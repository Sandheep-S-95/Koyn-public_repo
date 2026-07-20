import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserChats, createNewChat, deleteChat } from "@/lib/actions/chat.actions";
import Link from "next/link";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import ChatMobileSidebar from "@/components/chat/ChatMobileSidebar";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const chats = await getUserChats(session.user.email);

  return (
    <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-secondary/30 hidden md:flex flex-col backdrop-blur-md">
        <div className="p-4">
          <form action={async () => {
            "use server";
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session) return;
            const newChat = await createNewChat(session.user.email);
            redirect(`/chat/${newChat._id}`);
          }}>
            <Button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20">
              <Plus size={18} />
              <span>New Chat</span>
            </Button>
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {chats.map((chat: any) => (
            <div key={chat._id} className="group relative">
              <Link 
                href={`/chat/${chat._id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate flex-1">{chat.title}</span>
              </Link>
              
              <form 
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                action={async () => {
                  "use server";
                  const session = await auth.api.getSession({ headers: await headers() });
                  if (!session) return;
                  await deleteChat(chat._id, session.user.email);
                  redirect("/chat");
                }}
              >
                <button type="submit" className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-xs text-muted-foreground mt-10 px-4">
              No chat history found. Start a new conversation!
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 relative flex flex-col h-full bg-[#050505]">
        <ChatMobileSidebar chats={chats} email={session.user.email} />
        {children}
      </main>
    </div>
  );
}
