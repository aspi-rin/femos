import { useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from "@heroui/react";
import { supabase } from "../lib/supabaseClient";

export function AddMemosDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (count: number) => void; }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [block, setBlock] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setAuthor("");
      setBlock("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const splitBlocks = (text: string) => {
    return text
      .split(/\r?\n\s*\r?\n/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const findOrCreateBook = async (): Promise<string> => {
    const { data: allBooks, error: selErr } = await supabase
      .from("books")
      .select("id, title, author");
    if (selErr) throw selErr;
    const match = (allBooks ?? []).find((b: any) => b.title?.toLowerCase() === title.toLowerCase() && b.author?.toLowerCase() === author.toLowerCase());
    if (match) return match.id as string;

    const { data, error } = await supabase
      .from("books")
      .insert({ title, author })
      .select("id")
      .single();
    if (error) throw error;
    return (data as any).id as string;
  };

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!title.trim() || !author.trim() || !block.trim()) {
        throw new Error("请完整填写书名、作者与文本块");
      }
      const segments = splitBlocks(block);
      if (segments.length === 0) throw new Error("文本块未解析出有效句子");

      const bookId = await findOrCreateBook();
      let inserted = 0;
      for (const content of segments) {
        const { error } = await supabase
          .from("memos")
          .insert({ book_id: bookId, content });
        if (!error) inserted++;
      }
      setSuccess(`成功添加 ${inserted} 条句子`);
      onSuccess(inserted);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent>
        {(onCloseFn) => (
          <>
            <ModalHeader>添加句子（以书为单位）</ModalHeader>
            <ModalBody>
              <Input label="书名" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="作者" value={author} onChange={(e) => setAuthor(e.target.value)} />
              <Textarea label="文本块（按空白行分句）" value={block} onChange={(e) => setBlock(e.target.value)} minRows={8} />
              {error && <div className="text-danger text-sm">{error}</div>}
              {success && <div className="text-success text-sm">{success}</div>}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCloseFn}>取消</Button>
              <Button color="primary" isLoading={loading} onPress={onSubmit}>提交</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
