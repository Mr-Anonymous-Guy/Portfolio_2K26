import { Quote } from "../types/quote";

export const FALLBACK_QUOTES: Quote[] = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Programs must be written for people to read, and only secondarily for machines to execute.", author: "Harold Abelson" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" }
];

const LOCAL_STORAGE_KEY = "portfolio_last_quotes_queue";
const MAX_LOCAL_CACHE = 15;

// Cache typefit list in memory to avoid refetching the entire list
let typefitQuotesCache: Quote[] | null = null;

async function fetchFromPrayush(signal?: AbortSignal): Promise<Quote> {
  const response = await fetch("https://quotesapi.prayushadhikari.com.np/api/quotes/random", {
    signal,
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Prayush API status error");
  const json = await response.json();
  const quoteData = json.data?.[0];
  if (!quoteData || !quoteData.quote) throw new Error("Prayush API invalid format");
  return {
    text: quoteData.quote,
    author: quoteData.author || "Unknown"
  };
}

async function fetchFromDummyJson(signal?: AbortSignal): Promise<Quote> {
  const response = await fetch("https://dummyjson.com/quotes/random", { signal });
  if (!response.ok) throw new Error("DummyJSON API status error");
  const json = await response.json();
  if (!json || !json.quote) throw new Error("DummyJSON API invalid format");
  return {
    text: json.quote,
    author: json.author || "Unknown"
  };
}

async function fetchFromTypefit(signal?: AbortSignal): Promise<Quote> {
  if (!typefitQuotesCache) {
    const response = await fetch("https://type.fit/api/quotes", { signal });
    if (!response.ok) throw new Error("Typefit API status error");
    const list = await response.json();
    if (!Array.isArray(list) || list.length === 0) throw new Error("Typefit invalid list");
    typefitQuotesCache = list.map((item: any) => {
      let author = item.author || "Unknown";
      if (author.endsWith(", type.fit")) {
        author = author.substring(0, author.length - 10);
      }
      return {
        text: item.text || "",
        author: author
      };
    }).filter(q => q.text.length > 0);
  }

  if (!typefitQuotesCache || typefitQuotesCache.length === 0) {
    throw new Error("Typefit cache empty");
  }

  const randomIndex = Math.floor(Math.random() * typefitQuotesCache.length);
  return typefitQuotesCache[randomIndex];
}

// Global list of providers to try in order or randomly
const PROVIDERS = [
  fetchFromPrayush,
  fetchFromDummyJson,
  fetchFromTypefit
];

export async function fetchRandomQuote(signal?: AbortSignal): Promise<Quote> {
  // Shuffle/randomize the order of providers to balance loads and make it unpredictable
  const shuffledProviders = [...PROVIDERS].sort(() => Math.random() - 0.5);

  for (const provider of shuffledProviders) {
    try {
      const quote = await provider(signal);
      return quote;
    } catch (e) {
      console.warn(`Provider fetch failed, trying next provider:`, e);
    }
  }

  // If all online providers fail, try to read from localStorage cache
  try {
    const cachedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedStr) {
      const cachedList = JSON.parse(cachedStr) as Quote[];
      if (Array.isArray(cachedList) && cachedList.length > 0) {
        const randomIndex = Math.floor(Math.random() * cachedList.length);
        return cachedList[randomIndex];
      }
    }
  } catch (e) {
    console.warn("Failed to retrieve quote from localStorage:", e);
  }

  // Fallback to local hardcoded list
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[randomIndex];
}

// Function to save a queue to localStorage cache
export function saveQuotesQueueToCache(queue: Quote[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queue.slice(0, MAX_LOCAL_CACHE)));
  } catch (e) {
    console.warn("Failed to cache quotes queue in localStorage:", e);
  }
}
