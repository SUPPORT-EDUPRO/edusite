# NCF-Aligned Templates System

## Overview

The EduSitePro application now includes a comprehensive templates system featuring NCF (National Curriculum Framework) -aligned educational activities for Early Childhood Development (ECD) centres.

## Architecture

### Directory Structure

```
edusitepro/
├── content/
│   └── templates/          # MDX template files
│       ├── welcome-play.mdx
│       ├── bright-start.mdx
│       └── storytime.mdx
├── public/
│   └── templates/          # Template cover images
│       ├── welcome-play.png
│       ├── bright-start.png
│       └── storytime.png
├── src/
│   ├── app/
│   │   └── templates/
│   │       ├── page.tsx    # Templates listing page
│   │       └── [slug]/
│   │           └── page.tsx # Dynamic template detail page
│   ├── components/
│   │   └── templates/
│   │       └── MDXRenderer.tsx  # Client component for MDX rendering
│   ├── lib/
│   │   └── templates/
│   │       └── registry.ts      # Template metadata registry
│   └── types/
│       └── mdx.d.ts        # TypeScript definitions for MDX files
```

## Features

### 1. Template Registry (`src/lib/templates/registry.ts`)

The registry maintains static metadata for all templates, avoiding server-side rendering issues with MDX imports:

- **TemplateMetadata interface**: Defines the structure of template frontmatter
- **Static metadata array**: Contains all template information without requiring MDX imports
- **Utility functions**:
  - `getAllTemplatesMetadata()`: Returns all available templates
  - `getTemplateMetadataBySlug(slug)`: Retrieves a specific template by slug
  - `getTemplatesByPillar(pillar)`: Filters templates by NCF pillar
  - `getTemplateComponent(slug)`: Dynamically imports MDX component (not used in SSG)

### 2. MDX Renderer (`src/components/templates/MDXRenderer.tsx`)

A client-side component that dynamically loads MDX content:

- Uses Next.js `dynamic()` for code-splitting
- Shows loading state during content fetch
- Ensures MDX works properly with React context

### 3. Templates Listing Page (`src/app/templates/page.tsx`)

Displays all available templates in a responsive grid:

- Card-based layout with cover images
- Shows template metadata (pillar, difficulty, duration, age range)
- Links to individual template detail pages
- CTA to EduDash Pro

### 4. Template Detail Page (`src/app/templates/[slug]/page.tsx`)

Dynamic route for individual templates:

- **Hero section**: Template title, description, cover image, metadata
- **Quick info bar**: NCF pillars, author, language, materials count
- **MDX content**: Full template rendered with Tailwind Typography
- **CTA section**: Link to EduDash Pro
- **SEO**: Generates metadata for each template
- **SSG**: Pre-renders all templates at build time

## Current Templates

### 1. Welcome Play (`welcome-play`)

- **Pillar**: Well-Being
- **NCF Pillars**: Well-Being, Creativity and Imagination
- **Age Range**: 3-5 years
- **Duration**: 45 minutes
- **Focus**: Outdoor play, physical activity, creative expression

### 2. Bright Start (`bright-start`)

- **Pillar**: Identity and Belonging
- **NCF Pillars**: Identity and Belonging, Communication
- **Age Range**: 3-6 years
- **Duration**: 30 minutes
- **Focus**: Morning routine, circle time, self-expression

### 3. Story Time Adventures (`storytime`)

- **Pillar**: Communication
- **NCF Pillars**: Communication, Creativity and Imagination, Literacy
- **Age Range**: 2-5 years
- **Duration**: 40 minutes
- **Focus**: Storytelling, language development, literacy

## Template Structure

Each MDX template includes:

1. **Frontmatter** (metadata)
   - Title, slug, description
   - Pillar and NCF pillars
   - Age range, duration, group size
   - Locale, author, difficulty
   - Cover image path
   - Objectives, materials, keywords

2. **Content Sections**
   - **Overview**: Introduction and learning objectives
   - **Materials Needed**: Comprehensive list with alternatives
   - **Activity Steps**: Detailed instructions with timing
   - **Differentiation**: Adaptations for different abilities and ages
   - **Assessment**: Observation guide and documentation tips
   - **Parent Engagement**: Home extension activities
   - **Safety & Compliance**: Important notes and NCF alignment
   - **Resources**: Additional materials and references
   - **EduDash Pro Integration**: How to use with the management platform

## Styling

### Tailwind Typography Plugin

The `@tailwindcss/typography` plugin is integrated via `globals.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
```

This enables prose styling for MDX content:

- Consistent heading sizes and spacing
- Optimized reading width
- List and table styling
- Code block formatting
- Link colors and hover states

### Custom Prose Classes

Template detail pages use:

```html
<article
  class="prose prose-lg prose-emerald dark:prose-invert prose-headings:font-bold prose-h2:border-b prose-h2:pb-2 prose-a:text-emerald-600 hover:prose-a:text-emerald-700 max-w-none"
></article>
```

## Adding New Templates

To add a new template:

1. **Create MDX file** in `content/templates/your-template.mdx`
2. **Add frontmatter** with all required fields
3. **Write content** following the established structure
4. **Add cover image** to `public/templates/your-template.png`
5. **Register metadata** in `src/lib/templates/registry.ts`:
   ```typescript
   {
     slug: 'your-template',
     mdxPath: '../../../content/templates/your-template.mdx',
     frontmatter: {
       // ... your frontmatter
     },
   }
   ```
6. **Rebuild** and test: `npm run build`

## SEO & Performance

- **Static Generation**: All templates are pre-rendered at build time
- **Metadata**: Each template has unique title, description, and OG images
- **Code Splitting**: MDX content is loaded dynamically on the client
- **Images**: Cover images use Next.js Image component for optimization
- **File Size**: Template pages are ~100KB first load JS

## Integration with EduDash Pro

Templates include:

- Direct links to EduDash Pro platform
- Instructions for using templates within the management system
- Parent engagement features compatible with parent portal
- Assessment tools aligned with digital tracking

## Future Enhancements

Potential improvements:

- PDF export functionality for templates
- Search and filter by NCF pillar, age range, duration
- User ratings and favorites
- Community-submitted templates
- Multilingual support (Zulu, Afrikaans, Xhosa, etc.)
- Printable worksheet generation
- Video demonstrations
- Template versioning and updates
