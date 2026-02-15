import { Pressable, Text, View } from "react-native";

export type SwitchTabItem<T extends string> = {
  key: T;
  label: string;
};

type SwitchTabsProps<T extends string> = {
  tabs: SwitchTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  variant?: "underline" | "segmented";
};

export function SwitchTabs<T extends string>({
  tabs,
  activeKey,
  onChange,
  variant = "underline",
}: SwitchTabsProps<T>) {
  if (variant === "segmented") {
    return (
      <View className="w-full overflow-hidden rounded-sm border border-outline-300 bg-background-0">
        <View className="flex-row">
          {tabs.map((tab) => {
            const isActive = activeKey === tab.key;
            return (
              <Pressable
                key={tab.key}
                className={`h-7 flex-1 items-center justify-center ${
                  isActive ? "bg-typography-900" : "bg-background-0"
                }`}
                onPress={() => onChange(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <Text
                  className={`text-sm font-medium ${
                    isActive ? "text-typography-0" : "text-typography-900"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View className="w-full flex-row justify-center gap-6">
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        return (
          <Pressable
            key={tab.key}
            className="items-center"
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text
              className={`text-base leading-7 ${
                isActive
                  ? "font-semibold text-typography-900"
                  : "font-medium text-typography-400"
              }`}
            >
              {tab.label}
            </Text>
            <View
              className={`mt-0.5 h-0.5 w-8 rounded-full ${
                isActive ? "bg-primary-600" : "bg-transparent"
              }`}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
