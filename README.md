# Cold Storage Warehouse Management System

A modern warehouse management system built with Next.js 15, Prisma, and PostgreSQL, specifically designed for cold storage operations.

## Features

### ✅ Inventory Management
- Real-time inventory tracking with batch and expiry dates
- Reserved quantity tracking for pending orders
- FIFO (First In, First Out) inventory management
- Color-coded availability indicators
- Temperature zone tracking

### ✅ Inbound Operations
- Goods receiving workflow
- Batch and expiry date tracking
- Automatic stock movement records
- Supplier management

### ✅ Outbound Operations
- Customer order management (Advance Orders)
- Order dispatch with automatic DR number generation
- FIFO-based inventory reduction
- Delivery receipt printing
- Dispatch amendment for returns/corrections

### ✅ Documents & Printing
- Professional delivery receipt (DR) printing
- Customizable document templates
- Print-ready A4 format

### ✅ User Management
- Role-based access control (Super Admin, Admin, Employee)
- Secure authentication with NextAuth
- Activity tracking

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **Printing**: react-to-print

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/warehouse-management-system.git
cd warehouse-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and other credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/warehouse_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Seed the database (optional):
```bash
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warehouse-management-system.git
git push -u origin main
```

### 2. Set Up Database

You'll need a PostgreSQL database. Options:
- **Neon** (Recommended - Free tier): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your repository
4. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
5. Click "Deploy"

### 4. Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

Or use Vercel's dashboard to run:
```bash
npx prisma migrate deploy
```

## Default Login

After seeding the database:
- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## Database Schema

Key models:
- **Users**: Authentication and role management
- **Products**: Product catalog with temperature zones
- **Inventory**: Stock levels by batch and expiry
- **Suppliers/Customers**: Business partners
- **InboundOrders**: Goods receiving
- **OutboundOrders**: Customer orders and dispatches
- **StockMovements**: Audit trail of inventory changes

## Project Structure

```
warehouse-management-system/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main app pages
│   └── api/               # API routes
├── components/            # React components
│   ├── dialogs/          # Modal dialogs
│   ├── forms/            # Form components
│   ├── tables/           # Data tables
│   ├── print/            # Print templates
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configs
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── validations/      # Zod schemas
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Features Roadmap

- [ ] Reporting & Analytics
- [ ] Excel export
- [ ] Barcode scanning
- [ ] Stock transfer between locations
- [ ] Purchase order management
- [ ] Customer portal
- [ ] Mobile app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
