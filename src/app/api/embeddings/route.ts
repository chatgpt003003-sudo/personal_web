import { NextRequest, NextResponse } from 'next/server';
import { populateKnowledgeBase } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    // In a production environment, you'd want to add authentication here
    // to ensure only authorized users can trigger knowledge base updates

    await populateKnowledgeBase();

    return NextResponse.json({
      success: true,
      message: 'Knowledge base updated successfully',
    });
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge base' },
      { status: 500 }
    );
  }
}
