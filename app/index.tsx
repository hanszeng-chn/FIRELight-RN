import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeStore, type ThemeMode } from '@/src/stores/themeStore';
import { colors, spacing, typography } from '@/src/theme';

export default function Index() {
  const { mode, setMode, isDark } = useThemeStore();

  const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
  const palette = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.card, { backgroundColor: palette.backgroundSecondary }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>FIRELight</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>主题配置测试</Text>
      </View>

      <View style={styles.buttonGroup}>
        {themeModes.map((m) => {
          const isSelected = mode === m;
          const label = m === 'system' ? '跟随系统' : m === 'light' ? '浅色' : '深色';

          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={({ pressed }) => [
                styles.button,
                isSelected
                  ? { backgroundColor: colors.primary }
                  : { borderColor: colors.primary, borderWidth: 1 },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isSelected ? '#FFFFFF' : colors.primary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.colorDemo}>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          颜色预览
        </Text>
        <View style={styles.colorRow}>
          <ColorSwatch color={colors.primary} label="Primary" />
          <ColorSwatch color={colors.secondary} label="Secondary" />
          <ColorSwatch color={colors.success} label="Success" />
          <ColorSwatch color={colors.danger} label="Danger" />
          <ColorSwatch color={colors.warning} label="Warning" />
        </View>
      </View>
    </View>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  const { isDark } = useThemeStore();
  const palette = isDark ? colors.dark : colors.light;

  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text style={[styles.swatchLabel, { color: palette.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing['2xl'],
    padding: spacing.lg,
    borderRadius: 12,
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  button: {
    minWidth: 90,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.footnote,
    fontWeight: '600',
  },
  colorDemo: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.title3,
    marginBottom: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  swatch: {
    alignItems: 'center',
  },
  swatchColor: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  swatchLabel: {
    ...typography.caption1,
  },
});
