import { Icon } from "@/src/components/ui/icon";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

type PanelHeaderProps = {
  title: string;
  onTitlePress?: () => void;
  secondaryTitle?: string;
  onSecondaryTitlePress?: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
};

export function PanelHeader({
  title,
  onTitlePress,
  secondaryTitle,
  onSecondaryTitlePress,
  onPrevYear,
  onNextYear,
  onPrevMonth,
  onNextMonth,
}: PanelHeaderProps) {
  return (
    <View className="w-full border-b border-outline-100">
      <View className="h-12 w-full flex-row items-center">
        {/* Left navigation */}
        <Pressable
          className="h-full w-14 items-center justify-center active:bg-background-100"
          onPress={onPrevYear}
          accessibilityRole="button"
          accessibilityLabel="上一年"
        >
          <Icon className="text-typography-500" as={ChevronsLeft} size="lg" />
        </Pressable>

        {onPrevMonth && (
          <Pressable
            className="h-full w-10 items-center justify-center active:bg-background-100"
            onPress={onPrevMonth}
            accessibilityRole="button"
            accessibilityLabel="上一月"
          >
            <Icon className="text-typography-500" as={ChevronLeft} size="lg" />
          </Pressable>
        )}

        {/* Center title */}
        <View className="flex-1 flex-row items-center justify-center gap-1">
          <Pressable
            className="rounded px-1 py-0.5 active:bg-background-100"
            onPress={onTitlePress}
            disabled={!onTitlePress}
            accessibilityRole="button"
          >
            <Text className="text-lg font-semibold text-typography-900">
              {title}
            </Text>
          </Pressable>
          {secondaryTitle && (
            <Pressable
              className="rounded px-1 py-0.5 active:bg-background-100"
              onPress={onSecondaryTitlePress}
              disabled={!onSecondaryTitlePress}
              accessibilityRole="button"
            >
              <Text className="text-lg font-semibold text-typography-900">
                {secondaryTitle}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Right navigation */}
        {onNextMonth && (
          <Pressable
            className="h-full w-10 items-center justify-center active:bg-background-100"
            onPress={onNextMonth}
            accessibilityRole="button"
            accessibilityLabel="下一月"
          >
            <Icon className="text-typography-500" as={ChevronRight} size="lg" />
          </Pressable>
        )}

        <Pressable
          className="h-full w-14 items-center justify-center active:bg-background-100"
          onPress={onNextYear}
          accessibilityRole="button"
          accessibilityLabel="下一年"
        >
          <Icon className="text-typography-500" as={ChevronsRight} size="lg" />
        </Pressable>
      </View>
    </View>
  );
}
