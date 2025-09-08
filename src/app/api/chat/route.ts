import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DecisionTreeEngine } from '@/lib/decision-tree';
import { generateRAGResponse } from '@/lib/rag';
import { v4 as uuidv4 } from 'uuid';

const decisionTree = new DecisionTreeEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      sessionId,
      conversationId,
      mode = 'tree',
      currentNodeId,
      userChoice,
    } = body;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { timestamp: 'asc' } } },
      });
    } else {
      const newSessionId = sessionId || uuidv4();
      conversation = await prisma.chatConversation.create({
        data: {
          sessionId: newSessionId,
          context: JSON.stringify({
            userAgent: request.headers.get('user-agent'),
          }),
        },
        include: { messages: { orderBy: { timestamp: 'asc' } } },
      });
    }

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    let responseMessage: string;
    let options: Record<string, string>[] = [];
    let nextNodeId: string | undefined;
    let newMode = mode;

    if (mode === 'tree') {
      // Handle decision tree mode
      if (!currentNodeId && !userChoice) {
        // Starting conversation
        const startingNode = decisionTree.getStartingNode();
        responseMessage = startingNode.message;
        options = startingNode.options;
        nextNodeId = startingNode.id;
      } else if (currentNodeId && userChoice) {
        // Processing user choice
        const treeResponse = decisionTree.processUserChoice(
          currentNodeId,
          userChoice
        );
        responseMessage = treeResponse.message;
        options = treeResponse.options;
        nextNodeId = treeResponse.nextNodeId;

        if (treeResponse.shouldHandoffToAI) {
          newMode = 'ai';
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid tree mode request' },
          { status: 400 }
        );
      }
    } else if (mode === 'ai') {
      // Handle AI mode
      if (!message) {
        return NextResponse.json(
          { error: 'Message is required for AI mode' },
          { status: 400 }
        );
      }

      // Store user message
      await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message,
          messageType: 'text',
        },
      });

      // Generate context from conversation history
      const conversationContext = conversation.messages
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Generate AI response
      responseMessage = await generateRAGResponse(message, conversationContext);

      // Provide option to return to guided mode
      options = [
        {
          text: 'Return to guided conversation',
          value: 'back_to_tree',
          action: 'switch_mode',
          mode: 'tree',
        },
      ];
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    // Store assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: responseMessage,
        messageType: mode === 'tree' ? 'decision_tree' : 'text',
        metadata: JSON.stringify({
          mode: newMode,
          options: options,
          nextNodeId: nextNodeId,
        }),
      },
    });

    return NextResponse.json({
      message: responseMessage,
      options: options,
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      mode: newMode,
      nextNodeId: nextNodeId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        sessionId: conversation.sessionId,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          messageType: msg.messageType,
          metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
          timestamp: msg.timestamp,
        })),
      },
    });
  } catch (error) {
    console.error('Chat GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
