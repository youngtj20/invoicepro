import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTemplates() {
  console.log('🔧 Fixing template slugs...\n');

  try {
    // Check for templates with incorrect slugs
    const allTemplates = await prisma.template.findMany();
    
    console.log('Current templates in database:');
    allTemplates.forEach(t => {
      console.log(`  - ${t.name} (slug: ${t.slug})`);
    });
    console.log('');

    // Delete any templates with incorrect slugs
    const incorrectSlugs = ['classic', 'modern', 'elegant', 'minimal', 'professional'];
    
    for (const slug of incorrectSlugs) {
      const template = await prisma.template.findUnique({
        where: { slug }
      });

      if (template) {
        console.log(`⚠️  Found template with incorrect slug "${slug}" - deleting...`);
        await prisma.template.delete({
          where: { slug }
        });
        console.log(`✅ Deleted template with slug "${slug}"`);
      }
    }
    console.log('');

    // Ensure all correct templates exist
    const correctTemplates = [
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

    console.log('Ensuring all correct templates exist...');
    for (const template of correctTemplates) {
      await prisma.template.upsert({
        where: { slug: template.slug },
        update: template,
        create: template,
      });
      console.log(`  ✅ ${template.name} (${template.slug})`);
    }

    console.log('\n✅ Template fix completed successfully!');
    console.log('\nFinal templates in database:');
    const finalTemplates = await prisma.template.findMany({
      orderBy: { name: 'asc' }
    });
    finalTemplates.forEach(t => {
      console.log(`  - ${t.name} (slug: ${t.slug}) ${t.isPremium ? '[PREMIUM]' : '[FREE]'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
