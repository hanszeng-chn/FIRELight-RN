import type { Category } from "@/src/types";
import { Pressable, Text, View } from "react-native";

type CategoryGridProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (category: Category) => void;
};

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <View className="items-center py-16">
        <Text className="text-base text-typography-500">暂无可用分类</Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap px-3 py-4">
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <View key={category.id} className="w-1/4 items-center py-3">
            <Pressable
              onPress={() => onSelect(category)}
              className="items-center"
              accessibilityRole="button"
              accessibilityLabel={category.name}
            >
              <View
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-primary-100 border-2 border-primary-400"
                    : "bg-background-200"
                }`}
              >
                <Text
                  className={`text-lg ${
                    isSelected
                      ? "font-bold text-primary-700"
                      : "text-typography-700"
                  }`}
                >
                  {category.icon}
                </Text>
              </View>
              <Text
                className={`mt-1.5 text-xs ${
                  isSelected
                    ? "font-semibold text-primary-700"
                    : "text-typography-700"
                }`}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
