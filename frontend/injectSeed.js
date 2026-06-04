const fs = require('fs');

const df_ra = [
  { "id_ra": "RA1", "desc_ra": "Identifica los elementos de las instalaciones de telecomunicaciones...", "peso_ra": 60, "is_dual": "No" },
  { "id_ra": "RA2", "desc_ra": "Configura pequeñas instalaciones de infraestructuras comunes...", "peso_ra": 15, "is_dual": "No" },
  { "id_ra": "RA3", "desc_ra": "Monta instalaciones de infraestructuras comunes...", "peso_ra": 5, "is_dual": "No" },
  { "id_ra": "RA4", "desc_ra": "Verifica el funcionamiento de las instalaciones...", "peso_ra": 5, "is_dual": "No" },
  { "id_ra": "RA5", "desc_ra": "Mantiene y repara instalaciones de telecomunicaciones...", "peso_ra": 5, "is_dual": "No" },
  { "id_ra": "RA6", "desc_ra": "Cumple las normas de prevención de riesgos...", "peso_ra": 5, "is_dual": "No" },
  { "id_ra": "RA7", "desc_ra": "Otra competencia o resultado...", "peso_ra": 5, "is_dual": "No" }
];

const df_ud = [
  { "id_ud": "UD01", "desc_ud": "Infraestructuras comunes de teleco", "horas_ud": 25, "ra_mappings": { "RA1": "RA1" }, "RA1": 15, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD02", "desc_ud": "Transmisión señales radio y televisi", "horas_ud": 30, "ra_mappings": { "RA1": "RA1" }, "RA1": 15, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD03", "desc_ud": "Antenas y líneas para RTV", "horas_ud": 15, "ra_mappings": { "RA1": "RA1" }, "RA1": 10, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD04", "desc_ud": "Equipos de procesado y distribuci", "horas_ud": 10, "ra_mappings": { "RA1": "RA1" }, "RA1": 5, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD05", "desc_ud": "Config.inst. RTV (I): distribución caj", "horas_ud": 15, "ra_mappings": { "RA2": "RA2" }, "RA1": 0, "RA2": 10, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD06", "desc_ud": "Config.inst. RTV (II): cabeceras TV-", "horas_ud": 10, "ra_mappings": { "RA2": "RA2" }, "RA1": 0, "RA2": 5, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD07", "desc_ud": "Montaje de sistemas de recepción", "horas_ud": 10, "ra_mappings": { "RA3": "RA3" }, "RA1": 0, "RA2": 0, "RA3": 5, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD08", "desc_ud": "Verificación y ajustes en instalacior", "horas_ud": 10, "ra_mappings": { "RA4": "RA4" }, "RA1": 0, "RA2": 0, "RA3": 0, "RA4": 5, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD09", "desc_ud": "Instalaciones de telefonía en ICT", "horas_ud": 15, "ra_mappings": { "RA1": "RA1" }, "RA1": 10, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD10", "desc_ud": "Instalaciones de interfonía y contr", "horas_ud": 10, "ra_mappings": { "RA1": "RA1" }, "RA1": 5, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0 },
  { "id_ud": "UD11", "desc_ud": "Mantenimiento de instalaciones de", "horas_ud": 15, "ra_mappings": { "RA5": "RA5", "RA6": "RA6", "RA7": "RA7" }, "RA1": 0, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 5, "RA6": 5, "RA7": 5 }
];

let content = fs.readFileSync('src/services/demoSeed.ts', 'utf8');

// Replace df_ra
content = content.replace(/"df_ra": \[[\s\S]*?\],\n\s*"df_ce"/, '"df_ra": ' + JSON.stringify(df_ra, null, 6) + ',\n    "df_ce"');

// Replace df_ud
content = content.replace(/"df_ud": \[[\s\S]*?\],\n\s*"df_sesiones"/, '"df_ud": ' + JSON.stringify(df_ud, null, 6) + ',\n    "df_sesiones"');

// Bump version
content = content.replace(/export const CRM_SEED_VERSION = \d+;/, 'export const CRM_SEED_VERSION = 15;');

fs.writeFileSync('src/services/demoSeed.ts', content);
