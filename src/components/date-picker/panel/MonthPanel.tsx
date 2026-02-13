import { getYear } from "date-fns";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { useDatePickerContext } from "../datePickerContext";
import { PanelHeader } from "./PanelHeader";

export function MonthPanel() {
  const {
    panelDate,
    monthCells,
    goToPrevYear,
    goToNextYear,
    switchToYearPanel,
    onMonthSelect,
  } = useDatePickerContext();

  const year = getYear(panelDate);

  return (
    <View className="w-full">
      <PanelHeader
        title={`${year}年`}
        onTitlePress={switchToYearPanel}
        onPrevYear={goToPrevYear}
        onNextYear={goToNextYear}
      />
      <View className="px-3 py-1.5">
        <View className="flex-row flex-wrap">
          {monthCells.map((cell) => (
            <View key={cell.text} className="w-1/3 p-1">
              <Pressable
                className={`h-14 items-center justify-center rounded-md active:bg-background-100 ${
                  cell.isSelected ? "bg-primary-50" : "bg-transparent"
                } ${cell.disabled ? "opacity-30" : ""}`}
                onPress={() => onMonthSelect(cell.value)}
                disabled={cell.disabled}
                accessibilityRole="button"
                accessibilityLabel={`选择${cell.text}`}
              >
                <Text
                  className={
                    cell.isSelected
                      ? "text-xl font-semibold text-primary-700"
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
