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
      name: 'Modern Blue',
      slug: 'modern-blue',
      description: 'Clean and modern design with blue accents',
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
      name: 'Classic Green',
      slug: 'classic-green',
      description: 'Traditional business layout with green theme',
      isPremium: false,
      isActive: true,
      config: {
        colors: {
          primary: '#15803D',
          secondary: '#166534',
          accent: '#22C55E',
          background: '#DCFCE7',
        },
      },
    },
    {
      name: 'Elegant Purple',
      slug: 'elegant-purple',
      description: 'Sophisticated design with purple gradients',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#9333EA',
          secondary: '#7E22CE',
          accent: '#A855F7',
          background: '#F3E8FF',
        },
      },
    },
    {
      name: 'Bold Red',
      slug: 'bold-red',
      description: 'Strong and attention-grabbing red design',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#DC2626',
          secondary: '#B91C1C',
          accent: '#EF4444',
          background: '#FEE2E2',
        },
      },
    },
    {
      name: 'Minimalist Gray',
      slug: 'minimalist-gray',
      description: 'Ultra-clean grayscale design',
      isPremium: false,
      isActive: true,
      config: {
        colors: {
          primary: '#4B5563',
          secondary: '#374151',
          accent: '#6B7280',
          background: '#F3F4F6',
        },
      },
    },
    {
      name: 'Corporate Navy',
      slug: 'corporate-navy',
      description: 'Professional navy blue corporate style',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#1E3A8A',
          secondary: '#1E40AF',
          accent: '#3B82F6',
          background: '#EFF6FF',
        },
      },
    },
    {
      name: 'Fresh Orange',
      slug: 'fresh-orange',
      description: 'Energetic and modern orange theme',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#EA580C',
          secondary: '#C2410C',
          accent: '#FB923C',
          background: '#FFEDD5',
        },
      },
    },
    {
      name: 'Professional Black',
      slug: 'professional-black',
      description: 'Premium black and white elegance',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#111827',
          secondary: '#1F2937',
          accent: '#374151',
          background: '#F9FAFB',
        },
      },
    },
    {
      name: 'Friendly Yellow',
      slug: 'friendly-yellow',
      description: 'Warm and approachable yellow design',
      isPremium: false,
      isActive: true,
      config: {
        colors: {
          primary: '#CA8A04',
          secondary: '#A16207',
          accent: '#FBBF24',
          background: '#FEFCE8',
        },
      },
    },
    {
      name: 'Tech Teal',
      slug: 'tech-teal',
      description: 'Modern tech startup vibe with teal',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#0891B2',
          secondary: '#0E7490',
          accent: '#06B6D4',
          background: '#CCFBF1',
        },
      },
    },
    {
      name: 'Gradient Sunset',
      slug: 'gradient-sunset',
      description: 'Beautiful gradient design with warm sunset colors',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#F97316',
          secondary: '#EA580C',
          accent: '#FB923C',
          background: '#FFEDD5',
        },
      },
    },
    {
      name: 'Luxury Gold',
      slug: 'luxury-gold',
      description: 'Premium gold and black luxury design',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#EAB308',
          secondary: '#CA8A04',
          accent: '#FCD34D',
          background: '#FEF3C7',
        },
      },
    },
    {
      name: 'Ocean Wave',
      slug: 'ocean-wave',
      description: 'Calming blue-green gradient with wave elements',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#06B6D4',
          secondary: '#0891B2',
          accent: '#22D3EE',
          background: '#CFFAFE',
        },
      },
    },
    {
      name: 'Rose Gold',
      slug: 'rose-gold',
      description: 'Elegant rose gold and cream design',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#FB7185',
          secondary: '#F43F5E',
          accent: '#FDA4AF',
          background: '#FFE4E6',
        },
      },
    },
    {
      name: 'Midnight Dark',
      slug: 'midnight-dark',
      description: 'Modern dark theme with neon accents',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#7C3AED',
          secondary: '#6D28D9',
          accent: '#8B5CF6',
          background: '#EDE9FE',
        },
      },
    },
    {
      name: 'Pastel Dream',
      slug: 'pastel-dream',
      description: 'Soft pastel colors for a gentle, dreamy look',
      isPremium: true,
      isActive: true,
      config: {
        colors: {
          primary: '#A78BFA',
          secondary: '#8B5CF6',
          accent: '#C4B5FD',
          background: '#F5F3FF',
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
