export type PreviewStudent = { id: string; name: string; words: { word: string; count: number }[] };
export type PreviewClass = { id: number; name: string; year: string; students: PreviewStudent[] };

export function createExampleClasses(): PreviewClass[] {
  return ['A', 'B', 'C'].map((letter, classIndex) => ({
    id: classIndex + 1, name: `Kelas ${letter}`, year: 'yyyy',
    students: Array.from({ length: 10 }, (_, index) => ({
      id: `${letter}-${index + 1}`, name: `Siswa ${index + 1}`,
      words: ['Saya', 'Mau', 'Minum', 'Makan'].map((word, wordIndex) => ({
        word, count: Math.max(0, 12 - index - wordIndex * 2),
      })),
    })),
  }));
}
