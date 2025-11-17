import { useEffect, useState, useRef, useCallback } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, Spinner, Card, CardBody } from "@heroui/react";
import { Book, ArrowLeft } from "lucide-react";
import { BookMemo, getBookMemos } from "../lib/userBooksService";

interface BookMemosDialogProps {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  bookId: string | null;
  bookTitle?: string;
  bookAuthor?: string;
}

export function BookMemosDialog({ open, onClose, onBack, bookId, bookTitle, bookAuthor }: BookMemosDialogProps) {
  const [memos, setMemos] = useState<BookMemo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const PAGE_SIZE = 10;

  const lastMemoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (open && bookId) {
      setMemos([]);
      setPage(1);
      setHasMore(true);
      loadMemos(bookId, 1);
    }
  }, [open, bookId]);

  useEffect(() => {
    if (open && bookId && page > 1) {
      loadMemos(bookId, page);
    }
  }, [page, open, bookId]);

  const loadMemos = async (bookId: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const allMemos = await getBookMemos(bookId);

      // 模拟分页加载
      const startIndex = (pageNum - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const newMemos = allMemos.slice(startIndex, endIndex);

      if (pageNum === 1) {
        setMemos(newMemos);
      } else {
        setMemos(prev => [...prev, ...newMemos]);
      }

      setHasMore(endIndex < allMemos.length);
    } catch (e: any) {
      setError(e?.message || "获取书摘失败");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => !v && onClose()}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onCloseFn) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={onBack}
                >
                  <ArrowLeft size={16} />
                </Button>
                <Book size={20} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-lg truncate">
                    {bookTitle || "书籍详情"}
                  </div>
                  {bookAuthor && (
                    <div className="text-sm text-foreground/60">
                      {bookAuthor}
                    </div>
                  )}
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {loading && page === 1 && (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              )}

              {error && (
                <div className="text-danger text-center py-4">
                  {error}
                </div>
              )}

              {!loading && !error && memos.length === 0 && (
                <div className="text-center py-8 text-foreground/60">
                  本书暂无书摘
                </div>
              )}

              {memos.length > 0 && (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 pb-4">
                  {memos.map((memo, index) => (
                    <div
                      key={memo.id}
                      ref={index === memos.length - 1 ? lastMemoElementRef : undefined}
                      className="break-inside-avoid mb-4"
                    >
                      <Card className="h-auto">
                        <CardBody className="p-4">
                          <div className="text-sm whitespace-pre-line leading-relaxed">
                            {memo.content}
                          </div>
                          <div className="text-xs text-foreground/40 mt-2">
                            {formatDate(memo.created_at)}
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  ))}
                </div>
              )}

              {loading && page > 1 && (
                <div className="flex justify-center py-4">
                  <Spinner size="md" />
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}