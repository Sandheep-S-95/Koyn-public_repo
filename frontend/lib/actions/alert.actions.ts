'use server';

import { revalidatePath } from 'next/cache';
import { generateFastApiToken } from '@/lib/jwt';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';
const LAMBDA_API_URL = process.env.LAMBDA_API_URL || process.env.NEXT_PUBLIC_LAMBDA_API_URL || BACKEND_API_URL;

export async function createAlert(
  email: string,
  data: { symbol: string; company: string; alertName: string; alertType: 'upper' | 'lower'; threshold: number }
) {
  if (!email || !data.symbol) return { success: false };

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/alerts`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        symbol: data.symbol.toUpperCase(),
        company: data.company,
        alertName: data.alertName,
        alertType: data.alertType,
        threshold: data.threshold
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to create alert: ${res.statusText}`);
    }

    revalidatePath('/watchlist');
    return await res.json();
  } catch (err) {
    console.error('createAlert action error:', err);
    return { success: false };
  }
}

export async function updateAlert(
  email: string,
  alertId: string,
  data: { alertName: string; alertType: 'upper' | 'lower'; threshold: number }
) {
  if (!email || !alertId) return { success: false };

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/alerts/${alertId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        alertName: data.alertName,
        alertType: data.alertType,
        threshold: data.threshold
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to update alert: ${res.statusText}`);
    }

    revalidatePath('/watchlist');
    return await res.json();
  } catch (err) {
    console.error('updateAlert action error:', err);
    return { success: false };
  }
}

export async function deleteAlert(email: string, alertId: string) {
  if (!email || !alertId) return { success: false };

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/alerts/${alertId}?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to delete alert: ${res.statusText}`);
    }

    revalidatePath('/watchlist');
    return await res.json();
  } catch (err) {
    console.error('deleteAlert action error:', err);
    return { success: false };
  }
}

export async function getAlerts(email: string): Promise<Alert[]> {
  if (!email) {
    console.error('[getAlerts] No email provided — skipping API call to prevent 401');
    return [];
  }

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/alerts?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch alerts: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('getAlerts action error:', err);
    return [];
  }
}

export async function getAlertsByUserId(userId: string) {
  if (!userId) return [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const email = session?.user?.email || '';
    const token = generateFastApiToken(email);

    const url = `${LAMBDA_API_URL}/api/alerts/user/${encodeURIComponent(userId)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch alerts by userId: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('getAlertsByUserId action error:', err);
    return [];
  }
}
