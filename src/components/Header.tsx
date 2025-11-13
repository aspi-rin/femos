import { useContext } from "react";
import { Button } from "@heroui/react";
import { ThemeContext } from "../theme/ThemeProvider";

export function Header({ onLoginClick, onLogout, isAuthenticated }: {
  onLoginClick: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}) {
  const { themePref, setThemePref } = useContext(ThemeContext);

  const cycleTheme = () => {
    const order = ["system", "dark", "light"] as const;
    const idx = order.indexOf(themePref as any);
    const next = order[(idx + 1) % order.length];
    setThemePref(next);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-xl font-semibold">Femos 书摘分享</div>
      <div className="flex items-center gap-2">
        <Button variant="flat" onPress={cycleTheme}>{themePref}</Button>
        {isAuthenticated ? (
          <Button color="danger" onPress={onLogout}>退出登录</Button>
        ) : (
          <Button color="primary" onPress={onLoginClick}>登录</Button>
        )}
      </div>
    </div>
  );
}
