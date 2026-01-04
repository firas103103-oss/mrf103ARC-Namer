// إضافة اشتراكات realtime للجداول الجديدة
function setupAllRealtimeSubscriptions() {
  if (!isSupabaseConfigured()) return;
  
  // Anomalies Realtime
  supabase
    .channel("anomalies-channel")
    .on("postgres_changes", 
      { event: "INSERT", schema: "public", table: "anomalies" },
      (payload) => broadcast({ type: "new_anomaly", payload: payload.new })
    )
    .subscribe();
    
  // Tasks Realtime
  supabase
    .channel("tasks-channel")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "team_tasks" },
      (payload) => broadcast({ type: "task_update", payload: payload.new })
    )
    .subscribe();
    
  // Scenarios Realtime
  supabase
    .channel("scenarios-channel")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "mission_scenarios" },
      (payload) => broadcast({ type: "scenario_update", payload: payload.new })
    )
    .subscribe();
}