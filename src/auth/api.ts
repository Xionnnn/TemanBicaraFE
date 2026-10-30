import type { Account, StoredSession } from './session';

export type Verification = { verificationTicket: string; email: string; resendAfter: number; notice?: string };
export class ApiError extends Error {
  status: number;
  code: string;
  verification?: Verification;
  constructor(status: number, body: { code?: string; message?: string } & Partial<Verification>) {
    super(body.message ?? 'Layanan belum tersedia. Coba lagi nanti.');
    this.status = status;
    this.code = body.code ?? 'service_unavailable';
    if (body.verificationTicket && body.email)
      this.verification = { verificationTicket: body.verificationTicket, email: body.email, resendAfter: body.resendAfter ?? 0 };
  }
}

async function request<T>(path: string, body?: unknown, credential?: string, method = 'POST'): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!base?.startsWith('https://')) throw new ApiError(503, {});
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 15000);
  try {
    const response = await fetch(`${base}/auth/${path}`, {
      method, signal: abort.signal,
      headers: { 'Content-Type': 'application/json', ...(credential ? { Authorization: `Bearer ${credential}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let result: unknown = {};
    try { if (text) result = JSON.parse(text); }
    catch { if (response.ok) throw new ApiError(503, {}); }
    if (!response.ok) throw new ApiError(response.status,
      result && typeof result === 'object' ? result : {});
    return result as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, { message: 'Tidak dapat terhubung ke layanan. Periksa koneksi dan coba lagi.' });
  } finally { clearTimeout(timeout); }
}

export const authApi = {
  register: (data: { username: string; password: string; confirmPassword: string; email: string; role: Account['role'] }) =>
    request<Verification>('register', data),
  verify: (verificationTicket: string, code: string) => request<void>('verify-email', { verificationTicket, code }),
  resend: (verificationTicket: string) => request<Verification>('resend-verification', { verificationTicket }),
  login: (username: string, password: string) => request<StoredSession>('login', { username, password }),
  me: (credential: string) => request<Account>('me', undefined, credential, 'GET'),
  revoke: (credential: string) => request<void>('logout', undefined, credential),
};
