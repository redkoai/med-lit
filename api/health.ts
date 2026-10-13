interface ApiRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

import { logServerEvent, requestId } from '../src/services/serverTelemetry.js';

export default function handler(req: ApiRequest, res: ApiResponse) {
  const id = requestId(req);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  logServerEvent('info', 'health_checked', { requestId: id });
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Request-Id', id);
  res.status(200).json({ status: 'ok', service: 'medlit', version: '4.1.0' });
}
