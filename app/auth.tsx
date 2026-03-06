import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/hooks/useAuth';

type Mode = 'sign_in' | 'sign_up' | 'reset';

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      try {
        await resetPassword(email.trim());
        Alert.alert('Email sent', 'Check your inbox for a password reset link.');
        setMode('sign_in');
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    if (mode === 'sign_up' && password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'sign_up') {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      router.replace('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Authentication failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'reset' ? 'Reset Password' : mode === 'sign_up' ? 'Create Account' : 'Sign In';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.hero}>
            <View style={styles.heroCenter}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.heroIcon}
              />
              <Text style={styles.logoTitle}>MedLit</Text>
              <Text style={styles.logoSubtitle}>Scientific Literature Analyzer</Text>
            </View>
            <Text style={styles.heroTagline}>
              Sign in to sync your analyses and settings across devices.
            </Text>
          </LinearGradient>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />

            {/* Password (hidden for reset) */}
            {mode !== 'reset' ? (
              <>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Colors.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : null}

            {/* Forgot password link */}
            {mode === 'sign_in' ? (
              <TouchableOpacity onPress={() => setMode('reset')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            ) : null}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? [Colors.textTertiary, Colors.textTertiary] : [Colors.accent, Colors.science]}
                style={styles.submitBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={mode === 'reset' ? 'mail-outline' : mode === 'sign_up' ? 'person-add-outline' : 'log-in-outline'}
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.submitBtnText}>{title}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Google sign-in */}
            {mode !== 'reset' ? (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogle}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {/* Mode toggle */}
            <View style={styles.toggleRow}>
              {mode === 'reset' ? (
                <TouchableOpacity onPress={() => setMode('sign_in')}>
                  <Text style={styles.toggleText}>Back to sign in</Text>
                </TouchableOpacity>
              ) : mode === 'sign_in' ? (
                <TouchableOpacity onPress={() => setMode('sign_up')}>
                  <Text style={styles.toggleText}>Don't have an account? <Text style={styles.toggleBold}>Sign up</Text></Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setMode('sign_in')}>
                  <Text style={styles.toggleText}>Already have an account? <Text style={styles.toggleBold}>Sign in</Text></Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Skip button */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.skipText}>Continue without account</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom tab bar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
            <Ionicons name="home-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
            <Ionicons name="time-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.navLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <Ionicons name="person" size={22} color={Colors.accent} />
            <Text style={[styles.navLabel, { color: Colors.accent }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: 40 },

  hero: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 32,
    gap: 14,
  },
  heroCenter: {
    alignItems: 'center',
    gap: 8,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    marginBottom: 4,
  },
  logoTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    textAlign: 'center',
  },

  card: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 4,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'right',
  },

  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 13,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  toggleRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  toggleBold: {
    fontWeight: '700',
    color: Colors.accent,
  },

  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

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
