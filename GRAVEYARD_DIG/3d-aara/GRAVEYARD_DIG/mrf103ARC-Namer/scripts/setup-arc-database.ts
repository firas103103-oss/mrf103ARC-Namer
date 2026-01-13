#!/usr/bin/env node
/**
 * ARC 2.0 Database Setup Script
 * Executes the complete database schema in Supabase
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSchema() {
  console.log('🚀 Starting ARC 2.0 Database Setup...\n');
  
  try {
    // Read SQL file
    const sql = readFileSync('./supabase_arc_database_setup.sql', 'utf8');
    
    // Split into individual statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;
      
      // Extract statement type for logging
      const firstWord = statement.split(/\s+/)[0].toUpperCase();
      const isCreate = firstWord === 'CREATE';
      const isInsert = firstWord === 'INSERT';
      const isAlter = firstWord === 'ALTER';
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${firstWord}... `);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          // Check if it's an acceptable error (like "already exists")
          if (
            error.message?.includes('already exists') || 
            error.message?.includes('duplicate key')
          ) {
            console.log('⚠️  Already exists (skipped)');
          } else {
            console.log(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log('✅');
          successCount++;
        }
      } catch (err: any) {
        console.log(`❌ ${err.message}`);
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Success: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors: ${errorCount} statements`);
    }
    console.log('='.repeat(60) + '\n');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...\n');
    
    const tables = [
      'agent_experiences',
      'agent_skills',
      'agent_reports',
      'learning_goals',
      'agent_patterns',
      'agent_chat_messages',
      'agent_status'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists`);
      }
    }
    
    // Check agent_status has 31 agents
    console.log('\n👥 Checking agents initialization...\n');
    const { data: agents, error: agentsError } = await supabase
      .from('agent_status')
      .select('agent_id, status');
    
    if (agentsError) {
      console.log(`❌ Could not verify agents: ${agentsError.message}`);
    } else {
      console.log(`✅ Found ${agents?.length || 0} agents in database`);
      if (agents && agents.length === 31) {
        console.log('✅ All 31 agents initialized correctly!');
      } else {
        console.log(`⚠️  Expected 31 agents, found ${agents?.length || 0}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ARC 2.0 Database Setup Complete!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the setup
runSchema().catch(console.error);
