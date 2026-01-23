// Test script to check staff table connection
import { supabase } from './lib/supabase.js'

async function testStaffConnection() {
  console.log('Testing staff table connection...')
  
  try {
    // Test if we can connect to staff table
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, email, role')
      .eq('is_active', true)
      .limit(1)
    
    if (error) {
      console.error('Error connecting to staff table:', error)
      console.log('This might mean:')
      console.log('1. Staff table does not exist')
      console.log('2. Run the SQL migration: sql-migrations/add_staff_to_orders.sql')
      console.log('3. Or run: create_staff_tables.sql')
    } else {
      console.log('✅ Staff table connection successful!')
      console.log('Sample data:', data)
    }
  } catch (err) {
    console.error('Connection error:', err)
  }
}

testStaffConnection()
