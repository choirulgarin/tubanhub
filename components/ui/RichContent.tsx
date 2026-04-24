'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Mapping elemen markdown → kelas Tailwind. Dipisah ke konstanta agar mudah
// di-reuse kalau suatu saat ingin memakai varian gelap/compact.
const COMPONENTS: Components = {
  h1: ({ children, ...rest }) => (
    <h1
      {...rest}
      className="mt-8 mb-4 text-3xl font-bold tracking-tight text-slate-900"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...rest }) => (
    <h2
      {...rest}
      className="mt-6 mb-3 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-800"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }) => (
    <h3 {...rest} className="mt-4 mb-2 text-xl font-semibold text-slate-700">
      {children}
    </h3>
  ),
  p: ({ children, ...rest }) => (
    <p {...rest} className="mb-4 leading-relaxed text-slate-600">
      {children}
    </p>
  ),
  ul: ({ children, ...rest }) => (
    <ul
      {...rest}
      className="mb-4 list-inside list-disc space-y-2 text-slate-600"
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...rest }) => (
    <ol
      {...rest}
      className="mb-4 list-inside list-decimal space-y-2 text-slate-600"
    >
      {children}
    </ol>
  ),
  li: ({ children, ...rest }) => (
    <li {...rest} className="leading-relaxed text-slate-600">
      {children}
    </li>
  ),
  strong: ({ children, ...rest }) => (
    <strong {...rest} className="font-semibold text-slate-800">
      {children}
    </strong>
  ),
  em: ({ children, ...rest }) => (
    <em {...rest} className="italic text-slate-700">
      {children}
    </em>
  ),
  blockquote: ({ children, ...rest }) => (
    <blockquote
      {...rest}
      className="my-4 rounded-r-lg border-l-4 border-primary bg-blue-50 py-2 pl-4 italic text-slate-600"
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...rest }) => (
    <code
      {...rest}
      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-700"
    >
      {children}
    </code>
  ),
  hr: (props) => <hr {...props} className="my-6 border-slate-200" />,
  a: ({ children, ...rest }) => (
    <a
      {...rest}
      className="font-medium text-primary hover:underline"
      target={rest.href?.startsWith('http') ? '_blank' : rest.target}
      rel={rest.href?.startsWith('http') ? 'noopener noreferrer' : rest.rel}
    >
      {children}
    </a>
  ),
};

type RichContentProps = {
  content: string;
  className?: string;
};

// Render konten Markdown dari DB dengan remark-gfm (tabel, strikethrough, task list).
// Tidak menggunakan rehype-raw agar HTML mentah dari user tidak di-render — lebih aman.
export function RichContent({ content, className }: RichContentProps) {
  return (
    <div className={cn('max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
