declare module '*.mdx' {
  import { MDXProps } from 'mdx/types';

  export const frontmatter: {
    title: string;
    slug: string;
    description: string;
    pillar: string;
    ncfPillars: string[];
    ageRange: string;
    duration: string;
    groupSize: string;
    locale: string;
    author: string;
    difficulty: string;
    cover: string;
    objectives: string[];
    materials: string[];
    keywords: string[];
  };

  export default function MDXContent(_props: MDXProps): JSX.Element;
}
