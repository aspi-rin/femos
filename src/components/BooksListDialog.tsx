import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalHeader, Spinner, Card, CardBody } from "@heroui/react";
import { Book, ChevronRight } from "lucide-react";
import { UserBook, getUserBooks } from "../lib/userBooksService";

interface BooksListDialogProps {
  open: boolean;
  onClose: () => void;
  onBookSelect: (bookId: string, bookTitle?: string, bookAuthor?: string) => void;
}

export function BooksListDialog({ open, onClose, onBookSelect }: BooksListDialogProps) {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      loadBooks();
    }
  }, [open]);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const userBooks = await getUserBooks();
      setBooks(userBooks);
    } catch (e: any) {
      setError(e?.message || "获取书籍列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId: string, bookTitle?: string, bookAuthor?: string) => {
    onBookSelect(bookId, bookTitle, bookAuthor);
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(v) => !v && onClose()}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onCloseFn) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Book size={20} />
                我的书库
              </div>
              <div className="text-sm text-foreground/60">
                共 {books.length} 本书
              </div>
            </ModalHeader>
            <ModalBody>
              {loading && (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              )}

              {error && (
                <div className="text-danger text-center py-4">
                  {error}
                </div>
              )}

              {!loading && !error && books.length === 0 && (
                <div className="text-center py-8 text-foreground/60">
                  暂无书籍记录
                </div>
              )}

              {!loading && !error && books.length > 0 && (
                <div className="space-y-3 pb-4">
                  {books.map((book) => (
                    <Card
                      key={book.book_id}
                      isPressable
                      onPress={() => handleBookClick(book.book_id, book.title, book.author)}
                      className="hover:scale-[1.02] transition-transform"
                    >
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-lg truncate">
                              {book.title}
                            </div>
                            <div className="text-sm text-foreground/60 mt-1">
                              {book.author}
                            </div>
                            <div className="text-xs text-foreground/40 mt-1">
                              {book.memo_count} 条书摘
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-foreground/40 flex-shrink-0" />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}