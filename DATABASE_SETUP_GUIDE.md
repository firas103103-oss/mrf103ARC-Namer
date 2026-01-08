# 🗄️ ARC 2.0 Database Setup Guide

## Quick Setup (Recommended)

### Option 1: Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project: `rffpacsvwxfjhxgtsbzf`

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Paste SQL:**
   - Open file: `supabase_arc_database_setup.sql`
   - Copy ALL content
   - Paste into SQL Editor

4. **Execute:**
   - Click "Run" button (or press `Ctrl+Enter`)
   - Wait for completion (~30 seconds)

5. **Verify:**
   - Check "Table Editor" in sidebar
   - You should see 7 new tables:
     * `agent_experiences`
     * `agent_skills`
     * `agent_reports`
     * `learning_goals`
     * `agent_patterns`
     * `agent_chat_messages`
     * `agent_status` (should have 31 rows)

### Option 2: Using psql CLI

```bash
# You need the database password from Supabase Dashboard
# Settings → Database → Connection String

./scripts/setup-arc-database.sh
```

### Option 3: Using Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref rffpacsvwxfjhxgtsbzf

# Run migrations
supabase db push
```

---

## What Gets Created

### 📊 Tables (7 total)

#### 1. `agent_experiences`
Records all agent learning experiences.

```sql
id, agent_id, context, action, result, metrics, learnings, created_at
```

**Purpose:** Track every action an agent takes for self-learning

#### 2. `agent_skills`
Tracks all skills acquired by agents.

```sql
id, agent_id, skill_name, skill_name_ar, category, level, 
usage_count, success_rate, acquired_at, last_used
```

**Purpose:** Skill inventory with proficiency levels (0-100)

#### 3. `agent_reports`
Stores all generated reports.

```sql
id, report_type, agent_id, sector, data, generated_at, submitted_at
```

**Types:**
- `daily` - Agent daily reports
- `weekly` - Agent weekly summaries
- `monthly` - Agent monthly reviews
- `semi-annual` - Agent 6-month reports
- `sector` - Sector-wide reports
- `executive` - CEO overview reports

#### 4. `learning_goals`
Tracks agent learning goals and progress.

```sql
id, agent_id, goal, target_date, progress, milestones, status, 
created_at, completed_at
```

**Statuses:** `active`, `completed`, `cancelled`

#### 5. `agent_patterns`
Stores recognized behavioral patterns.

```sql
id, agent_id, name, description, frequency, confidence, 
examples, first_detected, last_seen
```

**Purpose:** Pattern recognition for autonomous improvement

#### 6. `agent_chat_messages`
Complete chat history between users and agents.

```sql
id, agent_id, user_id, message, is_agent, created_at
```

**Purpose:** Conversation history for context and learning

#### 7. `agent_status`
Real-time status tracking for all agents.

```sql
agent_id, status, current_task, last_activity, metadata
```

**Statuses:** `active`, `idle`, `busy`, `offline`, `learning`

**Pre-populated with 31 agents:**
- 1 CEO (mrf_ceo)
- 6 Maestros (maestro_security, maestro_finance, etc.)
- 24 Specialists (aegis, phantom, ledger, etc.)

---

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with two policies:

1. **Authenticated Read:** All logged-in users can read data
2. **Service Role Full Access:** Backend API has full control

### Constraints

- ✅ Result validation: `success`, `failure`, `partial`
- ✅ Level range: 0-100
- ✅ Success rate: 0-100%
- ✅ Status validation: defined enum values
- ✅ Unique constraints: One skill per agent

---

## ⚡ Advanced Features

### Triggers

**`trigger_update_agent_activity_on_experience`**
- Automatically updates `agent_status.last_activity`
- Fires whenever an experience is recorded

### Functions

**`get_agent_experience_count(agent_id)`**
- Returns total experiences for an agent

**`get_agent_success_rate(agent_id)`**
- Calculates percentage of successful actions

**`update_agent_activity()`**
- Trigger function for activity tracking

---

## 🧪 Verification Queries

After setup, run these in SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE 'agent_%' OR table_name LIKE 'learning_%')
ORDER BY table_name;

-- Check all 31 agents initialized
SELECT COUNT(*) as total_agents 
FROM agent_status;

-- View all agents by status
SELECT agent_id, status, last_activity 
FROM agent_status 
ORDER BY 
  CASE 
    WHEN agent_id = 'mrf_ceo' THEN 0
    WHEN agent_id LIKE 'maestro_%' THEN 1
    ELSE 2
  END,
  agent_id;

-- Test experience function
SELECT get_agent_experience_count('mrf_ceo');

-- Test success rate function
SELECT get_agent_success_rate('mrf_ceo');
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solution:** Table already created. This is safe to ignore or DROP TABLE first.

### Error: "permission denied"
**Solution:** Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` not anon key.

### Error: "function does not exist"
**Solution:** Functions might be in different schema. Try prefixing with `public.`

### Error: "duplicate key value"
**Solution:** Agents already initialized. This is safe to ignore.

---

## 📈 Next Steps

After successful setup:

1. ✅ Test API endpoints:
   ```bash
   curl http://localhost:5001/api/arc/ceo
   curl http://localhost:5001/api/arc/hierarchy/stats
   ```

2. ✅ Open frontend pages:
   - http://localhost:5001/mrf
   - http://localhost:5001/maestros
   - http://localhost:5001/security

3. ✅ Generate first report:
   ```bash
   curl -X POST http://localhost:5001/api/arc/reports/daily/mrf_ceo
   ```

4. ✅ Record first experience:
   ```bash
   curl -X POST http://localhost:5001/api/arc/learning/experience \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": "mrf_ceo",
       "context": "Database setup",
       "action": "Initialize ARC 2.0 schema",
       "result": "success",
       "metrics": {"tables": 7, "agents": 31},
       "learnings": ["Successfully deployed complete database architecture"]
     }'
   ```

---

## 📚 Documentation

- Full API Docs: `ARC_2.0_COMPLETE_DOCUMENTATION.md`
- SQL Schema: `supabase_arc_database_setup.sql`
- Setup Scripts: `scripts/setup-arc-database.sh`

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase Dashboard → Logs
2. Verify `.env` has correct credentials
3. Ensure you're on the correct project
4. Try executing SQL in smaller chunks
5. Check database quotas (free tier limits)

---

**Last Updated:** January 8, 2026  
**Version:** ARC 2.0  
**Agents:** 31 (1 CEO + 6 Maestros + 24 Specialists)
