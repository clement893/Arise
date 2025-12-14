import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF to extract MBTI type
    // We'll use a simple text extraction approach
    // For production, you might want to use pdf-parse or pdfjs-dist
    const mbtiType = await extractMBTITypeFromPDF(buffer);

    if (!mbtiType) {
      return NextResponse.json({ error: 'Could not extract MBTI type from PDF. Please ensure the PDF contains your MBTI personality type (e.g., ENFJ, INFP, etc.)' }, { status: 400 });
    }

    // Validate MBTI type format (4 letters: E/I, N/S, F/T, J/P)
    const validMBTITypes = [
      'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
      'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
      'INFJ', 'INFP', 'INTJ', 'INTP',
      'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
    ];

    if (!validMBTITypes.includes(mbtiType.toUpperCase())) {
      return NextResponse.json({ error: `Invalid MBTI type: ${mbtiType}. Please ensure your PDF contains a valid MBTI type.` }, { status: 400 });
    }

    // Save or update MBTI assessment result
    const assessmentResult = await prisma.assessmentResult.upsert({
      where: {
        userId_assessmentType: {
          userId: user.id,
          assessmentType: 'mbti',
        },
      },
      update: {
        dominantResult: mbtiType.toUpperCase(),
        completedAt: new Date(),
        answers: { source: 'pdf_upload', uploadedAt: new Date().toISOString() },
      },
      create: {
        userId: user.id,
        assessmentType: 'mbti',
        dominantResult: mbtiType.toUpperCase(),
        answers: { source: 'pdf_upload', uploadedAt: new Date().toISOString() },
        scores: {},
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      mbtiType: mbtiType.toUpperCase(),
      message: `MBTI type ${mbtiType.toUpperCase()} successfully imported from PDF`,
    });
  } catch (error: any) {
    console.error('Error uploading MBTI PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

async function extractMBTITypeFromPDF(buffer: Buffer): Promise<string | null> {
  try {
    // Try to extract text from PDF using multiple methods
    let text = '';
    
    // Method 1: Direct UTF-8 conversion (works for some PDFs)
    try {
      text = buffer.toString('utf-8');
    } catch (e) {
      // Continue to other methods
    }

    // Method 2: Try to use pdf-parse if available (dynamic import)
    try {
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(buffer);
      text = data.text;
    } catch (e) {
      // pdf-parse not available or failed, continue with text extraction
      console.log('pdf-parse not available, using basic extraction');
    }

    // Valid MBTI types
    const validMBTITypes = [
      'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
      'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
      'INFJ', 'INFP', 'INTJ', 'INTP',
      'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
    ];

    // Look for MBTI type patterns in the PDF text
    // Common patterns: "ENFJ", "Your type is ENFJ", "Personality type: ENFJ", etc.
    const mbtiPatterns = [
      /(?:type|personality|mbti)[\s:]*([EI][NS][FT][JP])/i,
      /(?:you are|your type is|personality type|your personality)[\s:]*([EI][NS][FT][JP])/i,
      /([EI][NS][FT][JP])/g,
      /(?:result|outcome)[\s:]*([EI][NS][FT][JP])/i,
    ];

    // First, try to find exact matches with context
    for (const pattern of mbtiPatterns) {
      const matches = text.match(pattern);
      if (matches && matches[1]) {
        const foundType = matches[1].toUpperCase();
        if (validMBTITypes.includes(foundType)) {
          return foundType;
        }
      }
    }

    // If no contextual match, search for any valid MBTI type in the text
    for (const type of validMBTITypes) {
      const regex = new RegExp(`\\b${type}\\b`, 'i');
      if (regex.test(text)) {
        return type;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting MBTI type from PDF:', error);
    return null;
  }
}

