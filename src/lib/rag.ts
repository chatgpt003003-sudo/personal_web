import openai from './openai';
import { prisma } from './prisma';

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error(
      'OpenAI client not initialized - embedding generation unavailable'
    );
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.replace(/\n/g, ' '),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function addToKnowledgeBase(
  entry: Omit<KnowledgeBaseEntry, 'id'>
): Promise<string> {
  try {
    let embedding: number[] = [];

    if (openai) {
      try {
        embedding = await generateEmbedding(`${entry.title} ${entry.content}`);
      } catch (error) {
        console.warn(
          'Failed to generate embedding, proceeding without:',
          error
        );
      }
    }

    const knowledgeBaseEntry = await prisma.knowledgeBase.create({
      data: {
        title: entry.title,
        content: entry.content,
        source: entry.source,
        sourceId: entry.sourceId,
        embedding: embedding.length > 0 ? JSON.stringify(embedding) : null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      },
    });

    return knowledgeBaseEntry.id;
  } catch (error) {
    console.error('Error adding to knowledge base:', error);
    throw new Error('Failed to add to knowledge base');
  }
}

export async function searchKnowledgeBase(
  query: string,
  limit: number = 5
): Promise<KnowledgeBaseEntry[]> {
  try {
    // For SQLite, we'll use a simple text search as a fallback
    // In production with PostgreSQL + pgvector, this would use cosine similarity
    const results = await prisma.knowledgeBase.findMany({
      where: {
        OR: [{ title: { contains: query } }, { content: { contains: query } }],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      source: result.source,
      sourceId: result.sourceId || undefined,
      metadata: result.metadata ? JSON.parse(result.metadata) : undefined,
    }));
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
}

export async function generateRAGResponse(
  query: string,
  context: string = ''
): Promise<string> {
  try {
    if (!openai) {
      // Fallback response when OpenAI is not available
      const relevantDocs = await searchKnowledgeBase(query);

      if (relevantDocs.length > 0) {
        const contextString = relevantDocs
          .map(doc => `${doc.title}: ${doc.content}`)
          .slice(0, 2) // Limit to 2 most relevant docs
          .join('\n\n');

        return `Based on the available information:\n\n${contextString}\n\nPlease note: AI responses are currently unavailable. For more detailed information, you can explore the projects section or contact directly.`;
      } else {
        return `I found some information related to your query, but AI responses are currently unavailable. Please explore the projects and blog sections for more details, or feel free to contact directly.`;
      }
    }

    const relevantDocs = await searchKnowledgeBase(query);

    const contextString = relevantDocs
      .map(doc => `${doc.title}: ${doc.content}`)
      .join('\n\n');

    const systemPrompt = `You are a helpful assistant representing a portfolio website owner. You have access to information about their projects, skills, and experience. Use the provided context to answer questions accurately and conversationally.

Context information:
${contextString}

Additional context: ${context}

Guidelines:
- Be conversational and friendly
- Provide specific details from the context when relevant
- If you don't have enough information, say so and suggest alternatives
- Focus on projects, technical skills, and professional experience
- Keep responses concise but informative`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content ||
      'I apologize, but I was unable to generate a response at this time.'
    );
  } catch (error) {
    console.error('Error generating RAG response:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.';
  }
}

export async function populateKnowledgeBase(): Promise<void> {
  try {
    // Clear existing knowledge base
    await prisma.knowledgeBase.deleteMany();

    // Add project information
    const projects = await prisma.project.findMany({
      where: { published: true },
    });
    for (const project of projects) {
      await addToKnowledgeBase({
        title: project.title,
        content: `${project.description || ''} ${project.metadata || ''}`,
        source: 'project',
        sourceId: project.id,
        metadata: { url: `/projects/${project.id}` },
      });
    }

    // Add blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
    });
    for (const post of blogPosts) {
      await addToKnowledgeBase({
        title: post.title,
        content: `${post.excerpt || ''} ${post.content}`,
        source: 'blog',
        sourceId: post.id,
        metadata: { url: `/blog/${post.slug}` },
      });
    }

    // Add manual knowledge entries
    const manualEntries = [
      {
        title: 'Technical Skills Overview',
        content:
          'Full-stack developer with expertise in React, Next.js, TypeScript, Node.js, PostgreSQL, and AWS. Experienced in building scalable web applications with modern development practices including testing, CI/CD, and security best practices.',
        source: 'manual',
        metadata: { category: 'skills' },
      },
      {
        title: 'Development Philosophy',
        content:
          'Believes in writing clean, maintainable code with comprehensive testing. Focuses on user experience, performance optimization, and accessibility. Enjoys working with modern technologies and staying current with industry best practices.',
        source: 'manual',
        metadata: { category: 'approach' },
      },
      {
        title: 'Portfolio Website Features',
        content:
          'This Netflix-style portfolio website demonstrates advanced React animations, AWS integration, full-stack development capabilities, and AI-powered features. Built with Next.js 14, TypeScript, Tailwind CSS, and deployed on AWS infrastructure.',
        source: 'manual',
        metadata: { category: 'portfolio' },
      },
    ];

    for (const entry of manualEntries) {
      await addToKnowledgeBase(entry);
    }

    console.log('Knowledge base populated successfully');
  } catch (error) {
    console.error('Error populating knowledge base:', error);
    throw new Error('Failed to populate knowledge base');
  }
}
