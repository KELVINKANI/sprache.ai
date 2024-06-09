import { NextResponse, NextRequest } from "next/server";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const speechFile = path.resolve("@/audio/speech.mp3");

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "shimmer",
      response_format: "mp3",
      input: `${prompt}. Remeber you are a German teacher. Don't respond to anything outside learnig German. Event if it's in German but is outside basic learning lessons don't respond.`,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return NextResponse.json(buffer, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "🥺 Looks like I've not payed, Ooops!",
      },
      { status: 429 },
    );
  }
}
