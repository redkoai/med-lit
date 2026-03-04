import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { FetchState } from '../types';

interface Props {
  state: FetchState;
}

const STEPS = [
  { key: 'parsing_url', icon: 'link-outline', label: 'Parsing URL' },
  { key: 'fetching_article', icon: 'cloud-download-outline', label: 'Fetching article' },
  { key: 'analyzing', icon: 'sparkles-outline', label: 'AI analysis' },
  { key: 'done', icon: 'checkmark-circle-outline', label: 'Complete' },
];

function PulsingDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color, opacity: anim }]}
    />
  );
}

export function LoadingState({ state }: Props) {
  if (state.status === 'idle') return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === state.status);

  return (
    <View style={styles.container}>
      {/* Pulsing icon */}
      <View style={styles.iconWrap}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons
              name={state.status === 'analyzing' ? 'sparkles' : 'document-text-outline'}
              size={32}
              color={Colors.accent}
            />
          </View>
        </View>
        {state.status !== 'done' && state.status !== 'error' ? (
          <View style={styles.dotRow}>
            {[0, 1, 2].map((i) => (
              <PulsingDot key={i} color={Colors.accent} />
            ))}
          </View>
        ) : null}
      </View>

      {/* Message */}
      <Text style={styles.message}>{state.message}</Text>

      {/* Step indicator */}
      <View style={styles.steps}>
        {STEPS.slice(0, 3).map((step, i) => {
          const isActive = step.key === state.status;
          const isDone = currentStepIndex > i;
          return (
            <View key={step.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isDone && styles.stepDone,
                  isActive && styles.stepActive,
                ]}
              >
                <Ionicons
                  name={isDone ? 'checkmark' : (step.icon as keyof typeof Ionicons.glyphMap)}
                  size={12}
                  color={isDone || isActive ? '#fff' : Colors.textTertiary}
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isDone || isActive) && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
              {i < 2 ? <View style={[styles.stepLine, isDone && styles.stepLineDone]} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  iconWrap: {
    alignItems: 'center',
    gap: 12,
  },
  iconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  stepLine: {
    width: 20,
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: Colors.success,
  },
});
