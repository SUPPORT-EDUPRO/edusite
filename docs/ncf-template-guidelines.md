# NCF Template Guidelines

## Overview

All EduSitePro templates must align with South Africa's **National Curriculum Framework for Children from Birth to Four** (NCF). This document provides guidelines for creating and maintaining NCF-compliant website templates.

## Six Pillars of Early Learning and Development (ELDA)

### 1. Well-being

**Focus**: Health, safety, and emotional development

**Website Content Requirements**:

- Health and safety policies prominently displayed
- Daily routine schedule
- Nutrition information
- Hygiene practices
- Emotional support programs
- First aid and emergency procedures

**Template Elements**:

- Safety badges and certifications
- Health policy downloads
- Photo gallery showing safe, clean facilities
- Parent testimonials about care quality

### 2. Identity and Belonging

**Focus**: Cultural awareness, diversity, and inclusion

**Website Content Requirements**:

- Welcome message in multiple languages
- Cultural diversity statement
- Inclusive enrollment policies
- Community involvement programs
- Respect for home languages
- Ubuntu philosophy integration

**Template Elements**:

- Multi-language toggle (EN, AF, ZU minimum)
- Diverse imagery showing all SA children
- Cultural calendar/events
- Parent involvement opportunities

### 3. Communication

**Focus**: Language development and literacy

**Website Content Requirements**:

- Language development programs
- Storytelling and reading activities
- Home language support
- Early literacy initiatives
- Parent-teacher communication channels
- Bilingual/multilingual approach

**Template Elements**:

- News and announcements section
- Parent communication portal
- Newsletter signup
- Contact forms in multiple languages
- Resources for parents

### 4. Mathematics

**Focus**: Early numeracy concepts

**Website Content Requirements**:

- Play-based numeracy activities
- Shape and pattern recognition programs
- Counting and measurement activities
- Problem-solving approaches
- Logical thinking development

**Template Elements**:

- Curriculum overview showing math activities
- Photo gallery of hands-on learning
- Age-appropriate activity descriptions
- Parent tips for math at home

### 5. Creativity

**Focus**: Creative expression and arts

**Website Content Requirements**:

- Art and craft programs
- Music and movement activities
- Imaginative play opportunities
- Drama and role-play
- Creative problem-solving

**Template Elements**:

- Gallery of children's artwork
- Music and movement programs
- Creative play spaces showcase
- Special events calendar

### 6. Knowledge and Understanding of the World

**Focus**: Science, nature, and social awareness

**Website Content Requirements**:

- Nature exploration programs
- Science discovery activities
- Environmental awareness
- Community and social studies
- Technology introduction (age-appropriate)

**Template Elements**:

- Outdoor learning space photos
- Sustainability initiatives
- Community partnerships
- Field trip information

## Age Bands

Templates should clearly indicate which age bands they serve:

- **Birth to 18 months**: Infant care focus
- **18 months to 3 years**: Toddler programs
- **3 to 4 years**: Pre-school readiness
- **4 to 6 years**: Grade R preparation

## Essential Content Blocks

Every template must include:

### 1. Home Page

- Welcome message
- Quick overview of ELDA pillars covered
- Call-to-action (Enroll, Visit, Contact)
- Trust indicators (certifications, registrations)
- Photo/video hero section

### 2. About Us

- Centre history and philosophy
- Staff qualifications and photos
- Registration details (DoE, DoH)
- Ubuntu values statement
- Community involvement

### 3. Programs

- Age-specific curriculum overview
- Daily routine/schedule
- ELDA pillars mapped to activities
- Learning outcomes
- Fees and payment options

### 4. Admissions

- Enrollment process
- Required documents
- Fees structure
- Waiting list information
- Contact form

### 5. Policies

- **POPIA Compliance**: Privacy policy
- **Health & Safety**: COVID-19, illness, accidents
- **Behaviour Management**: Positive discipline approach
- **Parent Involvement**: Communication, events
- **Complaints Procedure**: Grievance handling

### 6. Gallery

- Facility photos (classrooms, playground, kitchen)
- Activities in action (faces blurred for POPIA)
- Events and celebrations
- Learning materials

### 7. Contact

- Physical address with map
- Operating hours
- Contact phone/email
- WhatsApp contact (if available)
- Social media links
- Contact form

## Language Considerations

### Multi-language Support

Templates must support at minimum:

- **English** (EN) - Required
- **Afrikaans** (AF) - Highly recommended
- **isiZulu** (ZU) - Highly recommended

Additional languages based on location:

- isiXhosa (XH)
- Sesotho (ST)
- Setswana (TN)
- Other SA official languages

### Translation Guidelines

- Use professional translation services
- Avoid machine translation for important content
- Ensure cultural appropriateness
- Test with native speakers

## Accessibility Requirements

All templates must meet **WCAG 2.1 Level AA** standards:

### Visual

- Color contrast ratio minimum 4.5:1 for normal text
- Text resizable up to 200%
- No information conveyed by color alone
- Clear focus indicators

### Content

- Clear headings hierarchy
- Descriptive link text
- Alt text for all images
- Captions for videos

### Navigation

- Keyboard accessible
- Skip to content link
- Consistent navigation
- Breadcrumbs for deep pages

## POPIA Compliance

All templates must be POPIA (Protection of Personal Information Act) compliant:

### Required Elements

- Privacy policy page
- Cookie consent banner
- Data collection notices on forms
- Right to access/delete data
- Contact for data requests

### Photo Gallery Rules

- No identifiable faces of children without consent
- Blur faces or use back-of-head shots
- No names associated with photos
- Consent forms for all photography

### Forms

- Only collect necessary information
- Explain why data is needed
- Secure transmission (HTTPS)
- Clear opt-in for marketing

## SEO Best Practices

### Province-Specific Keywords

Include location keywords:

- "ECD centre in [City/Province]"
- "[Area] preschool"
- "Daycare near [Landmark]"

### NCF Keywords

- "NCF-aligned curriculum"
- "Early learning pillars"
- "Play-based learning"
- "South African curriculum"

### Content Requirements

- Minimum 300 words per page
- Unique meta descriptions
- Descriptive page titles
- Header tags (H1, H2, H3)
- Internal linking

## Mobile-First Design

Templates must be fully responsive:

### Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Mobile Priorities

- Click-to-call phone numbers
- WhatsApp button
- Easy contact form
- Fast loading (<3 seconds)
- Readable text (minimum 16px)

## Performance Standards

### Loading Speed

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Optimization

- Compress images (WebP format)
- Lazy loading for images
- Minimize CSS/JS
- Use CDN for assets
- Enable caching

## Template Metadata

Each template must include frontmatter:

```yaml
---
title: 'Welcome Play'
slug: 'welcome-play'
ncf:
  elda: ['well-being', 'creativity']
  age_band: '3-5'
languages: ['en', 'af', 'zu']
features:
  - 'Multi-language support'
  - 'Gallery with POPIA compliance'
  - 'Online enrollment form'
  - 'Daily schedule display'
thumbnail: '/images/templates/welcome-play.jpg'
demoUrl: 'https://demo.edusitepro.co.za/welcome-play'
color_scheme: 'emerald'
---
```

## Quality Checklist

Before publishing a template:

- [ ] All 6 ELDA pillars represented
- [ ] Age band clearly specified
- [ ] Multi-language support implemented
- [ ] POPIA-compliant privacy policy
- [ ] WCAG 2.1 AA accessible
- [ ] Mobile responsive tested
- [ ] Performance benchmarks met
- [ ] SEO optimized (meta tags, headings)
- [ ] Contact form with validation
- [ ] Map integration working
- [ ] Social media links functional
- [ ] Photo gallery POPIA-compliant
- [ ] SSL certificate configured
- [ ] Forms have spam protection
- [ ] Legal pages included (Privacy, Terms)

## Template Naming Convention

Use descriptive, NCF-aligned names:

- ✅ **Welcome-Play** (Well-being focus)
- ✅ **Bright-Start** (Identity & Belonging)
- ✅ **Storytime** (Communication)
- ✅ **Number-Fun** (Mathematics)
- ✅ **Creative-Spark** (Creativity)
- ✅ **Nature-Quest** (Knowledge of the World)

❌ Avoid: Generic names like "Template 1" or "Blue Theme"

## Support & Resources

### Official NCF Resources

- [Department of Basic Education](https://www.education.gov.za/)
- NCF Framework Document (Birth to Four)
- ECD Guidelines and Standards

### Technical Support

- Template issues: templates@edusitepro.co.za
- Content questions: content@edusitepro.co.za
- POPIA compliance: legal@edusitepro.co.za

---

**Remember**: Templates are not just websites—they're tools to showcase how ECD centres nurture children according to South Africa's national standards.
