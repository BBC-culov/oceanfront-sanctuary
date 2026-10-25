// Helper to extract a meaningful error message from a supabase.functions.invoke()
// FunctionsHttpError. By default the SDK only surfaces "non-2xx status code".
import { errorMessage } from "@/lib/dataTypes";

type ErrorContext = { json?: () => Promise<unknown>; text?: () => Promise<string> };
const responseError = (value: unknown): unknown =>
  typeof value === "object" && value !== null && "error" in value ? value.error : undefined;

export async function extractEdgeError(error: unknown, fallback = "Errore"): Promise<string> {
  if (!error) return fallback;
  const ctx = (typeof error === "object" && "context" in error ? error.context : undefined) as ErrorContext | undefined;
  try {
    if (ctx && typeof ctx.json === "function") {
      const j = await ctx.json();
      if (responseError(j)) return String(responseError(j));
    } else if (ctx && typeof ctx.text === "function") {
      const t = await ctx.text();
      try {
        const parsed: unknown = JSON.parse(t);
        if (responseError(parsed)) return String(responseError(parsed));
      } catch {
        if (t) return t;
      }
    }
  } catch {
    /* ignore */
  }
  return errorMessage(error) || fallback;
}
