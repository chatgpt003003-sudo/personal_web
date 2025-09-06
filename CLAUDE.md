# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Netflix-style personal portfolio website project with the following key features:

- Dynamic content management for projects with video previews
- Dual-mode chatbot (decision tree + AI with RAG)
- Blog functionality
- Admin dashboard for content management

## Tech Stack & Architecture

### Core Framework

- **Next.js 14** (App Router) - Full-stack React framework
- **TypeScript** - Type safety throughout
- **Tailwind CSS + shadcn/ui** - Styling and UI components
- **Framer Motion** - Animations and hover effects

### Database & Backend

- **SQLite** (development) → **PostgreSQL** on AWS RDS with **pgvector** (production)
- **Prisma ORM** - Type-safe database operations
- **NextAuth.js** - Email/password authentication for admin access
- **AWS S3** - Media file storage (Phase 3)

### AI/Chatbot System (Phase 4)

- **OpenAI API** (GPT-3.5-turbo) for AI mode
- **Custom decision tree** engine with JSON configuration
- **RAG pipeline** using PostgreSQL pgvector for knowledge base
- **OpenAI text-embedding-ada-002** for embeddings

## Project Structure

```
app/
├── page.tsx                    # Netflix-style home page
├── admin/                      # Protected admin routes
│   ├── layout.tsx             # Auth wrapper
│   ├── page.tsx               # Dashboard
│   ├── projects/page.tsx      # Project CRUD
│   └── blog/page.tsx          # Blog editor
├── api/
│   ├── auth/[...nextauth]/    # NextAuth routes
│   ├── projects/route.ts      # Project API
│   ├── upload/route.ts        # S3 upload endpoint
│   ├── chat/route.ts          # Chatbot endpoint
│   └── embeddings/route.ts    # RAG update endpoint
└── blog/[slug]/page.tsx       # Blog post pages

components/
├── ProjectGrid.tsx            # Netflix-style grid layout
├── ProjectCard.tsx            # Hover preview logic
├── VideoPlayer.tsx            # Auto-play video component
├── Chatbot/
│   ├── ChatWidget.tsx
│   ├── DecisionTree.tsx
│   └── AIChat.tsx
└── Admin/
    ├── ProjectForm.tsx
    ├── MediaUploader.tsx      # S3 drag-drop upload
    └── MetadataBuilder.tsx    # Dynamic metadata fields

lib/
├── prisma.ts                  # Prisma client
├── s3.ts                      # AWS S3 utilities
├── openai.ts                  # OpenAI client
├── rag.ts                     # RAG pipeline functions
└── chatbot-tree.json          # Decision tree configuration
```

## Key Database Models

- **Project**: Core project entity with flexible metadata (JSONB)
- **Media**: Associated videos/images with S3 URLs
- **BlogPost**: Blog content with markdown support
- **ChatConversation**: Persistent chat sessions
- **KnowledgeBase**: RAG embeddings with pgvector

## Development Commands

```bash
# Development
npm install
npx prisma migrate dev
npm run dev

# Production build
npm run build
npm start

# Database operations
npx prisma studio
npx prisma migrate deploy
```

## Critical Implementation Details

### Netflix-Style Hover Preview

- Video auto-play on hover with Framer Motion scaling
- Mobile tap-to-preview fallback
- Performance optimization for video loading

### Dynamic Metadata System

- JSONB field in Project model allows flexible field types
- Admin interface dynamically renders metadata forms
- Supports tech stack, duration, client, and custom fields

### Dual-Mode Chatbot

- Decision tree mode: JSON-configured conversation flows
- AI mode: RAG-enhanced responses using embedded knowledge base
- Seamless switching between modes during conversation

### RAG Pipeline

- PostgreSQL pgvector for similarity search
- OpenAI embeddings for knowledge base content
- Context-aware AI responses using retrieved documents

### AWS Integration

- S3 for media storage with CloudFront CDN
- RDS PostgreSQL with pgvector extension
- EC2 deployment with PM2 process management

## Security & Performance Considerations

- NextAuth.js for secure admin authentication
- Rate limiting on API routes
- Input validation and XSS protection
- S3 CORS configuration for secure uploads
- Performance target: <3s page load times
- Mobile-first responsive design

## Implementation Phases

### Phase 1: Core Layout & Foundation

- Next.js 14 setup with TypeScript, Tailwind CSS, shadcn/ui
- Netflix-style grid layout with placeholder content
- Basic ProjectGrid and ProjectCard components
- SQLite database with Prisma

### Phase 2: Database & CRUD System

- NextAuth.js email/password authentication
- Protected admin routes and basic dashboard
- Simple project CRUD operations
- Local media storage

### Phase 3: AWS Integration

- AWS CLI configuration and setup
- PostgreSQL RDS with pgvector extension
- S3 media storage and upload functionality
- Database migration from SQLite to PostgreSQL

### Phase 4: Advanced Features

- Video auto-play and hover animations
- Dual-mode chatbot system
- Blog functionality
- Dynamic metadata system
- Performance optimizations

## Environment Setup

**Phase 1**: Local development with SQLite
**Phase 3**: AWS RDS (PostgreSQL with pgvector), S3 bucket
**Phase 4**: OpenAI API key for chatbot functionality
