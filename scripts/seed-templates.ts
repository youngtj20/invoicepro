/**
 * Seed Templates Script
 *
 * This script creates the default invoice/receipt templates
 *
 * Run with: npx tsx scripts/seed-templates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Starting templates seeding...\n');

  const templates = [
    {
      name: 'Classic Blue',
      slug: 'classic',
      description: 'Professional blue template perfect for corporate invoices',
      isPremium: false,
      isActive: true,
      config: {
        colors: {
          primary: '#2563EB',
          secondary: '#1E40AF',
          accent: '#3B82F6',
          background: '#EFF6FF',
        },
      },
    },
    {
      name: 'Modern Green',
      slug: 'modern',
      description: 'Fresh and modern green design for eco-friendly businesses',
      isPremium: false,
      isActive: true,
      config: {
        colors: {
          primary: '#059669',
          secondary: '#047857',
          accent: '#10B981',
          background: '#ECFDF5',
        },
      },
    },
    {
      name: 'Elegant Purple',
      slug: 'elegant',
      description: 'Sophisticated purple template for luxury brands',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#7C3AED',
          secondary: '#6D28D9',
          accent: '#8B5CF6',
          background: '#F5F3FF',
        },
      },
    },
    {
      name: 'Professional Red',
      slug: 'professional',
      description: 'Bold red design that commands attention',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#DC2626',
          secondary: '#B91C1C',
          accent: '#EF4444',
          background: '#FEF2F2',
        },
      },
    },
    {
      name: 'Minimal Gray',
      slug: 'minimal',
      description: 'Clean and minimal design focusing on content',
      isPremium: false,
      isActive: true,
      config: {
        colors: {
          primary: '#374151',
          secondary: '#1F2937',
          accent: '#4B5563',
          background: '#F9FAFB',
        },
      },
    },
  ];

  console.log('📋 Creating templates...\n');

  for (const templateData of templates) {
    const template = await prisma.template.upsert({
      where: { slug: templateData.slug },
      update: templateData,
      create: templateData,
    });

    const premiumBadge = template.isPremium ? '⭐ Premium' : '✓ Free';
    console.log(`  ${premiumBadge} ${template.name} (${template.slug})`);
  }

  console.log(`\n✅ ${templates.length} templates created/updated\n`);

  // Summary
  const freeTemplates = templates.filter(t => !t.isPremium).length;
  const premiumTemplates = templates.filter(t => t.isPremium).length;

  console.log('📊 Summary:');
  console.log(`  Free Templates: ${freeTemplates}`);
  console.log(`  Premium Templates: ${premiumTemplates}`);
  console.log(`  Total: ${templates.length}`);

  console.log('\n✅ Template seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
