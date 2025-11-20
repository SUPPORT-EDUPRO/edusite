import { z } from 'zod';

// Staff member schema
const staffMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  bio: z.string().optional(),
  photo: z.string().url('Invalid photo URL').optional(),
  qualifications: z.array(z.string()).optional(),
});

// StaffCards block schema
export const staffCardsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  staff: z.array(staffMemberSchema).min(1, 'At least one staff member required').max(20),
  columns: z.enum(['2', '3', '4']).default('3'),
  showQualifications: z.boolean().default(true),
});

export type StaffCardsProps = z.infer<typeof staffCardsSchema>;

export default function StaffCards({
  title,
  subtitle,
  staff,
  columns = '3',
  showQualifications = true,
}: StaffCardsProps) {
  const columnClasses = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  };

  return (
    <section className="bg-stone-50 px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>

        <div className={`grid gap-8 ${columnClasses[columns]}`}>
          {staff.map((member, index) => (
            <div
              key={index}
              className="rounded-lg bg-white p-6 text-center shadow-lg transition-all hover:shadow-xl"
            >
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="mx-auto mb-4 h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-stone-200">
                  <svg className="h-16 w-16 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <h3 className="mb-1 text-xl font-semibold text-stone-900">{member.name}</h3>
              <p className="mb-3 font-medium text-amber-600">{member.role}</p>

              {member.bio && <p className="mb-4 text-sm text-stone-600">{member.bio}</p>}

              {showQualifications && member.qualifications && member.qualifications.length > 0 && (
                <div className="mt-4 border-t border-stone-200 pt-4">
                  <p className="mb-2 text-xs font-semibold text-stone-500 uppercase">
                    Qualifications
                  </p>
                  <ul className="space-y-1">
                    {member.qualifications.map((qual, idx) => (
                      <li key={idx} className="text-sm text-stone-600">
                        {qual}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export schema for form generation
StaffCards.schema = staffCardsSchema;
StaffCards.displayName = 'Staff Cards';
StaffCards.category = 'feature';
