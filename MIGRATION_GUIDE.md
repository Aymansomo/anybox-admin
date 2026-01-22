# Database Migration Guide

## 🚨 Current Issue: Tables Don't Exist

The errors you're seeing mean the database tables haven't been created yet. You need to run the migration files in Supabase.

## 📋 Required Migrations (Run in Order)

### 1. E-Commerce Schema (Required First)
**File:** `supabase/migrations/20240111_ecommerce_schema.sql`

**Creates:**
- `categories` table
- `subcategories` table  
- `products` table
- `product_features` table
- `product_colors` table
- `product_sizes` table

### 2. Orders Schema (Required Second)
**File:** `supabase/migrations/20240111_orders_schema.sql`

**Creates:**
- `customers` table
- `orders` table
- `order_items` table

## 🔧 How to Run Migrations

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. You'll see a query editor window

### Step 2: Run E-Commerce Schema
1. **Copy the entire content** of `20240111_ecommerce_schema.sql`
2. **Paste it into the SQL Editor**
3. **Click "Run"** (or press Ctrl+Enter)
4. **Wait for completion** - Should show "Success" message

### Step 3: Run Orders Schema
1. **Copy the entire content** of `20240111_orders_schema.sql`
2. **Paste it into the SQL Editor**
3. **Click "Run"** (or press Ctrl+Enter)
4. **Wait for completion** - Should show "Success" message

### Step 4: Verify Tables Created
1. **Go to "Table Editor"** in Supabase
2. **You should see all tables:**
   - categories
   - subcategories
   - products
   - product_features
   - product_colors
   - product_sizes
   - customers
   - orders
   - order_items

## ✅ Verification

After running both migrations:

1. **Visit:** `http://localhost:3000/test-connection`
2. **Should see:** ✅ All green connections
3. **Products page:** Will show real data
4. **Sales chart:** Will show actual orders

## 🚨 Common Issues & Solutions

### "relation does not exist"
**Cause:** Tables not created yet
**Solution:** Run the migration files first

### "permission denied"
**Cause:** RLS policies blocking access
**Solution:** Check RLS policies in migration files

### "syntax error"
**Cause:** SQL syntax issues
**Solution:** Copy the entire file content, not partial

## 🎯 Success Indicators

When migrations are successful:
- ✅ SQL Editor shows "Success" message
- ✅ Table Editor lists all new tables
- ✅ Test connection page shows all green
- ✅ Admin dashboard displays real data

## 🔄 After Migrations

Once tables exist:
1. All admin components will work with real data
2. API routes will connect to live database
3. Sales chart will show actual order information
4. Full admin functionality will be operational

**Run both migration files in order, then test your connection!**
