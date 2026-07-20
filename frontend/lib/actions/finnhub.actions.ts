'use server';

import { generateFastApiToken } from '@/lib/jwt';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';
const LAMBDA_API_URL = process.env.LAMBDA_API_URL || process.env.NEXT_PUBLIC_LAMBDA_API_URL || BACKEND_API_URL;

export async function getNews(symbols?: string[], providedEmail?: string): Promise<MarketNewsArticle[]> {
  try {
    let email = providedEmail;
    if (!email) {
      const session = await auth.api.getSession({ headers: await headers() });
      email = session?.user?.email || '';
    }
    if (!email) {
      console.error('[getNews] No email available — skipping API call to prevent 401');
      return [];
    }
    const token = generateFastApiToken(email);
    console.log('[DEBUG] getNews email:', email, 'token:', token ? 'exists' : 'empty');

    let url = `${BACKEND_API_URL}/api/news`;
    if (symbols && symbols.length > 0) {
      url += `?symbols=${encodeURIComponent(symbols.join(','))}`;
    }
    
    let res;
    for (let i = 0; i < 3; i++) {
      res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      if (res.ok) break;
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
    if (!res || !res.ok) {
      throw new Error(`Failed to fetch news from backend: ${res?.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('getNews action error:', err);
    return [];
  }
}

export async function searchStocks(query?: string, providedEmail?: string): Promise<StockWithWatchlistStatus[]> {
  try {
    let email = providedEmail;
    if (!email) {
      const session = await auth.api.getSession({ headers: await headers() });
      email = session?.user?.email || '';
    }
    if (!email) {
      console.error('[searchStocks] No email available — skipping API call to prevent 401');
      return [];
    }
    const token = generateFastApiToken(email);
    console.log('[DEBUG] searchStocks email:', email, 'token:', token ? 'exists' : 'empty');

    const url = `${BACKEND_API_URL}/api/stocks/search${query ? `?query=${encodeURIComponent(query)}` : ''}`;
    let res;
    for (let i = 0; i < 3; i++) {
      res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      if (res.ok) break;
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
    if (!res || !res.ok) {
      throw new Error(`Failed to search stocks from backend: ${res?.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('searchStocks action error:', err);
    return [];
  }
}
