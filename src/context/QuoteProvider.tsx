import React, { createContext, useState, useEffect, ReactNode, useRef } from "react";
import { Quote } from "../types/quote";
import { fetchRandomQuote, saveQuotesQueueToCache } from "../lib/quote-service";

export interface QuoteContextType {
  quote: Quote | null;
  rotateToNextQuote: () => void;
  loading: boolean;
}

export const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [queue, setQueue] = useState<Quote[]>([]);
  const [seenHistory, setSeenHistory] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Use refs to avoid dependency re-triggering of useEffect
  const queueRef = useRef<Quote[]>([]);
  const seenHistoryRef = useRef<Quote[]>([]);
  const currentQuoteRef = useRef<Quote | null>(null);
  const isFetching = useRef<boolean>(false);

  // Sync refs with state
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    seenHistoryRef.current = seenHistory;
  }, [seenHistory]);

  useEffect(() => {
    currentQuoteRef.current = currentQuote;
  }, [currentQuote]);

  // Preloading worker
  useEffect(() => {
    let isAborted = false;
    const abortController = new AbortController();

    async function maintainQueue() {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        // Keep queue filled up to 5 quotes in background
        while (!isAborted && queueRef.current.length < 5) {
          const quote = await fetchRandomQuote(abortController.signal);
          
          // Check for duplicate in history, queue and current quote
          const isDuplicate =
            seenHistoryRef.current.some(q => q.text === quote.text) ||
            queueRef.current.some(q => q.text === quote.text) ||
            (currentQuoteRef.current && currentQuoteRef.current.text === quote.text);

          if (!isDuplicate) {
            const nextQueue = [...queueRef.current, quote];
            queueRef.current = nextQueue;
            setQueue(nextQueue);
            saveQuotesQueueToCache(nextQueue);

            // Set initial quote if not set yet
            if (!currentQuoteRef.current) {
              const first = nextQueue[0];
              currentQuoteRef.current = first;
              setCurrentQuote(first);
              setLoading(false);
              
              // Remove the set quote from queue
              const remaining = nextQueue.slice(1);
              queueRef.current = remaining;
              setQueue(remaining);
            }
          } else {
            // Small backoff on duplicate
            await new Promise(r => setTimeout(r, 100));
          }
        }
      } catch (err) {
        console.warn("Error in maintainQueue background worker:", err);
      } finally {
        isFetching.current = false;
      }
    }

    maintainQueue();

    // Periodic check to fill queue in background
    const interval = setInterval(maintainQueue, 5000);

    return () => {
      isAborted = true;
      abortController.abort();
      clearInterval(interval);
    };
  }, []);

  const rotateToNextQuote = () => {
    const nextQueue = [...queueRef.current];
    if (nextQueue.length === 0) {
      console.warn("Queue empty during rotation request!");
      return;
    }

    const nextQuote = nextQueue[0];
    const remainingQueue = nextQueue.slice(1);

    // Save current to seen history (limit to last 20)
    if (currentQuoteRef.current) {
      const nextHistory = [currentQuoteRef.current, ...seenHistoryRef.current].slice(0, 20);
      setSeenHistory(nextHistory);
      seenHistoryRef.current = nextHistory;
    }

    // Set new current quote and update queue state
    setCurrentQuote(nextQuote);
    currentQuoteRef.current = nextQuote;
    
    setQueue(remainingQueue);
    queueRef.current = remainingQueue;
  };

  return (
    <QuoteContext.Provider value={{ quote: currentQuote, rotateToNextQuote, loading }}>
      {children}
    </QuoteContext.Provider>
  );
}
