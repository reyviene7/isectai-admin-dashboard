import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage keys for live in-browser testing
const STORAGE_URL_KEY = 'isectai_supabase_url';
const STORAGE_ANON_KEY = 'isectai_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined || '').trim();

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '').trim();
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '').trim();

  const isEnvValid = Boolean(
    envUrl &&
    envKey &&
    envUrl.startsWith('http') &&
    !envUrl.includes('your-project') &&
    !envUrl.includes('YOUR_PROJECT')
  );

  const isLocalValid = Boolean(
    localUrl &&
    localKey &&
    localUrl.startsWith('http') &&
    !localUrl.includes('your-project') &&
    !localUrl.includes('YOUR_PROJECT')
  );

  const rawUrl = isEnvValid ? envUrl : (isLocalValid ? localUrl : (envUrl || localUrl));
  const anonKey = isEnvValid ? envKey : (isLocalValid ? localKey : (envKey || localKey));

  // In browser, route requests through same-origin reverse proxy /api/cloud
  // to mask the raw Supabase URL and eliminate CORS preflight requests in the Network tab
  const isBrowser = typeof window !== 'undefined' && Boolean(window.location?.origin);
  const url = isBrowser ? `${window.location.origin}/api/cloud` : rawUrl;

  const isConfigured = Boolean(
    rawUrl &&
    anonKey &&
    rawUrl.startsWith('http') &&
    !rawUrl.includes('your-project') &&
    !rawUrl.includes('YOUR_PROJECT')
  );

  return { url, rawUrl, anonKey, isConfigured };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else localStorage.removeItem(STORAGE_URL_KEY);

    if (anonKey) localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  rowCount?: number;
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing or invalid. Please check your configuration.'
    };
  }

  const start = performance.now();
  try {
    const { data, error, count } = await client
      .from('tenants')
      .select('id, name', { count: 'exact' })
      .limit(5);

    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return {
        success: false,
        message: `Database error: ${error.message} (Code: ${error.code})`
      };
    }

    return {
      success: true,
      message: `Connected successfully to Supabase PostgreSQL! Retrieved ${data?.length ?? 0} businesses.`,
      latencyMs,
      rowCount: count ?? data?.length ?? 0
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network or configuration error: ${err?.message || 'Unknown error'}`
    };
  }
}
