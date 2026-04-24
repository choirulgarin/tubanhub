// Formatter util untuk tampilan UI (admin & publik).

const ID_LOCALE = 'id-ID';

// Format tanggal ISO → "12 Apr 2026" (short) atau "12 April 2026" (long).
export function formatDate(
  input: string | Date | null | undefined,
  style: 'short' | 'long' = 'short',
): string {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat(ID_LOCALE, {
    day: '2-digit',
    month: style === 'short' ? 'short' : 'long',
    year: 'numeric',
  }).format(d);
}

// Format tanggal + waktu → "12 Apr 2026, 14:30"
export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat(ID_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Format nomor telepon Indonesia:
// "081234567890" atau "+6281234567890" → "+62 812-3456-7890".
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // Normalisasi ke bentuk 62xxxxxxxxx
  const normalized = digits.startsWith('0')
    ? '62' + digits.slice(1)
    : digits.startsWith('62')
    ? digits
    : digits.startsWith('8')
    ? '62' + digits
    : digits;

  if (!normalized.startsWith('62')) return phone;
  const local = normalized.slice(2);
  // Pisahkan jadi grup 3-4-4 atau 3-4-3 tergantung panjang.
  if (local.length <= 3) return `+62 ${local}`;
  if (local.length <= 7) return `+62 ${local.slice(0, 3)}-${local.slice(3)}`;
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
}

// Format angka ke Rupiah ("Rp 25.000"). Nilai negatif di-format default Intl.
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat(ID_LOCALE, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, ' '); // normalisasi non-breaking space agar konsisten.
}

// Format angka biasa dengan pemisah ribuan (pakai titik).
export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat(ID_LOCALE).format(value);
}

// Potong teks dengan ellipsis bila melebihi batas.
export function truncateText(text: string | null | undefined, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, Math.max(0, length - 1)).trimEnd() + '…';
}
