"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
};

type Conversation = {
  id: number;
  title: string;
  createdAt: string;
  messages: Message[];
};

const HomePage: React.FC = () => {
  const [request, setRequest] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const response = await fetch("/api/v1/speech");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const { conversations } = await response.json();
      setConversations(conversations);
      if (conversations.length > 0 && !selectedChat) {
        setSelectedChat(conversations[0].id);
      }
    } catch (error) {
      toast.error("Failed to load conversations");
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleNewChat() {
    try {
      const response = await fetch("/api/v1/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Hello! I want to learn German.",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create new chat");
      }

      const { message, conversation } = await response.json();
      if (conversation) {
        const newConversation: Conversation = {
          ...conversation,
          messages: [
            {
              id: Date.now(),
              content: "Hello! I want to learn German.",
              role: "user",
              createdAt: new Date().toISOString(),
            },
            {
              id: Date.now() + 1,
              content: message,
              role: "assistant",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedChat(conversation.id);
      }
    } catch (error) {
      console.error("Create chat error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create new chat",
      );
    }
  }

  async function handleSubmit(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    const prompt = request.trim();
    if (!prompt || !selectedChat) return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationId: selectedChat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const { message } = await response.json();
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === selectedChat) {
            const userMessage: Message = {
              id: Date.now(),
              role: "user",
              content: prompt,
              createdAt: new Date().toISOString(),
            };

            const assistantMessage: Message = {
              id: Date.now() + 1,
              role: "assistant",
              content: message,
              createdAt: new Date().toISOString(),
            };

            return {
              ...conv,
              messages: [...conv.messages, userMessage, assistantMessage],
            };
          }
          return conv;
        }),
      );
      setRequest("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  const currentConversation = conversations.find((c) => c.id === selectedChat);

  return (
    <main className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white">
        <div className="p-4">
          <button
            onClick={handleNewChat}
            disabled={loading}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-red-600" />
                <span>Creating...</span>
              </div>
            ) : (
              "New Chat"
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* ... loading state ... */}
          {conversations.map((chat) => (
            <div key={chat.id} className="group relative mb-1 flex items-center">
              <button
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "w-full rounded-lg px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100",
                  selectedChat === chat.id && "bg-red-50 text-red-700 hover:bg-red-50",
                )}
              >
                <div className="truncate">{chat.title}</div>
                <div className="text-xs text-zinc-500">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add delete functionality here
                  const confirmed = window.confirm("Delete this conversation?");
                  if (confirmed) {
                    // Remove from state
                    setConversations(prev => prev.filter(c => c.id !== chat.id));
                    if (selectedChat === chat.id) {
                      setSelectedChat(null);
                    }
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-white">
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-6">
          <h1 className="text-xl font-semibold">
            <span className="text-red-600">Sprache</span>{" "}
            <span className="text-zinc-900">AI</span>
          </h1>
          {/* ... github link ... */}
        </header>

        <div className="flex-1 overflow-y-auto bg-zinc-50 p-4">
          {/* ... loading and empty states ... */}
          <div className="space-y-4">
            {currentConversation?.messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start space-x-3",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4 shadow-sm",
                    message.role === "user"
                      ? "bg-red-600 text-white"
                      : "border border-amber-100 bg-amber-50 text-zinc-900",
                  )}
                >
                  <ReactMarkdown
                    className={cn(
                      "prose max-w-none",
                      message.role === "user" && "prose-invert",
                    )}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-zinc-200 bg-white p-4">
          <div className="flex space-x-2">
            <Textarea
              onKeyDownCapture={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={
                initialLoading
                  ? "Loading..."
                  : selectedChat
                    ? "Type your message..."
                    : "Select or create a chat to start"
              }
              disabled={loading || initialLoading || !selectedChat}
              className="min-h-[44px] w-full resize-none rounded-lg border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 transition-colors focus:border-red-500 focus:ring-red-500 disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={
                loading || initialLoading || !selectedChat || !request.trim()
              }
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
export default HomePage;
