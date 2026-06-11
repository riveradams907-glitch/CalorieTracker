import { StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { FoodService, FoodEntry } from '@/services/food-service';
import { Spacing } from '@/constants/theme';

interface DayStats {
  date: string;
  calories: number;
  entries: number;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [weeklyStats, setWeeklyStats] = useState<DayStats[]>([]);
  const [allEntries, setAllEntries] = useState<FoodEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      // Get last 7 days stats
      const stats: DayStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const entries = FoodService.getEntriesByDate(user.id, date);
        const calories = entries.reduce((sum, e) => sum + e.calories, 0);

        stats.push({
          date: dateStr,
          calories,
          entries: entries.length,
        });
      }

      // Get all entries sorted by date
      const allEntries = FoodService.getAllEntries(user.id);

      setWeeklyStats(stats);
      setAllEntries(allEntries);
    }, [user])
  );

  const avgCalories = weeklyStats.length > 0
    ? Math.round(weeklyStats.reduce((sum, day) => sum + day.calories, 0) / weeklyStats.length)
    : 0;

  const totalEntries = weeklyStats.reduce((sum, day) => sum + day.entries, 0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            History & Stats
          </ThemedText>

          {/* Weekly Summary */}
          <ThemedView style={styles.summaryCard}>
            <ThemedText type="subtitle" style={styles.summaryTitle}>This Week</ThemedText>

            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statBox}>
                <ThemedText style={styles.statLabel}>Avg Calories</ThemedText>
                <ThemedText type="title">{avgCalories}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.statBox}>
                <ThemedText style={styles.statLabel}>Total Entries</ThemedText>
                <ThemedText type="title">{totalEntries}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.statBox}>
                <ThemedText style={styles.statLabel}>Daily Goal</ThemedText>
                <ThemedText type="title">{settings.dailyCalorieGoal}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Daily Chart */}
          <ThemedView style={styles.chartCard}>
            <ThemedText type="subtitle" style={styles.chartTitle}>Last 7 Days</ThemedText>

            <ThemedView style={styles.chartContainer}>
              {weeklyStats.map((day, index) => {
                const heightPercent = Math.min((day.calories / settings.dailyCalorieGoal) * 100, 100);
                const isMetGoal = day.calories >= settings.dailyCalorieGoal;

                return (
                  <ThemedView key={index} style={styles.barWrapper}>
                    <ThemedView style={styles.bar}>
                      <ThemedView
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: isMetGoal ? '#34C759' : '#007AFF',
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText style={styles.barLabel}>{day.date.split(' ')[0]}</ThemedText>
                    <ThemedText style={styles.barValue}>{day.calories}</ThemedText>
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ThemedView>

          {/* All Entries */}
          <ThemedText type="subtitle" style={styles.entriesTitle}>
            All Entries ({allEntries.length})
          </ThemedText>

          {allEntries.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No entries logged yet</ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={allEntries.slice(0, 20)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const date = new Date(item.timestamp);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <ThemedView style={styles.entryItem}>
                    <ThemedView style={styles.entryMeta}>
                      <ThemedText style={styles.entryDate}>{dateStr}</ThemedText>
                      <ThemedText style={styles.entryTime}>{timeStr}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.entryDetails}>
                      <ThemedText style={styles.entryName}>{item.name}</ThemedText>
                      {item.protein || item.carbs || item.fat ? (
                        <ThemedText style={styles.entryMacros}>
                          P: {Math.round(item.protein || 0)}g | C: {Math.round(item.carbs || 0)}g | F: {Math.round(item.fat || 0)}g
                        </ThemedText>
                      ) : null}
                    </ThemedView>
                    <ThemedText style={styles.entryCalories}>{item.calories}</ThemedText>
                  </ThemedView>
                );
              }}
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
  title: {
    marginBottom: Spacing.four,
  },
  summaryCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
  },
  summaryTitle: {
    marginBottom: Spacing.three,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  chartCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
  },
  chartTitle: {
    marginBottom: Spacing.three,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    height: 200,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  bar: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: Spacing.one,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
  },
  barLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  entriesTitle: {
    marginBottom: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  entryItem: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  entryMeta: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryTime: {
    fontSize: 10,
    opacity: 0.6,
  },
  entryDetails: {
    flex: 1,
  },
  entryName: {
    fontWeight: '500',
    marginBottom: Spacing.one,
  },
  entryMacros: {
    fontSize: 11,
    opacity: 0.6,
  },
  entryCalories: {
    fontWeight: '600',
    fontSize: 14,
    minWidth: 45,
    textAlign: 'right',
  },
});
