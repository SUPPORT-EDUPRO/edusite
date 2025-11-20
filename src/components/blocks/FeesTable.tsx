import { z } from 'zod';

// Fee row schema
const feeRowSchema = z.object({
  service: z.string().min(1, 'Service name is required').max(200),
  description: z.string().max(300).optional(),
  amount: z.string().min(1, 'Amount is required'),
  frequency: z.string().optional(),
});

// Fee category schema
const feeCategorySchema = z.object({
  category: z.string().min(1, 'Category name is required').max(100),
  rows: z.array(feeRowSchema).min(1, 'At least one fee row required'),
});

// FeesTable block schema
export const feesTableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  categories: z.array(feeCategorySchema).min(1, 'At least one category required').max(10),
  showDescriptions: z.boolean().default(true),
  showFrequency: z.boolean().default(true),
  backgroundColor: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type FeesTableProps = z.infer<typeof feesTableSchema>;

export default function FeesTable({
  title,
  subtitle,
  categories,
  showDescriptions = true,
  showFrequency = true,
  backgroundColor,
  note,
}: FeesTableProps) {
  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>

        <div className="space-y-8">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="overflow-hidden rounded-lg bg-white shadow-lg">
              {/* Category header */}
              <div className="bg-amber-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">{category.category}</h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">
                        Service
                      </th>
                      {showFrequency && (
                        <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">
                          Frequency
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-sm font-semibold text-stone-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {category.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="transition-colors hover:bg-stone-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-stone-900">{row.service}</div>
                          {showDescriptions && row.description && (
                            <div className="mt-1 text-sm text-stone-600">{row.description}</div>
                          )}
                        </td>
                        {showFrequency && (
                          <td className="px-6 py-4 text-stone-700">{row.frequency || '—'}</td>
                        )}
                        <td className="px-6 py-4 text-right font-semibold text-stone-900">
                          {row.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        {note && (
          <div className="mt-8 rounded-lg bg-amber-50 p-6 text-sm text-stone-700">
            <div className="flex gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>{note}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Export schema for form generation
FeesTable.schema = feesTableSchema;
FeesTable.displayName = 'FeesTable';
FeesTable.category = 'content';
