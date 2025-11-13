import { useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { supabase } from "../lib/supabaseClient";

export function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onClose();
  };

  return (
    <Modal isOpen={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent>
        {(onCloseFn) => (
          <>
            <ModalHeader>邮箱登录</ModalHeader>
            <ModalBody>
              <Input type="email" label="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" label="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <div className="text-danger text-sm">{error}</div>}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCloseFn}>取消</Button>
              <Button color="primary" isLoading={loading} onPress={signIn}>登录</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
