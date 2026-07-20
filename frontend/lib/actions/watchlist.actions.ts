'use server';

import { generateFastApiToken } from '@/lib/jwt';
import { revalidatePath } from 'next/cache';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';
const LAMBDA_API_URL = process.env.LAMBDA_API_URL || process.env.NEXT_PUBLIC_LAMBDA_API_URL || BACKEND_API_URL;

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/watchlist/symbols?email=${encodeURIComponent(email)}`;
    let res;
    for (let i = 0; i < 3; i++) {
      res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      if (res.ok) break;
      if (i < 2) await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
    }
    if (!res || !res.ok) {
      throw new Error(`Failed to fetch watchlist symbols: ${res?.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail action error:', err);
    return [];
  }
}

export async function getWatchlist(email: string): Promise<StockWithData[]> {
  if (!email) return [];

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/watchlist?email=${encodeURIComponent(email)}`;
    let res;
    for (let i = 0; i < 3; i++) {
      res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      if (res.ok) break;
      if (i < 2) await new Promise(r => setTimeout(r, 1000)); // wait 1s before retry
    }
    if (!res || !res.ok) {
      throw new Error(`Failed to fetch watchlist: ${res?.statusText}`);
    }
    const data = await res.json();
    return data.map((item: any) => ({
      ...item,
      addedAt: item.addedAt ? new Date(item.addedAt) : new Date()
    }));
  } catch (err) {
    console.error('getWatchlist action error:', err);
    return [];
  }
}

export async function toggleWatchlist(symbol: string, company: string, email: string, isAdding: boolean) {
  if (!email || !symbol) return { success: false };

  try {
    const token = generateFastApiToken(email);
    const url = `${LAMBDA_API_URL}/api/watchlist/toggle`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, symbol, company, isAdding }),
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`Failed to toggle watchlist: ${res.statusText}`);
    }
    const data = await res.json();
    revalidatePath('/watchlist');
    revalidatePath('/');
    return data;
  } catch (err) {
    console.error('toggleWatchlist action error:', err);
    return { success: false };
  }
}
