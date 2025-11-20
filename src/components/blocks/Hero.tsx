import { CalendarDays } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';

// Hero block schema
export const heroSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title too long'),
  subtitle: z.string().max(300, 'Subtitle too long').optional(),
  backgroundImage: z.string().optional(),
  heroImage: z.string().optional(),
  badgeText: z.string().max(40).optional(),
  ctaText: z.string().max(60).optional(),
  ctaLink: z.string().optional(),
  ctaSecondaryText: z.string().max(60).optional(),
  ctaSecondaryLink: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  backgroundOverlay: z.enum(['gradient', 'dark', 'none']).default('gradient'),
  height: z.enum(['short', 'medium', 'tall']).default('medium'),
  theme: z.enum(['dark', 'light']).default('dark'),
});

export type HeroProps = z.infer<typeof heroSchema>;

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  heroImage,
  ctaText,
  ctaLink,
  ctaSecondaryText,
  ctaSecondaryLink,
  badgeText,
  alignment = 'center',
  textAlign,
  backgroundOverlay = 'gradient',
  height = 'medium',
  theme = 'dark',
}: HeroProps) {
  const resolvedAlignment = textAlign || alignment;
  const alignmentClasses: Record<'left' | 'center' | 'right', string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  const heightClasses: Record<'short' | 'medium' | 'tall', string> = {
    short: 'min-h-[420px] py-16',
    medium: 'min-h-[560px] py-20',
    tall: 'min-h-[640px] py-24',
  };
  const overlayClasses: Record<'gradient' | 'dark' | 'none', string> = {
    gradient: 'bg-gradient-to-br from-stone-950/85 via-stone-900/70 to-stone-900/60',
    dark: 'bg-stone-950/75',
    none: 'bg-stone-900/40',
  };

  // Light theme design matching live site
  if (theme === 'light') {
    return (
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold leading-tight text-pink-600 md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-3xl text-base text-stone-700 md:text-lg lg:text-xl">
                {subtitle}
              </p>
            )}

            {(ctaText || ctaSecondaryText) && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {ctaText && ctaLink && (
                  <a
                    href={ctaLink}
                    className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-600/30 transition hover:bg-pink-700"
                  >
                    <CalendarDays className="h-5 w-5" />
                    {ctaText}
                  </a>
                )}
                {ctaSecondaryText && ctaSecondaryLink && (
                  <a
                    href={ctaSecondaryLink}
                    className="inline-flex items-center justify-center rounded-full border-2 border-stone-300 px-8 py-3 text-base font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    {ctaSecondaryText}
                  </a>
                )}
              </div>
            )}
          </div>

          {heroImage && (
            <div className="mx-auto mt-12 max-w-4xl">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl shadow-stone-900/10">
                <Image
                  src={heroImage}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Original dark theme
  return (
    <section
      className={`relative isolate flex w-full items-center justify-center bg-stone-950 px-4 text-white overflow-hidden ${heightClasses[height]}`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 ${overlayClasses[backgroundOverlay]}`} />
        <div className="absolute -top-10 left-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
      </div>
      
      <div className={`container relative z-10 mx-auto flex max-w-5xl flex-col gap-6 ${alignmentClasses[resolvedAlignment]}`}>
        {badgeText && (
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            {badgeText}
          </span>
        )}

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow md:text-6xl">
          {title}
        </h1>

        {subtitle && (
          <p className="max-w-3xl text-lg font-medium text-white/85 md:text-2xl">
            {subtitle}
          </p>
        )}

        <div className={`flex flex-wrap gap-4 ${resolvedAlignment === 'center' ? 'justify-center' : 'justify-start'}`}>
          {ctaText && ctaLink && (
            <a
              href={ctaLink}
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/40 transition hover:bg-amber-400"
            >
              {ctaText}
            </a>
          )}
          {ctaSecondaryText && ctaSecondaryLink && (
            <a
              href={ctaSecondaryLink}
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white/90 transition hover:border-white hover:text-white"
            >
              {ctaSecondaryText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// Export schema for form generation
Hero.schema = heroSchema;
Hero.displayName = 'Hero';
Hero.category = 'header';
