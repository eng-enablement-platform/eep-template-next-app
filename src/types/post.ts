/**
 * A post from the JSONPlaceholder API.
 *
 * Used as the reference SWR data type. JSONPlaceholder is a free public REST
 * API used here purely as a stable external data source for the example hook.
 *
 * @see https://jsonplaceholder.typicode.com/posts
 */
export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};
