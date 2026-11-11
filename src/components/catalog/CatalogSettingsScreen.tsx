import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth/AuthProvider';
import { saveAccountWord } from '../../catalog/catalogData';
import { pickLibraryImage } from '../../catalog/imagePicker';
import { useCatalog } from '../../catalog/useCatalog';
import type { CatalogAsset, CatalogDictionary, WordRequest } from '../../catalog/types';
import { Action } from '../AuthForm';
import { HomeIcon } from '../pecs/PecsIcons';
import { CatalogAssetGrid } from './CatalogAssetGrid';
import { PlaceholderNotice } from './CatalogControls';
import { CreateWordModal, type SavedWord } from './CreateWordModal';
import { DictionaryTabBar } from './DictionaryTabBar';

export function CatalogSettingsScreen({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { controller } = useAuth();
  const { state, retry, refresh } = useCatalog(accountId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [gridRevision, setGridRevision] = useState(0);

  // Edit actions are reserved for the edit task; they do nothing yet.
  const editDictionary = (_dictionary: CatalogDictionary) => {};
  const editAsset = (_asset: CatalogAsset) => {};

  const goHome = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const catalog = state.status === 'ready' ? state.catalog : null;
  const selected = catalog?.dictionaries.find((dictionary) => dictionary.id === selectedId)
    ?? catalog?.dictionaries[0] ?? null;

  // Rejects with AccountChangedError if this account is no longer the active one.
  const saveWord = async (request: WordRequest): Promise<SavedWord> => {
    const { label } = await controller.withAccount(accountId, (storage) => saveAccountWord(storage, request));
    let refreshed = true;
    try {
      await refresh();
    } catch {
      refreshed = false;
    }
    // Back to the first grid page, where the new card is.
    setGridRevision((value) => value + 1);
    return { label, refreshed };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
          onPress={goHome}
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        >
          <HomeIcon size={34} color="#111827" />
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>Pengaturan Katalog</Text>
        <Text style={styles.subtitle}>Ubah gambar dan kumpulan kamus gambar</Text>
      </View>

      <View style={styles.body}>
        {state.status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.status}>Memuat katalog…</Text>
          </View>
        )}

        {state.status === 'error' && (
          <View style={[styles.center, styles.errorBox]}>
            <Text accessibilityRole="alert" style={styles.status}>
              {state.legacySchema
                ? 'Data katalog di perangkat ini memakai format lama, jadi belum bisa dibuka.'
                : 'Katalog belum dapat dimuat.'}
            </Text>
            <Action title="Coba lagi" onPress={retry} />
          </View>
        )}

        {catalog && (
          <>
            <DictionaryTabBar
              dictionaries={catalog.dictionaries}
              selectedId={selected?.id ?? null}
              onSelect={(dictionary) => setSelectedId(dictionary.id)}
              onCreate={() => setNotice('Membuat kamus baru akan tersedia nanti.')}
              onEdit={editDictionary}
            />
            {selected ? (
              <CatalogAssetGrid
                key={`${selected.id}:${gridRevision}`}
                assets={catalog.assetsByDictionary[selected.id] ?? []}
                onCreate={() => setCreating(true)}
                onEdit={editAsset}
              />
            ) : (
              <View style={styles.center}>
                <Text style={styles.status}>Belum ada kamus. Buat kamus untuk mulai.</Text>
              </View>
            )}
          </>
        )}
      </View>

      {creating && catalog && selected && (
        <CreateWordModal
          catalog={catalog}
          dictionary={selected}
          pickImage={pickLibraryImage}
          onSave={saveWord}
          onClose={() => setCreating(false)}
        />
      )}
      <PlaceholderNotice message={notice} onClose={() => setNotice(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 4,
  },
  homeButton: {
    alignSelf: 'flex-start',
    width: 68,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
  },
  body: {
    flex: 1,
    backgroundColor: '#3F4940',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  errorBox: {
    alignItems: 'stretch',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
