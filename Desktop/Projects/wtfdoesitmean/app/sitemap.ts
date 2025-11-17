import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/ghost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wtfdoesitmean.com';
  
  let posts = [];
  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
    // Return just the homepage if posts can't be fetched
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postEntries,
  ];
}

