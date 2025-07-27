import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, BookOpen, Clock, Target, Lightbulb, Code, Moon, Sun, RefreshCw, Copy, Check } from 'lucide-react';

const EditorialPage = ({ user }) => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [editorial, setEditorial] = useState(null);
    const [problemInfo, setProblemInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // Auto-generate editorial when component loads
    useEffect(() => {
        if (problemId) {
            generateEditorial();
        }
    }, [problemId]);

    const generateEditorial = async () => {
        const PERPLEXITY_API_KEY = "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";
        
        if (!PERPLEXITY_API_KEY) {
            setError('Please add your actual Perplexity API key.');
            return;
        }

        setLoading(true);
        setError(null);
        setProblemInfo(null);
        
        try {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "sonar-pro",
                    messages: [{
                        role: "user",
                        content: `I need you to generate a comprehensive editorial for LeetCode problem ${problemId}. 

First, identify and provide the basic information about this problem:
- Problem name/title
- Difficulty level (Easy/Medium/Hard)
- Main topics/tags
- Problem description

Then generate a detailed editorial with:

1. **Problem Analysis** - Break down what the problem is asking
2. **Approach & Algorithm** - Detailed explanation of the solution strategy  
3. **Step-by-step Solution** - Clear implementation steps
4. **Time & Space Complexity** - Big O analysis
5. **Java Code Implementation** - Clean, commented Java code with proper class structure
6. **Example Walkthrough** - Trace through with sample input
7. **Edge Cases** - Important considerations
8. **Alternative Approaches** - Other ways to solve this problem

Please format the response clearly with headings and code blocks. Make it interview-preparation friendly. Use Java for all code examples.

Start your response with the problem information in this exact format:
PROBLEM_INFO:
Title: [Problem Name]
Difficulty: [Easy/Medium/Hard]
Topics: [Topic1, Topic2, Topic3]
Description: [Brief description]
END_PROBLEM_INFO

Then continue with the detailed editorial.`
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const content = data.choices[0].message.content;
                
                // Extract problem info from the response
                const problemInfoMatch = content.match(/PROBLEM_INFO:([\s\S]*?)END_PROBLEM_INFO/);
                if (problemInfoMatch) {
                    const infoText = problemInfoMatch[1];
                    const titleMatch = infoText.match(/Title:\s*(.+)/);
                    const difficultyMatch = infoText.match(/Difficulty:\s*(.+)/);
                    const topicsMatch = infoText.match(/Topics:\s*(.+)/);
                    const descriptionMatch = infoText.match(/Description:\s*(.+)/);
                    
                    setProblemInfo({
                        title: `${problemId}: ${titleMatch ? titleMatch[1].trim() : 'Unknown Problem'}`,
                        difficulty: difficultyMatch ? difficultyMatch[1].trim() : 'Medium',
                        topics: topicsMatch ? topicsMatch[1].split(',').map(t => t.trim()) : ['Unknown'],
                        description: descriptionMatch ? descriptionMatch[1].trim() : 'Problem description will be provided in the editorial below.'
                    });
                    
                    // Remove the problem info section from editorial content
                    setEditorial(content.replace(/PROBLEM_INFO:[\s\S]*?END_PROBLEM_INFO\s*/, '').trim());
                } else {
                    // Fallback if format not followed
                    setProblemInfo({
                        title: `${problemId}: LeetCode Problem`,
                        difficulty: 'Medium',
                        topics: ['Algorithm'],
                        description: 'Problem details will be provided in the editorial below.'
                    });
                    setEditorial(content);
                }
            } else {
                throw new Error('Invalid response format from API');
            }
            
        } catch (err) {
            console.error('Error generating editorial:', err);
            setError(err.message || 'Failed to generate editorial. Please try again.');
            
            // Set fallback problem info even on error
            setProblemInfo({
                title: `${problemId}: LeetCode Problem`,
                difficulty: 'Medium',
                topics: ['Algorithm'],
                description: 'Unable to load problem description at this time.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Enhanced copy functionality with feedback
    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Better code block detection and formatting
    const formatContent = (content) => {
        if (!content) return '';
        
        // Split content by code blocks using improved regex patterns
        const parts = [];
        let currentIndex = 0;
        
        // Match various code block patterns: ``````cpp, ```
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            // Add text before code block
            if (match.index > currentIndex) {
                const textContent = content.slice(currentIndex, match.index).trim();
                if (textContent) {
                    parts.push({
                        type: 'text',
                        content: textContent
                    });
                }
            }
            
            // Add code block
            const language = match[1] || 'java';
            const codeContent = match[2].trim();
            
            if (codeContent) {
                parts.push({
                    type: 'code',
                    language: language.toLowerCase(),
                    content: codeContent,
                    id: `code-${parts.length}-${Date.now()}`
                });
            }
            
            currentIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (currentIndex < content.length) {
            const remainingText = content.slice(currentIndex).trim();
            if (remainingText) {
                parts.push({
                    type: 'text',
                    content: remainingText
                });
            }
        }
        
        // If no code blocks found, treat entire content as text
        if (parts.length === 0) {
            parts.push({
                type: 'text',
                content: content
            });
        }
        
        return (
            <div className="space-y-6">
                {parts.map((part, index) => {
                    if (part.type === 'code') {
                        return (
                            <div key={index} className="my-8 rounded-xl overflow-hidden shadow-lg">
                                {/* Enhanced Code Header */}
                                <div className={`flex items-center justify-between px-4 py-3 border-b ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border-gray-600 text-gray-300' 
                                        : 'bg-gray-100 border-gray-200 text-gray-700'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            isDarkMode ? 'bg-red-500' : 'bg-red-400'
                                        }`}></div>
                                        <div className={`w-3 h-3 rounded-full ${
                                            isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'
                                        }`}></div>
                                        <div className={`w-3 h-3 rounded-full ${
                                            isDarkMode ? 'bg-green-500' : 'bg-green-400'
                                        }`}></div>
                                        <div className="flex items-center gap-2 ml-3">
                                            <Code size={16} />
                                            <span className="font-semibold text-sm uppercase tracking-wide">
                                                {part.language}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => copyToClipboard(part.content, part.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            copiedCode === part.id
                                                ? (isDarkMode 
                                                    ? 'bg-green-600 text-white' 
                                                    : 'bg-green-500 text-white')
                                                : (isDarkMode 
                                                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                                                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800')
                                        }`}
                                    >
                                        {copiedCode === part.id ? (
                                            <>
                                                <Check size={14} />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Enhanced Code Block */}
                                <div className={`relative ${
                                    isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                                }`}>
                                    <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
                                        <code className={`language-${part.language} font-mono ${
                                            isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                        }`}>
                                            {part.content}
                                        </code>
                                    </pre>
                                    
                                    {/* Line numbers for longer code blocks */}
                                    {part.content.split('\n').length > 5 && (
                                        <div className={`absolute left-0 top-0 p-6 pr-4 pointer-events-none select-none ${
                                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                            {part.content.split('\n').map((_, lineIndex) => (
                                                <div key={lineIndex} className="font-mono text-sm leading-relaxed">
                                                    {lineIndex + 1}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Process regular text content with enhanced formatting
                    const lines = part.content.split('\n');
                    return (
                        <div key={index} className="space-y-4">
                            {lines.map((line, lineIndex) => {
                                // Skip empty lines
                                if (line.trim() === '') {
                                    return <div key={lineIndex} className="h-2"></div>;
                                }

                                // Handle horizontal rules
                                if (line.trim() === '---') {
                                    return (
                                        <hr key={lineIndex} className={`my-8 border-t-2 ${
                                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                        }`} />
                                    );
                                }

                                // Handle numbered headings with enhanced styling
                                const numberedHeadingMatch = line.match(/^(\d+)\.\s*(.+)$/);
                                if (numberedHeadingMatch) {
                                    const [, number, title] = numberedHeadingMatch;
                                    return (
                                        <div key={lineIndex} className="mt-10 mb-6">
                                            <div className={`flex items-center gap-4 p-4 rounded-xl border-l-4 ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-blue-500' 
                                                    : 'bg-blue-50 border-blue-500'
                                            }`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                                                }`}>
                                                    {number}
                                                </div>
                                                <h2 className={`text-xl font-bold ${
                                                    isDarkMode ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                    {formatInlineText(title, isDarkMode)}
                                                </h2>
                                            </div>
                                        </div>
                                    );
                                }

                                // Handle regular headings with improved styling
                                if (line.startsWith('# ')) {
                                    return (
                                        <h1 key={lineIndex} className={`text-3xl font-bold mt-10 mb-6 pb-3 border-b-2 ${
                                            isDarkMode 
                                                ? 'text-white border-gray-700' 
                                                : 'text-gray-800 border-gray-200'
                                        }`}>
                                            {formatInlineText(line.slice(2), isDarkMode)}
                                        </h1>
                                    );
                                }
                                
                                if (line.startsWith('## ')) {
                                    return (
                                        <h2 key={lineIndex} className={`text-2xl font-semibold mt-8 mb-4 ${
                                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                        }`}>
                                            {formatInlineText(line.slice(3), isDarkMode)}
                                        </h2>
                                    );
                                }
                                
                                if (line.startsWith('### ')) {
                                    return (
                                        <h3 key={lineIndex} className={`text-xl font-medium mt-6 mb-3 ${
                                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                            {formatInlineText(line.slice(4), isDarkMode)}
                                        </h3>
                                    );
                                }

                                // Enhanced bullet points
                                if (line.match(/^[\s]*[-*]\s+/)) {
                                    const content = line.replace(/^[\s]*[-*]\s+/, '');
                                    return (
                                        <div key={lineIndex} className="flex items-start gap-3 ml-4 py-1">
                                            <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${
                                                isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                                            }`}></div>
                                            <p className={`leading-relaxed ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                {formatInlineText(content, isDarkMode)}
                                            </p>
                                        </div>
                                    );
                                }

                                // Regular paragraphs with better spacing
                                return (
                                    <p key={lineIndex} className={`leading-relaxed text-base ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {formatInlineText(line, isDarkMode)}
                                    </p>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    // 🚀 FIXED: Enhanced inline text formatting with proper LaTeX and backslash handling
    const formatInlineText = (text, isDarkMode) => {
        if (!text) return '';

        // Handle double backslashes first (escape sequences)
        text = text.replace(/\\\\/g, '\\');

        // Handle LaTeX math expressions first (including escaped ones)
        text = text.replace(/\\$$([^)]+)\\$$/g, (match, math) => {
            return `<span class="inline-block px-2 py-1 mx-1 rounded-md text-sm font-mono font-bold border ${
                isDarkMode 
                    ? 'bg-blue-900 text-blue-300 border-blue-700' 
                    : 'bg-blue-100 text-blue-800 border-blue-300'
            }">${math}</span>`;
        });

        // 🚀 FIXED: Handle escaped backslashes and LaTeX commands
        text = text.replace(/\\([a-zA-Z]+)/g, (match, command) => {
            // Common LaTeX commands
            const latexCommands = {
                'left': '\\left',
                'right': '\\right',
                'lfloor': '⌊',
                'rfloor': '⌋',
                'lceil': '⌈',
                'rceil': '⌉',
                'frac': '\\frac',
                'sqrt': '√',
                'sum': '∑',
                'prod': '∏',
                'int': '∫',
                'infty': '∞',
                'alpha': 'α',
                'beta': 'β',
                'gamma': 'γ',
                'delta': 'δ',
                'epsilon': 'ε',
                'theta': 'θ',
                'lambda': 'λ',
                'mu': 'μ',
                'pi': 'π',
                'sigma': 'σ',
                'phi': 'φ',
                'omega': 'ω',
                'leq': '≤',
                'geq': '≥',
                'neq': '≠',
                'equiv': '≡',
                'approx': '≈',
                'times': '×',
                'div': '÷',
                'pm': '±',
                'mp': '∓',
                'cdot': '⋅',
                'bullet': '- ',
                'cap': '∩',
                'cup': '∪',
                'subset': '⊂',
                'supset': '⊃',
                'subseteq': '⊆',
                'supseteq': '⊇',
                'in': '∈',
                'notin': '∉',
                'forall': '∀',
                'exists': '∃',
                'nabla': '∇',
                'partial': '∂',
                'emptyset': '∅',
                'text': '',
                'mathrm': '',
                'mathbf': '',
                'mathit': '',
                'log': 'log',
                'ln': 'ln',
                'sin': 'sin',
                'cos': 'cos',
                'tan': 'tan',
                'min': 'min',
                'max': 'max',
                'gcd': 'gcd',
                'lcm': 'lcm',
                'floor': '⌊',
                'dots': '...'
            };
            
            if (latexCommands[command]) {
                return `<span class="inline-block px-1 py-0.5 mx-0.5 rounded text-xs font-mono ${
                    isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                }">${latexCommands[command]}</span>`;
            }
            
            return `<span class="inline-block px-1 py-0.5 mx-0.5 rounded text-xs font-mono ${
                isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
            }">\\${command}</span>`;
        });

        // Handle curly braces (often used in LaTeX)
        text = text.replace(/\{([^}]+)\}/g, (match, content) => {
            return `<span class="inline-block px-1 py-0.5 mx-0.5 rounded text-xs font-mono ${
                isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
            }">{${content}}</span>`;
        });

        // Handle enhanced inline code formatting (avoid conflict with LaTeX)
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="px-2 py-1 mx-1 rounded-md text-sm font-mono border ${
                isDarkMode 
                    ? 'bg-gray-800 text-green-400 border-gray-600' 
                    : 'bg-gray-100 text-gray-800 border-gray-300'
            }">${code}</code>`;
        });

        // Handle reference brackets like  - remove them
        text = text.replace(/$$\d+$$/g, '');

        // Enhanced bold formatting
        text = text.replace(/\*\*([^*]+)\*\*/g, (match, boldText) => {
            return `<strong class="font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
            }">${boldText}</strong>`;
        });

        // Enhanced italic formatting
        text = text.replace(/\*([^*]+)\*/g, (match, italicText) => {
            return `<em class="italic ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }">${italicText}</em>`;
        });

        return <span dangerouslySetInnerHTML={{ __html: text }} />;
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 border-b transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/track')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                    isDarkMode 
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                <ArrowLeft size={18} />
                                Back to Tracker
                            </button>
                            <div className="flex items-center gap-2">
                                <BookOpen className="text-blue-500" size={20} />
                                <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Editorial
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={generateEditorial}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Generating...' : 'Regenerate'}
                            </button>
                            
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                            >
                                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Problem Info */}
                {problemInfo && (
                    <div className={`rounded-xl p-6 mb-8 border shadow-lg transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {problemInfo.title}
                                </h2>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                                        problemInfo.difficulty === 'Easy' ? 'bg-green-100 text-green-800 border border-green-200' :
                                        problemInfo.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                        'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                        {problemInfo.difficulty}
                                    </span>
                                    {problemInfo.topics.map(topic => (
                                        <span key={topic} className={`px-3 py-1 text-sm rounded-full border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 text-gray-300 border-gray-600' 
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <h3 className={`font-medium mb-2 flex items-center gap-2 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                                <Target size={16} />
                                Problem Description:
                            </h3>
                            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {problemInfo.description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className={`rounded-xl p-8 text-center border shadow-lg transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-center justify-center mb-4">
                            <Loader className="animate-spin text-blue-500 mr-3" size={32} />
                            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                Generating Editorial for {problemId}...
                            </span>
                        </div>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            AI is analyzing the problem and creating a comprehensive Java solution...
                        </p>
                        <div className={`mt-6 w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : ''}`}>
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-lg">
                        <div className="flex items-center mb-3">
                            <AlertCircle className="text-red-500 mr-3" size={24} />
                            <h3 className="text-lg font-semibold text-red-800">Error Loading Editorial</h3>
                        </div>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={generateEditorial}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Editorial Content */}
                {editorial && !loading && (
                    <div className={`rounded-xl p-8 border shadow-lg transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <Lightbulb className="text-yellow-500" size={28} />
                            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                Generated Editorial
                            </h2>
                        </div>
                        
                        <div className="editorial-content">
                            {formatContent(editorial)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorialPage;
