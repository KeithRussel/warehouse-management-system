/**
 * Database Seed Script
 * Created: November 14, 2025
 *
 * Seeds the database with initial data including:
 * - Super Admin user
 * - Sample suppliers
 * - Sample products
 * - Sample storage locations
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Super Admin User
  console.log('Creating super admin user...');
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
      isActive: true,
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // Create Admin User
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'manager@wms.com' },
    update: {},
    create: {
      email: 'manager@wms.com',
      username: 'manager',
      password: adminPassword,
      name: 'Warehouse Manager',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create Employee User
  console.log('Creating employee user...');
  const employeePassword = await bcrypt.hash('employee123', 10);

  const employee = await prisma.user.upsert({
    where: { email: 'staff@wms.com' },
    update: {},
    create: {
      email: 'staff@wms.com',
      username: 'staff',
      password: employeePassword,
      name: 'Warehouse Staff',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  console.log(`✅ Employee created: ${employee.email}`);

  // Create Sample Suppliers
  console.log('Creating sample suppliers...');

  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { code: 'SUP001' },
      update: {},
      create: {
        code: 'SUP001',
        name: 'Fresh Foods Inc.',
        contactName: 'John Smith',
        email: 'john@freshfoods.com',
        phone: '+1234567890',
        address: '123 Market Street, City, Country',
        isActive: true,
      },
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP002' },
      update: {},
      create: {
        code: 'SUP002',
        name: 'Frozen Delights Ltd.',
        contactName: 'Jane Doe',
        email: 'jane@frozendelights.com',
        phone: '+1234567891',
        address: '456 Cold Avenue, City, Country',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Create Sample Storage Locations
  console.log('Creating storage locations...');

  const locations = await Promise.all([
    // Frozen storage locations
    prisma.storageLocation.upsert({
      where: { code: 'F-A1-R1-S1' },
      update: {},
      create: {
        code: 'F-A1-R1-S1',
        zone: 'Freezer A',
        section: 'A1',
        rack: 'R1',
        shelf: 'S1',
        temperatureZone: 'FROZEN',
        capacity: 100,
        isActive: true,
      },
    }),
    prisma.storageLocation.upsert({
      where: { code: 'F-A1-R1-S2' },
      update: {},
      create: {
        code: 'F-A1-R1-S2',
        zone: 'Freezer A',
        section: 'A1',
        rack: 'R1',
        shelf: 'S2',
        temperatureZone: 'FROZEN',
        capacity: 100,
        isActive: true,
      },
    }),
    // Chilled storage locations
    prisma.storageLocation.upsert({
      where: { code: 'C-B1-R1-S1' },
      update: {},
      create: {
        code: 'C-B1-R1-S1',
        zone: 'Chiller B',
        section: 'B1',
        rack: 'R1',
        shelf: 'S1',
        temperatureZone: 'CHILLED',
        capacity: 150,
        isActive: true,
      },
    }),
    prisma.storageLocation.upsert({
      where: { code: 'C-B1-R1-S2' },
      update: {},
      create: {
        code: 'C-B1-R1-S2',
        zone: 'Chiller B',
        section: 'B1',
        rack: 'R1',
        shelf: 'S2',
        temperatureZone: 'CHILLED',
        capacity: 150,
        isActive: true,
      },
    }),
    // Ambient storage locations
    prisma.storageLocation.upsert({
      where: { code: 'A-C1-R1-S1' },
      update: {},
      create: {
        code: 'A-C1-R1-S1',
        zone: 'Ambient C',
        section: 'C1',
        rack: 'R1',
        shelf: 'S1',
        temperatureZone: 'AMBIENT',
        capacity: 200,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${locations.length} storage locations`);

  // Create Sample Products
  console.log('Creating sample products...');

  const products = await Promise.all([
    // Frozen products
    prisma.product.upsert({
      where: { sku: 'FRZ-001' },
      update: {},
      create: {
        sku: 'FRZ-001',
        barcode: '1234567890001',
        name: 'Frozen Chicken Breast',
        description: 'Premium quality frozen chicken breast',
        category: 'Meat & Poultry',
        temperatureZone: 'FROZEN',
        shelfLifeDays: 365,
        minStockLevel: 50,
        maxStockLevel: 500,
        unit: 'kg',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'FRZ-002' },
      update: {},
      create: {
        sku: 'FRZ-002',
        barcode: '1234567890002',
        name: 'Frozen Mixed Vegetables',
        description: 'Assorted frozen vegetables',
        category: 'Vegetables',
        temperatureZone: 'FROZEN',
        shelfLifeDays: 730,
        minStockLevel: 100,
        maxStockLevel: 1000,
        unit: 'kg',
        isActive: true,
      },
    }),
    // Chilled products
    prisma.product.upsert({
      where: { sku: 'CHL-001' },
      update: {},
      create: {
        sku: 'CHL-001',
        barcode: '1234567890003',
        name: 'Fresh Milk',
        description: 'Pasteurized fresh milk',
        category: 'Dairy',
        temperatureZone: 'CHILLED',
        shelfLifeDays: 7,
        minStockLevel: 100,
        maxStockLevel: 500,
        unit: 'pcs',
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CHL-002' },
      update: {},
      create: {
        sku: 'CHL-002',
        barcode: '1234567890004',
        name: 'Cheese',
        description: 'Cheddar cheese blocks',
        category: 'Dairy',
        temperatureZone: 'CHILLED',
        shelfLifeDays: 60,
        minStockLevel: 50,
        maxStockLevel: 300,
        unit: 'kg',
        isActive: true,
      },
    }),
    // Ambient products
    prisma.product.upsert({
      where: { sku: 'AMB-001' },
      update: {},
      create: {
        sku: 'AMB-001',
        barcode: '1234567890005',
        name: 'Canned Beans',
        description: 'Canned red kidney beans',
        category: 'Canned Goods',
        temperatureZone: 'AMBIENT',
        shelfLifeDays: 1095,
        minStockLevel: 200,
        maxStockLevel: 2000,
        unit: 'pcs',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Default Login Credentials:');
  console.log('   Super Admin:');
  console.log('   Email: admin@wms.com');
  console.log('   Password: admin123');
  console.log('\n   Admin:');
  console.log('   Email: manager@wms.com');
  console.log('   Password: admin123');
  console.log('\n   Employee:');
  console.log('   Email: staff@wms.com');
  console.log('   Password: employee123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
