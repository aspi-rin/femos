import { Button } from "@heroui/react";

export function FAB({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed right-5 bottom-5">
      <Button color="primary" radius="full" onPress={onClick}>+</Button>
    </div>
  );
}
