import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({ open, onClose, onSuccess }: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    console.log('开始重置密码流程');

    if (newPassword !== confirmPassword) {
      setMessage("密码不一致");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("密码至少需要6位");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      console.log('调用Supabase更新密码...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.log('重置密码失败:', error);
        setMessage("重置密码失败: " + error.message);
      } else {
        console.log('密码重置成功');
        setMessage("密码重置成功！");

        // 清空URL参数，避免重复触发
        window.history.replaceState({}, document.title, window.location.pathname);

        // 3秒后关闭重置密码界面并触发成功回调
        setTimeout(() => {
          onClose();
          setNewPassword("");
          setConfirmPassword("");
          setMessage("");
          setIsLoading(false);
          onSuccess?.();
        }, 3000);
      }
    } catch (error: any) {
      console.log('重置密码异常:', error);
      if (error.message?.includes('Token has expired')) {
        setMessage("密码重置链接已过期，请重新申请");
      } else {
        setMessage("重置密码时发生错误: " + (error.message || '未知错误'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 space-y-4 p-6 bg-background rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold text-center">重置密码</h1>
        {message?.includes("过期") ? (
          <div className="text-center space-y-4">
            <p className="text-danger">{message}</p>
            <Button
              color="primary"
              variant="bordered"
              onPress={handleClose}
            >
              关闭
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="password"
              label="新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码"
              isDisabled={isLoading}
            />
            <Input
              type="password"
              label="确认新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              isDisabled={isLoading}
            />
            <Button
              color="primary"
              className="w-full"
              onPress={handleResetPassword}
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              重置密码
            </Button>
            {message && (
              <p className={`text-center ${
                message.includes("成功") ? "text-success" : "text-danger"
              }`}>
                {message}
              </p>
            )}
            <div className="text-center">
              <Button
                variant="light"
                size="sm"
                onPress={handleClose}
                isDisabled={isLoading}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}