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
      console.error('Failed to extract MBTI type after all attempts. OpenAI API key:', openaiKey);
      console.error('File size:', buffer.length, 'bytes');
      console.error('File name:', file.name);
      
      return NextResponse.json({ 
        error: 'Could not extract MBTI type from PDF. Please ensure the PDF contains your MBTI personality type (e.g., ENFJ, INFP, etc.). If your PDF is a scanned image or has complex formatting, AI extraction may be required (OpenAI API key: ' + openaiKey + ').',
        details: 'The PDF was processed but no MBTI type was found. Please check that your PDF contains the MBTI result clearly visible in the text.'
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
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to process PDF';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `API error: ${error.response.status} - ${error.response.statusText}`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'An error occurred while processing your PDF. Please ensure the file is a valid PDF and try again.'
      },
      { status: 500 }
    );
  }
}

async function extractMBTITypeFromPDF(buffer: Buffer): Promise<string | null> {
  try {
    // Extract text from PDF using direct UTF-8 conversion
    // This works for some PDFs that contain text (not scanned images)
    // Note: This is a basic approach. For complex PDFs, a proper PDF parser is needed.
    let text = '';
    
    try {
      text = buffer.toString('utf-8');
      console.log('Basic extraction: extracted text length:', text.length);
      
      // Check if this looks like raw PDF binary data (starts with %PDF)
      if (text.startsWith('%PDF')) {
        console.log('PDF detected, extracting text from PDF structure...');
        
        // Try multiple extraction methods for PDFs
        let extractedTexts: string[] = [];
        
        // Method 1: Extract text from PDF text objects (text)
        const textObjects = text.match(/\((.*?)\)/g) || [];
        const textFromObjects = textObjects
          .map(match => {
            // Remove parentheses and decode PDF escape sequences
            let decoded = match.replace(/[()]/g, '');
            // Decode PDF escape sequences like \n, \r, etc.
            decoded = decoded.replace(/\\(.)/g, (_, char) => {
              if (char === 'n') return '\n';
              if (char === 'r') return '\r';
              if (char === 't') return '\t';
              return char;
            });
            return decoded;
          })
          .filter(t => t.length > 0 && /[A-Za-z0-9]/.test(t))
          .join(' ');
        
        if (textFromObjects.length > 50) {
          extractedTexts.push(textFromObjects);
          console.log('Method 1: Extracted', textFromObjects.length, 'characters from text objects');
        }
        
        // Method 2: Extract text from bracket arrays [text]
        const bracketArrays = text.match(/\[(.*?)\]/g) || [];
        const textFromBrackets = bracketArrays
          .map(match => match.replace(/[\[\]]/g, ''))
          .filter(t => t.length > 0 && /[A-Za-z0-9]/.test(t))
          .join(' ');
        
        if (textFromBrackets.length > 50) {
          extractedTexts.push(textFromBrackets);
          console.log('Method 2: Extracted', textFromBrackets.length, 'characters from bracket arrays');
        }
        
        // Method 3: Look for readable text sequences (consecutive letters/numbers)
        // This catches text that might be encoded differently
        const readableSequences = text.match(/[A-Za-z]{3,}/g) || [];
        const textFromSequences = readableSequences
          .filter(seq => seq.length >= 3)
          .join(' ');
        
        if (textFromSequences.length > 100) {
          extractedTexts.push(textFromSequences);
          console.log('Method 3: Extracted', textFromSequences.length, 'characters from readable sequences');
        }
        
        // Combine all extracted texts
        if (extractedTexts.length > 0) {
          // Combine and deduplicate
          const combinedText = extractedTexts.join(' ');
          // Remove excessive whitespace
          text = combinedText.replace(/\s+/g, ' ').trim();
          
          if (text.length > 50) {
            console.log('Basic extraction: Combined extracted text length:', text.length);
            console.log('First 500 characters:', text.substring(0, 500));
          } else {
            console.log('Basic extraction: PDF appears to be binary or scanned, readable text too short');
            return null;
          }
        } else {
          console.log('Basic extraction: Could not extract readable text from PDF');
          return null;
        }
      }
      
      if (text.length < 100) {
        console.log('Basic extraction: text is very short, PDF might be binary or scanned');
        return null;
      }
    } catch (e) {
      console.error('Error converting PDF buffer to text:', e);
      return null;
    }

    // Valid MBTI types (4 letters only, without -T/-A suffix)
    const validMBTITypes = [
      'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
      'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
      'INFJ', 'INFP', 'INTJ', 'INTP',
      'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
    ];

    // Look for MBTI type patterns in the PDF text
    // Common patterns from 16personalities.com and other sources:
    // - "ISFP-T", "ISFP-A" (with suffix)
    // - "Adventurer (ISFP-T)"
    // - "ISFP (Adventurer)"
    // - "Your type is ENFJ"
    // - "Personality type: ENFJ"
    // - "ISFP-T - Adventurer"
    const mbtiPatterns = [
      // Pattern for "Adventurer (ISFP-T)" - most common in 16personalities
      /(?:Adventurer|Architect|Advocate|Commander|Debater|Entertainer|Entrepreneur|Executive|Logician|Mediator|Protagonist|Virtuoso|Campaigner|Consul|Defender|Logistician)\s*\(([EI][NS][FT][JP])[- ]?[TA]?\)/i,
      // Pattern: "ISFP-T" or "ISFP-A" (with optional suffix, standalone)
      /\b([EI][NS][FT][JP])[- ]?[TA]\b/i,
      // Pattern: "ISFP (Adventurer)" - reversed format
      /\b([EI][NS][FT][JP])[- ]?[TA]?\s*\([^)]+\)/i,
      // Pattern with parentheses: "(ISFP-T)" or "(ISFP)"
      /\(([EI][NS][FT][JP])[- ]?[TA]?\)/i,
      // Pattern with type label: "Your type is ISFP-T" or "Personality type: ISFP"
      /(?:type|personality|mbti|your\s+type|personality\s+type)[\s:]*([EI][NS][FT][JP])[- ]?[TA]?/i,
      // Pattern: "Your type is ENFJ" or "Personality type: ENFJ"
      /(?:you\s+are|your\s+type\s+is|personality\s+type|your\s+personality)[\s:]*([EI][NS][FT][JP])[- ]?[TA]?/i,
      // Pattern: "result: ISFP" or "outcome: ENFJ"
      /(?:result|outcome)[\s:]*([EI][NS][FT][JP])[- ]?[TA]?/i,
      // Pattern: "ISFP-T - Adventurer" format
      /\b([EI][NS][FT][JP])[- ]?[TA]?\s*[-–]\s*[A-Za-z]+/i,
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
    // This will match "ISFP-T" as "ISFP" due to word boundary
    for (const type of validMBTITypes) {
      // Match type with optional -T or -A suffix
      const regex = new RegExp(`\\b${type}[- ]?[TA]?\\b`, 'i');
      const match = text.match(regex);
      if (match) {
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
    
    console.log('Text-based AI extraction failed, trying Files API with Chat Completions...');

    // If text extraction fails, try using OpenAI Files API with Chat Completions
    // Upload PDF file and use file_id in Chat Completions
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    let file: any = null;

    try {
      // Upload the PDF file to OpenAI Files API
      console.log('Uploading PDF to OpenAI Files API...');
      const uint8Array = new Uint8Array(buffer);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      file = await openai.files.create({
        file: new File([blob], 'mbti-result.pdf', { type: 'application/pdf' }),
        purpose: 'assistants',
      });

      console.log('File uploaded, ID:', file.id);

      // Check file status - OpenAI Files API returns 'uploaded' or 'processed' or 'error'
      // For PDFs, files are usually immediately available, but we check anyway
      let fileStatus = await openai.files.retrieve(file.id);
      console.log('File status after upload:', fileStatus.status);
      console.log('File details:', {
        id: fileStatus.id,
        bytes: fileStatus.bytes,
        created_at: fileStatus.created_at,
        filename: fileStatus.filename,
        purpose: fileStatus.purpose
      });

      // If file is not processed yet, wait a bit (though this is rare)
      if (fileStatus.status === 'uploaded') {
        console.log('File is uploaded but not yet processed, waiting...');
        // Wait a moment for processing (usually instant for PDFs)
        await new Promise(resolve => setTimeout(resolve, 2000));
        fileStatus = await openai.files.retrieve(file.id);
        console.log('File status after wait:', fileStatus.status);
      }

      if (fileStatus.status === 'error') {
        console.error('File upload failed with error status');
        try {
          await openai.files.del(file.id);
        } catch (e) {
          console.log('Error deleting failed file:', e);
        }
        return null;
      }
      
      if (fileStatus.status !== 'processed') {
        console.warn('File status is not "processed":', fileStatus.status);
        // Continue anyway, might still work
      }

      // Use Assistants API with file_search to extract MBTI type
      // Create assistant with file_search capability
      const assistant = await openai.beta.assistants.create({
        name: 'MBTI Extractor',
        instructions: `You are an expert at extracting MBTI personality types from documents. Your task is to find the MBTI personality type in the provided PDF document.

The MBTI type is always a 4-letter code consisting of:
- First letter: E (Extraversion) or I (Introversion)
- Second letter: N (Intuition) or S (Sensing)
- Third letter: F (Feeling) or T (Thinking)
- Fourth letter: J (Judging) or P (Perceiving)

Valid MBTI types are: ENFJ, ENFP, ENTJ, ENTP, ESFJ, ESFP, ESTJ, ESTP, INFJ, INFP, INTJ, INTP, ISFJ, ISFP, ISTJ, ISTP

Look for:
- "Your type is [TYPE]"
- "Personality type: [TYPE]"
- "MBTI type: [TYPE]"
- "Your MBTI: [TYPE]"
- Any 4-letter code matching the pattern above
- Results sections, summary sections, or conclusion sections

IMPORTANT: Return ONLY the 4-letter MBTI type code in uppercase (e.g., "ENFJ" or "INFP"). Do not include any explanation, punctuation, or additional text. If you cannot find a valid MBTI type after thoroughly searching the document, return exactly "NOT_FOUND".`,
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: {
            vector_store_ids: [],
          },
        },
      });

      // Create thread with file attached
      const thread = await openai.beta.threads.create({
        messages: [
        {
          role: 'user',
          content: `I need you to extract the MBTI personality type from this PDF document. 

Please search through the entire document carefully. Look for:
- Results sections or summary sections
- Any mention of "MBTI", "personality type", "your type", "Adventurer", or similar phrases
- Any 4-letter code that matches the MBTI pattern (E/I, N/S, F/T, J/P)
- The type may appear with a suffix like "-T" (Turbulent) or "-A" (Assertive), e.g., "ISFP-T" or "ENFJ-A"
- Common formats: "ISFP-T", "Adventurer (ISFP-T)", "ISFP (Adventurer)", "Your type is ENFJ"

The MBTI type will be one of these 16 types (ignore the -T/-A suffix):
ENFJ, ENFP, ENTJ, ENTP, ESFJ, ESFP, ESTJ, ESTP, INFJ, INFP, INTJ, INTP, ISFJ, ISFP, ISTJ, ISTP

IMPORTANT: Return ONLY the 4-letter code in uppercase (e.g., "ISFP" not "ISFP-T"). Ignore any suffix like -T or -A.
If you cannot find a valid MBTI type, return "NOT_FOUND".`,
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
        if (attempts % 5 === 0) {
          console.log(`Waiting for assistant run... attempt ${attempts}/30, status: ${runStatus.status}`);
        }
      }

      if (runStatus.status !== 'completed') {
        console.error('Assistants API run did not complete, status:', runStatus.status);
        if (runStatus.status === 'failed') {
          console.error('Run failed with error:', JSON.stringify(runStatus.last_error, null, 2));
        }
        if (runStatus.status === 'requires_action') {
          console.error('Run requires action:', JSON.stringify(runStatus.required_action, null, 2));
        }
        // Clean up
        try {
          await openai.beta.assistants.del(assistant.id);
        } catch (e) {
          console.log('Error cleaning up assistant:', e);
        }
        try {
          await openai.files.del(file.id);
        } catch (e) {
          console.log('Error cleaning up file:', e);
        }
        return null;
      }
      
      console.log('Assistants API run completed successfully');

      // Get the response
      const messages = await openai.beta.threads.messages.list(thread.id);
      console.log('Total messages in thread:', messages.data.length);
      
      let extractedType = null;
      
      // Check all assistant messages (they come first in the list)
      for (const message of messages.data) {
        if (message.role === 'assistant' && message.content && message.content.length > 0) {
          for (const contentItem of message.content) {
            if (contentItem.type === 'text') {
              const textValue = contentItem.text.value.trim();
              console.log('Assistant message content:', textValue);
              
              // Extract MBTI type from the response
              const upperText = textValue.toUpperCase();
              
              // First, try to find exact match
              const validMBTITypes = [
                'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
                'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
                'INFJ', 'INFP', 'INTJ', 'INTP',
                'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
              ];
              
              for (const type of validMBTITypes) {
                if (upperText.includes(type)) {
                  extractedType = type;
                  console.log('Found MBTI type in response:', extractedType);
                  break;
                }
              }
              
              // If not found, use the text as-is (might be just the type)
              if (!extractedType && upperText.length === 4) {
                // Check if it matches MBTI pattern
                const mbtiPattern = /^[EI][NS][FT][JP]$/;
                if (mbtiPattern.test(upperText)) {
                  extractedType = upperText;
                  console.log('Found MBTI type pattern match:', extractedType);
                }
              }
              
              if (extractedType) break;
            }
          }
          if (extractedType) break;
        }
      }

      console.log('OpenAI Assistants API extracted type:', extractedType);

      // Clean up resources
      try {
        await openai.beta.assistants.del(assistant.id);
      } catch (cleanupError) {
        console.log('Error cleaning up assistant:', cleanupError);
      }
      try {
        await openai.files.del(file.id);
      } catch (cleanupError) {
        // File might already be deleted, ignore error
        console.log('File cleanup note (may already be deleted):', cleanupError);
      }

      if (!extractedType || extractedType === 'NOT_FOUND') {
        console.log('OpenAI Assistants API did not find MBTI type in the document');
        console.log('This could mean:');
        console.log('1. The PDF is a scanned image (requires OCR)');
        console.log('2. The PDF does not contain the MBTI type');
        console.log('3. The MBTI type is in a format not recognized');
        return null;
      }
      
      console.log('Successfully extracted MBTI type via Assistants API:', extractedType);

      // Validate the extracted type
      const validMBTITypes = [
        'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
        'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
        'INFJ', 'INFP', 'INTJ', 'INTP',
        'ISFJ', 'ISFP', 'ISTJ', 'ISTP'
      ];

      if (validMBTITypes.includes(extractedType)) {
        console.log(`AI Chat Completions API successfully extracted MBTI type: ${extractedType}`);
        return extractedType;
      }

      // Try to extract from the response if it contains the type
      for (const type of validMBTITypes) {
        if (extractedType.includes(type)) {
          console.log(`AI extracted MBTI type from response: ${type}`);
          return type;
        }
      }

      console.log('OpenAI Chat Completions API returned invalid MBTI type:', extractedType);
      return null;
    } catch (error: any) {
      console.error('Error extracting MBTI type with AI Chat Completions API:', error.message);
      console.error('Error details:', error);
      // Try to clean up resources if they exist
      try {
        if (file?.id) {
          await openai.files.del(file.id);
        }
      } catch (cleanupError) {
        // File might already be deleted, ignore error
        console.log('File cleanup note (may already be deleted):', cleanupError);
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

