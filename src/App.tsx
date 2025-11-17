import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LoginDialog } from "./components/LoginDialog";
import { RandomMemo } from "./components/RandomMemo";
import { FAB } from "./components/FAB";
import { AddMemosDialog } from "./components/AddMemosDialog";
import { ResetPasswordDialog } from "./components/ResetPasswordDialog";
import { supabase } from "./lib/supabaseClient";
import { AppThemeProvider } from "./theme/ThemeProvider";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reloadSignal, setReloadSignal] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const initialSession = result.data?.session;
      if (initialSession) {
        setSession(initialSession);
      } else {
        setSession(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // 确保正确处理不同的事件类型
      if (session) {
        setSession(session);
      } else if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED' && !session) {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 检查URL中是否有重置密码的token
  useEffect(() => {
    // 检查查询参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchType = urlParams.get('type');
    const searchToken = urlParams.get('token');
    const searchError = urlParams.get('error');
    const searchErrorDescription = urlParams.get('error_description');

    // 检查hash片段（#后面的部分）
    const hash = window.location.hash.substring(1); // 移除#
    const hashParams = new URLSearchParams(hash);
    const hashError = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');
    const hashType = hashParams.get('type');
    const hashAccessToken = hashParams.get('access_token');

    console.log('URL参数检查:', { 
      search: window.location.search, 
      hash: window.location.hash,
      searchType, 
      searchToken, 
      searchError, 
      searchErrorDescription,
      hashError,
      hashErrorCode,
      hashErrorDescription,
      hashType,
      hashAccessToken
    });

    // 优先处理hash中的错误（Supabase通常把错误放在hash中）
    if (hashError || hashErrorCode) {
      console.log('检测到hash错误:', hashError, hashErrorCode, hashErrorDescription);
      let errorMsg = '密码重置失败: ';
      if (hashErrorCode === 'otp_expired') {
        errorMsg += '链接已过期，请重新申请';
      } else if (hashErrorDescription) {
        errorMsg += hashErrorDescription;
      } else {
        errorMsg += hashError || '未知错误';
      }
      setToast(errorMsg);
      // 清除URL中的错误参数
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // 处理查询参数中的错误
    if (searchError) {
      console.log('检测到查询参数错误:', searchError, searchErrorDescription);
      setToast(`密码重置失败: ${searchErrorDescription || searchError}`);
      // 清除URL中的错误参数
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // 处理hash中的成功状态（包含access_token和type=recovery）
    if (hashType === 'recovery' && hashAccessToken) {
      console.log('检测到hash中的密码重置成功状态，显示重置密码界面');
      setShowResetPassword(true);
      // 清除URL参数，避免重复触发
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // 处理查询参数中的密码重置token
    if (searchType === 'recovery' && searchToken) {
      console.log('检测到查询参数中的密码重置token，显示重置密码界面');
      setShowResetPassword(true);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key === " " || key === "Spacebar" || e.code === "Space") {
        if (e.repeat) return;
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        const editable = !!target?.isContentEditable;
        const inForm = editable || tag === "input" || tag === "textarea" || tag === "select";
        if (inForm) return;
        if (loginOpen || addOpen || showResetPassword) return;
        e.preventDefault();
        setReloadSignal((n) => n + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loginOpen, addOpen, showResetPassword]);


  const isAuthenticated = useMemo(() => {
    return !!session && !!session.user;
  }, [session]);
  
  const isAdmin = useMemo(() => {
    return session?.user?.email === "rin@rin.name";
  }, [session]);

  const logout = async () => {
    await supabase.auth.signOut();
  };


  // 渲染主应用界面
  const renderMainApp = () => (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setLoginOpen(true)} onLogout={logout} isAuthenticated={isAuthenticated} />
      <div className="flex-1 flex items-center justify-center">
        <RandomMemo reloadSignal={reloadSignal} />
      </div>
      <FAB visible={isAuthenticated} onClick={() => setAddOpen(true)} />
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
      <ResetPasswordDialog
        open={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onSuccess={() => setToast("密码重置成功")}
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

  return (
    <AppThemeProvider>
      {renderMainApp()}
    </AppThemeProvider>
  );
}
