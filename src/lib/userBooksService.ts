import { supabase } from "./supabaseClient";

export interface UserBook {
  book_id: string;
  title: string;
  author: string;
  memo_count: number;
  last_read_at?: string;
}

export interface BookMemo {
  id: string;
  content: string;
  created_at: string;
}

/**
 * 获取用户阅读过的书籍列表
 */
export async function getUserBooks(userId: string): Promise<UserBook[]> {
  // 首先获取所有有memo的书籍
  const { data: booksData, error: booksError } = await supabase
    .from("books")
    .select(`
      id,
      title,
      author,
      memos(count)
    `)
    .order("title");

  if (booksError) {
    console.error("获取书籍列表失败:", booksError);
    throw booksError;
  }

  // 转换为UserBook格式
  const userBooks: UserBook[] = (booksData || []).map(book => ({
    book_id: book.id,
    title: book.title,
    author: book.author,
    memo_count: book.memos?.[0]?.count || 0,
  }));

  return userBooks;
}

/**
 * 获取指定书籍的所有memos
 */
export async function getBookMemos(bookId: string): Promise<BookMemo[]> {
  const { data, error } = await supabase
    .from("memos")
    .select(`id, content, created_at`)
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取书籍memos失败:", error);
    throw error;
  }

  return data || [];
}

/**
 * 标记书籍为已读（记录阅读时间）
 */
export async function markBookAsRead(userId: string, bookId: string): Promise<void> {
  // 这里可以扩展为记录用户阅读历史
  // 目前先返回成功，后续可以添加阅读记录表
  console.log(`用户 ${userId} 阅读了书籍 ${bookId}`);
}