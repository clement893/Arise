import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

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
    // First try basic extraction, then fallback to AI if needed
    console.log('Starting MBTI extraction from PDF, file size:', buffer.length, 'bytes');
    let mbtiType = await extractMBTITypeFromPDF(buffer);

    // If basic extraction fails, try AI extraction
    if (!mbtiType) {
      console.log('Basic extraction failed, trying AI extraction...');
      mbtiType = await extractMBTITypeWithAI(buffer, file.name);
    }

    if (!mbtiType) {
      const openaiKey = process.env.OPENAI_API_KEY ? 'configured' : 'not configured';
      console.error('Failed to extract MBTI type. OpenAI API key:', openaiKey);
      return NextResponse.json({ 
        error: 'Could not extract MBTI type from PDF. Please ensure the PDF contains your MBTI personality type (e.g., ENFJ, INFP, etc.). If your PDF is a scanned image or has complex formatting, AI extraction may be required (OpenAI API key: ' + openaiKey + ').' 
      }, { status: 400 });
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
    // Extract text from PDF using direct UTF-8 conversion
    // This works for most PDFs that contain text (not scanned images)
    let text = '';
    
    try {
      text = buffer.toString('utf-8');
      console.log('Basic extraction: extracted text length:', text.length);
      if (text.length < 100) {
        console.log('Basic extraction: text is very short, PDF might be binary or scanned');
        console.log('First 200 chars:', text.substring(0, 200));
      }
    } catch (e) {
      console.error('Error converting PDF buffer to text:', e);
      return null;
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
      /(?:result|outcome)[\s:]*([EI][NS][FT][JP])/i,
    ];

    // First, try to find exact matches with context (more reliable)
    for (const pattern of mbtiPatterns) {
      const matches = text.match(pattern);
      if (matches && matches[1]) {
        const foundType = matches[1].toUpperCase();
        if (validMBTITypes.includes(foundType)) {
          console.log('Basic extraction: found MBTI type with pattern:', foundType);
          return foundType;
        }
      }
    }

    // If no contextual match, search for any valid MBTI type in the text
    // Use word boundaries to avoid partial matches
    for (const type of validMBTITypes) {
      const regex = new RegExp(`\\b${type}\\b`, 'i');
      if (regex.test(text)) {
        console.log('Basic extraction: found MBTI type without context:', type);
        return type;
      }
    }

    console.log('Basic extraction: no MBTI type found in PDF text');
    return null;
  } catch (error) {
    console.error('Error extracting MBTI type from PDF:', error);
    return null;
  }
}

async function extractMBTITypeWithAI(buffer: Buffer, fileName: string): Promise<string | null> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('OpenAI API key not configured, skipping AI extraction');
      console.log('To enable AI extraction, set OPENAI_API_KEY environment variable');
      return null;
    }

    console.log('OpenAI API key found, attempting AI extraction...');
    
    // Try text-based extraction first (cheaper and faster)
    console.log('Trying text-based AI extraction...');
    const textResult = await extractMBTITypeWithAIText(buffer);
    if (textResult) {
      console.log('Text-based AI extraction succeeded:', textResult);
      return textResult;
    }
    
    console.log('Text-based AI extraction failed, trying Files/Assistants API...');

    // If text extraction fails, try using OpenAI Files API
    // Note: OpenAI Vision API doesn't support PDFs directly, so we'll use Files/Assistants API
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    let file: any = null;
    let assistant: any = null;
    let thread: any = null;

    try {
      // Try using OpenAI Files API to extract text from PDF
      // First, upload the file
      console.log('Uploading PDF to OpenAI Files API...');
      file = await openai.files.create({
        file: new File([buffer], 'mbti-result.pdf', { type: 'application/pdf' }),
        purpose: 'assistants',
      });

      console.log('File uploaded, ID:', file.id);

      // Use Assistants API with file search to extract MBTI type
      assistant = await openai.beta.assistants.create({
        name: 'MBTI Extractor',
        instructions: 'You are an expert at extracting MBTI personality types from documents. Extract the MBTI personality type (one of: ENFJ, ENFP, ENTJ, ENTP, ESFJ, ESFP, ESTJ, ESTP, INFJ, INFP, INTJ, INTP, ISFJ, ISFP, ISTJ, ISTP) from the provided document. Return ONLY the 4-letter MBTI type code in uppercase, nothing else. If you cannot find a valid MBTI type, return "NOT_FOUND".',
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
      });

      thread = await openai.beta.threads.create({
        messages: [
          {
            role: 'user',
            content: 'Please extract the MBTI personality type from this PDF document. Look for phrases like "Your type is", "Personality type", "MBTI type", or any mention of a 4-letter code like ENFJ, INFP, etc. Return ONLY the 4-letter code in uppercase.',
            attachments: [
              {
                file_id: file.id,
                tools: [{ type: 'file_search' }],
              },
            ],
          },
        ],
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      // Wait for completion
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      let attempts = 0;
      while (runStatus.status !== 'completed' && runStatus.status !== 'failed' && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        attempts++;
      }

      if (runStatus.status !== 'completed') {
        console.log('OpenAI Assistants API run did not complete, status:', runStatus.status);
        if (runStatus.status === 'failed') {
          console.log('Run failed with error:', runStatus.last_error);
        }
        return null;
      }

      // Get the response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];
      let extractedType = null;
      
      if (lastMessage.content && lastMessage.content.length > 0) {
        const content = lastMessage.content[0];
        if (content.type === 'text') {
          extractedType = content.text.value.trim().toUpperCase();
        }
      }

      // Clean up files and assistant
      await openai.files.del(file.id);
      await openai.beta.assistants.del(assistant.id);

      console.log('OpenAI Assistants API response:', extractedType);

      if (!extractedType || extractedType === 'NOT_FOUND') {
        console.log('OpenAI Assistants API did not find MBTI type');
        return null;
      }

      // Validate the extracted type
      const validMBTITypes = [
        'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
        'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
        'INFJ', 'INFP', 'INTJ', 'INTP',
        'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
      ];

      if (validMBTITypes.includes(extractedType)) {
        console.log(`AI Assistants API successfully extracted MBTI type: ${extractedType}`);
        return extractedType;
      }

      // Try to extract from the response if it contains the type
      for (const type of validMBTITypes) {
        if (extractedType.includes(type)) {
          console.log(`AI extracted MBTI type from response: ${type}`);
          return type;
        }
      }

      console.log('OpenAI Assistants API returned invalid MBTI type:', extractedType);
      return null;
    } catch (error: any) {
      console.error('Error extracting MBTI type with AI Assistants API:', error.message);
      console.error('Error details:', error);
      // Try to clean up resources if they exist
      try {
        if (file?.id) await openai.files.del(file.id);
        if (assistant?.id) await openai.beta.assistants.del(assistant.id);
      } catch (cleanupError) {
        console.error('Error cleaning up resources:', cleanupError);
      }
      return null;
    }
  } catch (error: any) {
    console.error('Error in extractMBTITypeWithAI:', error.message);
    return null;
  }
}

async function extractMBTITypeWithAIText(buffer: Buffer): Promise<string | null> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return null;
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Convert PDF buffer to text (basic UTF-8 conversion)
    const text = buffer.toString('utf-8');
    console.log('Extracted text length:', text.length, 'characters');
    console.log('First 500 characters of text:', text.substring(0, 500));
    
    // Limit text length to avoid token limits (first 8000 characters should be enough)
    const limitedText = text.substring(0, 8000);

    console.log('Calling OpenAI API for text extraction...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cheaper model for text extraction
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting MBTI personality types from text. Extract the MBTI personality type (one of: ENFJ, ENFP, ENTJ, ENTP, ESFJ, ESFP, ESTJ, ESTP, INFJ, INFP, INTJ, INTP, ISFJ, ISFP, ISTJ, ISTP) from the provided text. Return ONLY the 4-letter MBTI type code in uppercase, nothing else. If you cannot find a valid MBTI type, return "NOT_FOUND".'
        },
        {
          role: 'user',
          content: `Please extract the MBTI personality type from this text:\n\n${limitedText}\n\nLook for phrases like "Your type is", "Personality type", "MBTI type", or any mention of a 4-letter code like ENFJ, INFP, etc. Return ONLY the 4-letter code in uppercase.`
        }
      ],
      max_tokens: 10,
    });

    const extractedType = response.choices[0]?.message?.content?.trim().toUpperCase();
    console.log('OpenAI response:', extractedType);

    if (!extractedType || extractedType === 'NOT_FOUND') {
      console.log('OpenAI did not find MBTI type in text');
      return null;
    }

    // Validate the extracted type
    const validMBTITypes = [
      'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
      'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
      'INFJ', 'INFP', 'INTJ', 'INTP',
      'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
    ];

    if (validMBTITypes.includes(extractedType)) {
      console.log(`AI text extraction successfully extracted MBTI type: ${extractedType}`);
      return extractedType;
    }

    console.log('OpenAI returned invalid MBTI type:', extractedType);
    return null;
  } catch (error: any) {
    console.error('Error extracting MBTI type with AI text:', error.message);
    console.error('Error details:', error);
    return null;
  }
}

