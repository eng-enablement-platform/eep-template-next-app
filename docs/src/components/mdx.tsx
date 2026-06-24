import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Step, Steps } from 'fumadocs-ui/components/steps';

import {
  CollapsibleStep,
  CollapsibleSteps,
} from '@/components/collapsible-steps';
import { File, Files, Folder } from '@/components/files';
import { ImageZoom } from '@/components/image-zoom';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    File,
    Files,
    Folder,
    Step,
    Steps,
    CollapsibleStep,
    CollapsibleSteps,
    img: (props) => (
      <ImageZoom {...(props as Parameters<typeof ImageZoom>[0])} />
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
