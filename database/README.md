# 📁 Database Scripts Organization

## 🗂️ Folder Structure

```
database/
├── sql-scripts/           # Security scripts (current)
│   ├── enable_secure_rls.sql
│   ├── alternative_rls_setup.sql
│   └── simple_security_check.sql
├── legacy-scripts/       # Legacy scripts from project root
│   ├── complete_database_schema.sql
│   ├── create_staff_tables.sql
│   ├── fix_*.sql          # Various fix scripts
│   ├── check_*.sql        # Debug and check scripts
│   └── [40+ legacy files]
└── [other database files...]
```

## 📋 Script Categories

### 🔐 Security Scripts (`sql-scripts/`)
1. **`simple_security_check.sql`** - Check current security setup
2. **`enable_secure_rls.sql`** - Full RLS setup (requires owner permissions)
3. **`alternative_rls_setup.sql`** - Limited permission RLS setup

### 🗃️ Legacy Scripts (`legacy-scripts/`)
- **Schema**: `complete_database_schema.sql`, `create_staff_tables.sql`
- **Fixes**: `fix_*.sql` files for various issues
- **Debug**: `check_*.sql`, `debug_*.sql` files
- **Setup**: `setup_*.sql`, `ensure_*.sql` files

### 📦 Supabase Migrations (`supabase/migrations/`)
- Official Supabase migration files
- Timestamped migration history

## 🚀 Quick Start

1. **Security Setup**:
   ```sql
   -- Run: sql-scripts/simple_security_check.sql
   -- Then: sql-scripts/enable_secure_rls.sql (or alternative)
   ```

2. **Legacy Schema** (if needed):
   ```sql
   -- Run: legacy-scripts/complete_database_schema.sql
   ```

All SQL files are now properly organized! ✅
