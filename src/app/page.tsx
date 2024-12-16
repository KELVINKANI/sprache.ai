"use client";
import Link from "next/link";
import React, { useState, MouseEventHandler } from "react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [request, setRequest] = useState<string>("");
  const [response, setResponse] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: MouseEventHandler<HTMLButtonElement>) {
    const prompt = request.trim();
    setLoading(true);
    setRequest("");
    if (prompt.length > 0) {
      try {
        const response = await fetch("/api/v1/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        });

        if (response.status === 200) {
          const { message } = await response.json();
          setResponse(message);
        } else if (response.status === 429) {
          toast.error("Ooops!", {
            className:
              "bg-zinc-800 border-purple-400 border-[0.5px] text-white",
            duration: 5000,
            description: "🥺 Looks like I've not paid for the OpenAI service.",
          });
        }
      } catch (error) {
        toast.error("Ooops!", {
          className: "bg-zinc-800 border-purple-400 border-[0.5px] text-white",
          duration: 5000,
          description: "🥺 Looks like I've not paid for the OpenAI service.",
        });
      }
    }

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-slate-900 to-zinc-900 font-primary text-white">
      {!response ? (
        <>
          <span className="absolute right-10 top-4 z-10 flex h-12 flex-row gap-2">
            <Link
              className="flex w-36 items-center justify-center space-x-2 rounded-xl border-[0.5px] border-gray-600  p-2 transition duration-300 ease-in-out hover:border-purple-600 hover:text-purple-200"
              target="_blank"
              href="https://github.com/shadmeoli/sprache.ai"
            >
              <span>View code</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </Link>
          </span>
          <Image
            className="mt-20 md:mt-0"
            src="/book.png"
            alt="sprache"
            width={200}
            height={200}
          />
          <h1 className="text-3xl font-bold md:text-4xl">Sprache</h1>
          <p className="font-light tracking-widest">
            Learn Germany with the Power of AI
          </p>
          <Cards />
        </>
      ) : (
        <section className="h-[40rem] flex-row gap-2 rounded-xl bg-slate-600/15 p-4 md:w-[45%]">
          <div className="flex h-full w-full flex-col items-start overflow-y-auto p-4">
            <div className="flex w-full flex-col items-start justify-start space-x-2 rounded-2xl bg-white/20 p-2 text-sm">
              {response && (
                <ReactMarkdown className="whitespace-pre-line text-balance p-4">
                  {response}
                </ReactMarkdown>
              )}
            </div>
            <Image
              src="/gemmini.png"
              height={60}
              width={60}
              alt="gemmini-ai"
              className={cn(
                "-ml-6",
                loading ? "animate-pulse" : "animate-none",
              )}
            />
          </div>
        </section>
      )}

      <section className=" absolute bottom-0 flex w-full justify-center p-2 md:h-36 md:w-full md:p-10">
        <ChatSection query={handleSubmit} text={request} setText={setRequest} />
      </section>
    </main>
  );
}

function Cards() {
  const features = [
    {
      title: "Powerful",
      description:
        "Sprache is a powerful tool that can help you learn German with ease.",
    },
    {
      title: "User-friendly",
      description:
        "Sprache is designed to be user-friendly and easy to use, even for beginners.",
    },
    {
      title: "Customizable",
      description:
        "Sprache is customizable, so you can tailor it to your specific needs and preferences.",
    },
    {
      title: "Privacy-focused",
      description:
        "Sprache is built with privacy in mind, so you can use it without any concerns.",
    },
  ];
  return (
    <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2 ">
      {features.map((feature) => (
        <div
          key={feature.title}
          className=" ease-in-linear flex h-36 w-60 flex-col items-start justify-center space-y-2 rounded-xl border-[0.5px] border-gray-600 p-4 transition duration-300 hover:border-violet-400"
        >
          <h1>{feature.title}</h1>
          <p className="text-sm font-light">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

type ChatSectionProps = {
  query: (e: MouseEventHandler<HTMLButtonElement>) => Promise<void>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

function ChatSection({ query, text, setText }: any) {
  const [loading, setLoading] = useState(false);
  async function submit() {
    setLoading(true);
    query(text);
    setLoading(false);
  }
  return (
    <div className="flex  h-full w-80 flex-row  items-center justify-center space-x-2 rounded-2xl bg-zinc-700 p-4 md:w-[50%]">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="font-regular text-whit h-12 min-h-12 w-full border-0 bg-zinc-800 outline-none ring-0 hover:outline-none hover:ring-0 focus:ring-0 active:outline-none"
        placeholder="Type a message..."
      />
      <button
        onClick={submit}
        className="flex h-12 w-12 items-center justify-center rounded bg-zinc-900 text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
          />
        </svg>
      </button>
    </div>
  );
}
