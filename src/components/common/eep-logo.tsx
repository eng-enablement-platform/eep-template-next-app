import { cn } from '@/utils/tailwind-merge';

type EepLogoProps = {
  variant?: 'nav' | 'full';
  className?: string;
};

/**
 * The EEP logo as inline SVG, so the wordmark follows the theme.
 *
 * The files in `public/` hardcode a navy wordmark, which disappears on a dark
 * background. Those stay for the README; the app uses this instead. The node
 * colours are brand colours and stay the same in both themes.
 *
 * @param variant - `nav` is the mark and wordmark; `full` adds the divider and
 * "Engineering Enablement Platform" line underneath.
 * @example
 * ```tsx
 * <EepLogo variant='full' className='w-60' />
 * ```
 */
export function EepLogo({ variant = 'nav', className }: EepLogoProps) {
  const isFull = variant === 'full';

  return (
    <svg
      viewBox={isFull ? '0 0 240 112' : '0 0 240 80'}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label='EEP - Engineering Enablement Platform'
      className={cn('h-auto', className)}
    >
      <line
        x1='30'
        y1='42'
        x2='62'
        y2='16'
        stroke='#7FAECB'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <line
        x1='30'
        y1='42'
        x2='78'
        y2='50'
        stroke='#7FAECB'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <line
        x1='62'
        y1='16'
        x2='78'
        y2='50'
        stroke='#6BBAB5'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <line
        x1='78'
        y1='50'
        x2='54'
        y2='67'
        stroke='#7FAECB'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <circle cx='30' cy='42' r='15' fill='#1B5FA8' />
      <circle cx='62' cy='16' r='9' fill='#14958F' />
      <circle cx='78' cy='50' r='7' fill='#1B5FA8' />
      <circle cx='54' cy='67' r='4.5' fill='#14958F' />
      <text
        x='100'
        y='55'
        fontWeight='700'
        fontSize='42'
        letterSpacing='0.5'
        className='fill-foreground font-sans'
      >
        EEP
      </text>
      {isFull && (
        <>
          <line
            x1='4'
            y1='78'
            x2='236'
            y2='78'
            strokeWidth='0.75'
            className='stroke-border'
          />
          <text
            x='12'
            y='97'
            fontSize='8.5'
            letterSpacing='1.6'
            className='fill-muted-foreground font-sans'
          >
            ENGINEERING ENABLEMENT PLATFORM
          </text>
        </>
      )}
    </svg>
  );
}
