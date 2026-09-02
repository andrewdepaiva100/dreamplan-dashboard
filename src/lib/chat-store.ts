import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";

export type ChatThread = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export async function listThreads(): Promise<ChatThread[]> {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ChatThread[];
}

export async function createThread(title = "New chat"): Promise<ChatThread> {
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ title })
    .select("id, title, created_at, updated_at")
    .single();
  if (error) throw error;
  return data as ChatThread;
}

export async function renameThread(id: string, title: string) {
  await supabase.from("chat_threads").update({ title }).eq("id", id);
}

export async function touchThread(id: string) {
  await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteThread(id: string) {
  await supabase.from("chat_threads").delete().eq("id", id);
}

export async function loadMessages(threadId: string): Promise<UIMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, parts, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    role: row.role as UIMessage["role"],
    parts: (row.parts ?? []) as UIMessage["parts"],
  }));
}

export async function saveMessage(threadId: string, message: UIMessage) {
  await supabase.from("chat_messages").upsert(
    {
      id: message.id,
      thread_id: threadId,
      role: message.role,
      parts: message.parts as unknown as never,
    },
    { onConflict: "id" },
  );
  await touchThread(threadId);
}
