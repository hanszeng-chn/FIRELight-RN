import React from "react";
import { Pressable, Text, View } from "react-native";

import { useDatePickerContext } from "../datePickerContext";
import { PanelHeader } from "./PanelHeader";

export function YearPanel() {
  const {
    yearCells,
    decadeRange,
    goToPrevDecade,
    goToNextDecade,
    onYearSelect,
  } = useDatePickerContext();

  return (
    <View className="w-full">
      <PanelHeader
        title={decadeRange}
        onPrevYear={goToPrevDecade}
        onNextYear={goToNextDecade}
      />
      <View className="px-3 py-1.5">
        <View className="flex-row flex-wrap">
          {yearCells.map((cell) => (
            <View key={cell.value} className="w-1/3 p-1">
              <Pressable
                className={`h-14 items-center justify-center rounded-md active:bg-background-100 ${
                  cell.isSelected ? "bg-primary-50" : "bg-transparent"
                } ${cell.disabled ? "opacity-30" : ""}`}
                onPress={() => onYearSelect(cell.value)}
                disabled={cell.disabled}
                accessibilityRole="button"
                accessibilityLabel={`选择${cell.text}年`}
              >
                <Text
                  className={
                    cell.isSelected
                      ? "text-xl font-semibold text-primary-700"
                      : !cell.isCurDecade
                        ? "text-xl font-medium text-typography-300"
                        : "text-xl font-medium text-typography-900"
                  }
                >
                  {cell.text}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
