"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TableStatus {
  name: string
  status: 'checking' | 'success' | 'error'
  message: string
}

export default function TestConnection() {
  const [tables, setTables] = useState<TableStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [overallStatus, setOverallStatus] = useState<'checking' | 'success' | 'error'>('checking')

  const tableNames = [
    'categories',
    'subcategories', 
    'products',
    'product_features',
    'product_colors',
    'product_sizes',
    'customers',
    'orders',
    'order_items'
  ]

  useEffect(() => {
    testAllConnections()
  }, [])

  const testAllConnections = async () => {
    setLoading(true)
    setOverallStatus('checking')
    
    const tableStatuses: TableStatus[] = []
    let hasError = false

    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1)

        if (error) {
          tableStatuses.push({
            name: tableName,
            status: 'error',
            message: error.message
          })
          hasError = true
        } else {
          tableStatuses.push({
            name: tableName,
            status: 'success',
            message: 'Connected successfully'
          })
        }
      } catch (err) {
        tableStatuses.push({
          name: tableName,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error'
        })
        hasError = true
      }
    }

    setTables(tableStatuses)
    setOverallStatus(hasError ? 'error' : 'success')
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600 animate-pulse" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Overall Status:</span>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(overallStatus)}`}>
                  {getStatusIcon(overallStatus)}
                  <span className="font-medium">
                    {overallStatus === 'success' && '✅ All connections successful'}
                    {overallStatus === 'error' && '❌ Some connections failed'}
                    {overallStatus === 'checking' && '🔄 Testing connections...'}
                  </span>
                </div>
              </div>
              <Button onClick={testAllConnections} disabled={loading}>
                {loading ? 'Testing...' : 'Test Again'}
              </Button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Testing connection to Supabase tables...</p>
              </div>
            )}

            {!loading && tables.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Table Connection Status:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getStatusColor(table.status)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(table.status)}
                        <span className="font-medium">{table.name}</span>
                      </div>
                      <p className="text-sm">{table.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && tables.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tables tested yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>✅ If all tables show green:</strong> Your Supabase connection is working perfectly!
              </div>
              <div>
                <strong>⚠️ If some tables show red:</strong> Check if you've run the migration files in Supabase SQL Editor.
              </div>
              <div>
                <strong>❌ If all tables show red:</strong> Verify your environment variables in .env.local file.
              </div>
              <div>
                <strong>🔧 Environment variables:</strong> Make sure NEXT_PUBLIC_SUPABASE_URL and keys are correctly set.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
