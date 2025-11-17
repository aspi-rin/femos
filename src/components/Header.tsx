import { useContext } from "react";
import { Button } from "@heroui/react";
import { Moon, Sun, Monitor, LogIn, LogOut, Book } from "lucide-react";
import { ThemeContext } from "../theme/ThemeProvider";

export function Header({ onLoginClick, onLogout, isAuthenticated, onBooksClick }: {
  onLoginClick: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  onBooksClick: () => void;
}) {
  const { themePref, setThemePref } = useContext(ThemeContext);

  const cycleTheme = () => {
    const order = ["system", "dark", "light"] as const;
    const idx = order.indexOf(themePref as any);
    const next = order[(idx + 1) % order.length];
    setThemePref(next);
  };

  const ThemeIcon = () => {
    if (themePref === "dark") return <Moon size={20} />;
    if (themePref === "light") return <Sun size={20} />;
    return <Monitor size={20} />;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 relative z-10">
      <div className="text-xl font-semibold">Femos 书摘分享</div>
      <div className="flex items-center gap-2">
        <Button isIconOnly aria-label="我的书库" variant="flat" onPress={onBooksClick}>
          <Book size={20} />
        </Button>
        <Button isIconOnly aria-label="主题切换" variant="flat" onPress={cycleTheme}>
          <ThemeIcon />
        </Button>
        {isAuthenticated ? (
          <Button isIconOnly aria-label="退出登录" color="danger" onPress={onLogout}>
            <LogOut size={20} />
          </Button>
        ) : (
          <Button isIconOnly aria-label="登录" color="primary" onPress={onLoginClick}>
            <LogIn size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
