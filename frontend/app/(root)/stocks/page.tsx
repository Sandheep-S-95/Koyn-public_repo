import { redirect } from 'next/navigation';

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StocksPage({ searchParams }: SearchParamsProps) {
  const resolvedSearchParams = await searchParams;
  const tvWidgetSymbol = resolvedSearchParams.tvwidgetsymbol;

  if (typeof tvWidgetSymbol === 'string' && tvWidgetSymbol.trim() !== '') {
    let symbol = tvWidgetSymbol.trim();
    
    // If the symbol includes an exchange prefix (e.g. NASDAQ:AAPL), extract just the ticker (AAPL)
    if (symbol.includes(':')) {
      symbol = symbol.split(':')[1];
    }
    
    if (symbol) {
      redirect(`/stocks/${symbol.toUpperCase()}`);
    }
  }

  // Fallback to home/dashboard if no query param is passed
  redirect('/');
}
