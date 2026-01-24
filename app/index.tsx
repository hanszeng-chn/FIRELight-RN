import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

import { useThemeStore, type ThemeMode } from '@/src/stores/themeStore';
import type { AppTheme } from '@/src/theme';
import { spacing } from '@/src/theme';

export default function Index() {
  const theme = useTheme<AppTheme>();
  const { mode, setMode } = useThemeStore();

  const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            FIRELight
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.textSecondary }}>
            主题配置测试
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonGroup}>
        {themeModes.map((m) => (
          <Button
            key={m}
            mode={mode === m ? 'contained' : 'outlined'}
            onPress={() => setMode(m)}
            style={styles.button}
          >
            {m === 'system' ? '跟随系统' : m === 'light' ? '浅色' : '深色'}
          </Button>
        ))}
      </View>

      <View style={styles.colorDemo}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          颜色预览
        </Text>
        <View style={styles.colorRow}>
          <ColorSwatch color={theme.colors.primary} label="Primary" />
          <ColorSwatch color={theme.colors.secondary} label="Secondary" />
          <ColorSwatch color={theme.colors.success} label="Success" />
          <ColorSwatch color={theme.colors.error} label="Danger" />
          <ColorSwatch color={theme.colors.warning} label="Warning" />
        </View>
      </View>
    </View>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text variant="labelSmall" style={{ color: theme.colors.textSecondary }}>
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
  },
  title: {
    marginBottom: spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  button: {
    minWidth: 90,
  },
  colorDemo: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
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
});
