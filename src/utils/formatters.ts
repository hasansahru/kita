/**
 * Formatting utility functions for Indonesian currency, numbers, and dates
 */

export const formatRupiah = (amount: number, hideAmount = false): string => {
  if (hideAmount) return 'Rp ••••••••';
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const formatted = Math.round(amount).toLocaleString('id-ID');
  return `Rp ${formatted}`;
};

export const formatRupiahCompact = (amount: number, hideAmount = false): string => {
  if (hideAmount) return 'Rp •••';
  if (isNaN(amount)) return 'Rp 0';
  
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatDateIndo = (dateStr: string, includeDayName = false): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(includeDayName ? { weekday: 'long' } : {}),
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex] || '';
};

export const getMonthKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
