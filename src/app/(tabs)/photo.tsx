import { StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { PhotoAnalysisService, AnalyzedFood } from '@/services/photo-analysis-service';
import { FoodService } from '@/services/food-service';
import { Spacing } from '@/constants/theme';

type Step = 'upload' | 'analyzing' | 'results' | 'confirming';

export default function PhotoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzedFoods, setAnalyzedFoods] = useState<AnalyzedFood[]>([]);
  const [error, setError] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Set<number>>(new Set());

  const handleImageSelect = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

      setSelectedImage(base64);
      setStep('analyzing');
      setError('');

      try {
        const foods = await PhotoAnalysisService.analyzeFood(base64Data);
        if (foods.length === 0) {
          setError('No food detected in the image. Please try another photo.');
          setStep('upload');
          return;
        }
        setAnalyzedFoods(foods);
        setSelectedFoods(new Set(foods.map((_, i) => i)));
        setStep('results');
      } catch (err) {
        setError('Failed to analyze image. Please try again.');
        console.error(err);
        setStep('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddFoods = () => {
    if (!user || selectedFoods.size === 0) return;

    selectedFoods.forEach((index) => {
      const food = analyzedFoods[index];
      FoodService.addFoodEntry(
        food.name,
        food.calories,
        user.id,
        food.protein,
        food.carbs,
        food.fat
      );
    });

    router.back();
  };

  const toggleFoodSelection = (index: number) => {
    const newSelected = new Set(selectedFoods);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFoods(newSelected);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step === 'upload' && (
          <>
            <ThemedText type="title" style={styles.title}>
              Analyze Food Photo
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Take a photo or upload an image of your food, and we'll identify the items and estimate calories
            </ThemedText>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => fileInputRef.current?.click()}
            >
              <ThemedText style={styles.uploadButtonText}>📸 Choose Photo</ThemedText>
            </TouchableOpacity>

            {error && <ThemedText style={styles.error}>{error}</ThemedText>}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </>
        )}

        {step === 'analyzing' && (
          <ThemedView style={styles.centerContent}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.analyzingText}>Analyzing your photo...</ThemedText>
          </ThemedView>
        )}

        {step === 'results' && selectedImage && (
          <>
            <ThemedView style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
              />
            </ThemedView>

            <ThemedText type="subtitle" style={styles.resultsTitle}>
              Detected Foods ({selectedFoods.size} selected)
            </ThemedText>

            <FlatList
              scrollEnabled={false}
              data={analyzedFoods}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.foodItem,
                    selectedFoods.has(index) && styles.foodItemSelected,
                  ]}
                  onPress={() => toggleFoodSelection(index)}
                >
                  <ThemedView style={styles.foodItemContent}>
                    <ThemedText style={styles.foodName}>{item.name}</ThemedText>
                    <ThemedText style={styles.foodDetails}>
                      {item.calories} cal • P: {item.protein || 0}g • C: {item.carbs || 0}g • F: {item.fat || 0}g
                    </ThemedText>
                    <ThemedText style={styles.confidence}>
                      Confidence: {item.confidence}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.checkbox}>
                    {selectedFoods.has(index) ? '✓' : '○'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />

            <ThemedView style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep('upload');
                  setSelectedImage(null);
                  setAnalyzedFoods([]);
                }}
              >
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addButton, selectedFoods.size === 0 && styles.addButtonDisabled]}
                onPress={handleAddFoods}
                disabled={selectedFoods.size === 0}
              >
                <ThemedText style={styles.addButtonText}>
                  Add {selectedFoods.size} Item{selectedFoods.size !== 1 ? 's' : ''}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
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
    paddingVertical: Spacing.three,
  },
  title: {
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.four,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  analyzingText: {
    fontSize: 16,
    marginTop: Spacing.three,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    marginBottom: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultsTitle: {
    marginBottom: Spacing.two,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  foodItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  foodDetails: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: Spacing.one,
  },
  confidence: {
    fontSize: 11,
    opacity: 0.5,
    textTransform: 'capitalize',
  },
  checkbox: {
    fontSize: 20,
    marginLeft: Spacing.two,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
