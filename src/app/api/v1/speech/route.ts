import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(`${process.env.GEMMINIAPI_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Existing POST endpoint remains the same
export async function POST(req: NextRequest) {
  const { prompt, conversationId } = await req.json();
  try {
    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 },
      );
    }

    // Generate AI response
    const { response } = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
            Be conversational.
            You are strictly a German teacher to help english speakers learn German, don't answer anything outside learning German.
            Anyone sending prompts are basically new to German, make the response user friendly and make it easy for them to understand what you are saying.
            Use English as the anchor point for each response for better guidance.
            Make the responses, really graceful and don't be harsh with your responses please.
            And feel free to use emojis if need be based on the tone of the user.
            ${prompt}
          `,
            },
          ],
        },
      ],
    });

    const messageResponse = response.text();

    // Save the conversation in the database using transaction
    const result = await prisma.$transaction(async (tx) => {
      let conversation;

      if (!conversationId) {
        // Create new conversation if no ID provided
        const conversationCount = await tx.conversation.count();
        conversation = await tx.conversation.create({
          data: {
            title: `Lektion${conversationCount + 1}`,
          },
        });
      }

      // Save user's message
      await tx.message.create({
        data: {
          content: prompt,
          role: "user",
          conversationId: parseInt(conversationId || conversation?.id),
        },
      });

      // Save AI's response
      const aiMessage = await tx.message.create({
        data: {
          content: messageResponse,
          role: "assistant",
          conversationId: parseInt(conversationId || conversation?.id),
        },
      });

      // Return full conversation if it's new
      if (!conversationId) {
        return {
          message: messageResponse,
          conversation: await tx.conversation.findUnique({
            where: { id: conversation?.id },
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
              },
            },
          }),
        };
      }

      return { message: messageResponse };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Get all chats for a user
export async function GET(req: NextRequest) {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

// Update chat name
export async function PATCH(req: NextRequest) {
  try {
    const { conversationId, title } = await req.json();

    if (!conversationId || !title) {
      return NextResponse.json(
        { error: "conversationId and title are required" },
        { status: 400 },
      );
    }

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        title,
      },
    });

    return NextResponse.json(
      { conversation: updatedConversation },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}

// Delete a chat
export async function DELETE(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 },
      );
    }

    // Delete all messages first due to foreign key constraint
    await prisma.message.deleteMany({
      where: {
        conversationId: parseInt(conversationId),
      },
    });

    // Then delete the conversation
    await prisma.conversation.delete({
      where: {
        id: parseInt(conversationId),
      },
    });

    return NextResponse.json(
      { message: "Conversation deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}

// Get prompt history (all messages) for a user
export async function HEAD(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          id: parseInt(userId),
        },
      },
      include: {
        conversation: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch message history" },
      { status: 500 },
    );
  }
}

// Add this new route for creating chats
// export async function PUT(req: NextRequest) {
//   try {
//     const { firstMessage = "Hello! I want to learn German." } = await req.json();

//     // Create new conversation with automatic lesson numbering and default userId
//     const result = await prisma.$transaction(async (tx) => {
//       // Ensure default user exists
//       let defaultUser = await tx.conversation.findUnique({
//         where: { id: 1 }
//       });

//       if (!defaultUser) {
//         defaultUser = await tx?.conversation.create({
//           data: {
//             id: 1,
//             email: 'default@example.com',
//             name: 'Default User'
//           }
//         });
//       }

//       // Get conversation count
//       const conversationCount = await tx.conversation.count();

//       // Create the conversation
//       const conversation = await tx.conversation.create({
//         data: {
//           title: `Lektion${conversationCount + 1}`,
//           userId: defaultUser.id,
//         },
//       });

//       // Create the user's first message
//       await tx.message.create({
//         data: {
//           content: firstMessage,
//           role: 'user',
//           conversationId: conversation.id,
//         },
//       });

//       // Get AI's response
//       const { response } = await model.generateContent({
//         contents: [{
//           role: 'user',
//           parts: [{
//             text: `
//               Be conversational.
//               You are strictly a German teacher to help english speakers learn German, don't answer anything outside learning German.
//               Anyone sending prompts are basically new to German, make the response user friendly and make it easy for them to understand what you are saying.
//               Use English as the anchor point for each response for better guidance.
//               Make the responses, really graceful and don't be harsh with your responses please.
//               And feel free to use emojis if need be based on the tone of the user.
//               ${firstMessage}
//             `
//           }]
//         }]
//       });

//       const aiResponse = response.text();

//       // Save AI's response
//       await tx.message.create({
//         data: {
//           content: aiResponse,
//           role: 'assistant',
//           conversationId: conversation.id,
//         },
//       });

//       // Return the complete conversation with messages
//       return tx.conversation.findUnique({
//         where: { id: conversation.id },
//         include: {
//           messages: {
//             orderBy: { createdAt: 'asc' },
//           },
//         },
//       });
//     });

//     return NextResponse.json({ conversation: result }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating chat:', error);
//     return NextResponse.json(
//       { error: 'Failed to create chat', details: error instanceof Error ? error.message : "Unknown error" },
//       { status: 500 }
//     );
//   }
// }
