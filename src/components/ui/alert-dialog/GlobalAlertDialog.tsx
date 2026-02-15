import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/src/components/ui/alert-dialog";
import { Button, ButtonText } from "@/src/components/ui/button";
import {
  type AppAlertAction,
  useAlertDialogStore,
} from "@/src/stores/alertDialogStore";
import { Text } from "react-native";

function getButtonProps(action: AppAlertAction) {
  if (action.style === "destructive") {
    return { action: "negative" as const, variant: "solid" as const };
  }
  if (action.style === "cancel") {
    return { action: "secondary" as const, variant: "outline" as const };
  }
  return { action: "primary" as const, variant: "solid" as const };
}

export function GlobalAlertDialog() {
  const isOpen = useAlertDialogStore((s) => s.isOpen);
  const title = useAlertDialogStore((s) => s.title);
  const message = useAlertDialogStore((s) => s.message);
  const actions = useAlertDialogStore((s) => s.actions);
  const close = useAlertDialogStore((s) => s.close);

  return (
    <AlertDialog isOpen={isOpen} onClose={close}>
      <AlertDialogBackdrop />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <Text className="text-base font-semibold text-typography-900">
            {title}
          </Text>
        </AlertDialogHeader>

        {message ? (
          <AlertDialogBody className="mt-3">
            <Text className="text-sm text-typography-700">{message}</Text>
          </AlertDialogBody>
        ) : null}

        <AlertDialogFooter className="mt-5">
          {actions.map((action, index) => {
            const buttonProps = getButtonProps(action);
            return (
              <Button
                key={`${action.text}-${index}`}
                {...buttonProps}
                size="sm"
                onPress={() => {
                  close();
                  action.onPress?.();
                }}
              >
                <ButtonText>{action.text}</ButtonText>
              </Button>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
