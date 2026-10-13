import mongoose, { Model } from 'mongoose';
import { Staff } from '../models/Staff.js';
import { Product } from '../models/Product.js';
import { PRODUCT_CATALOG } from './productCatalog.js';
import { Section } from '../models/Section.js';
import { Category } from '../models/Category.js';
import { Subcategory } from '../models/Subcategory.js';
import { Brand } from '../models/Brand.js';
import { Color } from '../models/Color.js';
import { Size } from '../models/Size.js';
import { News } from '../models/News.js';
import { slugify } from '../utils/slugify.js';
import { ENV } from '../config/env.js';

export const seedInitialAdmin = async (): Promise<void> => {
  try {
    const existingAdmin = await Staff.findOne({
      $or: [
        { email: ENV.ADMIN_EMAIL.toLowerCase().trim() },
        { role: 'superadmin' },
      ],
    });

    if (!existingAdmin) {
      console.log(`[Seed] Creating initial Super Admin: ${ENV.ADMIN_EMAIL}`);
      const admin = new Staff({
        name: ENV.ADMIN_NAME,
        email: ENV.ADMIN_EMAIL.toLowerCase().trim(),
        password: ENV.ADMIN_PASSWORD,
        role: 'superadmin',
        status: 'active',
      });
      await admin.save();
      console.log(`[Seed] Initial Super Admin successfully created (${ENV.ADMIN_EMAIL})`);
    } else {
      console.log(`[Seed] Super Admin already exists (${existingAdmin.email})`);
    }
  } catch (error) {
    console.error('[Seed] Error during admin seeding:', error);
  }
};

export const seedInitialProducts = async (): Promise<void> => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding initial product catalog...');
      const sampleProducts = PRODUCT_CATALOG;
      await Product.insertMany(sampleProducts);
      console.log(`[Seed] Seeded ${sampleProducts.length} sample products.`);
    } else {
      console.log(`[Seed] Products already exist (${count} items)`);
    }
  } catch (error) {
    console.error('[Seed] Error seeding products:', error);
  }
};

export const seedInitialSections = async (): Promise<void> => {
  try {
    // Never re-seed a populated database: admin deletions must be permanent.
    // Seeding only runs on a fresh/empty install.
    const existingSections = await Section.countDocuments();
    if (existingSections > 0) {
      console.log(`[Seed] Sections already exist (${existingSections}); skipping seed.`);
      return;
    }

    const clientSections = [
      {
        sectionKey: 'navbar',
        sectionName: 'Main Navigation',
        category: 'Navigation',
        title: 'Total Apparel Navigation',
        subtitle: 'Header Menu & Actions',
        description: 'Global site header navigation links and dropdown menus',
        image: '/companylogo.png',
        images: ['/companylogo.png'],
        badgeText: 'Total Apparel',
        buttonText: 'Request Quote',
        buttonLink: '/contact',
        content: {
          links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Services', href: '/capabilities' },
            { label: 'Process', href: '/process' },
            { label: 'Products', href: '/products' },
            { label: 'Lookbook', href: '/lookbook' },
            { label: 'News', href: '/news' },
            { label: 'Contact', href: '/contact' },
          ],
          aboutMenu: {
            featuredImage: '/our-story-cover.png',
            featuredTitle: 'Heritage & Vision',
            featuredText: 'Engineering apparel solutions with decades of textile expertise.',
            links: [
              { label: 'Our Story', href: '/about' },
              { label: 'Mission & Values', href: '/about#mission' },
              { label: 'Team & Expertise', href: '/about#team' },
              { label: 'Sustainability', href: '/about#sustainability' },
            ],
            socials: [
              { label: 'Facebook', href: 'https://facebook.com' },
              { label: 'Instagram', href: 'https://instagram.com' },
            ],
            processLinks: [
              { label: 'Raw Cotton', href: '/process#cotton', icon: 'Leaf' },
              { label: 'Spinning Mill', href: '/process#spinning', icon: 'Settings2' },
              { label: 'Weaving Loom', href: '/process#weaving', icon: 'Grid' },
              { label: 'Yarn to Fabric', href: '/process#yarn', icon: 'Layers' },
              { label: 'Fabric Dyeing', href: '/process#dyeing', icon: 'Droplet' },
              { label: 'Quality Lab', href: '/process#lab', icon: 'Microscope' },
              { label: 'Garment Making', href: '/process#garment', icon: 'Scissors' },
              { label: 'Global Logistics', href: '/process#shipping', icon: 'Ship' },
            ],
          },
          productsMenu: {
            featuredImage: '/apparel-manufacturing.png',
            featuredTitle: 'Premium Collection',
            featuredText: 'Discover high-grade knitwear, outerwear, and precision streetwear blanks.',
            links: [
              { label: 'All Products', href: '/products' },
              { label: 'Mens Clothing', href: '/products?category=Mens%20Clothing' },
              { label: 'Womens Clothing', href: '/products?category=Womens%20Clothing' },
              { label: 'Activewear', href: '/products?category=Activewear' },
              { label: 'Outerwear & Hoodies', href: '/products?category=Hoodie%20%26%20Sweatshirts' },
            ],
          },
          ctaText: 'Request Quote',
          ctaLink: '/contact',
        },
      },
      {
        sectionKey: 'hero',
        sectionName: 'Hero Section',
        category: 'Homepage',
        title: 'Our Journey Started.',
        subtitle: "Connecting the world's leading fashion brands with premium textile engineering and seamless production management.",
        description: "Connecting the world's leading fashion brands with premium textile engineering and seamless production management.",
        image: '/total apparel.png',
        images: ['/total apparel.png'],
        badgeText: 'Total Apparel Manufacturing',
        buttonText: 'Start Production',
        buttonLink: '/contact',
        content: {
          videos: [
            '/realistic1.mp4',
            '/realistic2.mp4',
            '/realistic3.mp4',
          ],
        },
      },
      {
        sectionKey: 'company_story',
        sectionName: 'Our Story',
        category: 'Homepage',
        title: 'Our Story',
        subtitle: 'Excellence in Global Apparel Manufacturing',
        description: 'Since our inception, we have been driven by a singular vision: to redefine global apparel manufacturing through uncompromising quality and sustainable innovation. What began as a boutique operation has evolved into a world-class production powerhouse.',
        image: '/images/company-story/factory.png',
        images: [
          '/images/company-story/factory.png',
          '/images/company-story/inspection.png',
          '/images/company-story/cutting.png',
        ],
        badgeText: 'Total Apparel Journey',
        buttonText: 'Learn More About Us',
        buttonLink: '/about',
        stats: [
          { label: 'Years Experience', value: '15+' },
          { label: 'Global Clients', value: '500+' },
          { label: 'Export Countries', value: '50+' },
          { label: 'On-Time Delivery', value: '99%' },
        ],
      },
      {
        sectionKey: 'cotton_farming',
        sectionName: 'Cotton Farming',
        category: 'Homepage',
        title: 'The Origins of Our Quality',
        subtitle: '100% Organic Certified Cotton',
        description: 'Every premium garment begins with exceptional raw materials. Our photorealistic cotton fields represent our commitment to sustainable farming, ensuring that from seed to thread, quality is never compromised.',
        image: '/images/cotton_farming_hero.png',
        images: [
          '/images/cotton_farming_hero.png',
          '/images/quality_laboratory.png',
          '/images/company-story/inspection.png',
        ],
        badgeText: 'Sustainable Source',
        buttonText: 'Explore Our Farming Process',
        buttonLink: '#cotton',
      },
      {
        sectionKey: 'spinning_mill',
        sectionName: 'Spinning Mill',
        category: 'Homepage',
        title: 'Modern Spinning Technology',
        subtitle: 'Automated Precision Spindles',
        description: 'Experience the cinematic precision of our modern spinning mills. We transform raw white cotton fibers into fine, exceptionally strong yarn threads using high-speed spindles and cutting-edge mechanical technology.',
        image: '/images/spinning_mill_yarn.png',
        images: [
          '/images/spinning_mill_yarn.png',
          '/images/precision_spinning.png',
          '/images/yarn_to_fabric.png',
          '/images/weaving_loom.png',
        ],
        badgeText: 'Textile Manufacturing',
        buttonText: 'View Production Plant',
        buttonLink: '#spinning',
      },
      {
        sectionKey: 'weaving_loom',
        sectionName: 'Weaving Loom',
        category: 'Homepage',
        title: 'The Art of Weaving',
        subtitle: 'Woven Perfection & Synchronized Threads',
        description: 'Witness the cinematic orchestration of our ultra-modern weaving looms. Thousands of fine yarns crisscross in perfect synchrony, forming the structural foundation of our luxurious and highly durable apparel.',
        image: '/images/weaving_loom.png',
        images: [
          '/images/weaving_loom.png',
          '/images/yarn_to_fabric.png',
          '/images/fabric_dyeing.png',
        ],
        badgeText: 'Fabric Construction',
        buttonText: 'Discover Our Textiles',
        buttonLink: '#weaving',
      },
      {
        sectionKey: 'yarn_to_fabric',
        sectionName: 'Yarn to Fabric',
        category: 'Homepage',
        title: 'Yarn to Fabric',
        subtitle: 'Neural Grid Active • Laser Interlacing',
        description: 'Experience the futuristic evolution of textile manufacturing. Glowing neon blue and white yarn threads automatically interlace into a complex, high-tech fabric grid driven by laser-guided systems.',
        image: '/images/yarn_to_fabric.png',
        images: ['/images/yarn_to_fabric.png'],
        badgeText: 'Textile Innovation',
        buttonText: 'Explore Technology',
        buttonLink: '#yarn',
      },
      {
        sectionKey: 'fabric_dyeing',
        sectionName: 'Fabric Dyeing',
        category: 'Homepage',
        title: 'Fabric Dyeing & Finishing',
        subtitle: 'Advanced Color Infusion & Eco-Friendly Dyes',
        description: 'Infusing life into our textiles. Our modern, high-tech dyeing facilities ensure vibrant, long-lasting colors while our finishing processes add unparalleled texture, performance, and durability to every woven roll.',
        image: '/images/fabric_dyeing.png',
        images: ['/images/fabric_dyeing.png'],
        badgeText: 'Color & Texture',
        buttonText: 'View Dyeing Process',
        buttonLink: '#dyeing',
      },
      {
        sectionKey: 'quality_laboratory',
        sectionName: 'Quality Laboratory',
        category: 'Homepage',
        title: 'Quality Laboratory',
        subtitle: 'ISO Certified Lab - Strict QC Parameters',
        description: 'Before any fabric moves to production, it must pass our state-of-the-art laboratory testing. From GSM verification to advanced shrinkage and color fastness analysis, our scientists ensure perfect consistency.',
        image: '/images/quality_laboratory.png',
        images: ['/images/quality_laboratory.png'],
        badgeText: 'Uncompromising Standards',
        buttonText: 'Explore QC Parameters',
        buttonLink: '#lab',
      },
      {
        sectionKey: 'garment_manufacturing',
        sectionName: 'Garment Manufacturing',
        category: 'Homepage',
        title: 'Garment Manufacturing',
        subtitle: 'High-Volume Automated Stitching & Construction',
        description: 'The grand finale of our production process. From automated precision fabric cutting to advanced stitching and immaculate packing, our vast industrial facilities transform premium textiles into world-class finished garments.',
        image: '/images/garment_manufacturing.png',
        images: [
          '/images/garment_manufacturing.png',
          '/images/company-story/cutting.png',
          '/images/company-story/factory.png',
        ],
        badgeText: 'Final Assembly',
        buttonText: 'Take a Factory Tour',
        buttonLink: '#garment',
      },
      {
        sectionKey: 'global_manufacturing',
        sectionName: 'Global Manufacturing',
        category: 'Homepage',
        title: 'Global Manufacturing Process',
        subtitle: 'Worldwide Delivery - Global Sync Active',
        description: 'From the initial tech pack to final worldwide delivery, we manage the entire lifecycle. Our interconnected global logistics network ensures transparency, speed, and uncompromising quality at every single touchpoint.',
        image: '/images/global_manufacturing.png',
        images: ['/images/global_manufacturing.png'],
        badgeText: 'End-to-End Supply Chain',
        buttonText: 'Track Our Logistics',
        buttonLink: '#global',
      },
      {
        sectionKey: 'lets_work_together',
        sectionName: "Let's Work Together",
        category: 'Homepage',
        title: "Let's Work Together",
        subtitle: 'Global Headquarters: New York • London • Dhaka',
        description: 'Partner with a world-class manufacturing facility. Whether you have a new tech pack or a large-scale production inquiry, our team is ready to deliver excellence.',
        image: '/images/lets_work_together.png',
        images: ['/images/lets_work_together.png'],
        badgeText: 'Business Inquiry',
        buttonText: 'Send an Inquiry',
        buttonLink: 'mailto:inquiry@globalapparel.com',
      },
      // FOOTER & GLOBAL CTA
      {
        sectionKey: 'footer',
        sectionName: 'Footer & Global Brand',
        category: 'Footer',
        title: "Let's Build Together.",
        subtitle: 'Start Project',
        description: "Partner with the industry's finest. We engineer apparel solutions that define global brands.",
        image: '',
        images: [],
        badgeText: 'id@totaltexbd.com',
        buttonText: 'Start Project',
        buttonLink: '/contact',
      },
      // ABOUT PAGE SECTIONS
      {
        sectionKey: 'about_hero',
        sectionName: 'About - Hero Story',
        category: 'About Page',
        title: 'The TOTAL APPAREL Story.',
        subtitle: 'Global Excellence',
        description: 'Operating from the heart of the global textile hub in Dhaka, Bangladesh, TOTAL APPAREL bridges the gap between creative fashion design and technical garment manufacturing. We bring together a specialized team of textile engineers and merchandising experts dedicated to supplying world-class Ready-Made Garments (RMG) to the international market.',
        image: '/our-story-cover.png',
        images: ['/our-story-cover.png'],
        badgeText: 'Global Excellence',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'about_mission',
        sectionName: 'About - Mission & Precision',
        category: 'About Page',
        title: 'Precision, Transparency, and Timely Delivery',
        subtitle: 'Our Mission',
        description: 'At TOTAL APPAREL, we believe that exceptional garments begin with meticulous planning and technical precision. We go beyond traditional manufacturing by providing expert fabric selection—including premium cottons, specialized activewear blends, and eco-friendly organics.',
        image: '/process-engineering.png',
        images: [
          '/process-engineering.png',
          '/process-sourcing.png',
          '/process-quality.png',
        ],
        badgeText: 'Quality Assured',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'about_expertise',
        sectionName: 'About - Expertise & Partners',
        category: 'About Page',
        title: 'Driven by Expertise, Trusted by Global Partners',
        subtitle: 'Ethical Manufacturing',
        description: 'Our team consists of seasoned textile engineers, merchandising specialists, and quality control experts with decades of combined industry experience. We collaborate closely with international fashion brands, buying houses, and independent labels, acting as their highly reliable, on-the-ground execution partner in Bangladesh.',
        image: '/professional-team.png',
        images: [
          '/professional-team.png',
          '/merchandising.png',
        ],
        badgeText: 'Decades of Experience',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'about_cta',
        sectionName: 'About - Ready to Source CTA',
        category: 'About Page',
        title: "Let's Build Your Next Collection.",
        subtitle: 'Ready to Source?',
        description: 'Work With Our Team to engineer apparel solutions that define global brands.',
        image: '',
        images: [],
        badgeText: 'Ready to Source?',
        buttonText: 'Work With Our Team',
        buttonLink: '/contact',
      },
      // CONTACT PAGE
      {
        sectionKey: 'contact_hero',
        sectionName: 'Contact - Hero & Details',
        category: 'Contact Page',
        title: "Let's Build Together.",
        subtitle: 'Start Your Project',
        description: "From raw materials to global shipment, we engineer elite manufacturing solutions for the world's most demanding brands.",
        image: '/images/contact_hero_bg.png',
        images: ['/images/contact_hero_bg.png'],
        badgeText: 'Total Apparel Bd. • Dhaka, Bangladesh',
        buttonText: '',
        buttonLink: '',
      },
      // CAPABILITIES PAGE
      {
        sectionKey: 'capabilities_hero',
        sectionName: 'Capabilities - Hero',
        category: 'Capabilities Page',
        title: 'Technical Expertise.',
        subtitle: 'Core Competencies',
        description: "Seamless execution across the entire manufacturing ecosystem, engineered for the world's leading brands.",
        image: '',
        images: [],
        badgeText: 'Core Competencies',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'capabilities_merchandising',
        sectionName: 'Capabilities - Merchandising',
        category: 'Capabilities Page',
        title: 'Strategic Merchandising',
        subtitle: 'From concept to production',
        description: 'Our merchandising team translates your vision into a production-ready plan — costing, sourcing, sampling, and timelines handled end-to-end.',
        image: '/images/company-story/factory.png',
        images: ['/images/company-story/factory.png'],
        badgeText: 'Merchandising',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'capabilities_fabric',
        sectionName: 'Capabilities - Fabric Development',
        category: 'Capabilities Page',
        title: 'Fabric Development',
        subtitle: 'Custom textiles, engineered',
        description: 'From GSM and hand-feel to finish and performance, we develop fabrics tailored to your product and your market.',
        image: '/images/fabric_dyeing.png',
        images: ['/images/fabric_dyeing.png', '/images/yarn_to_fabric.png'],
        badgeText: 'Fabric Development',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'capabilities_quality',
        sectionName: 'Capabilities - Quality & Compliance',
        category: 'Capabilities Page',
        title: 'Quality & Compliance',
        subtitle: 'Protected at every step',
        description: 'Multi-stage inspection and internationally recognised testing protect your brand at every step.',
        image: '/images/quality_laboratory.png',
        images: ['/images/quality_laboratory.png', '/images/global_manufacturing.png'],
        badgeText: 'Quality & Compliance',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'capabilities_cta',
        sectionName: 'Capabilities - Ready to Source CTA',
        category: 'Capabilities Page',
        title: "Let's Engineer Your Next Collection.",
        subtitle: 'Ready to Source?',
        description: 'Share your tech pack or idea — our team will come back with costing, timelines, and a production plan.',
        image: '',
        images: [],
        badgeText: 'Ready to Source?',
        buttonText: 'Start Your Project',
        buttonLink: '/contact',
      },
      // PROCESS PAGE
      {
        sectionKey: 'process_hero',
        sectionName: 'Process - Ecosystem Hero',
        category: 'Process Page',
        title: 'The Anatomy of Precision',
        subtitle: 'Our Ecosystem',
        description: 'Discover how we are working with global buyers and maintaining the start-to-end process. We seamlessly execute complex orders through meticulous engineering. From the Tech Pack to Shipment, we define world-class manufacturing.',
        image: '',
        images: [],
        badgeText: 'Our Ecosystem',
        buttonText: '',
        buttonLink: '',
      },
      {
        sectionKey: 'process_steps',
        sectionName: 'Process - 6 Manufacturing Steps Gallery',
        category: 'Process Page',
        title: '6-Stage Production Pipeline',
        subtitle: 'From Yarn to Global Delivery',
        description: '01 Raw Material Sourcing • 02 Fabric Development • 03 Dyeing & Production • 04 Cutting & Engineering • 05 Quality Assurance • 06 Packaging & Logistics',
        image: '/process-sourcing.png',
        images: [
          '/process-sourcing.png',
          '/fabric-development.png',
          '/process-production.png',
          '/process-engineering.png',
          '/process-quality.png',
          '/export-logistics.png',
        ],
        badgeText: '6-Step Pipeline',
        buttonText: '',
        buttonLink: '',
      },
    ];

    // Rich, section-specific content so every home page section renders its
    // unique feature / process / timeline blocks out of the box.
    const sectionContent: Record<string, Record<string, unknown>> = {
      capabilities_hero: {
        headingLine1: 'Technical',
        headingLine2: 'Expertise.',
        categories: [
          '01 Strategic Merchandising',
          '02 Fabric Development',
          '03 Quality & Compliance',
          '04 Global Logistics',
        ],
      },
      capabilities_merchandising: {
        features: [
          'Dedicated account merchandiser',
          'Transparent cost breakdown & MOQs',
          'Rapid sampling and fit approvals',
          'Production scheduling you can track',
        ],
        statValue: '98%',
        statLabel: 'On-time delivery',
      },
      capabilities_fabric: {
        features: [
          { title: 'Lab Dips & Matching', desc: 'Spectrophotometer colour matching for accurate, repeatable shades.' },
          { title: 'GSM & Composition Control', desc: 'Precise weight, stretch and composition to your exact specification.' },
          { title: 'Performance Finishes', desc: 'Anti-pilling, water-repellent and soft-touch treatments.' },
        ],
      },
      capabilities_quality: {
        paragraphs: [
          'Every order passes inline and end-line inspection against AQL standards, with GSM, shrinkage and colour-fastness validated in our in-house laboratory.',
          'We maintain full compliance documentation — BSCI, OEKO-TEX and GOTS-aligned certifications — so your products clear customs and audits without delays.',
          'From pre-production samples to the final pre-shipment audit, our QA team signs off on every milestone before your goods leave the floor.',
        ],
      },
      capabilities_cta: {
        headingLine1: "Let's Engineer",
        headingLine2: 'Your Next Collection.',
      },
      company_story: {
        trustBadges: [
          'ISO 9001 Certified',
          'Ethical & Safe Factories',
          'On-Time Global Delivery',
          'Low MOQ Sampling',
        ],
      },
      cotton_farming: {
        features: [
          { icon: 'Sun', title: 'Regenerative Farming', description: 'Long-staple cotton cultivated under responsible, soil-first agricultural practices.' },
          { icon: 'Droplets', title: 'Water-Efficient Irrigation', description: 'Drip systems cut water usage while protecting fibre strength and purity.' },
          { icon: 'Leaf', title: 'Organic Certification', description: 'GOTS-aligned organic cotton, fully traceable from field to finished fabric.' },
        ],
      },
      spinning_mill: {
        processes: [
          { icon: 'Settings', title: 'Automated Spinning Lines', description: 'High-speed ring and compact spindles deliver consistent yarn counts at scale.' },
          { icon: 'Repeat', title: 'Sliver & Roving Control', description: 'Precision drafting minimises neps and imperfections at every single stage.' },
          { icon: 'Layers', title: 'Quality-Tested Yarn', description: 'Every lot is load-tested for tensile strength, evenness, and elongation.' },
        ],
        floatingBox: {
          title: '99.2% Yarn Consistency',
          description: 'Measured across 1.2M production spindles each month.',
        },
      },
      weaving_loom: {
        highlights: [
          { icon: 'Maximize', title: 'Air-Jet Precision', description: 'High-density weaving with perfect warp and weft alignment every pass.' },
          { icon: 'Zap', title: 'Rapid Changeovers', description: 'Quick style changes keep sampling and bulk runs fast and flexible.' },
          { icon: 'ShieldCheck', title: 'Fabric Integrity', description: 'In-line inspection catches faults long before finishing and dyeing.' },
        ],
      },
      yarn_to_fabric: {
        innovations: [
          { icon: 'Activity', title: 'Laser Interlacing', description: 'Laser-guided systems interlace yarns into complex, high-tech fabric grids.' },
          { icon: 'Cpu', title: 'Digital Monitoring', description: 'IoT sensors track tension, humidity, and temperature in real time.' },
          { icon: 'Network', title: 'Smart Fabric Blends', description: 'Engineered performance blends tailored to your exact end use.' },
        ],
        statusText: 'Live production sync: 98.6% efficiency',
      },
      fabric_dyeing: {
        features: [
          { icon: 'Palette', title: 'Lab-Matched Colour', description: 'Spectrophotometer matching for pinpoint shade accuracy across batches.' },
          { icon: 'Droplet', title: 'Eco-Friendly Dyes', description: 'Low-impact reactive dyes paired with closed-loop water treatment.' },
          { icon: 'Sparkles', title: 'Premium Finishing', description: 'Softening, anti-pilling, and performance finishes for a luxury hand-feel.' },
        ],
      },
      quality_laboratory: {
        tests: [
          { icon: 'Ruler', title: 'GSM & Shrinkage', description: 'Dimensional stability validated before any bulk production begins.' },
          { icon: 'Pipette', title: 'Colour Fastness', description: 'Wash, rub, and light fastness tested to international standards.' },
          { icon: 'Microscope', title: 'Fibre Analysis', description: 'Microscopic inspection detects contamination and hidden defects.' },
        ],
      },
      garment_manufacturing: {
        stages: [
          { icon: 'Scissors', title: 'Precision Cutting', description: 'CAD-driven cutting with automated fabric spreading and nesting.' },
          { icon: 'Factory', title: 'High-Volume Stitching', description: 'Modular lines scale effortlessly from sampling to millions of units.' },
          { icon: 'Package', title: 'Finishing & Packing', description: 'Steam finishing, final checks, and export-ready packing.' },
        ],
      },
      global_manufacturing: {
        timeline: [
          { icon: 'FileText', title: 'Tech Pack Review', description: 'Specifications, costing, and timelines finalised with your team.' },
          { icon: 'Globe', title: 'Production & QC', description: 'Centralised production with multi-stage quality gates.' },
          { icon: 'CheckCircle', title: 'Final Audit', description: 'Pre-shipment inspection and complete compliance documentation.' },
          { icon: 'Ship', title: 'Global Delivery', description: 'Consolidated freight with live shipment tracking to your door.' },
        ],
      },
      footer: {
        brandName: 'TOTAL APPAREL',
        brandDescription:
          'Engineering world-class apparel solutions from Dhaka to the global market — from raw cotton to finished garments.',
        email: 'id@totaltexbd.com',
        columns: [
          {
            title: 'Company',
            links: [
              { label: 'About Us', href: '/about' },
              { label: 'Our Process', href: '/process' },
              { label: 'Capabilities', href: '/capabilities' },
              { label: 'News', href: '/news' },
            ],
          },
          {
            title: 'Services',
            links: [
              { label: 'Product Catalog', href: '/products' },
              { label: 'Lookbook', href: '/lookbook' },
              { label: 'Contact', href: '/contact' },
            ],
          },
          {
            title: 'Socials',
            links: [
              { label: 'Facebook', href: 'https://facebook.com' },
              { label: 'Instagram', href: 'https://instagram.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
            ],
          },
        ],
        legalLinks: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
        ],
      },
    };

    // Only create sections that do not exist yet. Existing sections are managed
    // from the admin panel, so we must never overwrite their content on restart.
    for (const sec of clientSections) {
      const extraContent = sectionContent[sec.sectionKey];
      const seeded = extraContent
        ? { ...sec, content: { ...((sec as { content?: Record<string, unknown> }).content || {}), ...extraContent } }
        : sec;
      await Section.updateOne(
        { sectionKey: sec.sectionKey },
        { $setOnInsert: seeded },
        { upsert: true }
      );
    }
    // Clean up old obsolete keys if present
    await Section.deleteMany({
      sectionKey: { $in: ['quality_lab', 'garment_mfg', 'global_mfg'] },
    });

    console.log(`[Seed] Synced all ${clientSections.length} real client sections.`);
  } catch (error) {
    console.error('[Seed] Error seeding sections:', error);
  }
};

export const seedInitialTaxonomies = async (): Promise<void> => {
  try {
    const upsertMany = async (
      model: Model<any>,
      label: string,
      items: Record<string, any>[]
    ): Promise<void> => {
      // Never re-seed a populated collection: admin deletions must be permanent.
      // Seeding only runs on a fresh/empty install so deleted brands, colors,
      // sizes, categories and subcategories never come back on restart.
      const existing = await model.countDocuments();
      if (existing > 0) {
        console.log(`[Seed] ${label} already exist (${existing}); skipping seed.`);
        return;
      }
      for (const item of items) {
        const slug = item.slug || slugify(item.name);
        await model.updateOne({ slug }, { $setOnInsert: { ...item, slug } }, { upsert: true });
      }
      console.log(`[Seed] Synced ${items.length} ${label}.`);
    };

    const colors = [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Red', hex: '#DC2626' },
      { name: 'Blue', hex: '#2563EB' },
      { name: 'Navy Blue', hex: '#1E3A8A' },
      { name: 'Sky Blue', hex: '#38BDF8' },
      { name: 'Green', hex: '#16A34A' },
      { name: 'Olive Green', hex: '#4D7C0F' },
      { name: 'Yellow', hex: '#FACC15' },
      { name: 'Orange', hex: '#F97316' },
      { name: 'Pink', hex: '#EC4899' },
      { name: 'Purple', hex: '#7C3AED' },
      { name: 'Maroon', hex: '#7F1D1D' },
      { name: 'Brown', hex: '#78350F' },
      { name: 'Beige', hex: '#D6C7A1' },
      { name: 'Cream', hex: '#F5F0E1' },
      { name: 'Gray', hex: '#9CA3AF' },
      { name: 'Charcoal', hex: '#374151' },
      { name: 'Khaki', hex: '#C3B091' },
      { name: 'Teal', hex: '#0D9488' },
      { name: 'Cyan', hex: '#06B6D4' },
      { name: 'Magenta', hex: '#D946EF' },
      { name: 'Multicolor', hex: '#808080' },
    ].map((c, i) => ({ ...c, sortOrder: i, status: 'active' }));

    const sizes = [
      { name: 'Newborn', code: 'NB', group: 'kids', sortOrder: 1 },
      { name: '0–3 Months', code: '0-3M', group: 'kids', sortOrder: 2 },
      { name: '3–6 Months', code: '3-6M', group: 'kids', sortOrder: 3 },
      { name: '6–12 Months', code: '6-12M', group: 'kids', sortOrder: 4 },
      { name: '1–2 Years', code: '1-2Y', group: 'kids', sortOrder: 5 },
      { name: '2–3 Years', code: '2-3Y', group: 'kids', sortOrder: 6 },
      { name: '4 Years', code: '4Y', group: 'kids', sortOrder: 7 },
      { name: '6 Years', code: '6Y', group: 'kids', sortOrder: 8 },
      { name: '8 Years', code: '8Y', group: 'kids', sortOrder: 9 },
      { name: '10 Years', code: '10Y', group: 'kids', sortOrder: 10 },
      { name: '12 Years', code: '12Y', group: 'kids', sortOrder: 11 },
      { name: '14 Years', code: '14Y', group: 'kids', sortOrder: 12 },
      { name: '16 Years', code: '16Y', group: 'kids', sortOrder: 13 },
      { name: 'Extra Small', code: 'XS', group: 'adult', sortOrder: 14 },
      { name: 'Small', code: 'S', group: 'adult', sortOrder: 15 },
      { name: 'Medium', code: 'M', group: 'adult', sortOrder: 16 },
      { name: 'Large', code: 'L', group: 'adult', sortOrder: 17 },
      { name: 'Extra Large', code: 'XL', group: 'adult', sortOrder: 18 },
      { name: '2X Large', code: 'XXL', group: 'adult', sortOrder: 19 },
      { name: '3X Large', code: 'XXXL', group: 'adult', sortOrder: 20 },
      { name: '4X Large', code: '4XL', group: 'adult', sortOrder: 21 },
      { name: '5X Large', code: '5XL', group: 'adult', sortOrder: 22 },
      { name: 'Free Size', code: 'FREE', group: 'adult', sortOrder: 23 },
      { name: 'Waist 26', code: 'W26', group: 'adult', sortOrder: 24 },
      { name: 'Waist 28', code: 'W28', group: 'adult', sortOrder: 25 },
      { name: 'Waist 30', code: 'W30', group: 'adult', sortOrder: 26 },
      { name: 'Waist 32', code: 'W32', group: 'adult', sortOrder: 27 },
      { name: 'Waist 34', code: 'W34', group: 'adult', sortOrder: 28 },
      { name: 'Waist 36', code: 'W36', group: 'adult', sortOrder: 29 },
      { name: 'Waist 38', code: 'W38', group: 'adult', sortOrder: 30 },
    ].map((s) => ({
      name: s.name,
      group: s.group,
      sortOrder: s.sortOrder,
      description: `Code: ${s.code}`,
      status: 'active',
    }));

    const brands = [
      { name: 'Nike', description: 'Sportswear, T-shirts, Hoodies', sortOrder: 1 },
      { name: 'Adidas', description: 'Sportswear, Tracksuits', sortOrder: 2 },
      { name: 'H&M', description: 'Casual and Everyday Wear', sortOrder: 3 },
      { name: 'Zara', description: 'Fashion and Formal Wear', sortOrder: 4 },
      { name: 'Uniqlo', description: 'Basic Wear and Essentials', sortOrder: 5 },
      { name: "Levi's", description: 'Denim & Jeanswear', sortOrder: 6 },
      { name: 'Puma', description: 'Athletic & Lifestyle Apparel', sortOrder: 7 },
      { name: 'Under Armour', description: 'Performance & Sportswear', sortOrder: 8 },
      { name: 'Tommy Hilfiger', description: 'Classic American Cool', sortOrder: 9 },
      { name: 'Calvin Klein', description: 'Modern Minimalist & Underwear', sortOrder: 10 },
      { name: 'Ralph Lauren', description: 'Polo & Premium Apparel', sortOrder: 11 },
      { name: 'GAP', description: 'Casual & Denim Essentials', sortOrder: 12 },
      { name: 'Gucci', description: 'Luxury Fashion & Ready-to-Wear', sortOrder: 13 },
      { name: 'Louis Vuitton', description: 'Luxury Fashion & Accessories', sortOrder: 14 },
      { name: 'The North Face', description: 'Outdoor & Technical Outerwear', sortOrder: 15 },
      { name: 'Columbia', description: 'Outdoor & Active Sportswear', sortOrder: 16 },
      { name: 'Mango', description: 'Contemporary Fashion', sortOrder: 17 },
      { name: 'Pull&Bear', description: 'Youth Streetwear & Casual', sortOrder: 18 },
      { name: 'Bershka', description: 'Urban Street Fashion', sortOrder: 19 },
      { name: 'Massimo Dutti', description: 'Sophisticated Urban Wear', sortOrder: 20 },
      { name: 'Jack & Jones', description: "Men's Denim & Casual", sortOrder: 21 },
      { name: 'Vero Moda', description: "Contemporary Women's Fashion", sortOrder: 22 },
      { name: 'Only', description: 'Denim & Casual Streetwear', sortOrder: 23 },
      { name: 'Forever 21', description: 'Fast Fashion & Trendy Styles', sortOrder: 24 },
      { name: 'ASOS', description: 'Trend-driven Fashion & Basics', sortOrder: 25 },
      { name: 'Champion', description: 'Heritage Athleticwear & Hoodies', sortOrder: 26 },
      { name: 'New Balance', description: 'Athletic Footwear & Activewear', sortOrder: 27 },
      { name: 'Lululemon', description: 'Yoga & Technical Athletic Apparel', sortOrder: 28 },
      { name: 'Diesel', description: 'Premium Denim & Streetwear', sortOrder: 29 },
      { name: 'Hugo Boss', description: 'Tailoring & Luxury Casualwear', sortOrder: 30 },
    ].map((b) => ({ ...b, status: 'active' }));

    const categoryData = [
      {
        name: "Men's Clothing",
        description: 'Apparel and clothing line for men',
        subcategories: [
          'T-shirt & Polo Shirt',
          'Hoodie & Sweatshirts',
          'Jeans',
          'Shirts',
          'Sweater',
          'Jacket & Vest',
          'Pants & Trousers',
          'Shorts',
          'Underwear',
          'Sleepwear',
        ],
      },
      {
        name: "Women's Clothing",
        description: 'Apparel and fashion wear for women',
        subcategories: [
          'T-shirt & Polo Shirt',
          'Hoodie & Sweatshirts',
          'Jeans',
          'Shirts & Blouse',
          'Sweater',
          'Jacket & Vest',
          'Pants & Trousers',
          'Shorts',
          'Underwear',
          'Sleepwear',
          'Dress',
          'Skirts',
          'Leggings',
        ],
      },
      {
        name: "Children's Clothing",
        description: 'Apparel, babywear and clothing sets for children',
        subcategories: [
          'T-shirt',
          'Polo Shirt',
          'Shirts',
          'Pants',
          'Shorts',
          'Dress',
          'Clothing Set',
          'Romper',
          'Baby Bodysuit',
          'Pajamas',
        ],
      },
      {
        name: 'Workwear',
        description: 'Professional uniforms, safety and industrial workwear',
        subcategories: [
          'Work Uniform',
          'Safety Vest',
          'Work Jacket',
          'Work Pants',
          'Coverall',
          'Chef Uniform',
          'Medical Scrubs',
        ],
      },
      {
        name: 'Socks',
        description: 'Socks collection for all ages and athletic activities',
        subcategories: [
          'Ankle Socks',
          'Crew Socks',
          'No-Show Socks',
          'Knee-High Socks',
          'Sports Socks',
          'Dress Socks',
          'Baby Socks',
        ],
      },
      {
        name: 'Headwear',
        description: 'Caps, beanies, sun hats and headwear accessories',
        subcategories: [
          'Baseball Cap',
          'Bucket Hat',
          'Beanie',
          'Sun Hat',
          'Snapback Cap',
          'Trucker Hat',
        ],
      },
      {
        name: 'Accessories',
        description: 'Fashion accessories, belts, scarves, bags and wallets',
        subcategories: [
          'Belts',
          'Gloves',
          'Scarves',
          'Face Cover',
          'Bags & Totes',
          'Ties',
          'Wallets',
        ],
      },
      {
        name: 'Home Textile',
        description: 'Bed sheets, towels, curtains and home textile essentials',
        subcategories: [
          'Bed Sheets',
          'Pillowcases',
          'Blankets',
          'Curtains',
          'Towels',
          'Washcloths',
          'Cushion Covers',
        ],
      },
      {
        name: 'Underwear & Lingerie',
        description: 'Innerwear, briefs, trunks, bras and thermal undergarments',
        subcategories: [
          'Bra',
          'Panty',
          'Briefs',
          'Boxers',
          'Trunks',
          'Camisole',
          'Thermal Underwear',
        ],
      },
    ];

    const categories = categoryData.map((c, i) => ({
      name: c.name,
      slug: slugify(c.name),
      description: c.description,
      sortOrder: i + 1,
      status: 'active',
    }));

    const subcategories = categoryData.flatMap((c) =>
      c.subcategories.map((name, sIdx) => ({
        name,
        category: c.name,
        slug: slugify(`${c.name} ${name}`),
        sortOrder: sIdx + 1,
        status: 'active',
      }))
    );

    await upsertMany(Color, 'colors', colors);
    await upsertMany(Size, 'sizes', sizes);
    await upsertMany(Brand, 'brands', brands);
    await upsertMany(Category, 'categories', categories);
    await upsertMany(Subcategory, 'subcategories', subcategories);
  } catch (error) {
    console.error('[Seed] Error seeding taxonomies:', error);
  }
};

export const seedInitialNews = async (): Promise<void> => {
  try {
    const articles = [
      {
        title: 'The Future of Sustainable Denim: Closed-Loop Water Systems',
        slug: 'sustainable-denim',
        category: 'Sustainability',
        date: 'July 24, 2026',
        readTime: '8 min read',
        excerpt:
          'As the global fashion industry rapidly shifts towards true circularity, we explore how our newly implemented closed-loop water systems and ozone washing techniques are revolutionizing high-volume raw denim manufacturing.',
        image: '/images/fabric_dyeing.png',
        featured: true,
      },
      {
        title: 'Navigating Global Logistics: SS26 Freight Updates',
        slug: 'navigating-global-logistics-ss26-freight-updates',
        category: 'Supply Chain',
        date: 'July 20, 2026',
        readTime: '5 min read',
        excerpt: 'How AI-driven forecasting and optimized freight routes are cutting global transit times this season.',
        image: '/images/global_manufacturing.png',
        featured: false,
      },
      {
        title: 'Material Focus: The Rise of Heavyweight French Terry',
        slug: 'material-focus-heavyweight-french-terry',
        category: 'Fabric Innovation',
        date: 'July 15, 2026',
        readTime: '4 min read',
        excerpt: 'Inside our new knitting technique for 400gsm+ French Terry with a smooth, print-ready face.',
        image: '/images/yarn_to_fabric.png',
        featured: false,
      },
      {
        title: 'Inside the Facility: New Quality Assurance Protocols',
        slug: 'inside-the-facility-new-quality-assurance-protocols',
        category: 'Operations',
        date: 'July 08, 2026',
        readTime: '6 min read',
        excerpt: 'Automated optical inspection and zero-defect tolerance now standard across every production line.',
        image: '/images/quality_laboratory.png',
        featured: false,
      },
      {
        title: 'Client Spotlight: Scaling a Luxury Streetwear Syndicate',
        slug: 'client-spotlight-scaling-a-luxury-streetwear-syndicate',
        category: 'Case Study',
        date: 'June 28, 2026',
        readTime: '10 min read',
        excerpt: 'How we scaled a European streetwear brand from 5,000 to 50,000 units with flawless consistency.',
        image: '/images/garment_manufacturing.png',
        featured: false,
      },
      {
        title: 'The Golden Hour: Photorealistic Cotton Harvesting',
        slug: 'the-golden-hour-photorealistic-cotton-harvesting',
        category: 'Sourcing',
        date: 'June 12, 2026',
        readTime: '7 min read',
        excerpt: 'Regenerative agriculture and long-staple fibers from our partner cotton farms.',
        image: '/images/cotton_farming_hero.png',
        featured: false,
      },
      {
        title: 'Ultra-Modern Weaving Looms in Action',
        slug: 'ultra-modern-weaving-looms-in-action',
        category: 'Technology',
        date: 'June 05, 2026',
        readTime: '5 min read',
        excerpt: 'Air-jet weaving technology enabling custom fabric development at lower MOQs.',
        image: '/images/weaving_loom.png',
        featured: false,
      },
    ].map((item, i) => ({ ...item, status: 'active', sortOrder: i }));

    const count = await News.countDocuments();
    if (count === 0) {
      await News.insertMany(articles);
      console.log(`[Seed] Seeded ${articles.length} news articles.`);
    } else {
      console.log(`[Seed] News already exists (${count} articles)`);
    }
  } catch (error) {
    console.error('[Seed] Error seeding news:', error);
  }
};

// Directly run seeder ONLY if executed directly from CLI (e.g. npm run seed)
const runCLI = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed CLI] Connected to database');
    await seedInitialAdmin();
    await seedInitialProducts();
    await seedInitialSections();
    await seedInitialTaxonomies();
    await seedInitialNews();
    await mongoose.disconnect();
    console.log('[Seed CLI] Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('[Seed CLI] Connection failed:', err);
    process.exit(1);
  }
};

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runCLI();
}
