# EduSitePro - Product Roadmap

**Last Updated:** 2025-01-25  
**Project Started:** 2025-01-24  
**Current Phase:** Foundation (Phase 1)  
**Overall Progress:** ~45% of Phase 1 Complete

---

## Vision

Build a comprehensive multi-tenant SaaS platform that empowers South African ECD centres to create, manage, and deploy professional, NCF-aligned websites with zero technical knowledge required.

---

## Phase 1: Foundation (Week 1-2) - 🚧 IN PROGRESS

**Goal:** Establish core architecture, multi-tenancy, and basic admin tools

### ✅ Completed (Days 1-4)

#### Infrastructure & Architecture

- [x] Next.js 14 app setup with TypeScript
- [x] Supabase database connection
- [x] Multi-tenant middleware with domain resolution
- [x] RLS-based security (no service role key needed)
- [x] In-memory caching for tenant lookups (5min TTL)
- [x] Edge-compatible architecture

#### Database Schema

- [x] Core tables: centres, centre_domains, pages, page_sections, templates
- [x] RLS policies for public tenant resolution
- [x] Foreign key relationships
- [x] Proper indexing strategy

#### Block Component System

- [x] Block registry with 10 components
- [x] Zod schema validation for all blocks
- [x] TypeScript type inference from schemas
- [x] Block categories: header, content, contact, feature, media, team, pricing

#### Block Components (10 total)

- [x] Hero - Full-width hero with CTA
- [x] RichText - WYSIWYG content
- [x] ContactCTA - Contact form
- [x] ProgramGrid - Educational programs
- [x] StaffCards - Team profiles
- [x] Testimonials - Reviews with ratings
- [x] Gallery - Photo/video gallery
- [x] Stats - Key metrics display
- [x] Features - Feature highlights
- [x] FeesTable - Pricing tables

#### Admin Dashboard

- [x] Professional sidebar layout
- [x] Dashboard home with stats
- [x] Navigation structure (6 sections)
- [x] Responsive design

#### Page Builder

- [x] 3-panel layout (Library, Canvas, Properties)
- [x] Block selector with search/filtering
- [x] Add/remove/reorder blocks
- [x] Block selection highlighting
- [x] Properties panel with live editing

#### Form System

- [x] 6 reusable form field components
- [x] TextField with character counter
- [x] TextAreaField with multi-row
- [x] NumberField with min/max
- [x] CheckboxField for booleans
- [x] SelectField with options
- [x] ImageField with live preview

#### Block Props Editor

- [x] Dynamic form rendering for 6 block types
- [x] Real-time property updates
- [x] Validation feedback
- [x] Fallback for unsupported blocks

### 🔜 Remaining (Days 5-7)

#### Database Integration

- [ ] API routes: POST/GET/PUT/DELETE `/api/admin/pages`
- [ ] API routes: POST/PUT/DELETE `/api/admin/sections`
- [ ] Save page builder state to database
- [ ] Load pages from database
- [ ] Publish/draft workflow

#### Advanced Editors

- [ ] Array field editor component
- [ ] Add/remove items in arrays
- [ ] Edit nested objects (testimonials, programs, etc.)
- [ ] Dynamic schema parsing utility

#### Centre Management

- [ ] Centre creation form
- [ ] Centre listing table with search
- [ ] Centre editing interface
- [ ] Domain assignment UI
- [ ] Branding configuration

#### Page Management

- [ ] Pages listing for a centre
- [ ] Create new page form
- [ ] Edit page metadata (title, slug, description)
- [ ] Delete page confirmation
- [ ] Page status (draft/published)

#### Testing & Documentation

- [ ] Unit tests for block components
- [ ] Integration tests for registry
- [ ] E2E test for page builder
- [ ] API documentation
- [ ] User guide for admin dashboard

---

## Phase 2: Builder Enhancement (Week 3-4) - 📋 PLANNED

**Goal:** Advanced page building features and template system

### Page Builder v2

- [ ] Drag-and-drop block ordering (dnd-kit)
- [ ] Block duplication
- [ ] Copy/paste blocks
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Live preview panel
- [ ] Mobile preview mode
- [ ] Responsive breakpoint testing

### Template System

- [ ] Template creation from pages
- [ ] Template marketplace/library
- [ ] Template categories
- [ ] Template preview
- [ ] One-click template instantiation
- [ ] Template variants (color schemes)
- [ ] Custom template metadata

### Visual Enhancements

- [ ] Block thumbnails/icons
- [ ] Block hover preview
- [ ] Inline editing for simple fields
- [ ] Visual grid/layout guides
- [ ] Block animations preview

### Advanced Block Features

- [ ] Conditional rendering logic
- [ ] Block visibility rules
- [ ] Custom CSS per block
- [ ] Block presets/styles
- [ ] Global blocks (reusable)

---

## Phase 3: Content & Features (Week 5-6) - 📋 PLANNED

**Goal:** Rich content features and parent-facing functionality

### Content Management

- [ ] Media library (Supabase Storage)
- [ ] Image upload and management
- [ ] Image optimization pipeline
- [ ] Video embed support
- [ ] File attachments
- [ ] Asset organization (folders)

### Parent Portal Features

- [ ] Online enrollment forms
- [ ] Program registration
- [ ] Payment integration (PayFast/Paystack)
- [ ] Parent dashboard
- [ ] Child profile management
- [ ] Document uploads
- [ ] Email notifications

### Communication

- [ ] Newsletter sign-up blocks
- [ ] Contact form submissions
- [ ] Email integration (SendGrid/Mailgun)
- [ ] WhatsApp integration
- [ ] SMS notifications (planned)

### SEO & Analytics

- [ ] Meta tags management
- [ ] Open Graph images
- [ ] Sitemap generation
- [ ] Google Analytics integration
- [ ] Search Console integration
- [ ] Performance monitoring

---

## Phase 4: Multi-Tenant Features (Week 7-8) - 📋 PLANNED

**Goal:** Full multi-tenant capabilities and centre customization

### Centre Branding

- [ ] Custom color schemes
- [ ] Logo upload
- [ ] Font selection
- [ ] Custom CSS override
- [ ] Favicon management
- [ ] Social media links

### Domain Management

- [ ] Custom domain connection
- [ ] DNS verification flow
- [ ] SSL certificate automation
- [ ] Subdomain provisioning
- [ ] Domain status monitoring

### User Management

- [ ] Role-based access control
- [ ] Invite team members
- [ ] Permission management
- [ ] Activity logs
- [ ] User sessions

### Billing & Subscriptions

- [ ] Plan tier management
- [ ] Stripe/PayFast integration
- [ ] Subscription handling
- [ ] Invoice generation
- [ ] Usage tracking
- [ ] Payment history

---

## Phase 5: Scale & Polish (Week 9-10) - 📋 PLANNED

**Goal:** Production-ready polish and scalability

### Performance

- [ ] Redis caching layer
- [ ] CDN setup (Cloudflare)
- [ ] Image CDN (Cloudinary/imgix)
- [ ] Database query optimization
- [ ] Lazy loading implementation
- [ ] Service worker (PWA)

### Monitoring & DevOps

- [ ] Sentry error tracking
- [ ] Log aggregation
- [ ] Uptime monitoring
- [ ] Performance metrics
- [ ] Automated backups
- [ ] Disaster recovery plan

### Testing

- [ ] Unit test coverage >80%
- [ ] Integration test suite
- [ ] E2E test scenarios
- [ ] Load testing
- [ ] Security audit
- [ ] Accessibility audit (WCAG 2.1)

### Documentation

- [ ] Developer documentation
- [ ] API reference
- [ ] User manual
- [ ] Video tutorials
- [ ] Migration guides
- [ ] Troubleshooting guides

---

## Phase 6: Advanced Features (Week 11-12) - 🔮 FUTURE

**Goal:** Advanced features and integrations

### Advanced Block Types

- [ ] Calendar/Events block
- [ ] Map integration block
- [ ] Social media feeds
- [ ] Photo carousel/slider
- [ ] Video background
- [ ] Countdown timer
- [ ] FAQ accordion
- [ ] Pricing tables (advanced)

### Integrations

- [ ] Zapier integration
- [ ] Google Workspace
- [ ] Microsoft 365
- [ ] Zoom API
- [ ] WhatsApp Business API
- [ ] SMS gateway

### Mobile App (Future)

- [ ] React Native app
- [ ] Push notifications
- [ ] Offline mode
- [ ] Native camera/media
- [ ] Biometric auth

### White-Label Solution

- [ ] Custom branding for platform
- [ ] Subdomain customization
- [ ] Email templates
- [ ] Partner dashboard
- [ ] Reseller program

---

## Current Sprint (Day 4-5)

### Priorities

**P0 (Critical) - This Week:**

1. ✅ Complete block props editor
2. 🔄 Build API routes for pages CRUD
3. 🔄 Implement save/load functionality
4. 🔄 Array field editor for complex blocks

**P1 (High) - This Week:** 5. Centre management CRUD 6. Page listing and management 7. Basic database seeding

**P2 (Medium) - Next Week:** 8. Template system foundation 9. Live preview panel 10. Enhanced validation

---

## Success Metrics

### Phase 1 Goals

- ✅ Multi-tenant architecture working
- ✅ 10 block components built
- ✅ Admin dashboard functional
- ✅ Page builder working
- 🔄 Database persistence (80% done)
- ⏳ 3 demo centres with content
- ⏳ Complete documentation

### KPIs

- **Build Time:** <60s for production
- **Page Load:** <2s (Lighthouse >90)
- **TypeScript:** 100% type coverage
- **Test Coverage:** >70% (target >80%)
- **Uptime:** >99.5%

---

## Risk Management

### Technical Risks

- **Database Performance:** Mitigated by caching and RLS optimization
- **Middleware Latency:** Using edge functions and 5min cache
- **TypeScript Complexity:** Proper typing from day 1
- **State Management:** Keep it simple with React hooks

### Business Risks

- **Scope Creep:** Focus on MVP first, then iterate
- **Timeline Pressure:** Buffer time in estimates
- **Feature Complexity:** Start simple, add complexity later

---

## Dependencies

### External Services

- ✅ Supabase (Database, Auth, Storage)
- ✅ Vercel (Hosting, Edge Functions)
- ✅ PostHog (Analytics)
- 🔜 Stripe/PayFast (Payments)
- 🔜 SendGrid (Email)

### Libraries

- ✅ Next.js 14.2.5
- ✅ TypeScript 5.5.4
- ✅ Tailwind CSS 3.4.1
- ✅ Zod (Validation)
- 🔜 dnd-kit (Drag & Drop)
- 🔜 TipTap (Rich Text Editor)

---

## Team & Resources

### Current Team

- **You (Developer):** Full-stack development
- **AI Assistant:** Code generation, documentation, architecture

### Needed Soon

- QA Engineer (Phase 2)
- UI/UX Designer (Phase 3)
- DevOps Engineer (Phase 4)

---

## Release Strategy

### Alpha Release (Current)

- **Target:** 2025-01-31
- **Audience:** Internal testing
- **Features:** Core page builder, 10 blocks, admin dashboard

### Beta Release

- **Target:** 2025-02-15
- **Audience:** 5-10 pilot centres
- **Features:** Complete Phase 1 + payment integration

### v1.0 Release

- **Target:** 2025-03-01
- **Audience:** Public launch
- **Features:** All Phase 1-3 features
- **Marketing:** Launch campaign, partnerships

---

## Changelog

### Day 4 (2025-01-25)

- ✅ Form field components (6 types)
- ✅ BlockPropsEditor with live updates
- ✅ Integrated props editor with page builder
- ✅ Support for 6 block types
- 📝 Updated documentation

### Day 3 (2025-01-25)

- ✅ Admin dashboard layout with sidebar
- ✅ Dashboard home with stats
- ✅ Block selector with search/filter
- ✅ Page builder 3-panel layout
- ✅ Block add/remove/reorder

### Day 2 (2025-01-25)

- ✅ 7 new block components
- ✅ RLS security refactor
- ✅ Middleware bug fixes
- ✅ Partner logo placeholders

### Day 1 (2025-01-24)

- ✅ Project setup
- ✅ Database schema
- ✅ Multi-tenant middleware
- ✅ Initial 3 blocks
- ✅ Block registry

---

**Next Review:** End of Day 5  
**Last Updated:** 2025-01-25 18:37 UTC
