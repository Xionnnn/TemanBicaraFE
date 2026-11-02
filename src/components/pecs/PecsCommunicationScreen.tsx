import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CategoryBar } from './CategoryBar';
import { PecsCardGrid } from './PecsCardGrid';
import { PecsHeader } from './PecsHeader';
import { SentenceStrip } from './SentenceStrip';
import { MOCK_CARDS, MOCK_CATEGORIES } from './mockData';
import type { PecsCard, SentenceItem } from './types';

export function PecsCommunicationScreen() {
  const router = useRouter();
  const [sentenceItems, setSentenceItems] = useState<SentenceItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    MOCK_CATEGORIES[0]?.id ?? ''
  );
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  // Filter cards by selected category
  const filteredCards = useMemo(() => {
    return MOCK_CARDS.filter((card) => card.category === selectedCategoryId);
  }, [selectedCategoryId]);

  // Append card to sentence strip
  const handleSelectCard = (card: PecsCard) => {
    const newItem: SentenceItem = {
      instanceId: `${card.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      card,
    };
    setSentenceItems((prev) => [...prev, newItem]);
  };

  // Remove individual card from strip
  const handleRemoveItem = (instanceId: string) => {
    setSentenceItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };

  // Clear entire sentence strip
  const handleClearStrip = () => {
    setSentenceItems([]);
    setSpeechFeedback(null);
  };

  // Playback action (speech deferred as requested; provides visual feedback for now)
  const handleSpeakSentence = () => {
    if (sentenceItems.length === 0) return;
    const sentenceText = sentenceItems.map((item) => item.card.name).join(' ');
    setSpeechFeedback(sentenceText);
    setTimeout(() => {
      setSpeechFeedback(null);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Top Header: Home, Trash, Speaker */}
        <PecsHeader
          onGoHome={() => router.replace('/home')}
          onClearStrip={handleClearStrip}
          onSpeakSentence={handleSpeakSentence}
          isStripEmpty={sentenceItems.length === 0}
        />

        {/* Visual feedback banner when speak is triggered */}
        {speechFeedback && (
          <View style={styles.feedbackBanner} accessibilityLiveRegion="polite">
            <Text style={styles.feedbackText}>{`🔊 Membaca: "${speechFeedback}"`}</Text>
          </View>
        )}

        {/* Sentence Strip */}
        <SentenceStrip
          items={sentenceItems}
          onRemoveItem={handleRemoveItem}
        />

        {/* Category Bar ("Kamus") with Left/Right Arrows */}
        <CategoryBar
          categories={MOCK_CATEGORIES}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* 2x2 Grid of Picture Cards with Up/Down Arrows */}
        <PecsCardGrid
          cards={filteredCards}
          onSelectCard={handleSelectCard}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#3F4940',
  },
  feedbackBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
});
