import { Phone, Flame, Ambulance, Shield, Waves, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Emergency = {
  label: string;
  number: string;
  icon: LucideIcon;
  description?: string;
  tone: 'red' | 'orange' | 'blue' | 'emerald' | 'amber' | 'violet';
};

const EMERGENCIES: Emergency[] = [
  {
    label: 'Polisi',
    number: '110',
    icon: Shield,
    description: 'Polres Tuban',
    tone: 'blue',
  },
  {
    label: 'Pemadam Kebakaran',
    number: '113',
    icon: Flame,
    description: 'PMK Tuban',
    tone: 'red',
  },
  {
    label: 'Ambulans',
    number: '118',
    icon: Ambulance,
    description: 'Layanan medis darurat',
    tone: 'emerald',
  },
  {
    label: 'SAR Nasional',
    number: '115',
    icon: Waves,
    description: 'Tim penyelamatan',
    tone: 'orange',
  },
  {
    label: 'BPBD Tuban',
    number: '(0356) 325999',
    icon: Shield,
    description: 'Penanggulangan bencana',
    tone: 'amber',
  },
  {
    label: 'PLN',
    number: '123',
    icon: Zap,
    description: 'Gangguan listrik',
    tone: 'violet',
  },
];

const TONE_CLASS: Record<Emergency['tone'], string> = {
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
};

type Props = {
  variant?: 'full' | 'compact';
  className?: string;
};

export function EmergencyNumbers({ variant = 'full', className }: Props) {
  const items = variant === 'compact' ? EMERGENCIES.slice(0, 4) : EMERGENCIES;
  return (
    <div
      className={cn(
        'grid gap-3',
        variant === 'compact'
          ? 'grid-cols-2 md:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((e) => {
        const Icon = e.icon;
        // tel: link sanitized — hapus semua non-digit kecuali "+".
        const telSafe = e.number.replace(/[^\d+]/g, '');
        return (
          <a
            key={e.label}
            href={`tel:${telSafe}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
          >
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                TONE_CLASS[e.tone],
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {e.label}
              </p>
              {e.description && (
                <p className="truncate text-xs text-muted-foreground">
                  {e.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{e.number}</p>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary">
                <Phone className="h-2.5 w-2.5" aria-hidden />
                Hubungi
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
