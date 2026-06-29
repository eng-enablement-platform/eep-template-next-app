import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className='flex items-center gap-3'>
          <Image
            src='/eep/eep-logo-nav.svg'
            alt='EEP'
            width={80}
            height={27}
            priority
          />
          <span className='text-sm font-medium'>Next.js Template</span>
        </div>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
