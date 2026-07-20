import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserChats, createNewChat } from "@/lib/actions/chat.actions";
import KoynAI from "@/components/KoynAI";

export default async function ChatIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const chats = await getUserChats(session.user.email);
  
  if (chats.length > 0) {
    // Redirect to most recent chat
    redirect(`/chat/${chats[0]._id}`);
  }

  return (
    <div className="flex h-full items-center justify-center flex-col text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">Welcome to <KoynAI className="text-3xl" /></h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your personal financial analyst. Create a new chat to start analyzing stocks, getting market overviews, and discovering insights.
      </p>
      
      <form action={async () => {
        "use server";
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) return;
        const newChat = await createNewChat(session.user.email);
        redirect(`/chat/${newChat._id}`);
      }}>
        <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Start Your First Chat
        </button>
      </form>
    </div>
  );
}
