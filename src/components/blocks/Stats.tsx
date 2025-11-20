import { z } from 'zod';

// Stat item schema
const statItemSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  label: z.string().min(1, 'Label is required').max(100),
  icon: z.string().optional(),
  description: z.string().max(200).optional(),
});

// Stats block schema
export const statsSchema = z.object({
  title: z.string().max(100).optional(),
  subtitle: z.string().max(200).optional(),
  stats: z.array(statItemSchema).min(2, 'At least two stats required').max(8),
  columns: z.number().min(2).max(4).default(4),
  backgroundColor: z.string().optional(),
  variant: z.enum(['default', 'cards', 'minimal']).default('default'),
});

export type StatsProps = z.infer<typeof statsSchema>;

export default function Stats({
  title,
  subtitle,
  stats,
  columns = 4,
  backgroundColor,
  variant = 'default',
}: StatsProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const renderStat = (stat: z.infer<typeof statItemSchema>, index: number) => {
    const content = (
      <>
        {stat.icon && (
          <div className="mb-2">
            <span className="text-4xl">{stat.icon}</span>
          </div>
        )}
        <div className="mb-2 text-4xl font-bold text-amber-600 md:text-5xl">{stat.value}</div>
        <div className="text-lg font-semibold text-stone-700">{stat.label}</div>
        {stat.description && <p className="mt-2 text-sm text-stone-600">{stat.description}</p>}
      </>
    );

    if (variant === 'cards') {
      return (
        <div
          key={index}
          className="flex flex-col items-center rounded-lg bg-white dark:bg-stone-800 p-6 text-center shadow-lg"
        >
          {content}
        </div>
      );
    }

    if (variant === 'minimal') {
      return (
        <div key={index} className="flex flex-col items-center text-center">
          <div className="mb-1 text-3xl font-bold text-amber-600 md:text-4xl">{stat.value}</div>
          <div className="text-base font-medium text-stone-700">{stat.label}</div>
        </div>
      );
    }

    // default variant
    return (
      <div
        key={index}
        className="flex flex-col items-center border-b border-stone-200 py-6 text-center last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
      >
        {content}
      </div>
    );
  };

  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="container mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
            )}
            {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${gridColsClass}`}>
          {stats.map((stat, index) => renderStat(stat, index))}
        </div>
      </div>
    </section>
  );
}

// Export schema for form generation
Stats.schema = statsSchema;
Stats.displayName = 'Stats';
Stats.category = 'content';
