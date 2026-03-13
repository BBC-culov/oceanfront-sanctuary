import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an amministratore
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is amministratore using service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAmministratore = callerRoles?.some((r: any) => r.role === "amministratore");
    if (!isAmministratore) {
      return new Response(JSON.stringify({ error: "Accesso riservato agli amministratori" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...payload } = await req.json();

    // LIST all admin users
    if (action === "list") {
      const { data: adminRoles } = await adminClient
        .from("user_roles")
        .select("user_id, role, created_at")
        .in("role", ["admin", "amministratore"]);

      if (!adminRoles || adminRoles.length === 0) {
        return new Response(JSON.stringify({ users: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userIds = [...new Set(adminRoles.map((r: any) => r.user_id))];
      const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const users = userIds.map((uid: string) => {
        const authUser = authUsers?.find((u: any) => u.id === uid);
        const profile = profiles?.find((p: any) => p.user_id === uid);
        const roles = adminRoles.filter((r: any) => r.user_id === uid).map((r: any) => r.role);
        return {
          id: uid,
          email: authUser?.email ?? "—",
          first_name: profile?.first_name ?? "",
          last_name: profile?.last_name ?? "",
          phone: profile?.phone ?? "",
          roles,
          created_at: authUser?.created_at ?? "",
        };
      });

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CREATE admin user
    if (action === "create") {
      const { email, password, first_name, last_name, phone, role } = payload;
      if (!email || !password || !role) {
        return new Response(JSON.stringify({ error: "Email, password e ruolo sono obbligatori" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name, last_name, phone },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // The trigger auto-assigns 'user' role; now add the admin role
      if (role !== "user") {
        await adminClient.from("user_roles").insert({
          user_id: newUser.user.id,
          role,
        });
      }

      return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE admin user
    if (action === "update") {
      const { user_id, email, first_name, last_name, phone, role } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id è obbligatorio" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Don't allow editing yourself out of amministratore
      if (user_id === caller.id && role && role !== "amministratore") {
        return new Response(JSON.stringify({ error: "Non puoi rimuovere il tuo ruolo di amministratore" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (email) {
        await adminClient.auth.admin.updateUserById(user_id, { email });
      }

      await adminClient.from("profiles").update({
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        phone: phone ?? null,
      }).eq("user_id", user_id);

      if (role) {
        // Remove existing admin/amministratore roles, add new one
        await adminClient.from("user_roles").delete()
          .eq("user_id", user_id)
          .in("role", ["admin", "amministratore"]);
        
        await adminClient.from("user_roles").insert({ user_id, role });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE admin user
    if (action === "delete") {
      const { user_id } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id è obbligatorio" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Non puoi eliminare il tuo stesso account" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: delError } = await adminClient.auth.admin.deleteUser(user_id);
      if (delError) {
        return new Response(JSON.stringify({ error: delError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Azione non valida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
