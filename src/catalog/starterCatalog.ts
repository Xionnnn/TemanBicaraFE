import { MOCK_CARDS, MOCK_CATEGORIES } from '../components/pecs/mockData';
import type { StarterCatalog } from './catalogStore';
import type { CatalogAsset } from './types';

// Starter kamus are saved in each account's SQLite database on first catalog load.
// Kamus are local and never synced, so every account can reuse these fixed IDs.
const STARTER_IDS: readonly { id: string; mockCategoryId: string }[] = [
  { id: 'a0806ad0-8270-479b-8e17-59a1c94e8109', mockCategoryId: 'cat-kebutuhan' },
  { id: 'a2292faf-d036-4133-aea8-25fa2044ae5b', mockCategoryId: 'cat-aktivitas' },
  { id: '071dc232-3bff-47a6-a781-9759c987f6f4', mockCategoryId: 'cat-perasaan' },
  { id: '26d71db8-445f-4781-96a4-51436c1359f7', mockCategoryId: 'cat-orang' },
  { id: '84c467e7-4079-4172-9058-600b05afc818', mockCategoryId: 'cat-benda' },
];

function mockCategory(id: string) {
  const category = MOCK_CATEGORIES.find((candidate) => candidate.id === id);
  if (!category) throw new Error(`Missing mock category ${id}.`);
  return category;
}

// DUMMY cards from the PECS mocks. They are shown but never written to SQLite.
function dummyCards(mockCategoryId: string): CatalogAsset[] {
  return MOCK_CARDS.filter((card) => card.category === mockCategoryId).map((card) => ({
    id: card.id,
    name: card.name,
    defaultName: card.name,
    sourceType: 'builtin',
    path: `${card.id}.png`,
    dummy: true,
  }));
}

export const STARTER_CATALOG: StarterCatalog = {
  dictionaries: STARTER_IDS.map(({ id, mockCategoryId }) => {
    const category = mockCategory(mockCategoryId);
    return { id, name: category.name, color: category.color };
  }),
  dummyCards: Object.fromEntries(
    STARTER_IDS.map(({ id, mockCategoryId }) => [id, dummyCards(mockCategoryId)]),
  ),
};
