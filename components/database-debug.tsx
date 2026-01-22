"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function DatabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      const results: any = {}

      // Test 1: Check orders table
      console.log('=== DIAGNOSTIC: Testing orders table ===')
      const { data: ordersData, error: ordersError, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
      
      results.orders = {
        count: ordersCount,
        error: ordersError,
        sampleData: ordersData?.slice(0, 2),
        userIds: ordersData?.map(o => o.user_id).filter(Boolean)
      }
      console.log('Orders diagnostic:', results.orders)

      // Test 2: Check profiles table structure and data
      console.log('=== DIAGNOSTIC: Testing profiles table ===')
      
      // First, try to get all columns to see the structure
      const { data: profilesStructure, error: structureError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      console.log('Profiles structure test:', { profilesStructure, structureError })
      
      // Then get count and data
      const { data: profilesData, error: profilesError, count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
      
      results.profiles = {
        count: profilesCount,
        error: profilesError,
        sampleData: profilesData?.slice(0, 2),
        profileIds: profilesData?.map(p => p.id),
        structure: profilesStructure?.[0] ? Object.keys(profilesStructure[0]) : [],
        structureError
      }
      console.log('Profiles diagnostic:', results.profiles)

      // Test 2.5: Check if we can use the admin view from your SQL
      console.log('=== DIAGNOSTIC: Testing admin_orders view ===')
      const { data: adminOrdersData, error: adminOrdersError } = await supabase
        .from('admin_orders')
        .select('order_number, customer_name, customer_email, total_amount, status')
        .limit(5)
      
      results.adminOrders = {
        data: adminOrdersData,
        error: adminOrdersError
      }
      console.log('Admin orders view:', results.adminOrders)

      // Test 2.6: Check auth.users table (if accessible)
      console.log('=== DIAGNOSTIC: Testing auth.users table ===')
      try {
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data')
          .eq('id', '275b7983-2db6-423b-9198-68a4bd09f38d')
        
        results.authUsers = {
          data: authUsersData,
          error: authUsersError
        }
        console.log('Auth users test:', results.authUsers)
      } catch (err) {
        results.authUsers = { error: err }
        console.log('Auth users not accessible:', err)
      }

      // Test 3: Try specific profile lookup
      if (results.orders.userIds?.length > 0) {
        const targetUserId = results.orders.userIds[0]
        console.log('=== DIAGNOSTIC: Testing specific profile lookup ===', targetUserId)
        
        const { data: specificProfile, error: specificError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
        
        results.specificProfile = {
          targetUserId,
          data: specificProfile,
          error: specificError
        }
        console.log('Specific profile diagnostic:', results.specificProfile)
      }

      // Test 4: Check if there are any tables at all
      console.log('=== DIAGNOSTIC: Listing tables ===')
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_tables') // This might not work, but let's try
      
      results.tables = {
        data: tablesData,
        error: tablesError
      }

      // Test 5: Try raw SQL query
      console.log('=== DIAGNOSTIC: Raw SQL test ===')
      try {
        const { data: rawData, error: rawError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .limit(5)
        
        results.rawQuery = {
          data: rawData,
          error: rawError
        }
      } catch (err) {
        results.rawQuery = { error: err }
      }

      setDebugInfo(results)
    } catch (error) {
      console.error('Diagnostic error:', error)
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4">Running database diagnostics...</div>
  }

  return (
    <div className="p-4 space-y-4 bg-black border rounded-lg">
      <h2 className="text-xl font-bold">Database Diagnostics</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Orders Table:</h3>
        <pre className="text-xs bg-black p-2 rounded overflow-auto">
          {JSON.stringify(debugInfo.orders, null, 2)}
        </pre>
      </div>

      <div className="space-y-2 bg-black">
        <h3 className="font-semibold">Profiles Table:</h3>
        <pre className="text-xs bg-black p-2 rounded overflow-auto">
          {JSON.stringify(debugInfo.profiles, null, 2)}
        </pre>
      </div>

      {debugInfo.profiles?.structure && (
        <div className="space-y-2 bg-black">
          <h3 className="font-semibold">Profiles Table Structure:</h3>
          <pre className="text-xs bg-black p-2 rounded overflow-auto">
            Columns: {JSON.stringify(debugInfo.profiles.structure, null, 2)}
          </pre>
        </div>
      )}

      {debugInfo.specificProfile && (
        <div className="space-y-2 bg-black">
          <h3 className="font-semibold">Specific Profile Lookup:</h3>
          <pre className="text-xs bg-black p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo.specificProfile, null, 2)}
          </pre>
        </div>
      )}

      {debugInfo.adminOrders && (
        <div className="space-y-2 bg-black">
          <h3 className="font-semibold">Admin Orders View:</h3>
          <pre className="text-xs bg-black p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo.adminOrders, null, 2)}
          </pre>
        </div>
      )}

      {debugInfo.authUsers && (
        <div className="space-y-2 bg-black">
          <h3 className="font-semibold">Auth Users Test:</h3>
          <pre className="text-xs bg-black p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo.authUsers, null, 2)}
          </pre>
        </div>
      )}

      <button 
        onClick={runDiagnostics}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Diagnostics Again
      </button>
    </div>
  )
}
