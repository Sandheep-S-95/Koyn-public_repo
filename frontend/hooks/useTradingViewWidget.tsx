'use client';
import { useEffect, useRef }     from "react";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (containerRef.current.dataset.loaded) return;
        containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

        // Intercept config to point clicked symbols to our app's stocks page
        const updatedConfig = { ...config };
        if (typeof window !== "undefined") {
            const origin = window.location.origin;

            // Inject custom largeChartUrl if it is in config, or if we want to capture links from overview/quotes
            if (
                updatedConfig.hasOwnProperty("largeChartUrl") ||
                scriptUrl.includes("market-overview") ||
                scriptUrl.includes("market-quotes")
            ) {
                updatedConfig.largeChartUrl = `${origin}/stocks`;
            }

            // Inject custom symbolUrl for heatmap widget
            if (updatedConfig.hasOwnProperty("symbolUrl") || scriptUrl.includes("stock-heatmap")) {
                updatedConfig.symbolUrl = `${origin}/stocks/{tvsymbol}`;
            }
        }

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.innerHTML = JSON.stringify(updatedConfig);

        containerRef.current.appendChild(script);
        containerRef.current.dataset.loaded = 'true';

        return () => {
            if(containerRef.current) {
                containerRef.current.innerHTML = '';
                delete containerRef.current.dataset.loaded;
            }
        }
    }, [scriptUrl, config, height])

    return containerRef;
}
export default useTradingViewWidget
