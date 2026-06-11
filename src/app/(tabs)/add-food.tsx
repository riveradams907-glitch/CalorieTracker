import { StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { FoodService, CommonFood } from '@/services/food-service';
import { Spacing } from '@/constants/theme';

type AddMode = 'search' | 'custom';

export default function AddFoodScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<AddMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [commonFoods, setCommonFoods] = useState<CommonFood[]>(FoodService.getCommonFoods());
  const [isLoading, setIsLoading] = useState(false);

  // Custom food form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = FoodService.getCommonFoods(query);
    setCommonFoods(results);
  };

  const handleSelectFood = (food: CommonFood) => {
    if (!user) return;
    setIsLoading(true);
    try {
      FoodService.addFoodEntry(food.name, food.calories, user.id, food.protein, food.carbs, food.fat);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomFood = () => {
    if (!customName.trim() || !customCalories.trim()) {
      setError('Please enter food name and calories');
      return;
    }

    const calories = parseInt(customCalories, 10);
    if (isNaN(calories) || calories <= 0) {
      setError('Please enter a valid calorie amount');
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      FoodService.addFoodEntry(
        customName,
        calories,
        user.id,
        customProtein ? parseInt(customProtein, 10) : undefined,
        customCarbs ? parseInt(customCarbs, 10) : undefined,
        customFat ? parseInt(customFat, 10) : undefined
      );
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Add Food</ThemedText>
          <ThemedView style={styles.placeholder} />
        </ThemedView>

        {/* Mode Tabs */}
        <ThemedView style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'search' && styles.modeTabActive]}
            onPress={() => setMode('search')}
          >
            <ThemedText style={[styles.modeTabText, mode === 'search' && styles.modeTabTextActive]}>
              Search Food
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'custom' && styles.modeTabActive]}
            onPress={() => setMode('custom')}
          >
            <ThemedText style={[styles.modeTabText, mode === 'custom' && styles.modeTabTextActive]}>
              Custom Food
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {mode === 'search' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {commonFoods.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <ThemedText>No foods found</ThemedText>
                <ThemedText style={styles.emptySubtext}>Try a different search</ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={commonFoods}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.foodItem}
                    onPress={() => handleSelectFood(item)}
                    disabled={isLoading}
                  >
                    <ThemedView style={styles.foodInfo}>
                      <ThemedText style={styles.foodName}>{item.name}</ThemedText>
                      <ThemedText style={styles.foodServing}>{item.serving}</ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.foodCalories}>{item.calories} cal</ThemedText>
                  </TouchableOpacity>
                )}
              />
            )}
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.form}>
              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Food Name *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grilled Chicken"
                  placeholderTextColor="#999"
                  value={customName}
                  onChangeText={setCustomName}
                  editable={!isLoading}
                />
              </ThemedView>

              <ThemedView style={styles.formGroup}>
                <ThemedText style={styles.label}>Calories *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 150"
                  placeholderTextColor="#999"
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  editable={!isLoading}
                  keyboardType="number-pad"
                />
              </ThemedView>

              <ThemedText style={styles.optionalLabel}>Optional - Macros</ThemedText>

              <ThemedView style={styles.macroInputs}>
                <ThemedView style={styles.macroInput}>
                  <ThemedText style={styles.label}>Protein (g)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={customProtein}
                    onChangeText={setCustomProtein}
                    editable={!isLoading}
                    keyboardType="number-pad"
                  />
                </ThemedView>

                <ThemedView style={styles.macroInput}>
                  <ThemedText style={styles.label}>Carbs (g)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                    editable={!isLoading}
                    keyboardType="number-pad"
                  />
                </ThemedView>

                <ThemedView style={styles.macroInput}>
                  <ThemedText style={styles.label}>Fat (g)</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={customFat}
                    onChangeText={setCustomFat}
                    editable={!isLoading}
                    keyboardType="number-pad"
                  />
                </ThemedView>
              </ThemedView>

              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

              <TouchableOpacity
                style={[styles.addButton, isLoading && styles.addButtonDisabled]}
                onPress={handleAddCustomFood}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.addButtonText}>Add to Log</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginBottom: Spacing.four,
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  placeholder: {
    width: 50,
  },
  modeTabs: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  modeTab: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabActive: {
    borderBottomColor: '#007AFF',
  },
  modeTabText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  modeTabTextActive: {
    opacity: 1,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.three,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontWeight: '500',
    marginBottom: Spacing.one,
  },
  foodServing: {
    fontSize: 12,
    opacity: 0.6,
  },
  foodCalories: {
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    gap: Spacing.three,
  },
  formGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  optionalLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
    marginTop: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  macroInputs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroInput: {
    flex: 1,
    gap: Spacing.one,
  },
  error: {
    color: '#ff4444',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
