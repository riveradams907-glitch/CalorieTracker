import { StyleSheet, TouchableOpacity, ScrollView, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { FoodService, FoodEntry } from '@/services/food-service';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [todayEntries, setTodayEntries] = useState<FoodEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  useFocusEffect(
    useCallback(() => {
      if (user) {
        const entries = FoodService.getTodayEntries(user.id);
        const calories = FoodService.getTodayCalories(user.id);
        const macrosData = FoodService.getTodayMacros(user.id);

        setTodayEntries(entries);
        setTotalCalories(calories);
        setMacros(macrosData);
      }
    }, [user])
  );

  const remainingCalories = settings.dailyCalorieGoal - totalCalories;
  const caloriePercentage = Math.min((totalCalories / settings.dailyCalorieGoal) * 100, 100);

  const handleDeleteEntry = (entryId: string) => {
    FoodService.deleteEntry(entryId);
    if (user) {
      const entries = FoodService.getTodayEntries(user.id);
      const calories = FoodService.getTodayCalories(user.id);
      const macrosData = FoodService.getTodayMacros(user.id);
      setTodayEntries(entries);
      setTotalCalories(calories);
      setMacros(macrosData);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Today</ThemedText>
            <ThemedText style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</ThemedText>
          </ThemedView>

          {/* Calorie Goal Progress */}
          <ThemedView style={styles.progressCard}>
            <ThemedView style={styles.progressHeader}>
              <ThemedText type="subtitle">{totalCalories}</ThemedText>
              <ThemedText style={styles.goal}>/ {settings.dailyCalorieGoal}</ThemedText>
            </ThemedView>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${caloriePercentage}%` }
                ]}
              />
            </View>

            <ThemedView style={styles.progressFooter}>
              <ThemedText style={styles.progressLabel}>
                {remainingCalories > 0 ? `${remainingCalories} left` : 'Goal reached!'}
              </ThemedText>
              <ThemedText style={styles.progressPercent}>
                {Math.round(caloriePercentage)}%
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Macros */}
          <ThemedView style={styles.macrosGrid}>
            <ThemedView style={styles.macroCard}>
              <ThemedText style={styles.macroLabel}>Protein</ThemedText>
              <ThemedText type="subtitle">{Math.round(macros.protein)}g</ThemedText>
              <ThemedText style={styles.macroGoal}>{settings.proteinGoal}g goal</ThemedText>
            </ThemedView>

            <ThemedView style={styles.macroCard}>
              <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
              <ThemedText type="subtitle">{Math.round(macros.carbs)}g</ThemedText>
              <ThemedText style={styles.macroGoal}>{settings.carbsGoal}g goal</ThemedText>
            </ThemedView>

            <ThemedView style={styles.macroCard}>
              <ThemedText style={styles.macroLabel}>Fat</ThemedText>
              <ThemedText type="subtitle">{Math.round(macros.fat)}g</ThemedText>
              <ThemedText style={styles.macroGoal}>{settings.fatGoal}g goal</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Add Food Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-food')}
          >
            <ThemedText style={styles.addButtonText}>+ Add Food</ThemedText>
          </TouchableOpacity>

          {/* Today's Entries */}
          <ThemedText type="subtitle" style={styles.entriesTitle}>
            Today's Log ({todayEntries.length})
          </ThemedText>

          {todayEntries.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No food logged yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Tap "Add Food" to get started</ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={todayEntries}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ThemedView style={styles.entryItem}>
                  <ThemedView style={styles.entryInfo}>
                    <ThemedText style={styles.entryName}>{item.name}</ThemedText>
                    <ThemedText style={styles.entryTime}>
                      {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.entryCalories}>
                    <ThemedText style={styles.calorieValue}>{item.calories}</ThemedText>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteEntry(item.id)}
                    >
                      <ThemedText style={styles.deleteButtonText}>×</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              )}
            />
          )}
        </ScrollView>
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
    marginBottom: Spacing.four,
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: Spacing.one,
  },
  progressCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.two,
  },
  goal: {
    fontSize: 16,
    opacity: 0.6,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  macroCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  macroGoal: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: Spacing.one,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  entriesTitle: {
    marginBottom: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontWeight: '500',
    marginBottom: Spacing.one,
  },
  entryTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  entryCalories: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  calorieValue: {
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 24,
  },
});
