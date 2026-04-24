'use client';

import type { OpeningHours } from '@/types';
import { cn } from '@/lib/utils';

type OpeningHoursInputProps = {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
  className?: string;
};

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'senin',          label: 'Senin' },
  { key: 'selasa',         label: 'Selasa' },
  { key: 'rabu',           label: 'Rabu' },
  { key: 'kamis',          label: 'Kamis' },
  { key: 'jumat',          label: 'Jumat' },
  { key: 'sabtu',          label: 'Sabtu' },
  { key: 'minggu',         label: 'Minggu' },
  { key: 'libur_nasional', label: 'Libur Nasional' },
];

// Representasi yang kita simpan ke `opening_hours` (jsonb) berupa string per-hari.
// Contoh: { senin: "08:00–14:00", minggu: "Tutup" }. "24 jam" didukung via checkbox.

// Struktur internal UI yang lebih ergonomis, lalu serialisasi ke OpeningHours string.
type DayState = {
  active: boolean;
  open24: boolean;
  start: string;
  end: string;
};

function parse(value: OpeningHours | null | undefined, day: string): DayState {
  const raw = value?.[day];
  if (!raw) return { active: false, open24: false, start: '08:00', end: '16:00' };
  if (/24\s*jam/i.test(raw)) {
    return { active: true, open24: true, start: '', end: '' };
  }
  const m = raw.match(/^(\d{1,2}[:.]\d{2})\s*[–-]\s*(\d{1,2}[:.]\d{2})$/);
  if (m) {
    return {
      active: true,
      open24: false,
      start: m[1].replace('.', ':'),
      end: m[2].replace('.', ':'),
    };
  }
  return { active: true, open24: false, start: '08:00', end: '16:00' };
}

function serialize(state: DayState): string | null {
  if (!state.active) return null;
  if (state.open24) return '24 jam';
  if (!state.start || !state.end) return null;
  return `${state.start}–${state.end}`;
}

export function OpeningHoursInput({
  value,
  onChange,
  className,
}: OpeningHoursInputProps) {
  function updateDay(dayKey: string, patch: Partial<DayState>) {
    const current = parse(value, dayKey);
    const merged = { ...current, ...patch };
    const next = { ...(value ?? {}) };
    const str = serialize(merged);
    if (str == null) {
      delete next[dayKey];
    } else {
      next[dayKey] = str;
    }
    onChange(next);
  }

  return (
    <div className={cn('space-y-2', className)}>
      {DAYS.map((day) => {
        const state = parse(value, day.key);
        return (
          <div
            key={day.key}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <label className="flex w-32 items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={state.active}
                onChange={(e) => updateDay(day.key, { active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              {day.label}
            </label>

            {state.active && (
              <>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={state.open24}
                    onChange={(e) => updateDay(day.key, { open24: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  24 jam
                </label>

                {!state.open24 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={state.start}
                      onChange={(e) => updateDay(day.key, { start: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-slate-400">–</span>
                    <input
                      type="time"
                      value={state.end}
                      onChange={(e) => updateDay(day.key, { end: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
