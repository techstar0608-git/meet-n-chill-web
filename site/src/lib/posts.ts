import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export async function getPosts(category?: string): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft && (!category || data.category === category));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (post: Post) => `/blog/${post.data.category}/${post.id}/`;

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
