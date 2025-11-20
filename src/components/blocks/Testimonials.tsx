import { z } from 'zod';

// Testimonial item schema
const testimonialSchema = z.object({
  quote: z.string().min(1, 'Quote is required'),
  author: z.string().min(1, 'Author name is required'),
  role: z.string().optional(),
  photo: z.string().url('Invalid photo URL').optional(),
  rating: z.number().min(1).max(5).optional(),
});

// Testimonials block schema
export const testimonialsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  testimonials: z.array(testimonialSchema).min(1, 'At least one testimonial required').max(12),
  backgroundColor: z.string().optional(),
  showRatings: z.boolean().default(true),
});

export type TestimonialsProps = z.infer<typeof testimonialsSchema>;

export default function Testimonials({
  title,
  subtitle,
  testimonials,
  backgroundColor,
  showRatings = true,
}: TestimonialsProps) {
  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col rounded-lg bg-white p-6 shadow-lg">
              {/* Quote */}
              <div className="mb-4 flex-1">
                <svg
                  className="mb-2 h-8 w-8 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-stone-700">{testimonial.quote}</p>
              </div>

              {/* Rating */}
              {showRatings && testimonial.rating && (
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating! ? 'text-amber-400' : 'text-stone-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.photo ? (
                  <img
                    src={testimonial.photo}
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-200">
                    <svg className="h-6 w-6 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-stone-900">{testimonial.author}</p>
                  {testimonial.role && <p className="text-sm text-stone-600">{testimonial.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export schema for form generation
Testimonials.schema = testimonialsSchema;
Testimonials.displayName = 'Testimonials';
Testimonials.category = 'content';
