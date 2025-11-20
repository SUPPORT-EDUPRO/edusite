import { z } from 'zod';

// Feature item schema
const featureItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(300),
  icon: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
});

// Features block schema
export const featuresSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  features: z.array(featureItemSchema).min(2, 'At least two features required').max(12),
  columns: z.number().min(2).max(4).default(3),
  backgroundColor: z.string().optional(),
  variant: z.enum(['cards', 'list', 'grid']).default('cards'),
});

export type FeaturesProps = z.infer<typeof featuresSchema>;

export default function Features({
  title,
  subtitle,
  features,
  columns = 3,
  backgroundColor,
  variant = 'cards',
}: FeaturesProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const renderFeature = (feature: z.infer<typeof featureItemSchema>, index: number) => {
    if (variant === 'list') {
      return (
        <div key={index} className="flex gap-4 border-b border-stone-200 dark:border-stone-700 py-6 last:border-b-0">
          {feature.icon && (
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <span className="text-2xl">{feature.icon}</span>
              </div>
            </div>
          )}
          <div className="flex-1">
            <h3 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">{feature.title}</h3>
            <p className="text-stone-600 dark:text-stone-400">{feature.description}</p>
          </div>
        </div>
      );
    }

    if (variant === 'grid') {
      return (
        <div key={index} className="text-center">
          {feature.icon && (
            <div className="mb-4 flex justify-center">
              <span className="text-5xl">{feature.icon}</span>
            </div>
          )}
          {feature.image && !feature.icon && (
            <div className="mb-4">
              <img
                src={feature.image}
                alt={feature.title}
                className="mx-auto h-32 w-32 rounded-lg object-cover"
              />
            </div>
          )}
          <h3 className="mb-3 text-xl font-semibold text-stone-900 dark:text-stone-100">{feature.title}</h3>
          <p className="text-stone-600 dark:text-stone-400">{feature.description}</p>
        </div>
      );
    }

    // cards variant (default)
    return (
      <div
        key={index}
        className="flex flex-col rounded-lg bg-white dark:bg-stone-800 p-6 shadow-lg transition-shadow hover:shadow-xl"
      >
        {feature.image && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img src={feature.image} alt={feature.title} className="h-48 w-full object-cover" />
          </div>
        )}
        {feature.icon && !feature.image && (
          <div className="mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <span className="text-3xl">{feature.icon}</span>
            </div>
          </div>
        )}
        <h3 className="mb-3 text-xl font-semibold text-stone-900 dark:text-stone-100">{feature.title}</h3>
        <p className="flex-1 text-stone-600 dark:text-stone-400">{feature.description}</p>
      </div>
    );
  };

  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>

        {variant === 'list' ? (
          <div className="mx-auto max-w-3xl">
            {features.map((feature, index) => renderFeature(feature, index))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 ${gridColsClass}`}>
            {features.map((feature, index) => renderFeature(feature, index))}
          </div>
        )}
      </div>
    </section>
  );
}

// Export schema for form generation
Features.schema = featuresSchema;
Features.displayName = 'Features';
Features.category = 'content';
