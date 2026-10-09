/* DIGITAL FUTURE STATE Supabase browser client.
   Include Supabase v2 UMD before this file and configure window.DFS_SUPABASE_CONFIG.
   Never place a secret/service-role key in this file. */
(function () {
  const config = window.DFS_SUPABASE_CONFIG;
  if (!config || !config.url || !config.publishableKey ||
      config.publishableKey === "REPLACE_WITH_THE_PROJECT_PUBLISHABLE_KEY") {
    console.warn("DIGITAL FUTURE STATE: Supabase public configuration is not set.");
    return;
  }
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("DIGITAL FUTURE STATE: Supabase JS v2 library was not loaded.");
    return;
  }
  window.dfsSupabase = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
