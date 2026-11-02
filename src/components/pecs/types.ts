export type PecsCard = {
  id: string;
  name: string;
  category: string;
  color?: string;
};

export type PecsCategory = {
  id: string;
  name: string;
  color: string;
};

export type SentenceItem = {
  instanceId: string;
  card: PecsCard;
};
