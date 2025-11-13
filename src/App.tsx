import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LoginDialog } from "./components/LoginDialog";
import { RandomMemo } from "./components/RandomMemo";
import { FAB } from "./components/FAB";
import { AddMemosDialog } from "./components/AddMemosDialog";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [reloadSignal, setReloadSignal] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from("admins")
        .select("user_email")
        .eq("user_email", session.user.email)
        .limit(1);
      if (error) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data && data.length > 0);
    })();
  }, [session?.user?.email]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;
      if (!isInput && e.code === "Space") {
        e.preventDefault();
        setReloadSignal((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isAuthenticated = useMemo(() => !!session, [session]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setLoginOpen(true)} onLogout={logout} isAuthenticated={isAuthenticated} />
      <div className="flex-1 flex items-center justify-center">
        <RandomMemo reloadSignal={reloadSignal} />
      </div>
      <FAB visible={isAdmin} onClick={() => setAddOpen(true)} />
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      <AddMemosDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(count) => {
          setAddOpen(false);
          setToast(`成功添加 ${count} 条句子`);
          setReloadSignal((n) => n + 1);
        }}
      />
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div className="px-4 py-2 rounded-lg shadow bg-background border text-foreground">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
