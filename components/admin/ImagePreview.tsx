'use client';

import { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImagePreviewProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  /** Aspek ratio — default 16:9 cocok untuk thumbnail. */
  ratio?: '16/9' | '1/1' | '4/3';
};

// Preview gambar dari URL. Tampilkan placeholder kalau src kosong
// atau state error bila URL gagal dimuat (misalnya typo).
export function ImagePreview({
  src,
  alt = 'Preview',
  className,
  ratio = '16/9',
}: ImagePreviewProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    src ? 'loading' : 'idle',
  );

  const ratioClass =
    ratio === '1/1'
      ? 'aspect-square'
      : ratio === '4/3'
      ? 'aspect-[4/3]'
      : 'aspect-video';

  if (!src) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground',
          ratioClass,
          className,
        )}
      >
        Belum ada gambar
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-muted',
        ratioClass,
        className,
      )}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
        </div>
      )}
      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
          <ImageOff className="h-6 w-6" aria-hidden />
          Gambar gagal dimuat
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onLoad={() => setStatus('idle')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}
