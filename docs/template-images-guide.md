# Template Cover Images Guide

## Current Status

The existing template cover images (`public/templates/*.png`) are placeholder SVGs renamed as PNG files. These need to be replaced with proper images.

## Image Requirements

### Technical Specifications

- **Format**: PNG (preferred) or WebP
- **Dimensions**: 1200x675px (16:9 ratio)
- **File Size**: Under 200KB (optimize for web)
- **Quality**: High resolution but web-optimized
- **Style**: Colorful, child-friendly, professional

### Design Guidelines

- Use bright, engaging colors
- Include representations of children (illustrations preferred over photos for privacy)
- Show the activity in action where possible
- Incorporate NCF pillar visual themes
- South African cultural relevance where applicable
- Avoid copyrighted characters or brands

## Recommended Image Sources

### Free/Open Source Options:

1. **Unsplash** (https://unsplash.com) - High-quality photos
   - Search: "children learning", "classroom activities", "outdoor play"
2. **Pexels** (https://www.pexels.com) - Free stock photos
   - Search: "kids education", "preschool", "children playing"
3. **Pixabay** (https://pixabay.com) - Free illustrations and photos
   - Search: "kindergarten", "early childhood", "kids learning"

4. **unDraw** (https://undraw.co) - Free illustrations
   - Search: "education", "children", "learning"

5. **Freepik** (https://www.freepik.com) - Free and premium
   - Filter: Free resources only
   - Search: "ECD activities", "children classroom"

### AI-Generated Options:

- **DALL-E** or **Midjourney** prompts:
  - "Colorful illustration of diverse South African children engaged in [activity], bright classroom setting, educational, friendly, professional"

### Custom Design:

- **Canva** (https://www.canva.com)
  - Use templates for "Education Cover" or "Social Media Post"
  - 1200x675px custom dimensions
  - Free elements and photos available

## Specific Template Recommendations

### 1. Welcome Play (welcome-play.png)

**Theme**: Outdoor play, physical activity, well-being

**Suggested Images**:

- Children playing outdoors with balls, hoops, or on playground
- Diverse group of 3-5 year olds running, jumping, playing
- Bright sunny day, green grass, vibrant colors
- Include elements: balls, cones, play equipment

**Alternative**: Illustration of children in motion with activity elements

### 2. Bright Start (bright-start.png)

**Theme**: Morning circle time, identity, belonging

**Suggested Images**:

- Children sitting in circle with teacher
- Morning greeting, name tags visible
- Diverse group showing belonging and inclusion
- Warm, welcoming classroom environment
- Include elements: circle mat, picture books, morning routine visuals

**Alternative**: Illustration of inclusive circle time with diverse children

### 3. Story Time Adventures (storytime.png)

**Theme**: Storytelling, literacy, communication

**Suggested Images**:

- Teacher reading to engaged children
- Picture book visible, children listening attentively
- Cozy reading corner or library setting
- Ages 2-5, diverse group
- Include elements: books, puppets, story props

**Alternative**: Illustration of magical storytelling scene with books and imagination elements

### 4. Coding Blocks & Logic Play (coding-blocks.png)

**Theme**: Computational thinking, problem-solving, STEM

**Suggested Images**:

- Children playing with colorful building blocks or coding toys
- Simple robot or programmable toy (like Bee-Bot)
- Logical sequence/pattern activities
- STEM-focused classroom corner
- Include elements: blocks, patterns, sequence cards

**Alternative**: Illustration of children with block-based coding concept

### 5. Little Engineers & Robots (little-engineers.png)

**Theme**: Robotics, engineering, movement

**Suggested Images**:

- Children with age-appropriate robots (Dash, Cubetto, etc.)
- Building/construction activities
- Engineering challenge setup
- Excited children problem-solving
- Include elements: simple robots, building materials, tools

**Alternative**: Illustration of children as engineers with friendly robots

### 6. Digital Storytellers (digital-storytellers.png)

**Theme**: Technology, media, digital literacy

**Suggested Images**:

- Children using tablets for creative activities
- Digital art or story creation
- Teacher guiding technology use
- Balanced tech integration
- Include elements: tablets, digital art, recorded stories

**Alternative**: Illustration of children creating digital content safely

## Color Palette Recommendations

Match the EduSitePro brand:

- **Primary**: Emerald/Teal (#10b981, #14b8a6)
- **Accent**: Warm colors (orange, yellow) for energy
- **Background**: Light, bright, welcoming
- **Diversity**: Include varied skin tones and cultural elements

## Image Optimization

Before adding to `public/templates/`:

```bash
# Using ImageMagick (if available)
magick input.jpg -resize 1200x675^ -gravity center -extent 1200x675 -quality 85 output.png

# Or use online tools:
# - TinyPNG (https://tinypng.com)
# - Squoosh (https://squoosh.app)
```

## Implementation Steps

1. **Source or create images** following guidelines above
2. **Optimize** images to under 200KB each
3. **Name correctly**: `template-slug.png` (e.g., `welcome-play.png`)
4. **Place in**: `public/templates/`
5. **Test**: Verify images load on listing and detail pages
6. **Commit**: Add to git with descriptive commit message

## Attribution

If using images that require attribution:

- Add attribution to template frontmatter or footer
- Create `public/templates/attributions.md` file
- Link to original sources where required

## Future Considerations

- **Localization**: Different images for different languages/regions
- **Seasonal**: Rotate images based on South African school terms
- **Dynamic**: Pull from EduDash Pro user-submitted photos (with permissions)
- **Video thumbnails**: Add video previews for activities
