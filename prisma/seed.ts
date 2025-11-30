import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create subscription plans
  console.log('Creating subscription plans...');

  const freePlan = await prisma.plan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for getting started with basic invoicing',
      price: 0,
      currency: 'NGN',
      billingPeriod: 'MONTHLY',
      trialDays: 0,
      maxInvoices: 3,
      maxCustomers: 10,
      maxItems: 10,
      canUsePremiumTemplates: false,
      canCustomizeTemplates: false,
      canUseReporting: false,
      canExportData: false,
      canRemoveBranding: false,
      canUseWhatsApp: false,
      canUseSMS: false,
      isActive: true,
      isDefault: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses with unlimited invoicing',
      price: 5000,
      currency: 'NGN',
      billingPeriod: 'MONTHLY',
      trialDays: 7,
      maxInvoices: -1, // unlimited
      maxCustomers: -1,
      maxItems: -1,
      canUsePremiumTemplates: true,
      canCustomizeTemplates: true,
      canUseReporting: true,
      canExportData: true,
      canRemoveBranding: true,
      canUseWhatsApp: true,
      canUseSMS: true,
      isActive: true,
      isDefault: false,
    },
  });

  console.log('✅ Plans created:', { freePlan: freePlan.id, proPlan: proPlan.id });

  // Create invoice templates
  console.log('Creating invoice templates...');

  const templates = [
    {
      name: 'Modern Blue',
      slug: 'modern-blue',
      description: 'Clean and professional blue template',
      isPremium: false,
      config: {
        colors: { primary: '#0ea5e9', secondary: '#64748b', accent: '#f59e0b' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'modern',
        logo: { position: 'left', size: 'medium' },
      },
    },
    {
      name: 'Classic Green',
      slug: 'classic-green',
      description: 'Traditional invoice with green accents',
      isPremium: false,
      config: {
        colors: { primary: '#10b981', secondary: '#6b7280', accent: '#fbbf24' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'classic',
        logo: { position: 'center', size: 'large' },
      },
    },
    {
      name: 'Elegant Purple',
      slug: 'elegant-purple',
      description: 'Sophisticated purple design',
      isPremium: true,
      config: {
        colors: { primary: '#8b5cf6', secondary: '#6b7280', accent: '#f59e0b' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'elegant',
        logo: { position: 'left', size: 'small' },
      },
    },
    {
      name: 'Bold Red',
      slug: 'bold-red',
      description: 'Eye-catching red template',
      isPremium: true,
      config: {
        colors: { primary: '#ef4444', secondary: '#64748b', accent: '#fbbf24' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'bold',
        logo: { position: 'right', size: 'medium' },
      },
    },
    {
      name: 'Minimalist Gray',
      slug: 'minimalist-gray',
      description: 'Simple and clean gray design',
      isPremium: false,
      config: {
        colors: { primary: '#64748b', secondary: '#94a3b8', accent: '#0ea5e9' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'minimal',
        logo: { position: 'left', size: 'small' },
      },
    },
    {
      name: 'Corporate Navy',
      slug: 'corporate-navy',
      description: 'Professional navy blue corporate style',
      isPremium: true,
      config: {
        colors: { primary: '#1e3a8a', secondary: '#64748b', accent: '#f59e0b' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'corporate',
        logo: { position: 'left', size: 'large' },
      },
    },
    {
      name: 'Fresh Orange',
      slug: 'fresh-orange',
      description: 'Vibrant orange design',
      isPremium: true,
      config: {
        colors: { primary: '#f97316', secondary: '#64748b', accent: '#0ea5e9' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'modern',
        logo: { position: 'center', size: 'medium' },
      },
    },
    {
      name: 'Professional Black',
      slug: 'professional-black',
      description: 'Sleek black and white template',
      isPremium: true,
      config: {
        colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#0ea5e9' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'professional',
        logo: { position: 'left', size: 'medium' },
      },
    },
    {
      name: 'Friendly Yellow',
      slug: 'friendly-yellow',
      description: 'Warm and inviting yellow template',
      isPremium: false,
      config: {
        colors: { primary: '#eab308', secondary: '#64748b', accent: '#10b981' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'friendly',
        logo: { position: 'center', size: 'large' },
      },
    },
    {
      name: 'Tech Teal',
      slug: 'tech-teal',
      description: 'Modern teal design for tech businesses',
      isPremium: true,
      config: {
        colors: { primary: '#14b8a6', secondary: '#64748b', accent: '#8b5cf6' },
        fonts: { heading: 'Inter', body: 'Inter' },
        layout: 'tech',
        logo: { position: 'left', size: 'medium' },
      },
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
  }

  console.log(`✅ ${templates.length} templates created`);

  // Create system configuration
  console.log('Creating system configuration...');

  const configs = [
    {
      key: 'trial_period_days',
      value: '7',
      type: 'number',
      description: 'Default trial period in days for new signups',
    },
    {
      key: 'default_currency',
      value: 'NGN',
      type: 'string',
      description: 'Default currency for new tenants',
    },
    {
      key: 'invoice_number_prefix',
      value: 'INV',
      type: 'string',
      description: 'Default prefix for invoice numbers',
    },
    {
      key: 'receipt_number_prefix',
      value: 'REC',
      type: 'string',
      description: 'Default prefix for receipt numbers',
    },
    {
      key: 'proforma_number_prefix',
      value: 'PRO',
      type: 'string',
      description: 'Default prefix for proforma invoice numbers',
    },
    {
      key: 'enable_google_oauth',
      value: 'true',
      type: 'boolean',
      description: 'Enable Google OAuth sign-in',
    },
    {
      key: 'enable_whatsapp',
      value: 'true',
      type: 'boolean',
      description: 'Enable WhatsApp invoice delivery',
    },
    {
      key: 'enable_sms',
      value: 'true',
      type: 'boolean',
      description: 'Enable SMS invoice delivery',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log(`✅ ${configs.length} system configs created`);

  // Create super admin user
  console.log('Creating super admin user...');

  const hashedPassword = await hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@invoicepro.com' },
    update: {},
    create: {
      email: 'admin@invoicepro.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Super admin created:', adminUser.email);
  console.log('   Email: admin@invoicepro.com');
  console.log('   Password: admin123');
  console.log('   ⚠️  PLEASE CHANGE THIS PASSWORD IMMEDIATELY!');

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
