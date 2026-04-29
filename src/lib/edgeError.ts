// Helper to extract a meaningful error message from a supabase.functions.invoke()
// FunctionsHttpError. By default the SDK only surfaces "non-2xx status code".
export async function extractEdgeError(error: unknown, fallback = "Errore"): Promise<string> {
  if (!error) return fallback;
  const anyErr = error as any;
  const ctx = anyErr?.context;
  try {
    if (ctx && typeof ctx.json === "function") {
      const j = await ctx.json();
      if (j?.error) return String(j.error);
    } else if (ctx && typeof ctx.text === "function") {
      const t = await ctx.text();
      try {
        const parsed = JSON.parse(t);
        if (parsed?.error) return String(parsed.error);
      } catch {
        if (t) return t;
      }
    }
  } catch {
    /* ignore */
  }
  return anyErr?.message || fallback;
}
