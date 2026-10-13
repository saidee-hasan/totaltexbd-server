import { Section, ISection } from '../models/Section.js';

// Approved Home Page builder component types (must match the admin library).
const BUILDER_BLOCK_TYPES = new Set([
  'spacer', 'divider', 'hero', 'split_hero', 'banner', 'heading', 'text', 'rich_text',
  'text_image', 'our_story', 'sustainable_source', 'spinning_mill', 'weaving_loom',
  'yarn_to_fabric', 'fabric_dyeing', 'quality_laboratory', 'garment_manufacturing',
  'global_manufacturing', 'lets_work_together', 'image', 'gallery', 'video',
  'feature_cards', 'product_cards', 'stats', 'timeline', 'testimonials',
  'certifications', 'cta', 'faq', 'custom_grid',
]);

// Recursively strip anything that isn't safe plain data (no functions, prototypes,
// symbols) and cap string lengths. Prevents storing arbitrary/unsafe payloads.
const sanitizeValue = (value: any, depth = 0): any => {
  if (depth > 6) return undefined;
  if (typeof value === 'string') return value.slice(0, 8000);
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 60).map((v) => sanitizeValue(v, depth + 1)).filter((v) => v !== undefined);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(k)) continue;
      const sv = sanitizeValue(v, depth + 1);
      if (sv !== undefined) out[k] = sv;
    }
    return out;
  }
  return undefined;
};

const sanitizeDesign = (design: any): Record<string, any> => {
  const d = design && typeof design === 'object' ? design : {};
  const out: Record<string, any> = {};
  if (typeof d.background === 'string') out.background = d.background.slice(0, 40);
  if (Number.isFinite(Number(d.paddingY))) out.paddingY = Math.max(0, Math.min(300, Number(d.paddingY)));
  if (d.maxWidth === 'boxed' || d.maxWidth === 'full') out.maxWidth = d.maxWidth;
  if (d.textAlign === 'left' || d.textAlign === 'center') out.textAlign = d.textAlign;
  if (typeof d.hideMobile === 'boolean') out.hideMobile = d.hideMobile;
  if (typeof d.hideDesktop === 'boolean') out.hideDesktop = d.hideDesktop;
  return out;
};

const sanitizeBlocks = (blocks: any): any[] =>
  Array.isArray(blocks)
    ? blocks
        .slice(0, 60)
        .filter((b) => b && typeof b === 'object' && BUILDER_BLOCK_TYPES.has(String(b.type)))
        .map((b) => ({
          id: String(b.id || '').slice(0, 64),
          type: String(b.type),
          label: String(b.label || '').slice(0, 80),
          hidden: !!b.hidden,
          props: sanitizeValue(b.props) || {},
          design: sanitizeDesign(b.design),
        }))
    : [];

const sanitizeBuilderContent = (content: any): any => {
  if (!content || typeof content !== 'object') return content;
  const next = { ...content };
  next.blocks = sanitizeBlocks(next.blocks);
  next.draft = sanitizeBlocks(next.draft);
  next.revisions = Array.isArray(next.revisions)
    ? next.revisions.slice(0, 12).map((r: any) => ({
        at: String(r?.at || '').slice(0, 40),
        blocks: sanitizeBlocks(r?.blocks),
      }))
    : [];
  return next;
};

export class SectionService {
  static async getAllSections(): Promise<ISection[]> {
    const sections = await Section.find().sort({ createdAt: 1 });
    return sections.map((s) => s.toJSON() as unknown as ISection);
  }

  static async getSectionByKey(sectionKey: string): Promise<ISection> {
    const section = await Section.findOne({ sectionKey: sectionKey.toLowerCase().trim() });
    if (!section) {
      throw { status: 404, message: `Section '${sectionKey}' not found.` };
    }
    return section.toJSON() as unknown as ISection;
  }

  static async upsertSection(
    sectionKey: string,
    data: {
      sectionName?: string;
      category?: string;
      title?: string;
      subtitle?: string;
      description?: string;
      image?: string;
      images?: string[];
      badgeText?: string;
      buttonText?: string;
      buttonLink?: string;
      stats?: { label: string; value: string }[];
      seoTitle?: string;
      metaDescription?: string;
      content?: Record<string, any>;
    }
  ): Promise<ISection> {
    const key = sectionKey.toLowerCase().trim();

    // Hard limits for the editable "Our Story" section so long copy can never
    // break the storefront layout, even if the API is called directly.
    if (key === 'company_story') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        title: trim(data.title, 70),
        subtitle: trim(data.subtitle, 90),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        stats: data.stats
          ? data.stats.slice(0, 8).map((s) => ({ value: (s.value || '').slice(0, 10), label: (s.label || '').slice(0, 30) }))
          : data.stats,
        content: data.content
          ? {
              ...data.content,
              trustBadges: Array.isArray(data.content.trustBadges)
                ? (data.content.trustBadges as unknown[]).slice(0, 8).map((b) => String(b).slice(0, 40))
                : data.content.trustBadges,
              trustBadgeIcons: Array.isArray(data.content.trustBadgeIcons)
                ? (data.content.trustBadgeIcons as unknown[]).slice(0, 8).map((i) => String(i).slice(0, 30))
                : data.content.trustBadgeIcons,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Sustainable Source" (cotton farming) section.
    if (key === 'cotton_farming') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 40),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              features: Array.isArray(data.content.features)
                ? (data.content.features as Record<string, any>[]).slice(0, 6).map((f) => ({
                    icon: typeof f?.icon === 'string' ? f.icon.slice(0, 20) : 'Leaf',
                    title: String(f?.title || '').slice(0, 40),
                    description: String(f?.description || '').slice(0, 140),
                  }))
                : data.content.features,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Textile Manufacturing" (spinning mill) section.
    if (key === 'spinning_mill') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              processes: Array.isArray(data.content.processes)
                ? (data.content.processes as Record<string, any>[]).slice(0, 8).map((p) => ({
                    icon: typeof p?.icon === 'string' ? p.icon.slice(0, 20) : 'Settings',
                    title: String(p?.title || '').slice(0, 40),
                    description: String(p?.description || '').slice(0, 140),
                  }))
                : data.content.processes,
              floatingBox: data.content.floatingBox
                ? {
                    title: String((data.content.floatingBox as Record<string, any>)?.title || '').slice(0, 30),
                    description: String((data.content.floatingBox as Record<string, any>)?.description || '').slice(0, 120),
                  }
                : data.content.floatingBox,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Weaving" section.
    if (key === 'weaving_loom') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 70),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              highlights: Array.isArray(data.content.highlights)
                ? (data.content.highlights as Record<string, any>[]).slice(0, 8).map((h) => ({
                    icon: typeof h?.icon === 'string' ? h.icon.slice(0, 20) : 'Maximize',
                    title: String(h?.title || '').slice(0, 40),
                    description: String(h?.description || '').slice(0, 140),
                  }))
                : data.content.highlights,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Yarn to Fabric" section.
    if (key === 'yarn_to_fabric') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 90),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        image: trim(data.image, 500),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              statusText: trim(data.content.statusText as string | undefined, 60),
              innovations: Array.isArray(data.content.innovations)
                ? (data.content.innovations as Record<string, any>[]).slice(0, 8).map((x) => ({
                    icon: typeof x?.icon === 'string' ? x.icon.slice(0, 20) : 'Activity',
                    title: String(x?.title || '').slice(0, 40),
                    description: String(x?.description || '').slice(0, 140),
                  }))
                : data.content.innovations,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Fabric Dyeing" section.
    if (key === 'fabric_dyeing') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 90),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        image: trim(data.image, 500),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              features: Array.isArray(data.content.features)
                ? (data.content.features as Record<string, any>[]).slice(0, 8).map((f) => ({
                    icon: typeof f?.icon === 'string' ? f.icon.slice(0, 20) : 'Palette',
                    title: String(f?.title || '').slice(0, 40),
                    description: String(f?.description || '').slice(0, 140),
                  }))
                : data.content.features,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Quality Laboratory" section.
    if (key === 'quality_laboratory') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 90),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        image: trim(data.image, 500),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              tests: Array.isArray(data.content.tests)
                ? (data.content.tests as Record<string, any>[]).slice(0, 8).map((t) => ({
                    icon: typeof t?.icon === 'string' ? t.icon.slice(0, 20) : 'Ruler',
                    title: String(t?.title || '').slice(0, 40),
                    description: String(t?.description || '').slice(0, 140),
                  }))
                : data.content.tests,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Garment Manufacturing" section.
    if (key === 'garment_manufacturing') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 70),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              stages: Array.isArray(data.content.stages)
                ? (data.content.stages as Record<string, any>[]).slice(0, 8).map((s) => ({
                    icon: typeof s?.icon === 'string' ? s.icon.slice(0, 20) : 'Scissors',
                    title: String(s?.title || '').slice(0, 40),
                    description: String(s?.description || '').slice(0, 140),
                  }))
                : data.content.stages,
            }
          : data.content,
      };
    }

    // Hard limits for the editable "Global Manufacturing" section.
    if (key === 'global_manufacturing') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        subtitle: trim(data.subtitle, 90),
        title: trim(data.title, 70),
        description: trim(data.description, 420),
        buttonText: trim(data.buttonText, 30),
        buttonLink: trim(data.buttonLink, 120),
        image: trim(data.image, 500),
        seoTitle: trim(data.seoTitle, 60),
        metaDescription: trim(data.metaDescription, 160),
        content: data.content
          ? {
              ...data.content,
              timeline: Array.isArray(data.content.timeline)
                ? (data.content.timeline as Record<string, any>[]).slice(0, 8).map((s) => ({
                    icon: typeof s?.icon === 'string' ? s.icon.slice(0, 20) : 'FileText',
                    title: String(s?.title || '').slice(0, 40),
                    description: String(s?.description || '').slice(0, 140),
                  }))
                : data.content.timeline,
            }
          : data.content,
      };
    }

    // Hard limits for the Home Hero section. Only text may be edited here —
    // background image/video, links and layout are intentionally locked.
    if (key === 'hero') {
      const trim = (v: string | undefined, max: number) => (v === undefined ? v : v.slice(0, max));
      data = {
        ...data,
        badgeText: trim(data.badgeText, 30),
        title: trim(data.title, 70),
        description: trim(data.description, 220),
        buttonText: trim(data.buttonText, 30),
        content: data.content
          ? {
              ...data.content,
              secondaryButtonText: trim(
                (data.content as Record<string, any>).secondaryButtonText as string | undefined,
                30
              ),
            }
          : data.content,
      };
    }

    // Home Page Visual Builder — validate & sanitize the structured layout.
    if (key === 'home_page') {
      data = { ...data, content: sanitizeBuilderContent(data.content) };
    }

    const existing = await Section.findOne({ sectionKey: key });

    let finalImages = data.images ? data.images.map((img) => img.trim()).filter(Boolean) : undefined;
    let finalImage = data.image !== undefined ? data.image.trim() : undefined;

    if (finalImages && finalImages.length > 0 && !finalImage) {
      finalImage = finalImages[0];
    } else if (finalImage && (!finalImages || finalImages.length === 0)) {
      finalImages = [finalImage];
    }

    if (existing) {
      if (data.sectionName) existing.sectionName = data.sectionName.trim();
      if (data.category) existing.category = data.category.trim();
      if (data.title) existing.title = data.title.trim();
      if (data.subtitle !== undefined) existing.subtitle = data.subtitle.trim();
      if (data.description !== undefined) existing.description = data.description.trim();
      if (finalImage !== undefined) existing.image = finalImage;
      if (finalImages !== undefined) existing.images = finalImages;
      if (data.badgeText !== undefined) existing.badgeText = data.badgeText.trim();
      if (data.buttonText !== undefined) existing.buttonText = data.buttonText.trim();
      if (data.buttonLink !== undefined) existing.buttonLink = data.buttonLink.trim();
      if (data.stats !== undefined) existing.stats = data.stats;
      if (data.seoTitle !== undefined) existing.seoTitle = data.seoTitle.trim();
      if (data.metaDescription !== undefined) existing.metaDescription = data.metaDescription.trim();
      if (data.content !== undefined) existing.content = data.content;

      await existing.save();
      return existing.toJSON() as unknown as ISection;
    } else {
      if (!data.title || !data.sectionName) {
        throw { status: 400, message: 'Section name and title are required.' };
      }

      const newSection = new Section({
        sectionKey: key,
        sectionName: data.sectionName.trim(),
        category: data.category?.trim() || 'Homepage',
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || '',
        description: data.description?.trim() || '',
        image: finalImage || '',
        images: finalImages || [],
        badgeText: data.badgeText?.trim() || '',
        buttonText: data.buttonText?.trim() || '',
        buttonLink: data.buttonLink?.trim() || '',
        stats: data.stats || [],
        seoTitle: data.seoTitle?.trim() || '',
        metaDescription: data.metaDescription?.trim() || '',
        content: data.content || {},
      });

      await newSection.save();
      return newSection.toJSON() as unknown as ISection;
    }
  }
}
