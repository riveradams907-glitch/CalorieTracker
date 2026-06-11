import { StyleSheet, TouchableOpacity, ScrollView, FlatList, View, Dimensions, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { FoodService, FoodEntry } from '@/services/food-service';
import { Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

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

  const getMacroPercentage = (value: number, goal: number) => {
    return Math.min((value / goal) * 100, 100);
  };

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Start strong today!';
    if (hour < 17) return '💪 Keep the momentum!';
    return '🌙 Finish the day right!';
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText style={styles.headerTitle}>Food Diary</ThemedText>
            <ThemedText style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</ThemedText>
          </ThemedView>

          {/* Daily Summary Card */}
          <ThemedView style={styles.summaryCard}>
            <ThemedView style={styles.summaryLeft}>
              <ThemedText style={styles.summaryLabel}>Your Calorie Goal</ThemedText>
              <ThemedView style={styles.calorieRow}>
                <ThemedText style={styles.calorieNumber}>{totalCalories}</ThemedText>
                <ThemedText style={styles.calorieDivider}>/</ThemedText>
                <ThemedText style={styles.calorieGoal}>{settings.dailyCalorieGoal}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.remaining}>
                {remainingCalories > 0 ? `${Math.round(remainingCalories)} remaining` : 'Over by ' + Math.abs(Math.round(remainingCalories))}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.summaryRight}>
              <View style={styles.progressCircle}>
                <View style={[styles.progressCircleFill, { width: `${caloriePercentage}%` }]} />
              </View>
            </ThemedView>
          </ThemedView>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${caloriePercentage}%` }]} />
            </View>
          </View>

          {/* Main Calorie Card - Enhanced */}
          <ThemedView style={styles.calorieCard}>
            <ThemedView style={styles.calorieTop}>
              <ThemedView>
                <ThemedText style={styles.calorieLabel}>ENERGY BURNED TODAY</ThemedText>
                <ThemedView style={styles.calorieValues}>
                  <ThemedText style={styles.calorieMain}>{totalCalories}</ThemedText>
                  <ThemedText style={styles.calorieGoal}>/ {settings.dailyCalorieGoal}</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={styles.calorieEmoji}>
                <ThemedText style={styles.emoji}>🔥</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Enhanced Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${caloriePercentage}%` }]} />
            </View>

            {/* Remaining Calories */}
            <ThemedView style={styles.calorieFooter}>
              <ThemedText style={styles.remaining}>
                {remainingCalories > 0 ? `${Math.round(remainingCalories)} left to crush` : '✓ Goal achieved!'}
              </ThemedText>
              <ThemedText style={styles.percentage}>{Math.round(caloriePercentage)}%</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Macronutrients Grid */}
          <ThemedText style={styles.sectionTitle}>Macronutrients</ThemedText>
          <ThemedView style={styles.macroGrid}>
            <MacroGridCard
              label="Protein"
              value={Math.round(macros.protein)}
              goal={settings.proteinGoal}
              color="#E91E63"
            />
            <MacroGridCard
              label="Carbs"
              value={Math.round(macros.carbs)}
              goal={settings.carbsGoal}
              color="#2196F3"
            />
            <MacroGridCard
              label="Fat"
              value={Math.round(macros.fat)}
              goal={settings.fatGoal}
              color="#FF9800"
            />
          </ThemedView>

          {/* Quick Add Buttons */}
          <ThemedView style={styles.quickAddSection}>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => router.push('/(tabs)/add-food')}
            >
              <ThemedText style={styles.quickAddButtonText}>+ Add Food</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAddButton, styles.quickAddButtonSecondary]}
              onPress={() => router.push('/(tabs)/photo')}
            >
              <ThemedText style={styles.quickAddButtonTextSecondary}>📸 Scan Meal</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Food Log Section */}
          <ThemedView style={styles.logSection}>
            <ThemedText style={styles.logSectionTitle}>Food Entries</ThemedText>

            {todayEntries.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={styles.emptyEmoji}>🍽️</ThemedText>
                <ThemedText style={styles.emptyText}>Your plate is empty</ThemedText>
                <ThemedText style={styles.emptySubtext}>Time to fuel your workout!</ThemedText>
              </ThemedView>
            ) : (
              <>
                <FlatList
                  scrollEnabled={false}
                  data={todayEntries}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <ThemedView style={styles.entryItem}>
                      <ThemedView style={styles.entryLeft}>
                        <ThemedView style={styles.entryIcon}>
                          <ThemedText style={styles.entryIconEmoji}>🍜</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.entryDetails}>
                          <ThemedText style={styles.entryName}>{item.name}</ThemedText>
                          <ThemedText style={styles.entryMacros}>
                            P: {Math.round(item.protein || 0)}g • C: {Math.round(item.carbs || 0)}g • F: {Math.round(item.fat || 0)}g
                          </ThemedText>
                          <ThemedText style={styles.entryTime}>
                            {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                      <ThemedView style={styles.entryRight}>
                        <ThemedText style={styles.entryCalories}>{item.calories}</ThemedText>
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
              </>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MacroGridCard({ label, value, goal, color }: any) {
  const percentage = Math.min((value / goal) * 100, 100);

  return (
    <ThemedView style={styles.macroGridCard}>
      <ThemedView style={[styles.macroColorBar, { backgroundColor: color }]} />
      <ThemedText style={styles.macroGridLabel}>{label}</ThemedText>
      <ThemedText style={styles.macroGridValue}>{value}g</ThemedText>
      <ThemedText style={styles.macroGridGoal}>Goal: {goal}g</ThemedText>
      <View style={styles.macroGridProgressBar}>
        <View style={[styles.macroGridProgressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <ThemedText style={styles.macroGridPercent}>{Math.round(percentage)}%</ThemedText>
    </ThemedView>
  );
}

function StatCard({ label, value, goal, emoji, bgColor }: any) {
  const percentage = Math.min((value / goal) * 100, 100);

  return (
    <ThemedView style={[styles.statCard, { backgroundColor: bgColor }]}>
      <ThemedText style={styles.statEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.statValue}>{value}g</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <ThemedView style={styles.statMini}>
        <ThemedText style={styles.statMiniText}>{Math.round(percentage)}%</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

function MacroCard({ label, current, goal, emoji, color }: any) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <ThemedView style={styles.macroCard}>
      <ThemedView style={styles.macroHeader}>
        <ThemedText style={styles.macroEmoji}>{emoji}</ThemedText>
        <ThemedText style={styles.macroLabel}>{label}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.macroValue}>
        <ThemedText style={styles.macroAmount}>{current}g</ThemedText>
        <ThemedText style={styles.macroGoal}>/{goal}g</ThemedText>
      </ThemedView>

      <View style={styles.macroBar}>
        <View
          style={[styles.macroBarFill, { width: `${percentage}%`, backgroundColor: color }]}
        />
      </View>

      <ThemedText style={styles.macroPercent}>{Math.round(percentage)}%</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  header: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: Spacing.half,
  },
  headerDate: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    marginLeft: Spacing.three,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.one,
  },
  calorieNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B35',
  },
  calorieDivider: {
    fontSize: 24,
    color: '#CCCCCC',
    marginHorizontal: Spacing.one,
  },
  calorieGoal: {
    fontSize: 20,
    color: '#999999',
    fontWeight: '600',
  },
  remaining: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressCircleFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#FF6B35',
  },
  progressBarContainer: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  macroGridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  macroColorBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.one,
  },
  macroGridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    marginBottom: Spacing.half,
  },
  macroGridValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  macroGridGoal: {
    fontSize: 11,
    color: '#999999',
    marginBottom: Spacing.one,
  },
  macroGridProgressBar: {
    height: 3,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.one,
  },
  macroGridProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroGridPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  quickAddSection: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickAddButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
  logSection: {
    paddingHorizontal: Spacing.three,
  },
  logSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: Spacing.two,
  },
  heroBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 0,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    minHeight: 200,
    borderWidth: 3,
    borderColor: '#00D4FF',
    backgroundColor: '#0A0E27',
  },
  heroBannerImage: {
    borderRadius: 0,
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 39, 0.75)',
    borderRadius: 0,
  },
  heroContent: {
    flex: 1,
    zIndex: 1,
  },
  heroMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginBottom: Spacing.one,
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.half,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  heroEmoji: {
    marginLeft: Spacing.three,
  },
  heroBigEmoji: {
    fontSize: 48,
  },
  calorieCard: {
    backgroundColor: '#0F1A3D',
    borderRadius: 0,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  calorieTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  calorieLabel: {
    fontSize: 12,
    opacity: 0.8,
    textTransform: 'uppercase',
    color: '#fff',
    fontWeight: '600',
  },
  calorieValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.one,
  },
  calorieMain: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  calorieGoal: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: Spacing.one,
  },
  calorieEmoji: {
    fontSize: 40,
  },
  emoji: {
    fontSize: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  calorieFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remaining: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  percentage: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    borderRadius: 0,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    minHeight: 140,
    borderWidth: 2,
    borderColor: '#0066FF',
    backgroundColor: '#0A0E27',
  },
  statCardImage: {
    borderRadius: 0,
  },
  statCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 39, 0.7)',
    borderRadius: 0,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: Spacing.half,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statMini: {
    marginTop: Spacing.one,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
    zIndex: 2,
  },
  statMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  actionSection: {
    marginBottom: Spacing.four,
  },
  actionSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  macroSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    color: '#00D4FF',
  },
  logSection: {
    marginTop: Spacing.three,
  },
  logSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  macrosGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  macroCard: {
    backgroundColor: '#0F1A3D',
    borderRadius: 0,
    padding: Spacing.three,
    borderWidth: 2,
    borderColor: '#0066FF',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  macroEmoji: {
    fontSize: 24,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  macroValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  macroAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  macroGoal: {
    fontSize: 12,
    opacity: 0.6,
  },
  macroBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.one,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroPercent: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: Spacing.two,
    flexDirection: 'row',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  addFoodButton: {
    backgroundColor: '#0066FF',
  },
  photoButton: {
    backgroundColor: '#00D4FF',
  },
  actionButtonEmoji: {
    fontSize: 24,
    marginTop: Spacing.half,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionButtonSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.half,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
    backgroundColor: '#0F1A3D',
    borderRadius: 0,
    marginVertical: Spacing.four,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0066FF',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D4FF',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  entryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryIconEmoji: {
    fontSize: 24,
  },
  entryDetails: {
    flex: 1,
  },
  entryName: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: Spacing.half,
    color: '#333333',
  },
  entryMacros: {
    fontSize: 11,
    color: '#999999',
    marginBottom: Spacing.half,
  },
  entryTime: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  entryRight: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  entryCalories: {
    fontWeight: '700',
    fontSize: 16,
    color: '#FF6B35',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: Spacing.four,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
  },
});
