import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, getScoreColor } from '../src/constants/colors';
import { useAuth } from '../src/hooks/useAuth';
import { useHistory } from '../src/hooks/useHistory';
import { useBadges } from '../src/hooks/useBadges';

export default function ProfileScreen() {
  const { user, signOut, deleteAccount } = useAuth();
  const uid = user?.uid ?? null;
  const { history, clearHistory } = useHistory(uid);
  const { badges, earned, total } = useBadges(history);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="person-outline" size={48} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>Not signed in</Text>
          <Text style={styles.emptyBody}>
            Sign in to track your progress, earn badges, and sync across devices.
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/auth')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.science]}
              style={styles.signInBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.signInBtnText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <NavBar active="profile" user={user} />
      </SafeAreaView>
    );
  }

  // Compute stats
  const totalAnalyses = history.length;
  const avgAccuracy = totalAnalyses > 0
    ? (history.reduce((s, h) => s + h.accuracyScore, 0) / totalAnalyses).toFixed(1)
    : '—';
  const avgBias = totalAnalyses > 0
    ? (history.reduce((s, h) => s + h.biasScore, 0) / totalAnalyses).toFixed(1)
    : '—';
  const trustworthyCount = history.filter((h) => h.trustworthy).length;
  const isGoogleUser = user.providerData?.[0]?.providerId === 'google.com';
  const memberSince = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount(isGoogleUser ? undefined : deletePassword || undefined);
      setDeleteModalVisible(false);
      Alert.alert('Account Deleted', 'Your account and all data have been permanently removed.');
      router.replace('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete account.';
      Alert.alert('Error', msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleShareProfile = async () => {
    const text = [
      `My MedLit Stats`,
      `Papers analyzed: ${totalAnalyses}`,
      `Avg accuracy found: ${avgAccuracy}/10`,
      `Badges earned: ${earned}/${total}`,
      ``,
      `Analyze scientific papers with MedLit!`,
    ].join('\n');
    await Share.share({ message: text });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleShareProfile} style={styles.headerBtn}>
          <Ionicons name="share-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            {user.photoURL ? (
              <Text style={styles.avatarText}>{(user.displayName || user.email || '?')[0].toUpperCase()}</Text>
            ) : (
              <Text style={styles.avatarText}>{(user.displayName || user.email || '?')[0].toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.profileName}>
            {user.displayName || 'MedLit User'}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.providerBadge}>
            <Ionicons
              name={isGoogleUser ? 'logo-google' : 'mail-outline'}
              size={12}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.providerText}>
              {isGoogleUser ? 'Google' : 'Email'} {memberSince ? `· Since ${memberSince}` : ''}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalAnalyses}</Text>
            <Text style={styles.statLabel}>Papers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.accent }]}>{avgAccuracy}</Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.science }]}>{avgBias}</Text>
            <Text style={styles.statLabel}>Avg Bias-Free</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{trustworthyCount}</Text>
            <Text style={styles.statLabel}>Trustworthy</Text>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={18} color={Colors.science} />
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>{earned}/{total}</Text>
          </View>
        </View>

        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <View
              key={badge.id}
              style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}
            >
              <View style={[styles.badgeIconCircle, { backgroundColor: badge.earned ? badge.color + '20' : Colors.borderLight }]}>
                <Ionicons
                  name={badge.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={badge.earned ? badge.color : Colors.textTertiary}
                />
              </View>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>
                {badge.description}
              </Text>
              {!badge.earned && (
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${badge.progress * 100}%`, backgroundColor: badge.color }]} />
                </View>
              )}
              {badge.earned && (
                <View style={[styles.earnedBadge, { backgroundColor: badge.color + '20' }]}>
                  <Ionicons name="checkmark-circle" size={12} color={badge.color} />
                  <Text style={[styles.earnedText, { color: badge.color }]}>Earned</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Ionicons name="apps-outline" size={18} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/history')} activeOpacity={0.6}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.accentLight }]}>
              <Ionicons name="time-outline" size={18} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>View History</Text>
              <Text style={styles.actionDesc}>{totalAnalyses} analyses saved</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/settings')} activeOpacity={0.6}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.scienceLight }]}>
              <Ionicons name="settings-outline" size={18} color={Colors.science} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionDesc}>API keys, model, preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleShareProfile} activeOpacity={0.6}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="share-social-outline" size={18} color={Colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Share Stats</Text>
              <Text style={styles.actionDesc}>Show off your research habits</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={Colors.accent} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'This will permanently delete your account, all analyses, and all data. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Continue',
                  style: 'destructive',
                  onPress: () => {
                    setDeletePassword('');
                    setDeleteModalVisible(true);
                  },
                },
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          <Text style={styles.dangerBtnText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconCircle, { backgroundColor: Colors.dangerLight }]}>
                <Ionicons name="warning" size={24} color={Colors.danger} />
              </View>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalSubtitle}>
                This action is permanent and cannot be undone. All your data will be erased.
              </Text>
            </View>

            {!isGoogleUser && (
              <>
                <Text style={styles.modalLabel}>Confirm your password</Text>
                <TextInput
                  style={styles.modalInput}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.confirmDeleteBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color="#fff" />
                  <Text style={styles.confirmDeleteText}>Permanently Delete</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelDeleteBtn}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.cancelDeleteText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <NavBar active="profile" user={user} />
    </SafeAreaView>
  );
}

function NavBar({ active, user }: { active: string; user: unknown }) {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
        <Ionicons name={active === 'home' ? 'home' : 'home-outline'} size={22} color={active === 'home' ? Colors.accent : Colors.textSecondary} />
        <Text style={[styles.navLabel, active === 'home' && { color: Colors.accent }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
        <Ionicons name={active === 'history' ? 'time' : 'time-outline'} size={22} color={active === 'history' ? Colors.accent : Colors.textSecondary} />
        <Text style={[styles.navLabel, active === 'history' && { color: Colors.accent }]}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
        <Ionicons name={active === 'settings' ? 'settings' : 'settings-outline'} size={22} color={active === 'settings' ? Colors.accent : Colors.textSecondary} />
        <Text style={[styles.navLabel, active === 'settings' && { color: Colors.accent }]}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => { if (!user) router.push('/auth'); }}>
        <Ionicons name="person" size={22} color={Colors.science} />
        <Text style={[styles.navLabel, { color: Colors.science }]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 10,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  signInBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Profile card
  profileCard: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  providerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeCount: {
    backgroundColor: Colors.scienceLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.science,
  },

  // Badges grid
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  badgeCard: {
    width: '47%' as unknown as number,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeCardLocked: {
    opacity: 0.65,
  },
  badgeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeNameLocked: {
    color: Colors.textSecondary,
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  earnedText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Actions card
  actionsCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 1,
  },
  actionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },

  // Account buttons
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },

  // Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  confirmDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.danger,
    paddingVertical: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cancelDeleteBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 2 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
