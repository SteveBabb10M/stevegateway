'use client';

import { useState, useCallback } from 'react';

const AI_INDICATORS = {
  phrases: [
    { text: "all things considered", weight: 3, tool: "ChatGPT" },
    { text: "taking everything into consideration", weight: 3, tool: "ChatGPT" },
    { text: "it's worth noting", weight: 2, tool: "ChatGPT" },
    { text: "it is important to note", weight: 2, tool: "ChatGPT" },
    { text: "in today's world", weight: 2, tool: "ChatGPT" },
    { text: "in conclusion", weight: 1, tool: "Generic" },
    { text: "multifaceted", weight: 2, tool: "ChatGPT" },
    { text: "delve into", weight: 3, tool: "ChatGPT" },
    { text: "navigate the complexities", weight: 3, tool: "ChatGPT" },
    { text: "foster a sense of", weight: 3, tool: "ChatGPT" },
    { text: "tapestry of", weight: 3, tool: "ChatGPT" },
    { text: "a testament to", weight: 2, tool: "ChatGPT" },
    { text: "pivotal role", weight: 2, tool: "ChatGPT" },
    { text: "nuanced understanding", weight: 2, tool: "ChatGPT" },
    { text: "myriad of", weight: 2, tool: "ChatGPT" },
    { text: "paramount importance", weight: 2, tool: "ChatGPT" },
    { text: "in the realm of", weight: 2, tool: "ChatGPT" },
    { text: "holistic approach", weight: 2, tool: "Generic" },
    { text: "multi-channel strategy", weight: 2, tool: "ChatGPT" },
    { text: "mission-driven", weight: 2, tool: "ChatGPT" },
    { text: "despite these challenges", weight: 2, tool: "ChatGPT" },
    { text: "notwithstanding", weight: 1, tool: "Generic" },
    { text: "leverage", weight: 1, tool: "Generic" },
    { text: "robust", weight: 1, tool: "Generic" },
    { text: "seamless", weight: 1, tool: "Generic" },
    { text: "cutting-edge", weight: 1, tool: "Generic" },
    { text: "synergy", weight: 2, tool: "Generic" },
    { text: "paradigm", weight: 2, tool: "ChatGPT" },
    { text: "in essence", weight: 2, tool: "ChatGPT" },
    { text: "ultimately", weight: 1, tool: "Generic" },
    { text: "it is worth mentioning", weight: 2, tool: "ChatGPT" },
    { text: "plays a crucial role", weight: 2, tool: "ChatGPT" },
    { text: "serve as a reminder", weight: 2, tool: "ChatGPT" },
    { text: "landscape", weight: 1, tool: "Generic" },
    { text: "ever-evolving", weight: 2, tool: "ChatGPT" },
    { text: "dynamic interplay", weight: 3, tool: "ChatGPT" },
  ],
};

export default function Home() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [studentContext, setStudentContext] = useState({
    level: 'gcse',
    ability: 'mid',
    subject: 'business',
    additionalNotes: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const extractTextFromDocx = async (arrayBuffer) => {
    // Dynamic import for mammoth (client-side only)
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const processFile = async (selectedFile) => {
    setError(null);
    setFile(selectedFile);
    setAnalysisResult(null);

    if (selectedFile.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const text = await extractTextFromDocx(arrayBuffer);
        setExtractedText(text);
      } catch (err) {
        console.error('Extraction error:', err);
        setError('Failed to extract text from document. Please ensure it is a valid .docx file.');
      }
    } else if (selectedFile.name.endsWith('.txt')) {
      const text = await selectedFile.text();
      setExtractedText(text);
    } else {
      setError('Please upload a .docx or .txt file');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const performLocalAnalysis = (text) => {
    const lowerText = text.toLowerCase();
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / sentences.length;
    
    const foundPhrases = [];
    let totalWeight = 0;
    
    AI_INDICATORS.phrases.forEach(indicator => {
      const regex = new RegExp(indicator.text, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        foundPhrases.push({
          ...indicator,
          count: matches.length
        });
        totalWeight += indicator.weight * matches.length;
      }
    });

    const complexWords = text.match(/\b\w{10,}\b/g) || [];
    const complexWordRatio = complexWords.length / wordCount;

    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
    const structuralUniformity = paragraphs.length > 3 ? 
      paragraphs.slice(0, -1).filter((p, i) => {
        const nextP = paragraphs[i + 1];
        const pLength = p.length;
        const nextLength = nextP?.length || 0;
        return Math.abs(pLength - nextLength) < pLength * 0.3;
      }).length / (paragraphs.length - 1) : 0;

    return {
      wordCount,
      sentenceCount: sentences.length,
      avgSentenceLength: avgSentenceLength.toFixed(1),
      foundPhrases: foundPhrases.sort((a, b) => b.weight - a.weight),
      totalIndicatorWeight: totalWeight,
      complexWordRatio: (complexWordRatio * 100).toFixed(1),
      structuralUniformity: (structuralUniformity * 100).toFixed(0),
      paragraphCount: paragraphs.length
    };
  };

  const analyzeWithAI = async () => {
    if (!extractedText) return;
    
    setIsAnalyzing(true);
    setError(null);

    const localAnalysis = performLocalAnalysis(extractedText);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          studentContext,
          localAnalysis
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult({
        ...data,
        localAnalysis,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback to local-only analysis
      setAnalysisResult({
        overallVerdict: localAnalysis.totalIndicatorWeight > 15 ? "Medium-High likelihood of AI assistance" : 
                        localAnalysis.totalIndicatorWeight > 8 ? "Medium likelihood of AI assistance" : 
                        "Low-Medium likelihood (requires manual review)",
        confidenceScore: Math.min(40 + localAnalysis.totalIndicatorWeight * 2, 75),
        summary: `AI-powered analysis unavailable (${err.message}). This assessment is based on automated pattern detection only and should be verified manually.`,
        likelyAITool: localAnalysis.foundPhrases.filter(p => p.tool === "ChatGPT").length > 2 ? "Possibly ChatGPT" : "Unknown",
        localAnalysis,
        limitedAnalysis: true,
        timestamp: new Date().toISOString(),
        redFlags: localAnalysis.foundPhrases.slice(0, 5).map(p => ({
          issue: `AI indicator phrase: "${p.text}"`,
          severity: p.weight >= 3 ? "High" : p.weight >= 2 ? "Medium" : "Low",
          explanation: `This phrase appeared ${p.count} time(s) and is commonly associated with ${p.tool}-generated content.`,
          examples: []
        })),
        recommendations: [
          "Conduct a verbal discussion with the student about their work",
          "Ask the student to explain specific claims or vocabulary choices",
          "Compare against known authentic samples from this student"
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getVerdictColor = (verdict) => {
    if (verdict?.toLowerCase().includes('high')) return '#dc2626';
    if (verdict?.toLowerCase().includes('medium')) return '#d97706';
    return '#059669';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Academic Integrity Analyzer
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            AI-powered originality assessment for student work
          </p>
        </div>

        {/* Upload Section */}
        <div className="card no-print">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            📄 Upload Student Work
          </h2>
          
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem' }}>
              {file ? file.name : 'Drop a .docx or .txt file here, or click to browse'}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Supported formats: Microsoft Word (.docx), Plain Text (.txt)
            </p>
          </div>

          {file && extractedText && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
              <p style={{ color: '#166534', fontWeight: 500 }}>
                ✓ Successfully extracted {extractedText.split(/\s+/).length.toLocaleString()} words from &quot;{file.name}&quot;
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <p style={{ color: '#dc2626' }}>⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Student Context */}
        <div className="card no-print">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            🎓 Student Context
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="label">Educational Level</label>
              <select 
                className="input-field"
                value={studentContext.level}
                onChange={(e) => setStudentContext({...studentContext, level: e.target.value})}
              >
                <option value="ks3">Key Stage 3</option>
                <option value="gcse">GCSE</option>
                <option value="btec-l2">BTEC Level 2</option>
                <option value="btec-l3">BTEC Level 3</option>
                <option value="alevel">A-Level</option>
                <option value="undergraduate">Undergraduate</option>
              </select>
            </div>
            
            <div>
              <label className="label">Expected Ability</label>
              <select 
                className="input-field"
                value={studentContext.ability}
                onChange={(e) => setStudentContext({...studentContext, ability: e.target.value})}
              >
                <option value="low">Lower ability</option>
                <option value="mid">Mid-range ability</option>
                <option value="high">High ability</option>
              </select>
            </div>
            
            <div>
              <label className="label">Subject</label>
              <input 
                type="text"
                className="input-field"
                value={studentContext.subject}
                onChange={(e) => setStudentContext({...studentContext, subject: e.target.value})}
                placeholder="e.g., Business Studies"
              />
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label className="label">Additional Notes (optional)</label>
            <textarea
              className="input-field"
              rows={2}
              value={studentContext.additionalNotes}
              onChange={(e) => setStudentContext({...studentContext, additionalNotes: e.target.value})}
              placeholder="Any additional context about the student or assignment..."
            />
          </div>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              className="btn-primary"
              onClick={analyzeWithAI}
              disabled={!extractedText || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="analyzing">⏳</span> Analyzing Document...
                </>
              ) : (
                <>🔍 Analyze for Originality</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {analysisResult && (
          <div id="results">
            {/* Verdict Card */}
            <div className="card" style={{ borderLeft: `4px solid ${getVerdictColor(analysisResult.overallVerdict)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>OVERALL ASSESSMENT</p>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: getVerdictColor(analysisResult.overallVerdict) }}>
                    {analysisResult.overallVerdict}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>CONFIDENCE</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                    {analysisResult.confidenceScore}%
                  </p>
                </div>
              </div>
              
              <div className="progress-bar" style={{ marginTop: '1rem' }}>
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${analysisResult.confidenceScore}%`,
                    background: getVerdictColor(analysisResult.overallVerdict)
                  }}
                />
              </div>
              
              <p style={{ marginTop: '1rem', color: '#475569', lineHeight: 1.6 }}>
                {analysisResult.summary}
              </p>
              
              {analysisResult.likelyAITool && analysisResult.likelyAITool !== "None detected" && (
                <p style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Suspected Tool: </span>
                  <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                    {analysisResult.likelyAITool}
                  </span>
                </p>
              )}
              
              {analysisResult.limitedAnalysis && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fefce8', borderRadius: '6px', border: '1px solid #fde047' }}>
                  <p style={{ color: '#854d0e', fontSize: '0.875rem' }}>
                    ⚠️ This analysis is based on pattern detection only. Full AI analysis was unavailable.
                  </p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                📊 Document Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Word Count', value: analysisResult.localAnalysis?.wordCount?.toLocaleString() },
                  { label: 'Sentences', value: analysisResult.localAnalysis?.sentenceCount },
                  { label: 'Avg. Sentence Length', value: `${analysisResult.localAnalysis?.avgSentenceLength} words` },
                  { label: 'Complex Word Ratio', value: `${analysisResult.localAnalysis?.complexWordRatio}%` },
                ].map((stat, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{stat.label}</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            {analysisResult.redFlags && analysisResult.redFlags.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#dc2626', marginBottom: '1rem' }}>
                  🚩 Red Flags Identified
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analysisResult.redFlags.map((flag, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        padding: '1rem', 
                        background: '#fef2f2', 
                        borderRadius: '8px',
                        borderLeft: `3px solid ${getSeverityColor(flag.severity)}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: 600, color: '#1e293b' }}>{flag.issue}</p>
                        <span className="badge" style={{ 
                          background: flag.severity === 'High' ? '#fee2e2' : flag.severity === 'Medium' ? '#fef3c7' : '#d1fae5',
                          color: getSeverityColor(flag.severity)
                        }}>
                          {flag.severity}
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.9rem' }}>{flag.explanation}</p>
                      {flag.examples && flag.examples.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                          {flag.examples.map((ex, j) => (
                            <p key={j} style={{ 
                              fontStyle: 'italic', 
                              color: '#64748b', 
                              fontSize: '0.85rem',
                              padding: '0.5rem',
                              background: 'white',
                              borderRadius: '4px',
                              marginTop: '0.25rem'
                            }}>
                              &quot;{ex}&quot;
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Analysis */}
            {analysisResult.sectionAnalysis && analysisResult.sectionAnalysis.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                  📑 Section-by-Section Analysis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analysisResult.sectionAnalysis.map((section, i) => (
                    <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: 600, color: '#1e293b' }}>{section.section}</p>
                        <span className="badge" style={{ 
                          background: section.verdict?.includes('Likely AI') ? '#fee2e2' : 
                                      section.verdict?.includes('Possibly') ? '#fef3c7' : '#d1fae5',
                          color: section.verdict?.includes('Likely AI') ? '#dc2626' : 
                                 section.verdict?.includes('Possibly') ? '#d97706' : '#059669'
                        }}>
                          {section.verdict}
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.9rem' }}>{section.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authentic Elements */}
            {analysisResult.authenticElements && analysisResult.authenticElements.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#059669', marginBottom: '1rem' }}>
                  ✓ Authentic Elements Detected
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                  {analysisResult.authenticElements.map((elem, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>{elem}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations & Questions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                    💡 Recommendations
                  </h3>
                  <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                    {analysisResult.recommendations.map((rec, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                    ))}
                  </ol>
                </div>
              )}

              {analysisResult.questionsForStudent && analysisResult.questionsForStudent.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                    ❓ Questions for the Student
                  </h3>
                  <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                    {analysisResult.questionsForStudent.map((q, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{q}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              <p>Report generated: {new Date(analysisResult.timestamp).toLocaleString()}</p>
              <p style={{ marginTop: '0.25rem' }}>
                This tool provides indicators only. Always use professional judgment and follow your institution&apos;s academic integrity policies.
              </p>
              <button 
                className="no-print"
                onClick={() => window.print()}
                style={{
                  marginTop: '1rem',
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                🖨️ Print Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
