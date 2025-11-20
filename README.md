# 🎓 EduSitePro

> Professional NCF-aligned educational activity templates for South African Early Childhood Development centres

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

**Live Site**: https://edusitepro.edudashpro.org.za (coming soon)

## 🎯 Mission

EduSitePro creates beautiful, professional websites for Early Childhood Development (ECD) centres across South Africa. Our templates are specifically designed to align with the National Curriculum Framework (NCF) and help ECD centres showcase their programs, communicate with parents, and demonstrate their commitment to quality early childhood education.

## 🤝 Relationship to EduDash Pro

EduSitePro serves as a complementary service to [EduDash Pro](../edudashpro) - our comprehensive educational platform for schools and ECD centres. While EduDash Pro provides the complete administrative, learning management, and parent communication system, EduSitePro focuses specifically on:

- **Marketing presence**: Professional websites that attract families
- **NCF alignment**: Templates showcasing curriculum compliance
- **Lead generation**: Converting website visitors to EduDash Pro users
- **Bulk services**: Cost-effective solutions for multiple centres

### Integration Strategy

- **Separate codebases**: No shared dependencies or backend coupling
- **Seamless funnel**: Deep links and smart app banners convert users to EduDash Pro
- **UTM tracking**: Attribution tracking for marketing ROI
- **Store fallbacks**: App store redirects for mobile users

## 🇿🇦 South African Focus

### National Curriculum Framework (NCF) Alignment

Our website templates incorporate the six pillars of early learning and development:

- **Well-being**: Health, safety, and emotional development
- **Identity & Belonging**: Cultural awareness and inclusion
- **Communication**: Language development and literacy
- **Mathematics**: Early numeracy concepts
- **Creativity**: Creative expression and arts
- **Knowledge & Understanding of the World**: Science and social awareness

### Legal Compliance

- **POPIA compliance**: Privacy and data protection for South African law
- **Multi-language support**: English, Afrikaans, and indigenous languages
- **Local hosting**: South African domain (.co.za) and hosting infrastructure

## 🏗️ Architecture

### 📚 Template Library (6 Comprehensive Templates)

#### Traditional ECD Activities

- **Welcome Play** - Well-Being & Creativity (Ages 3-5, 45 min)
- **Bright Start** - Identity & Belonging (Ages 3-6, 30 min)
- **Story Time Adventures** - Communication & Literacy (Ages 2-5, 40 min)

#### STEM & Technology Focus

- **Coding Blocks & Logic Play** - Computational Thinking (Ages 4-6, 40 min)
- **Little Engineers & Robots** - Engineering & Robotics (Ages 4-6, 50 min)
- **Digital Storytellers** - Digital Literacy & Media (Ages 4-6, 45 min)

### Tech Stack

- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Typography Plugin
- **Content**: MDX with frontmatter (gray-matter, remark-mdx-frontmatter)
- **Forms**: React Hook Form with Zod validation + hCaptcha
- **Analytics**: Vercel Analytics, PostHog ready
- **Email**: Resend for lead notifications
- **Hosting**: Vercel with edge functions

### Key Features

- **Template Gallery**: NCF-aligned website templates
- **Bulk Pricing**: Discounted packages for multiple centres
- **Lead Capture**: Quote forms with hCaptcha protection
- **SEO Optimized**: South African education keyword targeting
- **Mobile First**: Responsive design with app install prompts
- **Performance**: Lighthouse score optimization

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/K1NG-Devops/edusitepro.git
cd edusitepro

# Install dependencies
npm install

# Run development server
npm run dev
# Visit: http://localhost:3000

# Build for production
npm run build

# Verify templates working
./scripts/verify-templates.sh

# Deploy to Vercel
vercel --prod
```

## 📁 Project Structure

```
edusitepro/
├── content/
│   └── templates/              # MDX template files (6 templates)
├── docs/                       # Comprehensive documentation
│   ├── deployment-guide.md     # Vercel deployment
│   ├── templates-system.md     # Template architecture
│   ├── edudash-pro-requirements.md  # Integration specs
│   └── template-images-guide.md     # Image sourcing
├── public/
│   ├── templates/              # Template cover images
│   └── ...                     # Static assets
├── scripts/
│   └── verify-templates.sh     # Verification script
├── src/
│   ├── app/
│   │   ├── page.tsx            # Homepage
│   │   ├── templates/          # Templates listing & detail pages
│   │   ├── pricing/
│   │   ├── bulk/
│   │   └── legal/
│   ├── components/
│   │   └── templates/
│   │       └── MDXRenderer.tsx # MDX renderer
│   └── lib/
│       └── templates/
│           └── registry.ts      # Template metadata
└── ...config files
```

## 🔗 Deep Link Integration

EduSitePro uses smart deep linking to seamlessly transition users to EduDash Pro:

```typescript
// Example deep link generation
const deepLink = buildDeepLink('/onboarding/ecd-centre', {
  utm_source: 'edusitepro',
  utm_campaign: 'website_conversion',
  template_slug: selectedTemplate,
});
```

## 📊 Analytics & Tracking

- **Conversion funnel**: Website → Quote → EduDash Pro signup
- **UTM parameters**: Attribution tracking across platforms
- **Event tracking**: Template views, quote submissions, app opens
- **A/B testing**: Template preferences and pricing optimization

## 🎨 Design System

- **Primary Colors**: Emerald (education trust) + Gold (premium quality)
- **Typography**: Inter for readability and professionalism
- **Components**: shadcn/ui for consistency with modern web standards
- **Accessibility**: WCAG AA compliance for inclusive design

## 🚀 Deployment

### Vercel (Recommended)

**Domain**: `edusitepro.edudashpro.org.za`

```bash
# Deploy via CLI
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

**DNS Configuration:**

```
Type:  CNAME
Name:  edusitepro
Value: cname.vercel-dns.com
```

Full guide: `docs/deployment-guide.md`

## 📖 Documentation

- **[Deployment Guide](docs/deployment-guide.md)** - Vercel setup, DNS, SSL
- **[Templates System](docs/templates-system.md)** - Architecture, adding templates
- **[EduDash Pro Requirements](docs/edudash-pro-requirements.md)** - Integration specs (630 lines)
- **[Image Guidelines](docs/template-images-guide.md)** - Template cover image sourcing

## 🐛 Troubleshooting

### Clean Build Cache

```bash
rm -rf .next node_modules/.cache
npm run build
```

### Template 404s

Clean `.next` and restart:

```bash
rm -rf .next && npm run dev
```

## 📈 Business Model

### Revenue Streams

1. **Setup fees**: One-time website creation (R2,999 - R19,990)
2. **Monthly hosting**: Recurring revenue (R159 - R199/month per site)
3. **EduDash Pro upsells**: Commission on converted users
4. **Premium features**: Custom designs, additional pages

### Target Market

- **Primary**: Independent ECD centres (3-15 children)
- **Secondary**: ECD franchise networks
- **Tertiary**: NGOs and community-based programmes

## 🤖 AI Integration

While EduSitePro focuses on marketing and lead generation, it leverages AI for:

- **Content suggestions**: NCF-compliant copy for different age groups
- **Image optimization**: Automatic compression and format selection
- **SEO recommendations**: South African education keyword optimization
- **Lead scoring**: Prioritizing high-value bulk quote requests

## 📞 Support & Contact

- **Technical Issues**: Escalate to EduDash Pro support infrastructure
- **Sales Inquiries**: Handled through lead capture forms
- **Template Requests**: Community-driven template development

---

**EduSitePro** - Empowering South African ECD centres with professional web presence and seamless parent engagement through NCF-aligned digital solutions.
