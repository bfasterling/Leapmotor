import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { BRAND_MODELS_METADATA } from './src/data/brandModelsMetadata';
import { ALL_DEALERS } from './src/data/dealers';

const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8')
);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Lead synchronization routine for both automatic cron and REST API requests
 */
async function runLeadSync() {
  console.log('[CRON] Starting automated Lead CRM synchronization...');
  
  // Initialize dedicated Firebase instance safely in server mode using the database named '(default)'
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, '(default)');

  // Query all leads to ensure we process pending leads (crmSuccess !== true)
  const leadsRef = collection(db, 'leads');
  const querySnapshot = await getDocs(leadsRef);

  const results = {
    totalScanned: querySnapshot.size,
    processedCount: 0,
    syncedLeads: [] as any[],
    failedLeads: [] as any[]
  };

  for (const docSnap of querySnapshot.docs) {
    const leadId = docSnap.id;
    const lead = { id: leadId, ...docSnap.data() } as any;

    // Skip if already successfully uploaded to Lead CRM
    if (lead.crmSuccess === true) {
      continue;
    }

    results.processedCount++;

    const isLeapmotor = 
      (lead.landing === 'leapmotor') || 
      (lead.selectedBrand && lead.selectedBrand.toLowerCase() === 'leapmotor');

    if (isLeapmotor) {
      // Leapmotor leads are synced using the Leapmotor JSON API
      try {
        console.log(`[CRON] Synchronizing Leapmotor lead ${leadId} with Rapid Quotation JSON API...`);
        
        let urlVal = "01L5000";
        const isTestLead = 
          (lead.name && lead.name.toLowerCase().includes('test')) || 
          (lead.lastName && lead.lastName.toLowerCase().includes('test'));

        if (!isTestLead && lead.distributor && lead.distributor !== 'Sin Asignar (Pool Leapmotor)' && lead.distributor !== 'Sin Asignar (Sincronizando con Asesor)') {
          const matchedLocal = ALL_DEALERS.find(d => d.name === lead.distributor);
          if (matchedLocal && matchedLocal.corpKey) {
            urlVal = matchedLocal.corpKey;
          }
        }

        // Resolve dynamic origin based on user guidelines
        let origVal = "LANDING";
        const lLanding = lead.landing ? lead.landing.toLowerCase() : "";
        const isSoccerhouse = lead.utm_source && (lead.utm_source.toLowerCase().startsWith('soccerhouse') || lead.utm_source.toLowerCase().includes('soccerhouse'));

        if (isSoccerhouse) {
          origVal = lead.requestType === 'prueba' ? "SHMLPM" : "SHML";
        } else if (lLanding === 'jeep') {
          origVal = lead.requestType === 'prueba' ? "CMCHPM" : "CMCH";
        } else if (lLanding === 'leapmotor') {
          origVal = "CMLM";
        } else if (lLanding === 'multimarca') {
          origVal = lead.requestType === 'prueba' ? "CMMLPM" : "CMML";
        } else {
          origVal = lead.requestType === 'prueba' ? "CMMLPM" : "CMML";
        }

        const payload = {
          url: urlVal,
          cliente: {
            nombre: lead.name ? lead.name.trim() : "",
            apellidoPaterno: lead.lastName ? lead.lastName.trim() : "",
            apellidoMaterno: "",
            correo: lead.email ? lead.email.trim() : "",
            telefono: lead.phone ? lead.phone.trim() : ""
          },
          vehiculo: {
            modelo: lead.modelOfInterest || "B10"
          },
          comentarios: lead.postalCode ? `C.P. ${lead.postalCode.trim()}` : "C.P. No Asignado",
          origen: origVal,
          conversacion: lead.requestType === 'cotizacion' 
            ? "Formulario de cotización de la landing Leapmotor (Cron)" 
            : lead.requestType === 'prueba'
            ? "Solicitud de prueba de manejo de la landing Leapmotor (Cron)"
            : "Contacto de atención VIP asignado al asesor comercial Leapmotor (Cron)"
        };

        const response = await fetch("https://api.stellantis.netcar.com.mx/api/v1/Cotizaciones/Rapida", {
          method: "POST",
          headers: {
            "Usuario": "landings-st",
            "Token": "e05100fa837ecf4e30d5318f6b9a6a0a",
            "BusinessId": "77",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const statusCode = response.status;
        let responseData: any = null;
        try {
          responseData = await response.json();
        } catch (_) {}

        const isSuccess = (statusCode === 201 || statusCode === 200) && responseData && (
          responseData.success === true || 
          responseData.success === 'true' || 
          responseData.success === 'True' ||
          responseData.status === 'success' ||
          responseData.status === 'OK' ||
          (responseData.data && (responseData.data.solicitudId || responseData.data.shiftDigitalId))
        );

        if (isSuccess) {
          const docRef = doc(db, 'leads', leadId);
          await updateDoc(docRef, {
            crmSuccess: true,
            crmResponseCode: statusCode,
            crmSolicitudId: responseData.data?.solicitudId || responseData.solicitudId || null,
            crmShiftDigitalId: responseData.data?.shiftDigitalId || responseData.shiftDigitalId || "",
            crmSentAt: Timestamp.now(),
            status: 'enviado'
          });
          results.syncedLeads.push({ 
            leadId, 
            brand: 'Leapmotor', 
            type: lead.requestType, 
            status: 'success',
            crmResponseCode: statusCode,
            crmRawResponse: JSON.stringify(responseData)
          });
        } else {
          const docRef = doc(db, 'leads', leadId);
          await updateDoc(docRef, {
            crmSuccess: false,
            crmResponseCode: statusCode || 400,
            crmError: responseData?.message || responseData?.error || `Error (${statusCode})`
          });
          results.failedLeads.push({ 
            leadId, 
            brand: 'Leapmotor', 
            error: responseData?.message || `Response code ${statusCode}`,
            crmResponseCode: statusCode || 400,
            crmRawResponse: JSON.stringify(responseData)
          });
        }
      } catch (err: any) {
        console.error(`[CRON] Loop Exception for Leapmotor lead ${leadId}:`, err);
        results.failedLeads.push({ leadId, brand: 'Leapmotor', error: err.message });
      }
    } else {
      // Non-Leapmotor leads are synced using the form-urlencoded WS RegistraCOT API
      try {
        console.log(`[CRON] Synchronizing Stellantis lead ${leadId} with RegistraCOT URL Encoded API (Brand: ${lead.selectedBrand || 'Jeep'})...`);
        
        let urlDistVal = "demo2.gochv4.netcar.com.mx";
        const isTestLead = 
          (lead.name && lead.name.toLowerCase().includes('test')) || 
          (lead.lastName && lead.lastName.toLowerCase().includes('test'));

        if (!isTestLead && lead.distributor) {
          const matchedLocal = ALL_DEALERS.find(d => d.name === lead.distributor);
          if (matchedLocal && matchedLocal.url) {
            urlDistVal = matchedLocal.url;
          }
        }

        const params = new URLSearchParams();
        params.append('usuario', 'landings-st');
        params.append('token', 'e05100fa837ecf4e30d5318f6b9a6a0a');
        params.append('UrlDist', urlDistVal);
        params.append('CliEmail', lead.email || '');
        params.append('CliNombreCompleto', `${lead.name || ''} ${lead.lastName || ''}`.trim());
        params.append('CliNombre', lead.name || '');
        params.append('CliAP', lead.lastName || '');
        params.append('CliAM', '');
        params.append('CliTel', lead.phone || '');
        params.append('CliTipoTel', 'Celular');
        params.append('CliRecibirPromo', '0');
        params.append('CotTipo', '1');
        params.append('AutoIDSeminuevo', '0');

        // Vehicle metadata mapping using updated BRAND_MODELS_METADATA database
        let autoAnio = '25';
        let autoMarca = lead.selectedBrand || 'Jeep';
        let autoModelo = lead.modelOfInterest || '';
        let autoClaveGen = 'ATTI24';
        let autoVersion = lead.modelOfInterest || '';
        let autoIDClaveversion = '';

        const matchedModel = BRAND_MODELS_METADATA.find(m => 
          m.model.toLowerCase() === (lead.modelOfInterest || '').toLowerCase()
        );

        if (matchedModel) {
          autoAnio = matchedModel.anio || '25';
          autoMarca = matchedModel.brand;
          autoModelo = matchedModel.model;
          autoClaveGen = matchedModel.claveGen;
          autoVersion = matchedModel.version || matchedModel.model;
          autoIDClaveversion = matchedModel.idVersion || '';
        }

        params.append('AutoAnio', autoAnio);
        params.append('AutoMarca', autoMarca);
        params.append('AutoModelo', autoModelo);
        params.append('AutoClaveGen', autoClaveGen);
        params.append('AutoVersion', autoVersion);
        params.append('AutoIDClaveversion', autoIDClaveversion);
        params.append('CotComentarios', lead.postalCode ? `C.P. ${lead.postalCode}` : 'C.P. No Asignado');

        // Resolve dynamic origin based on user instructions
        let origVal = "LANDING";
        const lLanding = lead.landing ? lead.landing.toLowerCase() : "";
        const isSoccerhouse = lead.utm_source && (lead.utm_source.toLowerCase().startsWith('soccerhouse') || lead.utm_source.toLowerCase().includes('soccerhouse'));

        if (isSoccerhouse) {
          origVal = lead.requestType === 'prueba' ? "SHMLPM" : "SHML";
        } else if (lLanding === 'jeep') {
          origVal = lead.requestType === 'prueba' ? "CMCHPM" : "CMCH";
        } else if (lLanding === 'leapmotor') {
          origVal = "CMLM";
        } else if (lLanding === 'multimarca') {
          origVal = lead.requestType === 'prueba' ? "CMMLPM" : "CMML";
        } else {
          origVal = lead.requestType === 'prueba' ? "CMMLPM" : "CMML";
        }

        params.append('CotOrigen', origVal);
        params.append('CotIDTipodeContacto', '1');
        params.append('CotIDTipodeCompra', '1');
        params.append('CotPlazo', '0');
        params.append('CotEnganche', '0');
        params.append('CotMensualidad', '0');

        params.append('UTMsource', lead.utm_source || '');
        params.append('UTMmedium', lead.utm_medium || '');
        params.append('UTMcampaign', lead.utm_campaign || '');
        params.append('UTMcontent', lead.utm_content || '');
        params.append('UTMterm', lead.utm_term || '');
        params.append('CotOrigenCampana', origVal);
        params.append('IP', '');

        const response = await fetch("http://servicios.chv3.netcar.com.mx/admin/ws/Leads.asmx/RegistraCOT", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });

        const statusCode = response.status;
        const responseText = await response.text();
        
        // Extract the clean inner string from XML if wrapped in <string>...</string>
        const xmlMatch = responseText.match(/<string[^>]*>([\s\S]*?)<\/string>/);
        const parsedText = xmlMatch ? xmlMatch[1].trim() : responseText.trim();
        
        // As request does not return JSON, check if the response contains the "**Error**" text.
        // If it does, then it is NOT successful. Otherwise, it is successful.
        const isSuccess = statusCode >= 200 && statusCode < 300 && parsedText && !parsedText.includes("**Error**");

        if (isSuccess) {
          const docRef = doc(db, 'leads', leadId);
          await updateDoc(docRef, {
            crmSuccess: true,
            crmResponseCode: statusCode,
            crmSentAt: Timestamp.now(),
            crmRawResponse: responseText.slice(0, 500),
            crmShiftDigitalId: parsedText, // Save the clean parsed response text as the CRM / shift digital ID
            status: 'enviado'
          });
          results.syncedLeads.push({ 
            leadId, 
            brand: autoMarca, 
            type: lead.requestType, 
            status: 'success',
            crmResponseCode: statusCode,
            crmRawResponse: parsedText
          });
        } else {
          const docRef = doc(db, 'leads', leadId);
          await updateDoc(docRef, {
            crmSuccess: false,
            crmResponseCode: statusCode,
            crmError: parsedText ? parsedText.slice(0, 500) : `Error status ${statusCode}`,
            status: 'error'
          });
          results.failedLeads.push({ 
            leadId, 
            brand: autoMarca, 
            error: parsedText ? `WS returned Error: ${parsedText.slice(0, 100)}` : `WS returned status ${statusCode}`,
            crmResponseCode: statusCode,
            crmRawResponse: parsedText || responseText
          });
        }
      } catch (err: any) {
        console.error(`[CRON] Loop Exception for Stellantis lead ${leadId}:`, err);
        results.failedLeads.push({ leadId, brand: lead.selectedBrand || 'Stellantis', error: err.message });
      }
    }
  }

  console.log('[CRON] Automated Lead CRM synchronization completed successfully.');
  return results;
}

/**
 * REST Endpoint for ad-hoc or manual trigger of the sync cron process
 */
app.all('/api/cron/sync-leads', async (req, res) => {
  try {
    const syncResults = await runLeadSync();
    res.status(200).json({
      success: true,
      message: "Lead synchronization processed successfully",
      timestamp: new Date().toISOString(),
      results: syncResults
    });
  } catch (error: any) {
    console.error("[CRON] Ad-hoc trigger exception occurred:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during lead synchronization",
      error: error.message
    });
  }
});

// Full-stack on-demand Firestore database export
app.get('/api/db/export', async (req, res) => {
  try {
    console.log('[API] Starting on-demand dual-database backup and export...');
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Default Firestore DB - using '(default)' database
    const dbDefault = getFirestore(firebaseApp, '(default)');
    
    // Custom Firestore DB is disabled as we strictly use 'default' database everywhere
    const dbCustom = null;
    const customDbId = '';

    const collectionsToBackup = ['leads', 'advisors', 'distributors'];
    const backupData: Record<string, any[]> = {};

    for (const colName of collectionsToBackup) {
      const mergedDocsMap = new Map<string, any>();

      // 1. Fetch from Default Database
      try {
        console.log(`[API] Fetching collection: ${colName} from (default) database...`);
        const colRef = collection(dbDefault, colName);
        const querySnapshot = await getDocs(colRef);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const formattedData = { ...data };
          for (const [key, val] of Object.entries(formattedData)) {
            if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
              formattedData[key] = new Date((val as any).seconds * 1000).toISOString();
            }
          }
          mergedDocsMap.set(docSnap.id, {
            id: docSnap.id,
            ...formattedData
          });
        });
        console.log(`[API] (default) database had ${querySnapshot.size} records for ${colName}`);
      } catch (defaultColErr: any) {
        console.warn(`[API] Skip error querying (default) database for ${colName}:`, defaultColErr.message);
      }

      // 2. Fetch from Custom Database (if configured)
      if (dbCustom && customDbId) {
        try {
          console.log(`[API] Fetching collection: ${colName} from custom database (${customDbId})...`);
          const colRef = collection(dbCustom, colName);
          const querySnapshot = await getDocs(colRef);
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const formattedData = { ...data };
            for (const [key, val] of Object.entries(formattedData)) {
              if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
                formattedData[key] = new Date((val as any).seconds * 1000).toISOString();
              }
            }
            // Overwrites or adds to the Map, thereby de-duplicating by ID and prioritizing newest values
            mergedDocsMap.set(docSnap.id, {
              id: docSnap.id,
              ...formattedData
            });
          });
          console.log(`[API] Custom database (${customDbId}) had ${querySnapshot.size} records for ${colName}`);
        } catch (customColErr: any) {
          console.warn(`[API] Skip error querying custom database for ${colName}:`, customColErr.message);
        }
      }

      backupData[colName] = Array.from(mergedDocsMap.values());
      console.log(`[API] Total consolidated/merged records for ${colName}: ${backupData[colName].length}`);
    }

    // Save a copy to the server workspace for safety and compliance
    const outputPath = path.join(process.cwd(), 'firestore_backup_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`[API] Consolidated backup copy written to workspace file: ${outputPath}`);

    // Direct client attachment headers for instantaneous download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="firestore_backup_export.json"');
    res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error: any) {
    console.error('[API] Global export handler exception:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate instant database backup',
      error: error.message
    });
  }
});

// App Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

/**
 * Setup daily automated local interval checking
 * Emulates a system cron executing everyday at 1:00 AM Central Standard Time (Mexico City Time, UTC-6)
 */
let lastRunDate = '';
setInterval(() => {
  const currentDateStr = new Date().toLocaleDateString('en-US', { timeZone: 'America/Mexico_City' });
  const mexHours = parseInt(new Date().toLocaleTimeString('en-US', { timeZone: 'America/Mexico_City', hour12: false }));
  
  // Trigger syncing once a day when the hour matches 1:00 AM (1)
  if (mexHours === 1 && lastRunDate !== currentDateStr) {
    lastRunDate = currentDateStr;
    runLeadSync().catch(err => {
      console.error('[CRON] Scheduled execution failed with exception:', err);
    });
  }
}, 60000); // Check once a minute

/**
 * Setup Vite configuration and route routing fallback
 */
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Express Server] Mounting development Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Express Server] Mounting production static asset server...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Server] Active and running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('[Express Server] Bootstrapping failed:', err);
});
