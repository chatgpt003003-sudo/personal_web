import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadFileToS3 } from '@/lib/s3';
import {
  createRateLimit,
  addSecurityHeaders,
  logSecurityEvent,
  validateOrigin,
  validateFile,
  FileValidationOptions,
} from '@/lib/security';

// Rate limiting: 10 uploads per 10 minutes
const uploadRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
});

// File validation configuration
const fileValidationOptions: FileValidationOptions = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
  allowedExtensions: [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'mp4',
    'webm',
    'ogg',
  ],
};

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = uploadRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Validate origin
    if (!validateOrigin(request)) {
      logSecurityEvent(
        'INVALID_ORIGIN',
        { endpoint: '/api/upload', method: 'POST' },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      logSecurityEvent(
        'UNAUTHORIZED_UPLOAD_ATTEMPT',
        { endpoint: '/api/upload' },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    // Parse form data
    let data;
    try {
      data = await request.formData();
    } catch (error) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid form data' },
          { status: 400 }
        )
      );
    }

    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      );
    }

    // Enhanced file validation
    const validation = validateFile(file, fileValidationOptions);
    if (!validation.isValid) {
      logSecurityEvent(
        'FILE_VALIDATION_FAILED',
        {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validation.error,
        },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      );
    }

    // Additional security checks
    const fileName = file.name;
    
    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.php$/i,
      /\.jsp$/i,
      /\.asp$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.sh$/i,
      /\.py$/i,
      /\.js$/i,
      /\.html$/i,
      /\.htm$/i,
      /\.\./,
      /^\.+/,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(fileName))) {
      logSecurityEvent(
        'SUSPICIOUS_FILE_NAME',
        { fileName, fileType: file.type },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'File name not allowed' },
          { status: 400 }
        )
      );
    }

    // Basic virus/malware detection (check file headers)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Check for common malicious file signatures
    const maliciousSignatures = [
      Buffer.from([0x4D, 0x5A]), // PE executable
      Buffer.from('#!/bin/sh'),   // Shell script
      Buffer.from('#!/bin/bash'), // Bash script
      Buffer.from('<?php'),       // PHP script
    ];

    for (const signature of maliciousSignatures) {
      if (buffer.subarray(0, signature.length).equals(signature)) {
        logSecurityEvent(
          'MALICIOUS_FILE_DETECTED',
          { fileName, signature: signature.toString('hex') },
          request.headers.get('x-forwarded-for') || '127.0.0.1'
        );
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'File contains malicious content' },
            { status: 400 }
          )
        );
      }
    }

    // Sanitize file name
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100); // Limit length

    if (!sanitizedFileName) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid file name after sanitization' },
          { status: 400 }
        )
      );
    }

    // Upload to S3
    const fileUrl = await uploadFileToS3(buffer, sanitizedFileName, file.type);

    logSecurityEvent(
      'FILE_UPLOADED',
      {
        fileName: sanitizedFileName,
        fileSize: file.size,
        fileType: file.type,
        userId: session.user?.id,
        fileUrl,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json({ url: fileUrl }, { status: 200 });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('File upload error:', error);
    logSecurityEvent(
      'UPLOAD_ERROR',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}