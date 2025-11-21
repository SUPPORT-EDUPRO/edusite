/**
 * Database Sync Utility
 * Syncs organization and class data between EduDashPro and EduSitePro databases
 * 
 * Usage:
 * node sync-databases.js --direction edudash-to-edusite
 * node sync-databases.js --direction edusite-to-edudash
 * node sync-databases.js --direction both (bidirectional sync)
 */

const { createClient } = require('@supabase/supabase-js');

// EduDashPro Database
const edudashUrl = 'https://lvvvjywrmpcqrpvuptdi.supabase.co';
const edudashKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dnZqeXdybXBjcXJwdnVwdGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzc4MzgsImV4cCI6MjA2ODYxMzgzOH0.mjXejyRHPzEJfMlhW46TlYI0qw9mtoSRJZhGsCkuvd8';

// EduSitePro Database
const edusiteUrl = 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const edusiteKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDM3MzAsImV4cCI6MjA2OTMxOTczMH0.LcoKy-VzT6nKLPjcb6BXKHocj4E7DuUQPyH_bmfGbWA';

const edudash = createClient(edudashUrl, edudashKey);
const edusite = createClient(edusiteUrl, edusiteKey);

// Unified organization IDs to sync
const ORGANIZATIONS_TO_SYNC = [
  'ba79097c-1b93-4b48-bcbe-df73878ab4d1', // Young Eagles
];

async function syncOrganizations(direction) {
  console.log(`\n📋 Syncing Organizations (${direction})...\n`);
  
  for (const orgId of ORGANIZATIONS_TO_SYNC) {
    try {
      if (direction === 'edudash-to-edusite' || direction === 'both') {
        // Get from EduDashPro
        const { data: edudashOrg, error: fetchError } = await edudash
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();
        
        if (fetchError) {
          console.log(`⚠️  Organization ${orgId} not found in EduDashPro`);
          continue;
        }
        
        // Upsert to EduSitePro
        const { error: upsertError } = await edusite
          .from('organizations')
          .upsert({
            id: edudashOrg.id,
            name: edudashOrg.name,
            slug: edudashOrg.slug,
            organization_type: edudashOrg.organization_type,
            logo_url: edudashOrg.logo_url,
            primary_color: edudashOrg.primary_color,
            secondary_color: edudashOrg.secondary_color,
            registration_open: edudashOrg.registration_open,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        
        if (upsertError) {
          console.error(`❌ Error syncing ${edudashOrg.name} to EduSitePro:`, upsertError.message);
        } else {
          console.log(`✅ Synced ${edudashOrg.name} → EduSitePro`);
        }
      }
      
      if (direction === 'edusite-to-edudash' || direction === 'both') {
        // Get from EduSitePro
        const { data: edusiteOrg, error: fetchError } = await edusite
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();
        
        if (fetchError) {
          console.log(`⚠️  Organization ${orgId} not found in EduSitePro`);
          continue;
        }
        
        // Upsert to EduDashPro
        const { error: upsertError } = await edudash
          .from('organizations')
          .upsert({
            id: edusiteOrg.id,
            name: edusiteOrg.name,
            slug: edusiteOrg.slug,
            organization_type: edusiteOrg.organization_type,
            logo_url: edusiteOrg.logo_url,
            primary_color: edusiteOrg.primary_color,
            secondary_color: edusiteOrg.secondary_color,
            registration_open: edusiteOrg.registration_open,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        
        if (upsertError) {
          console.error(`❌ Error syncing ${edusiteOrg.name} to EduDashPro:`, upsertError.message);
        } else {
          console.log(`✅ Synced ${edusiteOrg.name} → EduDashPro`);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error syncing organization ${orgId}:`, error.message);
    }
  }
}

async function syncClasses(direction) {
  console.log(`\n📚 Syncing Classes (${direction})...\n`);
  
  for (const orgId of ORGANIZATIONS_TO_SYNC) {
    try {
      if (direction === 'edudash-to-edusite' || direction === 'both') {
        // Get from EduDashPro
        const { data: edudashClasses, error: fetchError } = await edudash
          .from('classes')
          .select('*')
          .eq('organization_id', orgId);
        
        if (fetchError || !edudashClasses || edudashClasses.length === 0) {
          console.log(`⚠️  No classes found in EduDashPro for org ${orgId}`);
        } else {
          for (const cls of edudashClasses) {
            const { error: upsertError } = await edusite
              .from('classes')
              .upsert({
                id: cls.id,
                organization_id: cls.organization_id,
                name: cls.name,
                grade_level: cls.grade_level,
                academic_year: cls.academic_year || '2026',
                max_students: cls.max_students,
                current_students: cls.current_students || 0,
                active: cls.active !== undefined ? cls.active : true,
                class_type: cls.class_type,
                age_range: cls.age_range,
                duration: cls.duration,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            
            if (upsertError) {
              console.error(`  ❌ Error syncing class ${cls.name}:`, upsertError.message);
            } else {
              console.log(`  ✅ Synced class ${cls.name} → EduSitePro`);
            }
          }
        }
      }
      
      if (direction === 'edusite-to-edudash' || direction === 'both') {
        // Get from EduSitePro
        const { data: edusiteClasses, error: fetchError } = await edusite
          .from('classes')
          .select('*')
          .eq('organization_id', orgId);
        
        if (fetchError || !edusiteClasses || edusiteClasses.length === 0) {
          console.log(`⚠️  No classes found in EduSitePro for org ${orgId}`);
        } else {
          for (const cls of edusiteClasses) {
            const { error: upsertError } = await edudash
              .from('classes')
              .upsert({
                id: cls.id,
                organization_id: cls.organization_id,
                name: cls.name,
                grade_level: cls.grade_level,
                academic_year: cls.academic_year || '2026',
                max_students: cls.max_students,
                current_students: cls.current_students || 0,
                active: cls.active !== undefined ? cls.active : true,
                class_type: cls.class_type,
                age_range: cls.age_range,
                duration: cls.duration,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            
            if (upsertError) {
              console.error(`  ❌ Error syncing class ${cls.name}:`, upsertError.message);
            } else {
              console.log(`  ✅ Synced class ${cls.name} → EduDashPro`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error syncing classes for org ${orgId}:`, error.message);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const direction = args.find(arg => arg.startsWith('--direction='))?.split('=')[1] || 'both';
  
  if (!['edudash-to-edusite', 'edusite-to-edudash', 'both'].includes(direction)) {
    console.error('❌ Invalid direction. Use: edudash-to-edusite, edusite-to-edudash, or both');
    process.exit(1);
  }
  
  console.log(`\n🔄 Starting Database Sync (${direction})\n`);
  console.log(`Organizations to sync: ${ORGANIZATIONS_TO_SYNC.join(', ')}\n`);
  
  await syncOrganizations(direction);
  await syncClasses(direction);
  
  console.log(`\n✅ Sync complete!\n`);
}

main().catch(console.error);
