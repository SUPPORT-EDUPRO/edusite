import createMDX from '@next/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }]],
  },
});

/** @type {import('next').NextConfig} */
const SUPABASE_HOSTNAME = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const remotePatterns = [
  { protocol: 'https', hostname: 'via.placeholder.com' },
  { protocol: 'https', hostname: 'img.freepik.com' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'placehold.co' },
  { protocol: 'https', hostname: 'res.cloudinary.com' },
];

if (SUPABASE_HOSTNAME) {
  remotePatterns.push({ protocol: 'https', hostname: SUPABASE_HOSTNAME });
}

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns,
  },
};

export default withMDX(nextConfig);
