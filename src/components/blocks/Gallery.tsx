import { z } from 'zod';

// Gallery item schema
const galleryItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().url('Invalid media URL'),
  thumbnail: z.string().url('Invalid thumbnail URL').optional(),
  caption: z.string().max(200).optional(),
  alt: z.string().min(1, 'Alt text is required'),
});

// Gallery block schema
export const gallerySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
  items: z.array(galleryItemSchema).min(1, 'At least one gallery item required').max(50),
  columns: z.number().min(2).max(5).default(3),
  showCaptions: z.boolean().default(true),
  backgroundColor: z.string().optional(),
});

export type GalleryProps = z.infer<typeof gallerySchema>;

export default function Gallery({
  title,
  subtitle,
  items,
  columns = 3,
  showCaptions = true,
  backgroundColor,
}: GalleryProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-3 lg:grid-cols-5',
  }[columns];

  return (
    <section className="px-4 py-16" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto max-w-2xl text-lg text-stone-600">{subtitle}</p>}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${gridColsClass}`}>
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg bg-stone-100 shadow-lg transition-transform hover:scale-105"
            >
              {/* Media */}
              <div className="relative aspect-square w-full">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="relative h-full w-full">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-200">
                        <svg
                          className="h-16 w-16 text-stone-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                    )}
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg
                        className="h-12 w-12 text-white drop-shadow-lg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <svg
                    className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>

              {/* Caption */}
              {showCaptions && item.caption && (
                <div className="bg-white p-3">
                  <p className="text-sm text-stone-700">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Note: Full lightbox functionality would require client-side state management */}
        {/* This is a foundation for adding lightbox with a library like yet-another-react-lightbox */}
      </div>
    </section>
  );
}

// Export schema for form generation
Gallery.schema = gallerySchema;
Gallery.displayName = 'Gallery';
Gallery.category = 'media';
