'use client';

import { usePosts } from '@/hooks/use-posts';

/**
 * EXAMPLE COMPONENT
 *
 * Renders a short list of posts fetched via the `usePosts` SWR hook.
 *
 * @example
 * ```tsx
 * <Posts />
 * ```
 */
export function Posts() {
  const { posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='bg-muted animate-pulse rounded-md p-3'>
            <div className='bg-muted-foreground/20 mb-2 h-3 w-2/3 rounded' />
            <div className='bg-muted-foreground/20 h-3 w-full rounded' />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className='text-destructive text-sm'>
        Failed to load posts: {error.message}
      </p>
    );
  }

  return (
    <ul className='flex flex-col gap-3'>
      {posts?.map((post) => (
        <li key={post.id} className='flex flex-col gap-1 text-left'>
          <span className='text-foreground text-sm font-medium capitalize'>
            {post.title}
          </span>
          <span className='text-muted-foreground line-clamp-2 text-xs'>
            {post.body}
          </span>
        </li>
      ))}
    </ul>
  );
}
