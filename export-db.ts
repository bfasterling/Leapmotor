import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

async function runBackup() {
  console.log('Starting full database backup...');
  
  // Read config
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('firebase-applet-config.json not found!');
    process.exit(1);
  }
  
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, 'default');

  const collectionsToBackup = ['leads', 'advisors', 'distributors'];
  const backupData: Record<string, any[]> = {};

  for (const colName of collectionsToBackup) {
    try {
      console.log(`Fetching collection: ${colName}...`);
      const colRef = collection(db, colName);
      const querySnapshot = await getDocs(colRef);
      
      const docsList: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Convert any timestamps to ISO string strings for JSON serialization
        const formattedData = { ...data };
        for (const [key, val] of Object.entries(formattedData)) {
          if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
            formattedData[key] = new Date((val as any).seconds * 1000).toISOString();
          }
        }
        
        docsList.push({
          id: docSnap.id,
          ...formattedData
        });
      });
      
      backupData[colName] = docsList;
      console.log(`Successfully fetched ${docsList.length} documents from ${colName}.`);
    } catch (colErr: any) {
      console.error(`Error fetching collection ${colName}:`, colErr.message);
    }
  }

  const outputPath = path.join(process.cwd(), 'firestore_backup_export.json');
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\nBackup successfully written to: ${outputPath}`);
  console.log(`Total Leads exported: ${backupData.leads?.length || 0}`);
  console.log(`Total Advisors exported: ${backupData.advisors?.length || 0}`);
  console.log(`Total Distributors exported: ${backupData.distributors?.length || 0}`);
}

runBackup().catch((error) => {
  console.error('Backup script failed:', error);
});
