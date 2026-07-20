import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  role: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const ChatSchema = new Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true, default: "New Chat" },
  messages: { type: [MessageSchema], default: [] },
}, { timestamps: true });

const Chat = models?.Chat || model("Chat", ChatSchema);

export default Chat;
