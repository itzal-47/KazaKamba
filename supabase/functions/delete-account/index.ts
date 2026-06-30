import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Delete user's listings (RLS will ensure only own listings are deleted, but we use service role)
    await supabase.from("listings").delete().eq("usuario_id", user.id);

    // Delete user's stories
    await supabase.from("stories").delete().eq("usuario_id", user.id);

    // Delete user's favorites
    await supabase.from("favorites").delete().eq("usuario_id", user.id);

    // Delete user's market comments
    await supabase.from("market_comments").delete().eq("usuario_id", user.id);

    // Delete user's messages and chats (where user is participant)
    const { data: chats } = await supabase
      .from("chats")
      .select("id")
      .contains("participantes", [user.id]);

    if (chats && chats.length > 0) {
      const chatIds = chats.map((c) => c.id);
      await supabase.from("messages").delete().in("chat_id", chatIds);
      await supabase.from("chats").delete().eq("id", user.id);
    }

    // Delete user's profile
    await supabase.from("profiles").delete().eq("id", user.id);

    // Delete the user account using admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error deleting account:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete account" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
