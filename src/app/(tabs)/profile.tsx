import { StyleSheet, TouchableOpacity, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useStats } from '@/context/stats-context';
import { StatsCalculator } from '@/services/stats-calculator';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { stats, goals, updateStats } = useStats();
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [age, setAge] = useState(stats?.age.toString() || '30');
  const [height, setHeight] = useState(stats?.height.toString() || '170');
  const [weight, setWeight] = useState(stats?.weight.toString() || '70');
  const [gender, setGender] = useState(stats?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState(stats?.activityLevel || 'moderate');
  const [goal, setGoal] = useState(stats?.goal || 'maintain');

  const handleSaveStats = () => {
    const newStats = {
      age: parseInt(age, 10) || 30,
      height: parseInt(height, 10) || 170,
      weight: parseInt(weight, 10) || 70,
      gender: gender as 'male' | 'female',
      activityLevel: activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
      goal: goal as 'lose' | 'maintain' | 'gain',
    };

    updateStats(newStats);

    // Auto-update settings based on calculated goals
    if (goals) {
      updateSettings({
        dailyCalorieGoal: goals.dailyCalories,
        proteinGoal: goals.proteinGrams,
        carbsGoal: goals.carbsGrams,
        fatGoal: goals.fatGrams,
      });
    }

    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>

          {/* User Info Card */}
          <ThemedView style={styles.card}>
            <ThemedView style={styles.cardHeader}>
              <ThemedText type="subtitle">Account</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <ThemedText style={styles.value}>{user?.name}</ThemedText>
            </ThemedView>

            <View style={styles.divider} />

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedText style={styles.value}>{user?.email}</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Body Stats Card */}
          <ThemedView style={styles.card}>
            <ThemedView style={styles.cardHeader}>
              <ThemedText type="subtitle">Body Stats</ThemedText>
              <TouchableOpacity onPress={() => isEditing ? handleSaveStats() : setIsEditing(true)}>
                <ThemedText style={styles.editButton}>
                  {isEditing ? '✓ Save' : '✎ Edit'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {isEditing ? (
              <ThemedView style={styles.formGroup}>
                {/* Age */}
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Age (years)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholder="30"
                  />
                </ThemedView>

                {/* Height */}
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Height (cm)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="number-pad"
                    placeholder="170"
                  />
                </ThemedView>

                {/* Weight */}
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Weight (kg)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="70"
                  />
                </ThemedView>

                {/* Gender */}
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Gender</ThemedText>
                  <View style={styles.genderButtons}>
                    <TouchableOpacity
                      style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                      onPress={() => setGender('male')}
                    >
                      <ThemedText style={styles.genderButtonText}>👨 Male</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                      onPress={() => setGender('female')}
                    >
                      <ThemedText style={styles.genderButtonText}>👩 Female</ThemedText>
                    </TouchableOpacity>
                  </View>
                </ThemedView>

                {/* Activity Level */}
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Activity Level</ThemedText>
                  <View style={styles.options}>
                    {['sedentary', 'light', 'moderate', 'active', 'veryActive'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.optionButton,
                          activityLevel === level && styles.optionButtonActive,
                        ]}
                        onPress={() => setActivityLevel(level as any)}
                      >
                        <ThemedText style={styles.optionText}>
                          {level === 'sedentary' && 'Sedentary'}
                          {level === 'light' && 'Light'}
                          {level === 'moderate' && 'Moderate'}
                          {level === 'active' && 'Active'}
                          {level === 'veryActive' && 'Very Active'}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ThemedView>

                {/* Goal */}
                <ThemedView style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Goal</ThemedText>
                  <View style={styles.goalButtons}>
                    {[
                      { key: 'lose', label: '⬇️ Lose' },
                      { key: 'maintain', label: '➡️ Maintain' },
                      { key: 'gain', label: '⬆️ Gain' },
                    ].map(({ key, label }) => (
                      <TouchableOpacity
                        key={key}
                        style={[styles.goalButton, goal === key && styles.goalButtonActive]}
                        onPress={() => setGoal(key as any)}
                      >
                        <ThemedText style={styles.goalButtonText}>{label}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ThemedView>
              </ThemedView>
            ) : (
              <ThemedView style={styles.statsDisplay}>
                <ThemedView style={styles.statRow}>
                  <ThemedText style={styles.label}>Age</ThemedText>
                  <ThemedText style={styles.value}>{stats?.age} years</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statRow}>
                  <ThemedText style={styles.label}>Height</ThemedText>
                  <ThemedText style={styles.value}>{stats?.height} cm</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statRow}>
                  <ThemedText style={styles.label}>Weight</ThemedText>
                  <ThemedText style={styles.value}>{stats?.weight} kg</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statRow}>
                  <ThemedText style={styles.label}>Gender</ThemedText>
                  <ThemedText style={styles.value}>{stats?.gender === 'male' ? 'Male' : 'Female'}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statRow}>
                  <ThemedText style={styles.label}>Activity</ThemedText>
                  <ThemedText style={styles.value}>{StatsCalculator.getActivityDescription(stats?.activityLevel || '')}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statRow}>
                  <ThemedText style={styles.label}>Goal</ThemedText>
                  <ThemedText style={styles.value}>{StatsCalculator.getGoalDescription(stats?.goal || '')}</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>

          {/* Calculated Goals Card */}
          {!isEditing && goals && (
            <ThemedView style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardTitle}>📊 Calculated Goals</ThemedText>

              <ThemedView style={styles.goalsGrid}>
                <ThemedView style={styles.goalBox}>
                  <ThemedText style={styles.goalLabel}>BMR</ThemedText>
                  <ThemedText style={styles.goalValue}>{goals.bmr}</ThemedText>
                  <ThemedText style={styles.goalUnit}>cal/day</ThemedText>
                </ThemedView>

                <ThemedView style={styles.goalBox}>
                  <ThemedText style={styles.goalLabel}>TDEE</ThemedText>
                  <ThemedText style={styles.goalValue}>{goals.tdee}</ThemedText>
                  <ThemedText style={styles.goalUnit}>cal/day</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.goalBox, styles.highlightBox]}>
                  <ThemedText style={styles.goalLabel}>Daily Target</ThemedText>
                  <ThemedText style={styles.goalValueHighlight}>{goals.dailyCalories}</ThemedText>
                  <ThemedText style={styles.goalUnit}>calories</ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedText style={styles.macroLabel}>Recommended Macros</ThemedText>
              <ThemedView style={styles.macroBoxes}>
                <ThemedView style={styles.macroBox}>
                  <ThemedText style={styles.macroValue}>{goals.proteinGrams}g</ThemedText>
                  <ThemedText style={styles.macroName}>Protein</ThemedText>
                </ThemedView>
                <ThemedView style={styles.macroBox}>
                  <ThemedText style={styles.macroValue}>{goals.carbsGrams}g</ThemedText>
                  <ThemedText style={styles.macroName}>Carbs</ThemedText>
                </ThemedView>
                <ThemedView style={styles.macroBox}>
                  <ThemedText style={styles.macroValue}>{goals.fatGrams}g</ThemedText>
                  <ThemedText style={styles.macroName}>Fat</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          )}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
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
    paddingVertical: Spacing.three,
  },
  title: {
    marginBottom: Spacing.four,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  cardTitle: {
    marginBottom: Spacing.three,
  },
  editButton: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    gap: Spacing.one,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '600',
  },
  value: {
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: Spacing.three,
  },
  formGroup: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  genderButtonText: {
    fontWeight: '500',
  },
  options: {
    flexDirection: 'row',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalButtons: {
    gap: Spacing.two,
  },
  goalButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  goalButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  goalButtonText: {
    fontWeight: '500',
  },
  statsDisplay: {
    gap: Spacing.one,
  },
  goalsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  goalBox: {
    flex: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: Spacing.two,
    padding: Spacing.two,
    alignItems: 'center',
  },
  highlightBox: {
    backgroundColor: '#667eea',
  },
  goalLabel: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  goalValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: Spacing.one,
  },
  goalValueHighlight: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: Spacing.one,
    color: '#fff',
  },
  goalUnit: {
    fontSize: 10,
    opacity: 0.6,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  macroBoxes: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: Spacing.two,
    padding: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
  },
  macroName: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: Spacing.one,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
