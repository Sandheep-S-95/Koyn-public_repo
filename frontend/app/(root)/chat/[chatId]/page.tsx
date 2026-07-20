import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getChatById } from "@/lib/actions/chat.actions";
import ChatClient from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const resolvedParams = await params;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const chat = await getChatById(resolvedParams.chatId, session.user.email);
  if (!chat) notFound();

  // Map messages to the format expected by ChatClient
  const formattedMessages = chat.messages.map((m: any) => ({
    role: m.role,
    content: m.content
  }));

  return (
    <ChatClient 
      chatId={resolvedParams.chatId} 
      initialMessages={formattedMessages} 
      email={session.user.email}
    />
  );
}
