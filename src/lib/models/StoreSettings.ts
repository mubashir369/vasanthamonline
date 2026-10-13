import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreSettings extends Document {
  storeName: string;
  tagline: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  aboutText: string;
  freeDeliveryRadiusKm: number;
  freeDeliveryMinAmount: number;
  baseCourierCharge: number;
  storeLat: number;
  storeLng: number;
  // Homepage Hero & Promo Content
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnLink?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnLink?: string;
  heroImage?: string;
  heroHighlightTag?: string;
  heroHighlightTitle?: string;
  heroHighlightSubtitle?: string;
  heroOfferTag?: string;
  heroOfferTitle?: string;
  heroOfferSubtitle?: string;
  showHeroOffer?: boolean;
  promoBannerTag?: string;
  promoBannerTitle?: string;
  promoBannerSubtitle?: string;
  promoBannerBtnText?: string;
  promoBannerBtnLink?: string;
  promoBannerSecondaryBtnText?: string;
  promoBannerSecondaryBtnLink?: string;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, default: 'Vasantham Group' },
    tagline: { type: String, default: 'Where elegance is woven with tradition.' },
    address: {
      type: String,
      default: 'OPP. MY G Future, Main road Mannarkkad, PALAKKAD, Kerala - 678582',
    },
    contactPhone: { type: String, default: '+91 94471 23456' },
    contactEmail: { type: String, default: 'info@vasanthamgroup.com' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#7E121D' }, // Rich Heritage Crimson
    secondaryColor: { type: String, default: '#D4AF37' }, // Antique Gold
    aboutText: {
      type: String,
      default:
        'Welcome to Vasantham Group — Malabar’s largest textile and fashion network, where tradition meets modern elegance. For generations, Vasantham has been a trusted name in the world of textiles. What began as a humble journey in Palakkad has now grown into one of Malabar’s most beloved destinations for premium fabrics, ethnic wear, and family fashion. At Vasantham Group, we take pride in offering an exquisite range of silk sarees, cotton wear, and designer fabrics — each piece crafted to perfection, blending timeless craftsmanship with contemporary design. Our mission is simple — to make elegant, high-quality fashion affordable for every family. From festive attire to daily wear, we bring you collections that celebrate comfort, culture, and class. Beyond fabrics, we believe in experiences — a warm, welcoming shopping atmosphere where every customer feels valued. Whether you visit our stores or connect with us online, we promise authenticity, quality, and a touch of heritage in every interaction. Vasantham Group — Where elegance is woven with tradition.',
    },
    freeDeliveryRadiusKm: { type: Number, default: 15 },
    freeDeliveryMinAmount: { type: Number, default: 1999 },
    baseCourierCharge: { type: Number, default: 80 },
    storeLat: { type: Number, default: 10.9889 }, // Mannarkkad coordinates
    storeLng: { type: Number, default: 76.4589 },

    // Homepage Hero & Promo Content
    heroBadge: { type: String, default: 'Malabar’s Largest Textile & Fashion Network' },
    heroTitle: { type: String, default: 'Where Elegance Is Woven with Tradition' },
    heroSubtitle: {
      type: String,
      default:
        'From exquisite Kanchipuram wedding silks and authentic Kerala Kasavu handlooms to festive family attire — discover timeless Malabar craftsmanship perfected for modern celebrations.',
    },
    heroPrimaryBtnText: { type: String, default: 'Explore Silk Sarees' },
    heroPrimaryBtnLink: { type: String, default: '/catalog?category=silk-sarees' },
    heroSecondaryBtnText: { type: String, default: 'View All Collections' },
    heroSecondaryBtnLink: { type: String, default: '/catalog' },
    heroImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    },
    heroHighlightTag: { type: String, default: 'Heritage Highlight' },
    heroHighlightTitle: { type: String, default: 'Kanchipuram Royal Crimson Silk' },
    heroHighlightSubtitle: {
      type: String,
      default: 'Pure zari border • Traditional temple weave',
    },
    heroOfferTag: { type: String, default: 'Festival Offer' },
    heroOfferTitle: { type: String, default: '10% OFF' },
    heroOfferSubtitle: { type: String, default: 'Code: VASANTHAM10' },
    showHeroOffer: { type: Boolean, default: true },
    promoBannerTag: { type: String, default: 'Mannarkkad Flagship Store' },
    promoBannerTitle: {
      type: String,
      default: 'Shop Online & Pick Up in Store with Zero Fees',
    },
    promoBannerSubtitle: {
      type: String,
      default:
        'Order your favorite sarees and festive wear from the comfort of your home and collect them anytime at our store',
    },
    promoBannerBtnText: { type: String, default: 'Start Shopping' },
    promoBannerBtnLink: { type: String, default: '/catalog' },
    promoBannerSecondaryBtnText: { type: String, default: 'Store Location & Hours' },
    promoBannerSecondaryBtnLink: { type: String, default: '/contact' },
  },
  {
    timestamps: true,
  }
);

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);

export default StoreSettings;
