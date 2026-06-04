import { demoSeed, CRM_SEED_VERSION } from "./demoSeed";

export type DataSourceType = 'demo' | 'local';

const STORAGE_KEYS = {
  SOURCE_TYPE: 'cdd_datasource_type',
  DEMO_DB: 'cdd_demo_db',
  LOCAL_DB: 'cdd_local_db',
  GOOGLE_CONNECTED: 'cdd_google_connected',
  GOOGLE_USER: 'cdd_google_user',
  ONEDRIVE_CONNECTED: 'cdd_onedrive_connected',
  ONEDRIVE_USER: 'cdd_onedrive_user',
};

// Eager cache invalidation — runs at module import time (before Zustand hydrates)
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem('cdd_seed_version');
  if (storedVersion !== String(CRM_SEED_VERSION)) {
    localStorage.removeItem(STORAGE_KEYS.DEMO_DB);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_DB);
    localStorage.removeItem('cdd-store-cache');
    localStorage.setItem('cdd_seed_version', String(CRM_SEED_VERSION));
    
    // Clear Zustand's IndexedDB cache
    import('idb-keyval').then(({ del }) => {
      del('cdd-store-cache-v2').catch(console.error);
      del('cdd-store-cache').catch(console.error);
    });
  }
}

// Helper to deep clone objects
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const fileManager = {
  // Get active data source type
  getDataSourceType(): DataSourceType {
    if (typeof window === 'undefined') return 'demo';
    const stored = localStorage.getItem(STORAGE_KEYS.SOURCE_TYPE);
    return (stored === null ? 'demo' : stored) as DataSourceType;
  },

  // Set active data source type
  setDataSourceType(type: DataSourceType) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SOURCE_TYPE, type);
    // Dispatch custom event to notify components/header of change
    window.dispatchEvent(new Event('cdd-datasource-changed'));
  },

  // Google Connection methods
  isGoogleConnected(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.GOOGLE_CONNECTED) === 'true';
  },
  setGoogleConnected(connected: boolean, user: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.GOOGLE_CONNECTED, String(connected));
    localStorage.setItem(STORAGE_KEYS.GOOGLE_USER, user);
    window.dispatchEvent(new Event('cdd-datasource-changed'));
  },
  getGoogleUser(): string {
    if (typeof window === 'undefined') return "";
    return localStorage.getItem(STORAGE_KEYS.GOOGLE_USER) || "";
  },

  // OneDrive Connection methods
  isOneDriveConnected(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.ONEDRIVE_CONNECTED) === 'true';
  },
  setOneDriveConnected(connected: boolean, user: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ONEDRIVE_CONNECTED, String(connected));
    localStorage.setItem(STORAGE_KEYS.ONEDRIVE_USER, user);
    window.dispatchEvent(new Event('cdd-datasource-changed'));
  },
  getOneDriveUser(): string {
    if (typeof window === 'undefined') return "";
    return localStorage.getItem(STORAGE_KEYS.ONEDRIVE_USER) || "";
  },

  // Load the full database dictionary for the active source
  getDb(): Record<string, any> {
    if (typeof window === 'undefined') return clone(demoSeed);
    
    const type = this.getDataSourceType();
    const key = type === 'local' ? STORAGE_KEYS.LOCAL_DB : STORAGE_KEYS.DEMO_DB;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // ── Auto-migration: merge any NEW top-level keys from the seed
        // that the stored DB is missing (e.g. new fields added after first load).
        if (type === 'demo') {
          let changed = false;
          for (const [docId, seedDoc] of Object.entries(demoSeed as Record<string, any>)) {
            if (!parsed[docId]) {
              // Whole document missing — add it
              parsed[docId] = clone(seedDoc);
              changed = true;
            } else if (typeof seedDoc === 'object' && seedDoc !== null) {
              // Document exists — merge missing top-level keys, always refresh crm_empresas
              for (const [field, value] of Object.entries(seedDoc)) {
                if (
                  field === 'crm_empresas' || 
                  parsed[docId][field] === undefined || 
                  (field === 'df_ud' && Array.isArray(parsed[docId][field]) && parsed[docId][field].length === 0)
                ) {
                  parsed[docId][field] = clone(value);
                  changed = true;
                }
              }
            }
          }
          if (changed) {
            localStorage.setItem(key, JSON.stringify(parsed));
            // Invalidate Zustand persist cache so it re-loads fresh data
            localStorage.removeItem('cdd-store-cache');
          }
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing stored database, reverting to seed", e);
      }
    }
    
    // Fallback: seed and save
    const initialDb = type === 'local' ? {} : clone(demoSeed);
    localStorage.setItem(key, JSON.stringify(initialDb));
    return initialDb;
  },

  // Save the full database dictionary for the active source
  saveDb(db: Record<string, any>) {
    if (typeof window === 'undefined') return;
    const type = this.getDataSourceType();
    const key = type === 'local' ? STORAGE_KEYS.LOCAL_DB : STORAGE_KEYS.DEMO_DB;
    localStorage.setItem(key, JSON.stringify(db));
  },

  // Get data for a single module/course ID
  getModuleData(id: string): any | null {
    const db = this.getDb();
    return db[id] || null;
  },

  // Save/update data for a single module/course ID
  saveModuleData(id: string, data: any) {
    const db = this.getDb();
    db[id] = data;
    this.saveDb(db);
  },

  // Export full database to a JSON file download
  exportToJsonFile() {
    const db = this.getDb();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const type = this.getDataSourceType();
    downloadAnchor.setAttribute("download", `cuaderno_digital_${type}_${timestamp}.cdd`);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  },

  // Import database from JSON string
  importFromJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || parsed === null) return false;
      
      this.saveDb(parsed);
      // Dispatch change event to update the page state
      window.dispatchEvent(new Event('cdd-datasource-changed'));
      return true;
    } catch (e) {
      console.error("Failed to import database JSON", e);
      return false;
    }
  },

  // Clear active database and reset to initial state
  resetActiveDb() {
    const type = this.getDataSourceType();
    const key = type === 'local' ? STORAGE_KEYS.LOCAL_DB : STORAGE_KEYS.DEMO_DB;
    const initialDb = type === 'local' ? {} : clone(demoSeed);
    localStorage.setItem(key, JSON.stringify(initialDb));
    window.dispatchEvent(new Event('cdd-datasource-changed'));
  }
};
