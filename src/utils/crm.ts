import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Lead } from '../types';
import { ALL_DEALERS } from '../data/dealers';

/**
 * Sends any Leapmotor lead to the Stellantis Netcar CRM API.
 * Identifies if the lead name/lastname contains "Test" to use the test "01L5000" code,
 * otherwise resolves the actual "claveCorporativo" of the distributor.
 */
export const sendLeapmotorLeadToCRM = async (lead: Lead): Promise<{
  success: boolean;
  status: number;
  solicitudId?: any;
  shiftDigitalId?: string;
  error?: string;
}> => {
  try {
    const isTestLead = 
      (lead.name && lead.name.toLowerCase().includes('test')) || 
      (lead.lastName && lead.lastName.toLowerCase().includes('test'));

    let urlVal = "01L5000"; // Default billing/test key

    if (!isTestLead && lead.distributor && lead.distributor !== 'Sin Asignar (Pool Leapmotor)' && lead.distributor !== 'Sin Asignar (Sincronizando con Asesor)') {
      try {
        const distQuery = query(collection(db, 'distributors'), where('name', '==', lead.distributor));
        const distSnap = await getDocs(distQuery);
        if (!distSnap.empty) {
          const docData = distSnap.docs[0].data();
          if (docData && docData.claveCorporativo) {
            urlVal = docData.claveCorporativo;
          }
        } else {
          const matchedLocal = ALL_DEALERS.find(d => d.name === lead.distributor);
          if (matchedLocal && matchedLocal.corpKey) {
            urlVal = matchedLocal.corpKey;
          }
        }
      } catch (err) {
        console.error("Error looking up distributor corporate key:", err);
        const matchedLocal = ALL_DEALERS.find(d => d.name === lead.distributor);
        if (matchedLocal && matchedLocal.corpKey) {
          urlVal = matchedLocal.corpKey;
        }
      }
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
      origen: "LANDING",
      conversacion: lead.requestType === 'cotizacion' 
        ? "Formulario de cotización de la landing Leapmotor" 
        : lead.requestType === 'prueba'
        ? "Solicitud de prueba de manejo de la landing Leapmotor"
        : "Contacto de atención VIP asignado al asesor comercial"
    };

    console.log("[CRM Connection] Posting to Netcar API for Leapmotor Lead:", payload);

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
    let data: any = null;
    
    try {
      data = await response.json();
    } catch (_) {}

    console.log(`[CRM Connection] Response: Status Code ${statusCode}`, data);

    if (statusCode === 201 && data && data.success) {
      return {
        success: true,
        status: 201,
        solicitudId: data.data?.solicitudId || null,
        shiftDigitalId: data.data?.shiftDigitalId || ""
      };
    } else {
      return {
        success: false,
        status: statusCode || 400,
        error: data?.message || data?.error || `Error de respuesta del CRM (${statusCode})`
      };
    }
  } catch (error: any) {
    console.error("[CRM Connection] Client fetch network error (likely CORS or Offline):", error);
    return {
      success: false,
      status: 0,
      error: error.message || "Error de red / CORS bloqueado"
    };
  }
};
