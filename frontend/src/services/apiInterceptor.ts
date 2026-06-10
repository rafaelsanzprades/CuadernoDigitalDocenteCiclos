import { fileManager } from "./fileManager";

let originalFetch: typeof fetch | null = null;

function createMockResponse(body: any, status = 200, statusText = "OK") {
  const jsonStr = JSON.stringify(body);
  const blob = new Blob([jsonStr], { type: "application/json" });

  return new Response(blob, {
    status,
    statusText,
    headers: { "Content-Type": "application/json" }
  });
}

function handleGetModule(id: string): Response {
  const data = fileManager.getModuleData(id);
  if (data) {
    return createMockResponse({ status: "success", data });
  }

  const isCurso = id.includes('-curso-');
  const defaultData = isCurso ? { df_al: [], tutoria_ledger: {}, daily_ledger: {} } : { df_ud: [], df_sesiones: [] };
  return createMockResponse({ status: "success", data: defaultData });
}

function handlePutModule(id: string, body: any): Response {
  fileManager.saveModuleData(id, body);
  return createMockResponse({ status: "success", message: "Module updated successfully" });
}

function handleGetAttendance(moduleId: string): Response {
  const moduleData = fileManager.getModuleData(moduleId) || {};
  const records = moduleData.attendance_records || [];
  return createMockResponse(records);
}

function handlePostAttendance(body: any): Response | null {
  const moduleId = body.module_document_id;
  if (!moduleId) return null;

  const moduleData = fileManager.getModuleData(moduleId) || {};
  if (!moduleData.attendance_records) {
    moduleData.attendance_records = [];
  }

  const existingIdx = moduleData.attendance_records.findIndex(
    (r: any) => r.student_id === body.student_id && r.date_str === body.date_str
  );

  const record = {
    id: existingIdx >= 0 ? moduleData.attendance_records[existingIdx].id : Math.floor(Math.random() * 1000000),
    module_document_id: body.module_document_id,
    student_id: body.student_id,
    date_str: body.date_str,
    status: body.status
  };

  if (existingIdx >= 0) {
    moduleData.attendance_records[existingIdx] = record;
  } else {
    moduleData.attendance_records.push(record);
  }

  fileManager.saveModuleData(moduleId, moduleData);
  return createMockResponse(record);
}

function handleListAttendance(): Response {
  const db = fileManager.getDb();
  const allRecords: any[] = [];
  Object.keys(db).forEach(key => {
    if (db[key].attendance_records) {
      allRecords.push(...db[key].attendance_records);
    }
  });
  return createMockResponse(allRecords);
}

export const apiInterceptor = {
  init() {
    if (typeof window === 'undefined') return;
    if (originalFetch) return;

    originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === 'string' ? input : (input as any).url || input.toString();

      const isModuleApi = urlStr.includes('/api/module/');
      const isAttendanceApi = urlStr.includes('/api/attendance');
      const method = init?.method || 'GET';

      const dataSourceType = fileManager.getDataSourceType();

      const getProxiedInput = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (apiUrl && urlStr.startsWith('/api/')) {
          return typeof input === 'string' ? apiUrl + urlStr : new Request(apiUrl + urlStr, input as any);
        }
        return input;
      };

      if ((isModuleApi || isAttendanceApi) && originalFetch) {
        try {
          // In 'local' mode, pass through to the real backend
          if (dataSourceType === 'local') {
            return originalFetch(getProxiedInput(), init);
          }

          if (isModuleApi && method === 'GET') {
            const parts = urlStr.split('/api/module/');
            const idWithParams = parts[parts.length - 1];
            const id = idWithParams.split('?')[0];
            return handleGetModule(id);
          }

          if (isModuleApi && method === 'PUT' && init?.body) {
            const parts = urlStr.split('/api/module/');
            const idWithParams = parts[parts.length - 1];
            const id = idWithParams.split('?')[0];
            const body = JSON.parse(init.body.toString());
            return handlePutModule(id, body);
          }

          if (isAttendanceApi && method === 'GET' && !urlStr.endsWith('/api/attendance/')) {
            const parts = urlStr.split('/api/attendance/');
            const idWithParams = parts[parts.length - 1];
            const moduleId = idWithParams.split('?')[0];
            return handleGetAttendance(moduleId);
          }

          if (isAttendanceApi && method === 'POST' && init?.body) {
            const body = JSON.parse(init.body.toString());
            const result = handlePostAttendance(body);
            if (result) return result;
          }

          if (isAttendanceApi && method === 'GET' && urlStr.endsWith('/api/attendance/')) {
            return handleListAttendance();
          }
        } catch (e) {
          console.error("Interceptor failed to handle simulated API request", e);
          return createMockResponse({ status: "error", detail: String(e) }, 500, "Internal Server Error");
        }
      }

      if (originalFetch) {
        return originalFetch(getProxiedInput(), init);
      } else {
        return Promise.reject("Original fetch not available");
      }
    };
  }
};
