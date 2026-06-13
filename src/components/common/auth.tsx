import { SignIn, SignUp } from '@clerk/nextjs';

type AuthProps = {
  type: 'sign-in' | 'sign-up';
  title?: string;
  subtitle?: string;
};

/**
 * Renders Clerk's prebuilt sign-in or sign-up flow under a shared heading.
 *
 * Consumed by the catch-all `[[...sign-in]]` / `[[...sign-up]]` routes, which is
 * why Clerk's path-based routing resolves without extra config. The heading is
 * ours; the form below it is Clerk's.
 *
 * @param subtitle - Defaults to a type-appropriate prompt when omitted.
 * @example
 * ```tsx
 * <Auth type='sign-in' title='Welcome back!' />
 * ```
 */
export function Auth({
  type,
  title = 'Welcome to My App!',
  subtitle,
}: AuthProps) {
  const defaultSubtitle =
    type === 'sign-up' ? 'Sign up to continue.' : 'Sign in to continue.';

  return (
    <div className='mt-10 flex flex-col items-center justify-center gap-8'>
      <div className='text-center'>
        <h1 className='scroll-m-20 text-4xl font-bold tracking-tight'>
          {title}
        </h1>
        <p className='text-muted-foreground mt-2 leading-7'>
          {subtitle ?? defaultSubtitle}
        </p>
      </div>
      {type === 'sign-up' ? (
        <SignUp signInUrl='/sign-in' />
      ) : (
        <SignIn signUpUrl='/sign-up' />
      )}
    </div>
  );
}
