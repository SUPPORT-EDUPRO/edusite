# Tenant Resolution Architecture

## Overview

EduSitePro uses a **Row Level Security (RLS)** approach for tenant resolution, eliminating the need to store the Supabase service role key in environment variables. This is more secure and follows Supabase best practices.

## How It Works

### 1. **Middleware-Safe Database Access**

The middleware uses the **anon client** (public key) to query tenant data:

```typescript
// Uses NEXT_PUBLIC_SUPABASE_ANON_KEY - safe to expose
import { supabase } from './supabase';

const centre = await supabase
  .from('centres')
  .select('*')
  .eq('slug', slug)
  .eq('status', 'active')
  .single();
```

### 2. **RLS Policies Control Access**

Database-level policies ensure only appropriate data is accessible:

- **centres table**: Only `active` centres are readable by anon users
- **centre_domains table**: Only `verified` domains are readable by anon users
- **Write operations**: Still require authentication (service role or authenticated users)

### 3. **In-Memory Caching**

To minimize database queries, tenant data is cached in memory for 5 minutes:

```typescript
const centreCache = new Map<string, Centre>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

## Security Benefits

1. **No Service Role Key Required**: The service role key grants full admin access and should never be in environment variables
2. **Principle of Least Privilege**: Middleware only has access to read active centres and verified domains
3. **Database-Level Security**: RLS policies are enforced at the database level, not in application code
4. **Audit Trail**: All database access is logged and can be monitored

## When You DO Need Service Role Key

The service role key is still required for:

- **Admin operations**: Creating, updating, or deleting centres
- **Background jobs**: Scheduled tasks that need admin access
- **Server-side mutations**: Any write operations from API routes

For these operations, use API routes with proper authentication:

```typescript
// pages/api/admin/centres.ts
import { getServiceRoleClient } from '@/lib/supabase';

export default async function handler(req, res) {
  // Verify admin authentication first
  const adminClient = getServiceRoleClient();
  // Perform admin operations...
}
```

## Deployment

The service role key should be stored in:

- **Local Development**: Not needed for basic development
- **Vercel Production**: Environment variable in Vercel dashboard (never in code)
- **CI/CD**: Secrets manager (GitHub Secrets, etc.)

## RLS Policies

Current policies are defined in:

```
supabase/migrations/20250125000002_add_public_tenant_resolution_policies.sql
```

To apply them to your Supabase instance:

```bash
# Using Supabase CLI
supabase db push

# Or run the migration directly in Supabase SQL Editor
```

## Performance Considerations

- **Cache Hit Rate**: Monitor cache effectiveness with logs
- **Database Load**: RLS adds minimal overhead to queries
- **Edge Deployment**: Middleware runs at the edge for low latency

## Troubleshooting

### "Row Level Security policy violation"

If you see RLS errors, ensure:

1. The centre `status` is set to `'active'`
2. Domain `verification_status` is `'verified'`
3. Migration has been applied to your database

### "No centre found"

Check:

1. Centre exists in database with correct slug
2. Domain is configured in `centre_domains` table
3. Cache is not stale (wait 5 minutes or clear manually)
