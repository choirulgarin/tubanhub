'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InfluencerPlatform } from '@/types';

const OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
];

type Props = {
  value: InfluencerPlatform[];
  onChange: (next: InfluencerPlatform[]) => void;
};

export function PlatformsInput({ value, onChange }: Props) {
  function update(index: number, patch: Partial<InfluencerPlatform>) {
    const next = value.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange(next);
  }

  function add() {
    onChange([
      ...value,
      { platform: 'instagram', username: '', followers: 0, url: '' },
    ]);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Belum ada platform. Tambah minimal satu.
        </p>
      )}

      {value.map((p, i) => (
        <div
          key={i}
          className="grid gap-2 rounded-lg border border-border bg-muted/20 p-3 md:grid-cols-[140px_1fr_120px_1fr_auto]"
        >
          <div className="space-y-1">
            <Label className="text-xs">Platform</Label>
            <Select
              value={p.platform}
              onValueChange={(v) => v && update(i, { platform: v })}
            >
              <SelectTrigger aria-label="Platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Username</Label>
            <Input
              value={p.username}
              onChange={(e) => update(i, { username: e.target.value })}
              maxLength={80}
              placeholder="@username"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Followers</Label>
            <Input
              type="number"
              min={0}
              value={p.followers}
              onChange={(e) =>
                update(i, { followers: parseInt(e.target.value, 10) || 0 })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">URL profil</Label>
            <Input
              type="url"
              value={p.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(i)}
              aria-label="Hapus platform"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" aria-hidden />
        Tambah platform
      </Button>
    </div>
  );
}
