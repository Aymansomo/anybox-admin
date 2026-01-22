# Admin Dashboard Setup Guide

## 🔧 Environment Variables Setup

The admin dashboard needs Supabase environment variables to connect to the database.

### Step 1: Create .env.local file

Since `.env*` files are ignored by git, you need to create the environment file manually:

1. **Create a new file** named `.env.local` in the admin project root
2. **Add your Supabase credentials:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xbnbbvoucbkgfuqtsdnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibmJidm91Y2JlZiI6InNlcnZpZSI6ImFub24iLCJpYXQiOjE3NjgxMzM1OTYsImV4cCI6MjA4MzcwOTU5Nn0.oIlcwbkAJ2b89wF7yKn2uvVHsZ7YdTRd8Z3j4PZR0as

# Database Configuration (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpZSI6ImFub24iLCJpYXQiOjE3NjgxMzM1OTYsImV4cCI6MjA4MzcwOTU1Nn0.p4Lg_TmUTV1P_KpSEM1g6Caym8jDFtNQ4QAcFkqLhBM
```

### Step 2: Restart Development Server

After creating the `.env.local` file:

1. **Stop the current dev server** (if running)
2. **Restart with:** `npm run dev`
3. **Clear browser cache** (Ctrl+F5)

### Step 3: Test Connection

1. **Visit:** `http://localhost:3000/test-connection`
2. **Should see:** ✅ Connected Successfully for all tables
3. **Check browser console** for any remaining errors

## 🗄️ Database Setup

Make sure you've run these migrations in Supabase:

1. **E-commerce Schema:** `supabase/migrations/20240111_ecommerce_schema.sql`
2. **Orders Schema:** `supabase/migrations/20240111_orders_schema.sql`
3. **Admin Schema:** `admin_schema.sql`

## 🔍 Troubleshooting

### If you still see connection errors:

1. **Check Supabase URL** - Make sure it's correct
2. **Verify API Keys** - Ensure keys match your Supabase project
3. **Check Network** - Ensure you can reach Supabase from your location
4. **RLS Policies** - Make sure Row Level Security allows access

### Common Issues:

- **"relation does not exist"** → Run the migration files first
- **"permission denied"** → Check RLS policies in Supabase
- **"connection refused"** → Verify URL and API keys

## 🚀 Next Steps

Once connected:

1. **Products page** will show real data from Supabase
2. **Sales chart** will display actual order data
3. **Low stock products** will show real inventory
4. **All API routes** will work with live data

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify the `.env.local` file has the correct values
3. Ensure Supabase project is active and accessible
4. Run migrations in correct order (e-commerce first, then orders)
