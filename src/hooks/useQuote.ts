import { useContext } from "react";
import { QuoteContext, QuoteContextType } from "../context/QuoteProvider";

export function useQuote(): QuoteContextType {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
}
