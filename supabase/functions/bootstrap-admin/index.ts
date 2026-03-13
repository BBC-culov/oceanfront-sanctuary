import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Create the superadmin user
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: "superadmin@bazhouse.com",
    password: "BazSuper2025!",
    email_confirm: true,
    user_metadata: { first_name: "Super", last_name: "Admin", phone: "+39 000 000 0000" },
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Add amministratore role
  await adminClient.from("user_roles").insert({
    user_id: newUser.user.id,
    role: "amministratore",
  });

  return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
