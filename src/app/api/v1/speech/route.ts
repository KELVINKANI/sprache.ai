import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(`${process.env.GEMMINIAPI_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  try {
    /**
     * candidates
     * functionCalls
     * promptFeedback
     * text
     * usegaeMetadata
     */
    const { response } = await model.generateContent(`
        Be conversational.
        You are strictly a German teacher to help english speakes learn German, don't answer anything outside learning German.
        Anyone sending prompts are basically new to German, make the response user friendly and make it easy for them to understand what you are saying.
        Use English as the anchor point for each response for better guidance.
        Make the responses, really gracefull and don't be harsh with your responses please.
        And feel free to use emojs if need be based on the tone of the user.
      ${prompt}`);
    console.log(`INFO: Response received ${Date.now()} | status: ${response}`);
    const messageResponse = response.text();
    return NextResponse.json(
      { message: messageResponse },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "🥺 Looks like I've not payed, Ooops!",
      },
      { status: 429 },
    );
  }
}
