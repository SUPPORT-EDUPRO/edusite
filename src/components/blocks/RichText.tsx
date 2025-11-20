import { z } from 'zod';

// RichText block schema
export const richTextSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  maxWidth: z.enum(['narrow', 'medium', 'wide', 'full']).default('medium'),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
});

export type RichTextProps = z.infer<typeof richTextSchema>;

export default function RichText({
  content,
  maxWidth = 'medium',
  backgroundColor,
  textColor,
}: RichTextProps) {
  const maxWidthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div
        className={`prose prose-stone mx-auto ${maxWidthClasses[maxWidth]} prose-headings:font-bold prose-a:text-amber-600 hover:prose-a:text-amber-700`}
        style={textColor ? { color: textColor } : undefined}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}

// Export schema for form generation
RichText.schema = richTextSchema;
RichText.displayName = 'Rich Text';
RichText.category = 'content';
