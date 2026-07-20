"use server";

import { connectToDatabase } from "@/database/mongoose";
import Chat from "@/database/models/chat.model";
import { revalidatePath } from "next/cache";

export async function getUserChats(email: string) {
  try {
    await connectToDatabase();
    const chats = await Chat.find({ userEmail: email })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt")
      .lean();

    return JSON.parse(JSON.stringify(chats));
  } catch (error) {
    console.error("getUserChats error:", error);
    return [];
  }
}

export async function getChatById(chatId: string, email: string) {
  try {
    await connectToDatabase();
    const chat = await Chat.findOne({ _id: chatId, userEmail: email }).lean();
    if (!chat) return null;

    return JSON.parse(JSON.stringify(chat));
  } catch (error) {
    console.error("getChatById error:", error);
    return null;
  }
}

export async function createNewChat(email: string, title: string = "New Chat") {
  try {
    await connectToDatabase();
    const newChat = await Chat.create({
      userEmail: email,
      title,
      messages: []
    });

    revalidatePath("/chat", "layout");
    return JSON.parse(JSON.stringify(newChat));
  } catch (error) {
    console.error("createNewChat error:", error);
    throw new Error("Failed to create chat");
  }
}

export async function deleteChat(chatId: string, email: string) {
  try {
    await connectToDatabase();
    await Chat.deleteOne({ _id: chatId, userEmail: email });
    revalidatePath("/chat", "layout");
    return true;
  } catch (error) {
    console.error("deleteChat error:", error);
    return false;
  }
}

export async function saveMessageToChat(chatId: string, email: string, role: string, content: string) {
  try {
    await connectToDatabase();
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userEmail: email },
      { $push: { messages: { role, content } } },
      { new: true }
    );

    revalidatePath(`/chat/${chatId}`);
    return JSON.parse(JSON.stringify(updatedChat));
  } catch (error) {
    console.error("saveMessageToChat error:", error);
    throw new Error("Failed to save message");
  }
}

export async function renameChat(chatId: string, email: string, newTitle: string) {
    try {
      await connectToDatabase();
      await Chat.findOneAndUpdate(
        { _id: chatId, userEmail: email },
        { title: newTitle }
      );
  
      revalidatePath("/chat", "layout");
      return true;
    } catch (error) {
      console.error("renameChat error:", error);
      return false;
    }
}
