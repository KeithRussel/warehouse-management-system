# Setup Instructions

**Created:** November 14, 2025
**Last Updated:** November 14, 2025

## Current Progress

The Cold Storage Warehouse Management System has been initialized with the following completed:

### ✅ Completed

1. **Next.js Project Initialized**
   - Next.js 15 with App Router
   - TypeScript configuration
   - Tailwind CSS setup
   - ESLint configuration

2. **Dependencies Installed**
   - All core dependencies installed
   - Prisma ORM configured
   - TanStack Query and Table
   - Zustand for state management
   - React Hook Form + Zod validation
   - All required packages

3. **Database Schema Created**
   - Complete Prisma schema for cold storage WMS
   - All entities defined:
     - Users (with roles)
     - Suppliers
     - Products (with temperature zones)
     - StorageLocations
     - Inventory (with FEFO tracking)
     - InboundOrders & InboundOrderItems
     - OutboundOrders & OutboundOrderItems
     - StockMovements
     - TemperatureLogs

4. **Project Structure with Documentation**
   - Comprehensive folder structure
   - README files in each major directory with dates
   - Documentation files created:
     - Main README.md
     - DATABASE.md
     - docs/README.md
     - Component documentation
     - Library documentation
     - Store documentation
     - App routing documentation

5. **Utility Libraries**
   - `lib/db.ts` - Prisma client singleton
   - `lib/utils.ts` - Utility functions (date, format, etc.)
   - `lib/constants.ts` - Application constants
   - `lib/fefo.ts` - FEFO logic implementation

6. **Configuration Files**
   - Shadcn components.json configured
   - Button component created
   - Tailwind config with Shadcn theme

### ⏳ Next Steps

To complete the setup and start using the system:

#### 1. Install Remaining Shadcn Components

```bash
# Install all required Shadcn components
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add alert
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add avatar
```

#### 2. Set Up Database

```bash
# Create .env file with your database credentials
cp .env.example .env

# Edit .env and set your PostgreSQL connection string:
# DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db"

# Generate a secret for NextAuth:
# NEXTAUTH_SECRET="<your-secret-here>"
# Generate with: openssl rand -base64 32

# Create database (if not exists)
# Using PostgreSQL CLI:
createdb warehouse_db

# Or using psql:
psql -U postgres -c "CREATE DATABASE warehouse_db;"

# Run migrations to create tables
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# (Optional) Seed database with sample data
npx prisma db seed
```

#### 3. Configure Authentication

Create `lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
```

Create `middleware.ts` at root:
```typescript
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)'],
};
```

#### 4. Create Initial Super Admin User

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@wms.com' },
    update: {},
    create: {
      email: 'admin@wms.com',
      username: 'admin',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
    },
  });

  console.log({ superAdmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

#### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Default login:
- Email: `admin@wms.com`
- Password: `admin123`

#### 6. Build Remaining Features

The following features need to be implemented:

1. **Authentication System**
   - Login page
   - Session management
   - Protected routes

2. **Dashboard**
   - Overview statistics
   - Alerts (expiry, low stock, temperature)
   - Quick actions

3. **Core Modules** (in order of priority):
   - Products module (catalog management)
   - Storage Locations module
   - Suppliers module
   - Inbound Orders (receiving)
   - Inventory management
   - Outbound Orders (picking/dispatch)
   - Temperature logging
   - Reports & exports
   - User management

4. **Additional Features**:
   - Barcode scanning
   - Excel export
   - Charts and analytics
   - Mobile responsive design

## Development Workflow

### Adding New Features

1. Create database models in `prisma/schema.prisma` (if needed)
2. Create API routes in `app/api/[feature]/`
3. Create page components in `app/(dashboard)/[feature]/`
4. Create form components in `components/forms/`
5. Create table components in `components/tables/`
6. Add validation schemas in `lib/validations/`
7. Update constants if needed

### Testing Locally

```bash
# Run development server
npm run dev

# View database in Prisma Studio
npx prisma studio

# Check database
psql -U postgres -d warehouse_db
```

### Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Next.js App (Frontend)        │
│  - React Components                     │
│  - Shadcn/UI                            │
│  - TanStack Query (data fetching)       │
│  - Zustand (client state)               │
└────────────┬────────────────────────────┘
             │
             │ HTTP/API
             │
┌────────────▼────────────────────────────┐
│      Next.js API Routes (Backend)       │
│  - Authentication (NextAuth.js)         │
│  - Business Logic                       │
│  - Validation (Zod)                     │
└────────────┬────────────────────────────┘
             │
             │ Prisma ORM
             │
┌────────────▼────────────────────────────┐
│        PostgreSQL Database              │
│  - All data storage                     │
│  - Inventory tracking                   │
│  - Transaction logs                     │
└─────────────────────────────────────────┘
```

## Key Features Summary

### Cold Storage Specific
- ❄️ Temperature zone management (Frozen/Chilled/Ambient)
- 📅 FEFO (First Expired, First Out) logic
- 🌡️ Temperature logging and monitoring
- ⚠️ Expiry alerts and warnings
- 📦 Batch/lot tracking

### Inventory Management
- 📊 Real-time stock levels
- 📍 Multi-location tracking
- 🔄 Stock movements audit trail
- ⚖️ Stock adjustments
- 📈 Min/max stock levels

### Order Management
- 📥 Inbound orders (receiving)
- 📤 Outbound orders (picking/dispatch)
- ✅ Order status tracking
- 📋 Pick lists generation
- 🚚 Dispatch management

### Reporting
- 📑 Inventory reports
- 📊 Movement reports
- ⏰ Expiry reports
- 🌡️ Temperature logs
- 📥 Excel export

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

## Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review database schema in `prisma/schema.prisma`
3. Check component documentation in respective folders

---

**Last Updated:** November 14, 2025
