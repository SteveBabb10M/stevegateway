import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, studentContext, localAnalysis } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured. Please add ANTHROPIC_API_KEY to environment variables.' 
      }, { status: 500 });
    }

    const levelMap = {
      'ks3': 'Key Stage 3 (ages 11-14)',
      'gcse': 'GCSE (ages 14-16)',
      'btec-l2': 'BTEC Level 2',
      'btec-l3': 'BTEC Level 3 / A-Level equivalent',
      'alevel': 'A-Level',
      'undergraduate': 'Undergraduate degree'
    };

    const abilityMap = {
      'low': 'lower ability / struggling',
      'mid': 'mid-range ability',
      'high': 'high ability / gifted'
    };

    const systemPrompt = `You are an expert educational assessor specializing in detecting AI-generated content in student work. You have extensive experience with student writing at all levels and can identify the telltale signs of AI assistance.

Your task is to analyze student work and provide a detailed originality assessment. Be specific, cite exact phrases from the text, and explain your reasoning clearly.

IMPORTANT: Respond ONLY with valid JSON matching this exact structure:
{
  "overallVerdict": "High/Medium/Low likelihood of AI assistance",
  "confidenceScore": 0-100,
  "summary": "2-3 sentence summary",
  "likelyAITool": "ChatGPT/Claude/Gemini/Unknown/None detected",
  "sectionAnalysis": [
    {
      "section": "Section name",
      "verdict": "Likely AI/Possibly AI/Likely authentic",
      "reasoning": "Explanation",
      "specificEvidence": ["quote 1", "quote 2"]
    }
  ],
  "redFlags": [
    {
      "issue": "Issue name",
      "severity": "High/Medium/Low",
      "explanation": "Details",
      "examples": ["example 1"]
    }
  ],
  "authenticElements": ["Element 1", "Element 2"],
  "vocabularyAnalysis": {
    "concerningPhrases": ["phrase 1"],
    "sophisticationMismatch": true/false,
    "explanation": "Details"
  },
  "structuralAnalysis": {
    "formulaicPatterns": true/false,
    "explanation": "Details"
  },
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "questionsForStudent": ["Question 1", "Question 2"]
}`;

    const userPrompt = `Please analyze this student work for originality and potential AI assistance.

STUDENT CONTEXT:
- Educational Level: ${levelMap[studentContext?.level] || 'Not specified'}
- Expected Ability: ${abilityMap[studentContext?.ability] || 'Not specified'}
- Subject: ${studentContext?.subject || 'Not specified'}
${studentContext?.additionalNotes ? `- Additional Notes: ${studentContext.additionalNotes}` : ''}

PRELIMINARY ANALYSIS (automated):
- Word count: ${localAnalysis?.wordCount || 'Unknown'}
- Average sentence length: ${localAnalysis?.avgSentenceLength || 'Unknown'} words
- Complex word ratio: ${localAnalysis?.complexWordRatio || 'Unknown'}%
- Structural uniformity: ${localAnalysis?.structuralUniformity || 'Unknown'}%
- AI indicator phrases found: ${localAnalysis?.foundPhrases?.map(p => `"${p.text}" (×${p.count})`).join(', ') || 'None'}

STUDENT WORK:
---
${text.slice(0, 12000)}
${text.length > 12000 ? '\n[Document truncated for analysis - full document is ' + (localAnalysis?.wordCount || 'many') + ' words]' : ''}
---

Provide your analysis as JSON only.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to analyze document. Please try again.' 
      }, { status: response.status });
    }

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      let jsonText = data.content[0].text;
      // Clean up potential markdown formatting
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const analysis = JSON.parse(jsonText);
        return NextResponse.json(analysis);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json({ 
          error: 'Failed to parse analysis results.' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Server error occurred. Please try again.' 
    }, { status: 500 });
  }
}
