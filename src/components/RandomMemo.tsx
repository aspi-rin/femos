import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@heroui/react";
import { supabase } from "../lib/supabaseClient";

type Memo = { id: string; content: string; title: string; author: string };

export function RandomMemo({ reloadSignal }: { reloadSignal?: number }) {
  const [memo, setMemo] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("get_random_memo");
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMemo(data?.[0] ?? null);
  }, []);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  useEffect(() => {
    if (reloadSignal !== undefined) {
      fetchRandom();
    }
  }, [reloadSignal, fetchRandom]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <Card className="max-w-2xl w-full p-6 text-center">
        {loading && <div>加载中…</div>}
        {error && <div className="text-danger">{error}</div>}
        {!loading && !error && memo && (
          <div>
            <div className="text-lg whitespace-pre-line">{memo.content}</div>
            <div className="mt-3 text-sm text-foreground/70">— {memo.author}《{memo.title}》</div>
          </div>
        )}
        {!loading && !error && !memo && <div>暂无内容</div>}
      </Card>
      <Button color="primary" onPress={fetchRandom}>换一句</Button>
    </div>
  );
}
