import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(settings.dailyCalorieGoal.toString());
  const [proteinGoal, setProteinGoal] = useState(settings.proteinGoal.toString());
  const [carbsGoal, setCarbsGoal] = useState(settings.carbsGoal.toString());
  const [fatGoal, setFatGoal] = useState(settings.fatGoal.toString());

  const handleSaveSettings = () => {
    updateSettings({
      dailyCalorieGoal: parseInt(calorieGoal, 10) || settings.dailyCalorieGoal,
      proteinGoal: parseInt(proteinGoal, 10) || settings.proteinGoal,
      carbsGoal: parseInt(carbsGoal, 10) || settings.carbsGoal,
      fatGoal: parseInt(fatGoal, 10) || settings.fatGoal,
    });
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
          <ThemedView style={styles.header}>
            <ThemedText type="title">Profile</ThemedText>
          </ThemedView>

          {/* User Info */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>
            <ThemedView style={styles.profileCard}>
              <ThemedView style={styles.profileRow}>
                <ThemedText style={styles.label}>Name</ThemedText>
                <ThemedText type="title">{user?.name}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.divider} />

              <ThemedView style={styles.profileRow}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <ThemedText>{user?.email}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Daily Goals */}
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Daily Goals</ThemedText>
              <TouchableOpacity onPress={() => isEditing ? handleSaveSettings() : setIsEditing(true)}>
                <ThemedText style={styles.editButton}>
                  {isEditing ? 'Save' : 'Edit'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {isEditing ? (
              <ThemedView style={styles.goalsForm}>
                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>Daily Calorie Goal</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={calorieGoal}
                    onChangeText={setCalorieGoal}
                    keyboardType="number-pad"
                  />
                </ThemedView>

                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>Protein Goal (g)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={proteinGoal}
                    onChangeText={setProteinGoal}
                    keyboardType="number-pad"
                  />
                </ThemedView>

                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>Carbs Goal (g)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={carbsGoal}
                    onChangeText={setCarbsGoal}
                    keyboardType="number-pad"
                  />
                </ThemedView>

                <ThemedView style={styles.formGroup}>
                  <ThemedText style={styles.label}>Fat Goal (g)</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={fatGoal}
                    onChangeText={setFatGoal}
                    keyboardType="number-pad"
                  />
                </ThemedView>
              </ThemedView>
            ) : (
              <ThemedView style={styles.goalsDisplay}>
                <ThemedView style={styles.goalItem}>
                  <ThemedText style={styles.goalLabel}>Calories</ThemedText>
                  <ThemedText type="subtitle">{settings.dailyCalorieGoal}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.goalItem}>
                  <ThemedText style={styles.goalLabel}>Protein</ThemedText>
                  <ThemedText type="subtitle">{settings.proteinGoal}g</ThemedText>
                </ThemedView>

                <ThemedView style={styles.goalItem}>
                  <ThemedText style={styles.goalLabel}>Carbs</ThemedText>
                  <ThemedText type="subtitle">{settings.carbsGoal}g</ThemedText>
                </ThemedView>

                <ThemedView style={styles.goalItem}>
                  <ThemedText style={styles.goalLabel}>Fat</ThemedText>
                  <ThemedText type="subtitle">{settings.fatGoal}g</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>

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
    paddingVertical: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  editButton: {
    color: '#007AFF',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  profileRow: {
    gap: Spacing.one,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: Spacing.three,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  goalsForm: {
    gap: Spacing.three,
  },
  goalsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  formGroup: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  goalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  goalLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
