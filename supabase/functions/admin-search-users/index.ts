import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Non autorizzato" });

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json(401, { error: "Non autorizzato" });

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);
    const isAdmin = callerRoles?.some((r: any) =>
      r.role === "admin" || r.role === "amministratore"
    );
    if (!isAdmin) return json(403, { error: "Accesso riservato" });

    const { query = "" } = await req.json();
    const q = String(query).trim().toLowerCase();
    if (q.length < 2) return json(200, { users: [] });
    if (q.length > 100) return json(400, { error: "Query troppo lunga" });

    // Fetch up to first 1000 auth users and filter in-memory by email
    const { data: { users: authUsers } } =
      await adminClient.auth.admin.listUsers({ perPage: 1000 });

    const filteredAuth = (authUsers ?? []).filter((u: any) =>
      (u.email ?? "").toLowerCase().includes(q)
    );

    // Also match by profile name/phone
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("user_id, first_name, last_name, phone")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(50);

    const profileMap = new Map<string, any>();
    (profiles ?? []).forEach((p: any) => profileMap.set(p.user_id, p));

    // Combine: all profile-matched + auth-matched, dedupe
    const ids = new Set<string>();
    filteredAuth.forEach((u: any) => ids.add(u.id));
    (profiles ?? []).forEach((p: any) => ids.add(p.user_id));

    const allAuthMap = new Map<string, any>();
    (authUsers ?? []).forEach((u: any) => allAuthMap.set(u.id, u));

    const results = [...ids].slice(0, 30).map((id) => {
      const a = allAuthMap.get(id);
      const p = profileMap.get(id);
      return {
        id,
        email: a?.email ?? "",
        first_name: p?.first_name ?? a?.user_metadata?.first_name ?? "",
        last_name: p?.last_name ?? a?.user_metadata?.last_name ?? "",
        phone: p?.phone ?? a?.user_metadata?.phone ?? "",
      };
    });

    return json(200, { users: results });
  } catch (err) {
    console.error("[admin-search-users] error:", err);
    return json(500, { error: err instanceof Error ? err.message : "Errore interno" });
  }
});
