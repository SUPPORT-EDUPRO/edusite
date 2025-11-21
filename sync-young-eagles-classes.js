/**
 * Sync Young Eagles classes from EduDashPro database to EduSitePro database
 * This ensures registration forms can display the correct class options
 */

const { createClient } = require('@supabase/supabase-js');

// EduDashPro Database (Source)
const edudashUrl = 'https://lvvvjywrmpcqrpvuptdi.supabase.co';
const edudashKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dnZqeXdybXBjcXJwdnVwdGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzc4MzgsImV4cCI6MjA2ODYxMzgzOH0.mjXejyRHPzEJfMlhW46TlYI0qw9mtoSRJZhGsCkuvd8';

// EduSitePro Database (Destination)
const edusiteUrl = 'https://bppuzibjlxgfwrujzfsz.supabase.co';
const edusiteKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcHV6aWJqbHhnZndydWp6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDM3MzAsImV4cCI6MjA2OTMxOTczMH0.LcoKy-VzT6nKLPjcb6BXKHocj4E7DuUQPyH_bmfGbWA';

const edudashSupabase = createClient(edudashUrl, edudashKey);
const edusiteSupabase = createClient(edusiteUrl, edusiteKey);

const YOUNG_EAGLES_ORG_ID = 'ba79097c-1b93-4b48-bcbe-df73878ab4d1';

async function syncClasses() {
  console.log('🔄 Starting class sync for Young Eagles...\n');

  try {
    // 1. First, check the schema of classes table in EduDashPro
    console.log('📋 Checking classes table schema in EduDashPro...');
    const { data: schemaCheck, error: schemaError } = await edudashSupabase
      .from('classes')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError);
    } else if (schemaCheck && schemaCheck.length > 0) {
      console.log('✅ Sample class record:', JSON.stringify(schemaCheck[0], null, 2));
    }

    // 2. Fetch classes from EduDashPro (try without organization_id filter first)
    console.log('\n📥 Fetching all classes from EduDashPro database...');
    const { data: sourceClasses, error: fetchError } = await edudashSupabase
      .from('classes')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching classes from EduDashPro:', fetchError);
      return;
    }

    if (!sourceClasses || sourceClasses.length === 0) {
      console.log('⚠️  No classes found in EduDashPro for Young Eagles');
      return;
    }

    console.log(`✅ Found ${sourceClasses.length} classes in EduDashPro:\n`);
    sourceClasses.forEach(cls => {
      console.log(`   - ${cls.name} (${cls.age_range || 'N/A'})`);
    });

    // 2. Check existing classes in EduSitePro
    console.log('\n📋 Checking existing classes in EduSitePro...');
    const { data: existingClasses, error: checkError } = await edusiteSupabase
      .from('classes')
      .select('id, name')
      .eq('organization_id', YOUNG_EAGLES_ORG_ID);

    if (checkError) {
      console.error('❌ Error checking existing classes:', checkError);
      return;
    }

    const existingNames = existingClasses?.map(c => c.name) || [];
    console.log(`   Found ${existingNames.length} existing classes:`, existingNames);

    // 3. Prepare classes for insertion (filter out duplicates)
    const classesToInsert = sourceClasses
      .filter(cls => !existingNames.includes(cls.name))
      .map(cls => ({
        id: cls.id,
        organization_id: cls.organization_id,
        name: cls.name,
        grade_level: cls.grade_level,
        academic_year: cls.academic_year || '2026',
        active: cls.active ?? true,
        max_students: cls.max_students,
        current_students: cls.current_students || 0,
        class_type: cls.class_type,
        age_range: cls.age_range,
        duration: cls.duration,
        created_at: cls.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

    if (classesToInsert.length === 0) {
      console.log('\n✅ All classes already synced. No action needed.');
      return;
    }

    // 4. Insert new classes into EduSitePro
    console.log(`\n📤 Inserting ${classesToInsert.length} new classes into EduSitePro...`);
    const { data: insertedClasses, error: insertError } = await edusiteSupabase
      .from('classes')
      .insert(classesToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting classes:', insertError);
      return;
    }

    console.log(`\n✅ Successfully synced ${insertedClasses.length} classes!\n`);
    insertedClasses.forEach(cls => {
      console.log(`   ✓ ${cls.name} (${cls.age_range || 'N/A'})`);
    });

    console.log('\n🎉 Class sync complete!');

  } catch (error) {
    console.error('❌ Unexpected error during sync:', error);
  }
}

// Run the sync
syncClasses();
