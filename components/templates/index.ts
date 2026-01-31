// Export all invoice templates
export { default as ModernBlue } from './ModernBlue';
export { default as ClassicGreen } from './ClassicGreen';
export { default as ElegantPurple } from './ElegantPurple';
export { default as BoldRed } from './BoldRed';
export { default as MinimalistGray } from './MinimalistGray';
export { default as CorporateNavy } from './CorporateNavy';
export { default as FreshOrange } from './FreshOrange';
export { default as ProfessionalBlack } from './ProfessionalBlack';
export { default as FriendlyYellow } from './FriendlyYellow';
export { default as TechTeal } from './TechTeal';
export { default as GradientSunset } from './GradientSunset';
export { default as LuxuryGold } from './LuxuryGold';
export { default as OceanWave } from './OceanWave';
export { default as RoseGold } from './RoseGold';
export { default as MidnightDark } from './MidnightDark';
export { default as PastelDream } from './PastelDream';

// Export types
export type { InvoiceData, TemplateProps } from './types';

// Template registry for dynamic selection
import ModernBlue from './ModernBlue';
import ClassicGreen from './ClassicGreen';
import ElegantPurple from './ElegantPurple';
import BoldRed from './BoldRed';
import MinimalistGray from './MinimalistGray';
import CorporateNavy from './CorporateNavy';
import FreshOrange from './FreshOrange';
import ProfessionalBlack from './ProfessionalBlack';
import FriendlyYellow from './FriendlyYellow';
import TechTeal from './TechTeal';
import GradientSunset from './GradientSunset';
import LuxuryGold from './LuxuryGold';
import OceanWave from './OceanWave';
import RoseGold from './RoseGold';
import MidnightDark from './MidnightDark';
import PastelDream from './PastelDream';

export const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  'modern-blue': ModernBlue,
  'classic-green': ClassicGreen,
  'elegant-purple': ElegantPurple,
  'bold-red': BoldRed,
  'minimalist-gray': MinimalistGray,
  'corporate-navy': CorporateNavy,
  'fresh-orange': FreshOrange,
  'professional-black': ProfessionalBlack,
  'friendly-yellow': FriendlyYellow,
  'tech-teal': TechTeal,
  'gradient-sunset': GradientSunset,
  'luxury-gold': LuxuryGold,
  'ocean-wave': OceanWave,
  'rose-gold': RoseGold,
  'midnight-dark': MidnightDark,
  'pastel-dream': PastelDream,
};

// Template metadata for gallery display
export const TEMPLATE_METADATA = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and modern design with blue accents',
    color: '#2563EB',
    isPremium: false,
  },
  {
    id: 'classic-green',
    name: 'Classic Green',
    description: 'Traditional business layout with green theme',
    color: '#15803D',
    isPremium: false,
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    description: 'Sophisticated design with purple gradients',
    color: '#9333EA',
    isPremium: true,
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    description: 'Strong and attention-grabbing red design',
    color: '#DC2626',
    isPremium: true,
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'Ultra-clean grayscale design',
    color: '#4B5563',
    isPremium: false,
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    description: 'Professional navy blue corporate style',
    color: '#1E3A8A',
    isPremium: true,
  },
  {
    id: 'fresh-orange',
    name: 'Fresh Orange',
    description: 'Energetic and modern orange theme',
    color: '#EA580C',
    isPremium: true,
  },
  {
    id: 'professional-black',
    name: 'Professional Black',
    description: 'Premium black and white elegance',
    color: '#111827',
    isPremium: true,
  },
  {
    id: 'friendly-yellow',
    name: 'Friendly Yellow',
    description: 'Warm and approachable yellow design',
    color: '#CA8A04',
    isPremium: false,
  },
  {
    id: 'tech-teal',
    name: 'Tech Teal',
    description: 'Modern tech startup vibe with teal',
    color: '#0891B2',
    isPremium: true,
  },
  {
    id: 'gradient-sunset',
    name: 'Gradient Sunset',
    description: 'Beautiful gradient design with warm sunset colors',
    color: '#F97316',
    isPremium: true,
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium gold and black luxury design',
    color: '#EAB308',
    isPremium: true,
  },
  {
    id: 'ocean-wave',
    name: 'Ocean Wave',
    description: 'Calming blue-green gradient with wave elements',
    color: '#06B6D4',
    isPremium: true,
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant rose gold and cream design',
    color: '#FB7185',
    isPremium: true,
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    description: 'Modern dark theme with neon accents',
    color: '#7C3AED',
    isPremium: true,
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Soft pastel colors for a gentle, dreamy look',
    color: '#A78BFA',
    isPremium: true,
  },
];

// Helper function to get template component by slug
export function getTemplateComponent(slug: string) {
  return TEMPLATE_MAP[slug] || ModernBlue; // Default to ModernBlue if not found
}

// Helper function to get template metadata by slug
export function getTemplateMetadata(slug: string) {
  return TEMPLATE_METADATA.find((t) => t.id === slug);
}
