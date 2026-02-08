import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { secret } = await req.json();
    if (secret !== "ATIEWS_INIT_2024") {
      return new Response(JSON.stringify({ error: "Invalid secret" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if admin already exists
    const { data: existingAdmin } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return new Response(JSON.stringify({ error: "Admin already exists" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error } = await adminClient.auth.admin.createUser({
      email: "admin@atiews.gov",
      password: "Admin@2024!",
      email_confirm: true,
      user_metadata: { full_name: "System Administrator", username: "admin" },
    });

    if (error) throw error;

    // Set role to admin
    await adminClient
      .from("user_roles")
      .update({ role: "admin" })
      .eq("user_id", newUser.user.id);

    // Approve admin
    await adminClient
      .from("profiles")
      .update({ is_approved: true })
      .eq("user_id", newUser.user.id);

    return new Response(JSON.stringify({ success: true, message: "Admin created: admin@atiews.gov / Admin@2024!" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
