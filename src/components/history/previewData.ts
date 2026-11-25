export type HistoryPreviewEntry = {
  id: string;
  displayTime: string;
  words: readonly string[];
};

export const HISTORY_PREVIEW: readonly HistoryPreviewEntry[] = [
  { id: 'preview-1', displayTime: 'yyyy/mm/dd hh:mm:ss', words: ['Saya', 'Mau', 'Makan', 'Nasi', 'Sekarang'] },
  { id: 'preview-2', displayTime: 'yyyy/mm/dd hh:mm:ss', words: ['Saya', 'Mau', 'Minum'] },
  { id: 'preview-3', displayTime: 'yyyy/mm/dd hh:mm:ss', words: ['Saya', 'Ingin', 'Bermain', 'Dengan', 'Teman'] },
  { id: 'preview-4', displayTime: 'yyyy/mm/dd hh:mm:ss',
    words: ['Saya', 'Mau', 'Makan', 'Nasi', 'Lalu', 'Minum', 'Air', 'Bersama', 'Teman'] },
];
