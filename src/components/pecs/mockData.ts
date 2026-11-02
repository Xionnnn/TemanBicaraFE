import type { PecsCard, PecsCategory } from './types';

export const MOCK_CATEGORIES: PecsCategory[] = [
  { id: 'cat-kebutuhan', name: 'Kebutuhan', color: '#E0F2FE' },
  { id: 'cat-aktivitas', name: 'Aktivitas', color: '#FEF3C7' },
  { id: 'cat-perasaan', name: 'Perasaan', color: '#FCE7F3' },
  { id: 'cat-orang', name: 'Orang', color: '#DCFCE7' },
  { id: 'cat-benda', name: 'Benda', color: '#F3E8FF' },
];

export const MOCK_CARDS: PecsCard[] = [
  // Kebutuhan
  { id: 'card-makan', name: 'Makan', category: 'cat-kebutuhan' },
  { id: 'card-minum', name: 'Minum', category: 'cat-kebutuhan' },
  { id: 'card-toilet', name: 'Toilet', category: 'cat-kebutuhan' },
  { id: 'card-istirahat', name: 'Istirahat', category: 'cat-kebutuhan' },
  { id: 'card-tolong', name: 'Tolong', category: 'cat-kebutuhan' },
  { id: 'card-sakit', name: 'Sakit', category: 'cat-kebutuhan' },

  // Aktivitas
  { id: 'card-belajar', name: 'Belajar', category: 'cat-aktivitas' },
  { id: 'card-bermain', name: 'Bermain', category: 'cat-aktivitas' },
  { id: 'card-membaca', name: 'Membaca', category: 'cat-aktivitas' },
  { id: 'card-gambar', name: 'Menggambar', category: 'cat-aktivitas' },
  { id: 'card-duduk', name: 'Duduk', category: 'cat-aktivitas' },
  { id: 'card-jalan', name: 'Berjalan', category: 'cat-aktivitas' },

  // Perasaan
  { id: 'card-senang', name: 'Senang', category: 'cat-perasaan' },
  { id: 'card-sedih', name: 'Sedih', category: 'cat-perasaan' },
  { id: 'card-marah', name: 'Marah', category: 'cat-perasaan' },
  { id: 'card-takut', name: 'Takut', category: 'cat-perasaan' },
  { id: 'card-lelah', name: 'Lelah', category: 'cat-perasaan' },

  // Orang
  { id: 'card-saya', name: 'Saya', category: 'cat-orang' },
  { id: 'card-guru', name: 'Guru', category: 'cat-orang' },
  { id: 'card-teman', name: 'Teman', category: 'cat-orang' },
  { id: 'card-ibu', name: 'Ibu', category: 'cat-orang' },
  { id: 'card-ayah', name: 'Ayah', category: 'cat-orang' },

  // Benda
  { id: 'card-buku', name: 'Buku', category: 'cat-benda' },
  { id: 'card-pensil', name: 'Pensil', category: 'cat-benda' },
  { id: 'card-bola', name: 'Bola', category: 'cat-benda' },
  { id: 'card-kursi', name: 'Kursi', category: 'cat-benda' },
  { id: 'card-meja', name: 'Meja', category: 'cat-benda' },
  { id: 'card-air', name: 'Air', category: 'cat-benda' },
];
