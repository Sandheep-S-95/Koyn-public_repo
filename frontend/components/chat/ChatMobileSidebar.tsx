"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createNewChat, deleteChat } from "@/lib/actions/chat.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import KoynAI from "@/components/KoynAI";

export default function ChatMobileSidebar({ chats, email }: { chats: any[], email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNewChat = async () => {
    const newChat = await createNewChat(email);
    setOpen(false);
    router.push(`/chat/${newChat._id}`);
  };

  const handleDelete = async (chatId: string) => {
    await deleteChat(chatId, email);
  };

  return (
    <div className="flex md:hidden p-4 border-b border-white/10 bg-[#0A0A0A] items-center shrink-0 w-full z-10">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-[#050505] border-r-white/10 p-4 flex flex-col w-72">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-gray-200">Chat History</SheetTitle>
          </SheetHeader>
          
          <Button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 mb-4"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </Button>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-1">
            {chats.map((chat: any) => (
              <div key={chat._id} className="group relative">
                <Link 
                  href={`/chat/${chat._id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="truncate flex-1">{chat.title}</span>
                </Link>
                
                <button 
                  onClick={() => handleDelete(chat._id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {chats.length === 0 && (
              <div className="text-center text-xs text-muted-foreground mt-10">
                No chat history found. Start a new conversation!
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <KoynAI className="ml-4 text-gray-300" />
    </div>
  );
}
