import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log("Connecting to Supabase...");

  // Order matters due to foreign key constraints!
  // We delete child tables before their parent tables.
  const tables = [
    "lesson_progress",
    "mock_attempts",
    "mock_questions",
    "lessons",
    "materials",
    "mock_tests",
    "categories"
  ];

  for (const table of tables) {
    console.log(`Clearing table: ${table}...`);
    // Delete all rows where created_at is not null (which is practically all rows)
    // Supabase requires a filter to run a delete operation.
    const { error } = await supabase.from(table).delete().not("created_at", "is", null);
    
    if (error) {
       console.error(`  -> Failed to clear ${table}:`, error.message);
    } else {
       console.log(`  -> Successfully cleared ${table}`);
    }
  }
  
  console.log("\nAll test data cleared successfully! (Users table was kept intact)");
}

clearData();
