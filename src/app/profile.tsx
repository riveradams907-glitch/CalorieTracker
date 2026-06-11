import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Profile</ThemedText>

          <ThemedView style={styles.profileCard}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <ThemedText type="title">{user?.name}</ThemedText>

            <ThemedText style={[styles.label, { marginTop: Spacing.three }]}>
              Email
            </ThemedText>
            <ThemedText>{user?.email}</ThemedText>
          </ThemedView>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
  content: {
    gap: Spacing.four,
  },
  profileCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
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
