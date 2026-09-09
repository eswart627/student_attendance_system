import { setServerTime } from './timeSync'

const API_BASE_URL = 'https://student-attendance-system-kr95.onrender.com/api';

type ApiOptions = RequestInit & {
  token?: string;
};

type AuthFailureListener = () => void;
let onAuthFailureCallback: AuthFailureListener | null = null;

export function registerAuthFailureHandler(
  handler: AuthFailureListener | null,
): void {
  onAuthFailureCallback = handler;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const serverDateHeader = response.headers.get('date');
  if (serverDateHeader) {
    const serverEpoch = new Date(serverDateHeader).getTime();
    if (!Number.isNaN(serverEpoch)) {
      setServerTime(serverEpoch);
    }
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    // Response wasn't JSON.
  }

  if (response.status === 401) {
    onAuthFailureCallback?.();
    throw new Error(
      data?.message || 'Your session has expired. Please sign in again.',
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`,
    );
  }

  return data as T;
}

export { API_BASE_URL };
