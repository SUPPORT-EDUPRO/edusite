import { z } from 'zod';

// Program item schema
const programItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  icon: z.string().optional(),
  ageRange: z.string().optional(),
  ncfPillars: z.array(z.string()).optional(),
});

// ProgramGrid block schema
export const programGridSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  programs: z.array(programItemSchema).min(1, 'At least one program required').max(12),
  columns: z.enum(['2', '3', '4']).default('3'),
  backgroundColor: z.string().optional(),
});

export type ProgramGridProps = z.infer<typeof programGridSchema>;

export default function ProgramGrid({
  title = 'Our Programs',
  subtitle,
  programs = [],
  columns = '3',
  backgroundColor,
}: Partial<ProgramGridProps>) {
  const columnClasses = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  };

  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>

        <div className={`grid gap-8 ${columnClasses[columns as keyof typeof columnClasses]}`}>
          {programs && programs.length > 0 ? (
            programs.map((program, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6 shadow-lg transition-all hover:shadow-xl"
              >
                {program.icon && <div className="mb-4 text-4xl">{program.icon}</div>}

                <h3 className="mb-2 text-xl font-semibold text-stone-900">{program.title}</h3>

                {program.ageRange && (
                  <p className="mb-2 text-sm font-medium text-amber-600">Ages {program.ageRange}</p>
                )}

                <p className="mb-4 text-stone-600">{program.description}</p>

                {program.ncfPillars && program.ncfPillars.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {program.ncfPillars.map((pillar, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
                      >
                        {pillar}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-stone-500">
              No programs configured yet. Add programs in the properties panel.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Export schema for form generation
ProgramGrid.schema = programGridSchema;
ProgramGrid.displayName = 'Program Grid';
ProgramGrid.category = 'feature';
