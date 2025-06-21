import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, Plus, BookOpen, Target, Code, Clock, Bell, Link, Edit, Trash2, Star, Brain, Moon, Sun, AlertCircle } from 'lucide-react';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import AuthPage from './AuthPage'; // ADD THIS IMPORT AT THE TOP
import problemsData from './problems.json';
// LeetCode-style Heatmap Component
const ActivityHeatmap = React.memo(({ problems, isDarkMode }) => {
    // Get activity data from completed problems
    const getActivityData = () => {
        const activityMap = {};
        
        if (!Array.isArray(problems)) return activityMap;
        
        problems.forEach(problem => {
            if (problem.status === 'completed' && problem.lastReviewed) {
                try {
                    let date = typeof problem.lastReviewed === 'string' 
                        ? new Date(problem.lastReviewed) 
                        : problem.lastReviewed;
                    
                    if (isNaN(date.getTime())) return;
                    
                    const normalizedDate = new Date(date);
                    normalizedDate.setHours(0, 0, 0, 0);
                    const dateKey = normalizedDate.toDateString();
                    activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
                } catch (error) {
                    console.error('Error processing date:', error);
                }
            }
        });
        
        return activityMap;
    };

    // Generate 5 months of days (compact grid)
    const generateCompactGrid = () => {
        const today = new Date();
        const startMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        const endMonth = new Date(today.getFullYear(), today.getMonth() + 2 + 1, 0);
        
        const days = [];
        const monthLabels = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let currentDate = new Date(startMonth);
        let weekCount = 0;
        let lastMonth = -1;
        
        const firstDayOfWeek = (currentDate.getDay() + 6) % 7;
        currentDate.setDate(currentDate.getDate() - firstDayOfWeek);
        
        while (currentDate <= endMonth) {
            const week = [];
            
            for (let i = 0; i < 7; i++) {
                const day = new Date(currentDate);
                const isInRange = day >= startMonth && day <= endMonth;
                
                week.push({
                    date: day,
                    dateKey: day.toDateString(),
                    isInRange: isInRange,
                    isToday: day.toDateString() === today.toDateString()
                });
                
                if (isInRange && day.getMonth() !== lastMonth && day.getDate() <= 7) {
                    monthLabels.push({
                        name: monthNames[day.getMonth()],
                        weekIndex: weekCount,
                        month: day.getMonth(),
                        year: day.getFullYear()
                    });
                    lastMonth = day.getMonth();
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            days.push(week);
            weekCount++;
        }
        
        return { weeks: days, monthLabels };
    };

    // Get intensity and color - FIXED for consistent dark mode
    const getIntensity = (count) => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 7) return 3;
        return 4;
    };

    const getColorClass = (intensity) => {
        if (isDarkMode) {
            const colors = [
                'bg-gray-700 border-gray-600', // Level 0 - no activity
                'bg-green-900 border-green-800', // Level 1 - low activity
                'bg-green-700 border-green-600', // Level 2 - medium-low activity
                'bg-green-500 border-green-400', // Level 3 - medium-high activity
                'bg-green-400 border-green-300'  // Level 4 - high activity
            ];
            return colors[intensity];
        } else {
            const colors = [
                'bg-gray-100 border-gray-200', // Level 0 - no activity
                'bg-green-100 border-green-200', // Level 1 - low activity
                'bg-green-300 border-green-400', // Level 2 - medium-low activity
                'bg-green-500 border-green-600', // Level 3 - medium-high activity
                'bg-green-600 border-green-700'  // Level 4 - high activity
            ];
            return colors[intensity];
        }
    };

    const activityData = getActivityData();
    const { weeks, monthLabels } = generateCompactGrid();
    
    const totalSolved = problems?.filter(p => p.status === 'completed').length || 0;
    
    const getCurrentStreak = () => {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateKey = checkDate.toDateString();
            
            if (activityData[dateKey] > 0) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        return streak;
    };

    return (
        <div className={`p-4 sm:p-6 rounded-lg shadow transition-all duration-300 border ${
            isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
        }`}>
            {/* Header - FIXED text colors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div>
                    <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        Coding Activity
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-600'
                    }`}>
                        5-month activity overview
                    </p>
                </div>
                <div className="flex gap-2 text-sm">
                    <div className={`px-3 py-1 rounded-full font-medium border transition-colors duration-300 ${
                        isDarkMode 
                            ? 'bg-green-900 text-white border-green-700' 
                            : 'bg-green-100 text-green-800 border-green-200'
                    }`}>
                        <span className="font-semibold">{totalSolved}</span> solved
                    </div>
                    <div className={`px-3 py-1 rounded-full font-medium border transition-colors duration-300 ${
                        isDarkMode 
                            ? 'bg-blue-900 text-white border-blue-700' 
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                        <span className="font-semibold">{getCurrentStreak()}</span> day streak
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="space-y-3">
                {/* Month Labels - FIXED text colors */}
                <div className="flex items-center ml-8 relative h-5">
                    {monthLabels.map((month, index) => (
                        <div
                            key={`${month.name}-${month.year}`}
                            className={`absolute text-xs font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-600'
                            }`}
                            style={{ 
                                left: `${month.weekIndex * 14}px`
                            }}
                        >
                            {month.name}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="flex gap-1">
                    {/* Day Labels - FIXED text colors */}
                    <div className="flex flex-col gap-1 mr-2 text-xs w-6">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div 
                                key={day} 
                                className={`h-3 flex items-center justify-center transition-colors duration-300 ${
                                    i % 2 === 0 
                                        ? (isDarkMode ? 'text-white' : 'text-gray-600') 
                                        : 'text-transparent'
                                }`}
                                style={{ fontSize: '10px' }}
                            >
                                {i % 2 === 0 ? day.charAt(0) : ''}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap Squares - FIXED border classes */}
                    <div className="flex gap-1">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {week.map((day, dayIndex) => {
                                    const count = day.isInRange ? (activityData[day.dateKey] || 0) : 0;
                                    const intensity = day.isInRange ? getIntensity(count) : 0;
                                    
                                    return (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            className={`
                                                w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 
                                                hover:scale-110 hover:shadow-sm border
                                                ${day.isInRange ? getColorClass(intensity) : 'bg-transparent border-transparent'}
                                                ${day.isToday ? (
                                                    isDarkMode 
                                                        ? 'ring-2 ring-blue-400 ring-opacity-60' 
                                                        : 'ring-2 ring-blue-500 ring-opacity-60'
                                                ) : ''}
                                            `}
                                            title={day.isInRange ? 
                                                `${day.date.toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}: ${count} problem${count !== 1 ? 's' : ''} solved` 
                                                : ''
                                            }
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend - FIXED text colors */}
                <div className={`flex items-center justify-between pt-3 border-t transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className={`transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-600'
                        }`}>
                            Less
                        </span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(intensity => (
                                <div
                                    key={intensity}
                                    className={`w-3 h-3 rounded-sm border transition-colors duration-300 ${getColorClass(intensity)}`}
                                />
                            ))}
                        </div>
                        <span className={`transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-600'
                        }`}>
                            More
                        </span>
                    </div>
                    
                    <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-500'
                    }`}>
                        GitHub-style contribution graph
                    </div>
                </div>
            </div>
        </div>
    );
});












// (Highly Recommended) Component moved outside of the main StudyPlanner component for performance.
const SpacedRepetitionList = React.memo(({ problems, isDarkMode }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison
//test
    // Spaced repetition intervals (in days): e.g., 1 day, 3 days, 1 week, 2 weeks, etc.
    const repetitionIntervals = [1, 3, 7, 14, 30, 90];

    const getNextReviewDate = (lastReviewed, repetitions) => {
        // Use the next interval, capping at the max defined interval
        const interval = repetitionIntervals[Math.min(repetitions, repetitionIntervals.length - 1)];
        return addDays(parseISO(lastReviewed), interval);
    };

    const getReviewStatus = (reviewDate) => {
        const daysDiff = differenceInDays(reviewDate, today);
        if (daysDiff < 0) return { label: 'Overdue', color: 'text-red-500', Icon: AlertCircle };
        if (daysDiff === 0) return { label: 'Due Today', color: 'text-orange-500', Icon: AlertCircle };
        return { label: `In ${daysDiff} day(s)`, color: 'text-blue-500', Icon: Calendar };
    };
    
    // Sort problems by the next review date
    const sortedProblems = [...problems].sort((a, b) => {
        const dateA = getNextReviewDate(a.lastReviewed, a.repetitions);
        const dateB = getNextReviewDate(b.lastReviewed, b.repetitions);
        return dateA - dateB;
    });

    return (
        <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Review Schedule</h3>
            {sortedProblems.length > 0 ? (
                <ul className="space-y-4">
                    {sortedProblems.map(problem => {
                        const nextReviewDate = getNextReviewDate(problem.lastReviewed, problem.repetitions);
                        const { label, color, Icon } = getReviewStatus(nextReviewDate);

                        return (
                            <li key={problem.id} className={`flex items-center justify-between p-3 rounded-md transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center">
                                    <Icon className={`mr-3 flex-shrink-0 ${color}`} size={20} />
                                    <div>
                                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{problem.name}</span>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Repetition: #{problem.repetitions + 1}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-semibold ${color}`}>{label}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {format(nextReviewDate, 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                     <CheckCircle className="text-green-500 mb-2" size={32} />
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>All Caught Up!</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Complete a problem to start your review schedule.</p>
                </div>
            )}
        </div>
    );
});


// (Highly Recommended) Component moved outside of the main StudyPlanner component for performance.
const ProblemCard = ({ problem, onToggle, onSaveNote, notes, isDarkMode, getDifficultyColor, formatNoteContent, insertCodeBlock }) => {
    const [notesMode, setNotesMode] = useState('none'); // 'none', 'view', 'edit'
    const [noteText, setNoteText] = useState(notes[problem.id] || '');
    const [textareaRef, setTextareaRef] = useState(null);
    const hasNotes = notes[problem.id] && notes[problem.id].trim().length > 0;


    const handleSaveNote = () => {
        onSaveNote(problem.id, noteText);
        setNotesMode('view');
    };

    // --- MODIFIED LOGIC ---
    // This function now acts as a simple toggle to show or hide the notes section.
    const handleNotesClick = () => {
        if (notesMode === 'none') {
            // If hidden, show notes. Go to 'view' if notes exist, otherwise go straight to 'edit'.
            setNotesMode(hasNotes ? 'view' : 'edit');
        } else {
            // If already in 'view' or 'edit' mode, just hide the notes section.
            setNotesMode('none');
        }
    };

    const handleInsertCodeBlock = (language = 'javascript') => {
        if (textareaRef) {
            const cursorPosition = textareaRef.selectionStart;
            const { newText, newCursorPosition } = insertCodeBlock(noteText, cursorPosition, language);
            setNoteText(newText);

            // Set cursor position after state update
            setTimeout(() => {
                textareaRef.setSelectionRange(newCursorPosition, newCursorPosition);
                textareaRef.focus();
            }, 0);
        }
    };

    const handleInsertTemplate = (template) => {
        if (textareaRef) {
            const cursorPosition = textareaRef.selectionStart;
            const beforeCursor = noteText.slice(0, cursorPosition);
            const afterCursor = noteText.slice(cursorPosition);
            const newText = beforeCursor + template + afterCursor;
            setNoteText(newText);

            setTimeout(() => {
                textareaRef.setSelectionRange(cursorPosition + template.length, cursorPosition + template.length);
                textareaRef.focus();
            }, 0);
        }
    };

    const leetcodeUrl = problem.leetcodeId ? `https://leetcode.com/problems/problem-${problem.leetcodeId}/` : null;
    const problemUrl = problem.customLink || leetcodeUrl;

    return (
        <div className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
            isDarkMode
                ? 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onToggle(problem.id)}
                        className="text-2xl"
                    >
                        {problem.status === 'completed' ?
                            <CheckCircle className="text-green-600" size={24} /> :
                            <Circle className="text-gray-400" size={24} />
                        }
                    </button>
                    <div>
                        <h4 className={`font-medium ${problem.status === 'completed' ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}` : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {problem.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{problem.topic}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                    </span>
                    {problem.isCustom && (
                        <Star className="text-yellow-500" size={16} />
                    )}
                    {hasNotes && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has notes"></div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                {problemUrl && (
                    <a
                        href={problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                        <Link size={14} />
                        {problem.leetcodeId ? `LC-${problem.leetcodeId}` : 'Solve'}
                    </a>
                )}
                <button
                    onClick={handleNotesClick}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                        hasNotes
                            ? 'text-blue-600 hover:text-blue-800'
                            : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <Edit size={14} />
                    {/* --- MODIFIED TEXT --- */}
                    {/* This text now clearly reflects the toggle action */}
                    {notesMode === 'none'
                        ? (hasNotes ? 'View Notes' : 'Add Notes')
                        : 'Hide Notes'
                    }
                </button>
            </div>

            {/* View Notes Mode */}
            {notesMode === 'view' && hasNotes && (
                <div className={`mt-3 p-4 rounded-lg border-l-4 transition-colors duration-300 ${
                    isDarkMode
                        ? 'bg-gray-700 border-blue-400'
                        : 'bg-blue-50 border-blue-500'
                }`}>
                    <div className="flex justify-between items-start mb-2">
                        <h5 className={`font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-900'
                        }`}>Notes:</h5>
                        <button
                            onClick={() => {
                                setNoteText(notes[problem.id]);
                                setNotesMode('edit');
                            }}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                            <Edit size={12} />
                            Edit
                        </button>
                    </div>
                    <div className={`p-3 rounded border transition-colors duration-300 ${
                        isDarkMode
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className={`text-sm font-sans leading-relaxed transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                            {formatNoteContent(notes[problem.id])}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Notes Mode */}
            {notesMode === 'edit' && (
                <div className={`mt-3 p-4 rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <div className="flex justify-between items-center mb-3">
                        <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {hasNotes ? 'Edit Notes:' : 'Add Notes:'}
                        </h5>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {noteText.length} characters
                        </div>
                    </div>

                    {/* Enhanced Toolbar */}
                    <div className={`mb-3 p-3 rounded-lg border transition-colors duration-300 ${
                        isDarkMode
                            ? 'bg-gray-800 border-gray-600'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Language:</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleInsertCodeBlock('javascript')}
                                    className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    JavaScript
                                </button>
                                <button
                                    onClick={() => handleInsertCodeBlock('python')}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                                >
                                    Python
                                </button>
                                <button
                                    onClick={() => handleInsertCodeBlock('java')}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                                >
                                    Java
                                </button>
                                <button
                                    onClick={() => handleInsertCodeBlock('cpp')}
                                    className="px-2 py-1 text-xs bg-blue-800 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    C++
                                </button>
                            </div>

                            <div className="w-px h-4 bg-gray-300 mx-1"></div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleInsertTemplate('\n## Approach:\n- \n\n## Time Complexity: O()\n## Space Complexity: O()\n\n## Key Points:\n- \n')}
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                                >
                                    + Template
                                </button>
                                <button
                                    onClick={() => handleInsertTemplate('\n**Edge Cases:**\n- \n- \n\n')}
                                    className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
                                >
                                    + Edge Cases
                                </button>
                            </div>
                        </div>

                        <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>Tip:</strong> Use ```language``` to create code blocks. Supports: javascript, python, java, cpp, sql, etc.
                        </div>
                    </div>

                    <textarea
                        ref={setTextareaRef}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your notes here..."
                        className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-colors duration-300 ${
                            isDarkMode
                                ? 'border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400'
                                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                        rows="8"
                    />
                    {/* // UPDATED CLASSNAME: Stacked buttons on mobile for better touch targets. */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-3 gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveNote}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                Save Notes
                            </button>
                            <button
                                onClick={() => {
                                    setNoteText(notes[problem.id] || '');
                                    setNotesMode(hasNotes ? 'view' : 'none');
                                }}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                    isDarkMode
                                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                            >
                                Cancel
                            </button>
                        </div>
                        {hasNotes && (
                            <button
                                onClick={() => {
                                    onSaveNote(problem.id, '');
                                    setNoteText('');
                                    setNotesMode('none');
                                }}
                                className={`text-red-600 hover:text-red-800 text-sm flex items-center justify-center gap-1 ${isDarkMode ? 'hover:text-red-400' : ''}`}
                            >
                                <Trash2 size={12} />
                                Delete Notes
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// (Highly Recommended) Component moved outside of the main StudyPlanner component for performance.
const SetupForm = ({ isDarkMode, formData, setFormData, handleFormSubmit, availableTopics }) => {
    // Add this array right at the top of SetupForm
    const durationPresets = [
        { label: '2 Weeks', days: 14 },
        { label: '1 Month', days: 30 },
        { label: '3 Months', days: 90 },
        { label: '6 Months', days: 180 },
    ];
    const [showAllTopics, setShowAllTopics] = useState(false);

    const handleTopicToggle = (topicId) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.includes(topicId)
                ? prev.topics.filter(id => id !== topicId)
                : [...prev.topics, topicId]
        }));
    };

    const getSelectedTopicNames = () => {
        return formData.topics
            .map(topicId => availableTopics.find(t => t.id === topicId))
            .filter(Boolean)
            .map(topic => topic.name)
            .join(', ');
    };

    const displayedTopics = showAllTopics ? availableTopics : availableTopics.slice(0, 8);

    return (
        // UPDATED CLASSNAME: Reduced padding on mobile.
        <div className={`max-w-4xl mx-auto p-4 sm:p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
                <Brain className="text-blue-600" />
                Create a Personalized Study Plan
            </h2>

            <div className="space-y-6">
                {/* Skill Level Section */}
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                        <Target className="inline w-4 h-4 mr-2" />
                        Skill Level
                    </label>
                    {/* // UPDATED CLASSNAME: Stacked grid on mobile, 3 columns on larger screens. */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { value: 'beginner', label: 'Beginner', desc: 'New to coding interviews' },
                            { value: 'intermediate', label: 'Intermediate', desc: 'Some practice experience' },
                            { value: 'pro', label: 'Pro', desc: 'Advanced problem solver' }
                        ].map(level => (
                            <div key={level.value} className="relative">
                                <input
                                    type="radio"
                                    id={level.value}
                                    name="level"
                                    value={level.value}
                                    checked={formData.level === level.value}
                                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                                    className="sr-only"
                                />
                                <label
                                    htmlFor={level.value}
                                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        formData.level === level.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : isDarkMode
                                                ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="font-medium">{level.label}</div>
                                    <div className={`text-sm mt-1 ${formData.level === level.value ? 'text-blue-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{level.desc}</div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Study Duration Section */}
                <div className="space-y-3">
                    <label className={`flex items-center text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        Study Duration
                    </label>

                    {(() => {
                        const presets = [
                            { label: '2 Weeks', days: 14 },
                            { label: '1 Month', days: 30 },
                            { label: '3 Months', days: 90 }
                        ];

                        const currentDays = formData.days || 30;

                        return (
                            <div className="space-y-4">
                                {/* Clean Toggle Buttons */}
                                <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.days}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, days: preset.days }))}
                                            className={`flex-1 text-center py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                                                formData.days === preset.days
                                                    ? `bg-white text-gray-900 shadow-sm ${isDarkMode ? '!bg-blue-500 !text-white' : ''}`
                                                    : isDarkMode
                                                        ? 'text-gray-400 hover:text-white'
                                                        : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Minimal Custom Input */}
                                <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Custom duration</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={formData.days || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData(prev => ({ ...prev, days: value === '' ? '' : parseInt(value) || '' }));
                                            }}
                                            onBlur={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!value || value < 1) {
                                                    setFormData(prev => ({ ...prev, days: 30 }));
                                                } else if (value > 365) {
                                                    setFormData(prev => ({ ...prev, days: 365 }));
                                                }
                                            }}
                                            className={`w-16 text-center text-sm font-medium border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500' : 'bg-white border-gray-200 focus:ring-blue-500'}`}
                                            placeholder="30"
                                        />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>days</span>
                                    </div>
                                </div>

                                {/* Subtle Duration Preview */}
                                <div className="text-center">
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Study plan: {currentDays} day{currentDays !== 1 ? 's' : ''}
                                        {currentDays >= 30 && (
                                            <span className="ml-1">
                                                ({Math.round(currentDays / 30 * 10) / 10} month{currentDays >= 60 ? 's' : ''})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>


                {/* Topic Selection Section */}
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            <BookOpen className="inline w-4 h-4 mr-2" />
                            Focus Topics {formData.topics.length > 0 && `(${formData.topics.length} selected)`}
                        </label>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, topics: [] }))}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    {formData.topics.length > 0 && (
                        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} mb-1`}>Selected Topics:</p>
                            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{getSelectedTopicNames()}</p>
                        </div>
                    )}

                    {/* Minimalist Scrollable List */}
                    <div className={`border rounded-lg max-h-72 overflow-y-auto ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <ul className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                            {availableTopics.map(topic => (
                                <li
                                    key={topic.id}
                                    onClick={() => handleTopicToggle(topic.id)}
                                    className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${
                                        formData.topics.includes(topic.id)
                                            ? isDarkMode ? 'bg-blue-800' : 'bg-blue-50'
                                            : isDarkMode ? 'hover:bg-gray-600 bg-gray-800' : 'hover:bg-gray-100 bg-white'
                                    }`}
                                >
                                    <div>
                                        <span className={`font-medium ${
                                            formData.topics.includes(topic.id)
                                                ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                                                : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                        }`}>
                                            {topic.name}
                                        </span>
                                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{topic.description}</p>
                                    </div>
                                    {formData.topics.includes(topic.id) && (
                                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 ml-4" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900 bg-opacity-50' : 'bg-yellow-50'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                            <strong>💡 Tip:</strong> {formData.topics.length === 0
                                ? 'Select specific topics for focused practice, or leave empty for a well-rounded curriculum.'
                                : `Your plan will focus on ${formData.topics.length} topic${formData.topics.length > 1 ? 's' : ''} with curated problems.`
                            }
                        </p>
                    </div>
                </div>


                {/* // UPDATED CLASSNAME: Adjusted font size on mobile for better fit. */}
                <button
                    onClick={handleFormSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-base sm:text-lg shadow-lg hover:shadow-xl"
                >
                    🚀 Generate My Personalized Study Plan
                </button>

                {/* Summary */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Plan Summary:</h3>
                    <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <p>• <strong>Level:</strong> {formData.level.charAt(0).toUpperCase() + formData.level.slice(1)}</p>
                        <p>• <strong>Duration:</strong> {formData.days} days</p>
                        <p>• <strong>Topics:</strong> {formData.topics.length > 0 ? getSelectedTopicNames() : 'All topics (comprehensive)'}</p>
                        <p>• <strong>Problems:</strong> AI-curated based on your preferences</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// (Highly Recommended) Component moved outside of the main StudyPlanner component for performance.
// (Highly Recommended) Component moved outside of the main StudyPlanner component for performance.
const Dashboard = ({ isDarkMode, stats, spacedRepetition, problems }) => {

    // LeetCode-style progress bar for a specific difficulty
    const DifficultyProgressBar = ({ difficulty, data, colorClass }) => (
        <div>
            <div className="flex justify-between mb-1">
                <span className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{difficulty}</span>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data.completed} / {data.total}</span>
            </div>
            <div className={`w-full rounded-full h-2.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                    className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${data.percentage}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Problems</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
                        </div>
                        <Target className="text-blue-500" size={24} />
                    </div>
                </div>
                
                <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
                            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                </div>
                <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                         <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</p>
                            <p className="text-2xl font-bold text-blue-500">{stats.percentage}%</p>
                        </div>
                        <div className="relative w-10 h-10">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    className={isDarkMode ? 'text-gray-700' : 'text-gray-200'}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="currentColor" strokeWidth="3.8"
                                />
                                <path
                                    className="text-blue-500"
                                    strokeDasharray={`${stats.percentage}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                               <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stats.percentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reviews Due</p>
                            <p className="text-2xl font-bold text-orange-500">{spacedRepetition.length}</p>
                        </div>
                        <Bell className="text-orange-500" size={24} />
                    </div>
                </div>
            </div>

            {/* LeetCode-Style Progress Breakdown */}
            <div className={`p-4 sm:p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Progress Breakdown</h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stats.completed} of {stats.total} problems solved
                </p>
                <div className="space-y-4">
                    <DifficultyProgressBar difficulty="Easy" data={stats.easy} colorClass="bg-green-500" />
                    <DifficultyProgressBar difficulty="Medium" data={stats.medium} colorClass="bg-yellow-500" />
                    <DifficultyProgressBar difficulty="Hard" data={stats.hard} colorClass="bg-red-500" />
                </div>
            </div>
            <ActivityHeatmap problems={problems} isDarkMode={isDarkMode} />

            <SpacedRepetitionList problems={spacedRepetition} isDarkMode={isDarkMode} />
        </div>
    );
};

// (Highly Recommended) Component moved outside of the main StudyPlanner component for performance.
const TaskManager = ({ studyPlan, addCustomProblem, toggleProblemStatus, saveNote, isDarkMode, notes, getDifficultyColor, formatNoteContent, insertCodeBlock }) => {
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [expandedDays, setExpandedDays] = useState(new Set([1, 'custom'])); // Expand first day and custom problems by default
    const [customForm, setCustomForm] = useState({
        name: '',
        difficulty: 'Easy',
        topic: '',
        leetcodeId: '',
        customLink: ''
    });

    const handleCustomSubmit = () => {
        addCustomProblem(customForm);
        setCustomForm({
            name: '',
            difficulty: 'Easy',
            topic: '',
            leetcodeId: '',
            customLink: ''
        });
        setShowCustomForm(false);
    };
    const toggleDay = (dayNumber) => {
        const newExpanded = new Set(expandedDays);
        if (newExpanded.has(dayNumber)) {
            newExpanded.delete(dayNumber);
        } else {
            newExpanded.add(dayNumber);
        }
        setExpandedDays(newExpanded);
    };

    const getDayProgress = (dayProblems) => {
        const completed = dayProblems.filter(p => p.status === 'completed').length;
        const total = dayProblems.length;
        return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const getDayStatus = (dateObj, day) => {
        if (day === 'custom') return 'custom';

        const today = new Date();
        const dayDate = new Date(dateObj);

        today.setHours(0, 0, 0, 0);
        dayDate.setHours(0, 0, 0, 0);

        if (dayDate.getTime() === today.getTime()) return 'today';
        if (dayDate < today) return 'past';
        return 'future';
    };

    const getStatusColor = (status) => {
        if (isDarkMode) {
            switch (status) {
                case 'today': return 'border-blue-400 bg-gray-800';
                case 'past': return 'border-gray-600 bg-gray-800 opacity-70';
                case 'future': return 'border-green-500 bg-gray-800';
                case 'custom': return 'border-purple-500 bg-gray-800';
                default: return 'border-gray-700 bg-gray-800';
            }
        } else {
            switch (status) {
                case 'today': return 'border-blue-500 bg-blue-50';
                case 'past': return 'border-gray-400 bg-gray-50';
                case 'future': return 'border-green-500 bg-green-50';
                case 'custom': return 'border-purple-500 bg-purple-50';
                default: return 'border-gray-300 bg-white';
            }
        }
    };


    const getStatusIcon = (status) => {
        switch (status) {
            case 'today': return '📅';
            case 'past': return '⏳';
            case 'future': return '📍';
            case 'custom': return '⭐';
            default: return '📋';
        }
    };

    const dailyPlans = studyPlan ? studyPlan.filter(p => p.day !== 'custom') : [];
    const customProblemsDay = studyPlan ? studyPlan.find(p => p.day === 'custom') : null;

    const inputClasses = `p-2 border rounded-lg transition-colors duration-300 ${
        isDarkMode
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400'
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
    }`;


    return (
        <div className="space-y-6">
            {/* // UPDATED CLASSNAME: Stacked header on mobile. */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* // UPDATED CLASSNAME: Adjusted font size on mobile. */}
                <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Task Manager - Day by Day</h2>
                {/* // UPDATED CLASSNAME: Added flex-wrap for better wrapping on small screens. */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setExpandedDays(new Set(studyPlan.map(day => day.day)))}
                        className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={() => setExpandedDays(new Set())}
                        className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                        Collapse All
                    </button>
                    <button
                        onClick={() => setShowCustomForm(!showCustomForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Custom Problem
                    </button>
                </div>
            </div>

            {showCustomForm && (
                <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                }`}>
                    <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>Add Custom Problem</h3>
                    <div className="space-y-4">
                        {/* // UPDATED CLASSNAME: This grid is already responsive, which is great. */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Problem Name"
                                value={customForm.name}
                                onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                                className={inputClasses}
                                required
                            />
                            <select
                                value={customForm.difficulty}
                                onChange={(e) => setCustomForm(prev => ({ ...prev, difficulty: e.target.value }))}
                                className={inputClasses}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Topic"
                                value={customForm.topic}
                                onChange={(e) => setCustomForm(prev => ({ ...prev, topic: e.target.value }))}
                                className={inputClasses}
                            />
                            <input
                                type="text"
                                placeholder="LeetCode ID (optional)"
                                value={customForm.leetcodeId}
                                onChange={(e) => setCustomForm(prev => ({ ...prev, leetcodeId: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                        <input
                            type="url"
                            placeholder="Custom Link (optional)"
                            value={customForm.customLink}
                            onChange={(e) => setCustomForm(prev => ({ ...prev, customLink: e.target.value }))}
                            className={`w-full ${inputClasses}`}
                        />
                        {/* // UPDATED CLASSNAME: Stacked buttons on mobile. Added w-full/sm:w-auto for proper sizing. */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={handleCustomSubmit}
                                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Add Problem
                            </button>
                            <button
                                onClick={() => setShowCustomForm(false)}
                                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Day-wise Problem List */}
            <div className="space-y-4">
                {[...(customProblemsDay ? [customProblemsDay] : []), ...dailyPlans].map(dayPlan => {
                    const progress = getDayProgress(dayPlan.problems);
                    const dayStatus = getDayStatus(dayPlan.dateObj, dayPlan.day);
                    const isExpanded = expandedDays.has(dayPlan.day);

                    return (
                        <div key={dayPlan.day} className={`rounded-lg shadow border-l-4 transition-all duration-300 ${getStatusColor(dayStatus)}`}>
                            {/* Day Header */}
                            <div
                                className={`p-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleDay(dayPlan.day)}
                            >
                                {/* // UPDATED CLASSNAME: Stacked layout on mobile to prevent squishing. */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getStatusIcon(dayStatus)}</span>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {dayPlan.day === 'custom' ? 'Custom Problems' : `Day ${dayPlan.day}`}
                                            </h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dayPlan.date}</p>
                                        </div>
                                        {dayStatus === 'today' && (
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Today
                                            </span>
                                        )}
                                    </div>

                                    {/* // UPDATED CLASSNAME: Changed alignment for mobile stacking. */}
                                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                                        {/* Progress Info */}
                                        <div className="text-left sm:text-right">
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {progress.completed}/{progress.total} Problems
                                            </div>
                                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {progress.percentage}% Complete
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className={`w-20 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                            <div
                                                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                                                style={{ width: `${progress.percentage}%` }}
                                            ></div>
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Day Problems */}
                            {isExpanded && (
                                <div className={`px-4 pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    {dayPlan.problems.length > 0 ? (
                                        <div className="space-y-3 mt-4">
                                            {dayPlan.problems.map(problem => (
                                                <ProblemCard
                                                    key={problem.id}
                                                    problem={problem}
                                                    onToggle={toggleProblemStatus}
                                                    onSaveNote={saveNote}
                                                    notes={notes}
                                                    isDarkMode={isDarkMode}
                                                    getDifficultyColor={getDifficultyColor}
                                                    formatNoteContent={formatNoteContent}
                                                    insertCodeBlock={insertCodeBlock}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            <Circle className="mx-auto mb-2" size={32} />
                                            <p>No problems assigned for this day</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const StudyPlanner = ({onLogout, user}) => {

    const [activeTab, setActiveTab] = useState('setup');
    const [studyPlan, setStudyPlan] = useState(null);
    const [problems, setProblems] = useState([]);
    const [completedProblems, setCompletedProblems] = useState([]);
    const [notes, setNotes] = useState({});
    const [customProblems, setCustomProblems] = useState([]);
    const [noteMode, setNoteMode] = useState('text'); // 'text' or 'code'
    const [showSetupError, setShowSetupError] = useState(false);
     const renderHeader = () => (
        <header className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
            isDarkMode 
                ? 'bg-gray-900/90 border-gray-700' 
                : 'bg-white/90 border-gray-200'
        } border-b`}>
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo section */}
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors duration-300 ${
                            isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                            <Code className={`w-6 h-6 ${
                                isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                        </div>
                        <div>
                            <h1 className={`text-xl font-bold transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                CodePulse Tracker
                            </h1>
                            <p className={`text-xs transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                Your Coding Progress Dashboard
                            </p>
                        </div>
                    </div>

                    {/* User info and controls */}
                    <div className="flex items-center gap-4">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                                isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* User Profile Section */}
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.avatar}
                                alt={user?.name}
                                className="w-8 h-8 rounded-full border-2 border-blue-200"
                            />
                            <div className="hidden sm:block">
                                <p className={`text-sm font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {user?.name}
                                </p>
                                <p className={`text-xs transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={onLogout}
                            className={`text-sm px-3 py-1 rounded-lg transition-colors duration-300 ${
                                isDarkMode
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );


    


    // Form state
    const [formData, setFormData] = useState({
        level: 'beginner',
        days: 30,
        topics: [],
        focusAreas: []
    });
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load and save dark mode preference from/to localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) {
            setIsDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);



    const handleLogout = () => {
        // Reset all data when logging out
    setStudyPlan(null);
    setProblems([]);
    setCompletedProblems([]);
    setNotes({});
    setCustomProblems([]);
    setActiveTab('setup');

    // Call the function passed down from App.js to update the global auth state
    onLogout(); 
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const formatNoteContent = (content) => {
        if (!content) return '';

        // Split content by code blocks (```language\ncode\n```)
        const parts = content.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                // Extract language and code
                const lines = part.split('\n');
                const firstLine = lines[0];
                const language = firstLine.slice(3).trim() || 'text';
                const code = lines.slice(1, -1).join('\n');

                return (
                    <div key={index} className="my-3">
                        <div className="bg-gray-800 text-gray-200 px-3 py-1 text-xs font-mono rounded-t-md border-b border-gray-600">
                            {language}
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-md overflow-x-auto">
                            <code className="text-sm font-mono">{code}</code>
                        </pre>
                    </div>
                );
            } else {
                // Regular text content
                return part.split('\n').map((line, lineIndex) => (
                    <div key={`${index}-${lineIndex}`}>
                        {line}
                        {lineIndex < part.split('\n').length - 1 && <br />}
                    </div>
                ));
            }
        });
    };

    const insertCodeBlock = (currentText, cursorPosition, language = 'javascript') => {
        const beforeCursor = currentText.slice(0, cursorPosition);
        const afterCursor = currentText.slice(cursorPosition);
        const codeTemplate = `\`\`\`${language}\n// Your code here\n\`\`\``;

        return {
            newText: beforeCursor + codeTemplate + afterCursor,
            newCursorPosition: cursorPosition + `\`\`\`${language}\n`.length
        };
    };



    // Available topics for selection
    const availableTopics = [
        { id: 'array', name: 'Array', description: 'Arrays, sorting, searching' },
        { id: 'string', name: 'String', description: 'String manipulation, pattern matching' },
        { id: 'linkedlist', name: 'Linked List', description: 'Single, double, circular linked lists' },
        { id: 'stack', name: 'Stack & Queue', description: 'LIFO and FIFO data structures' },
        { id: 'tree', name: 'Trees', description: 'Binary trees, BST, traversals' },
        { id: 'graph', name: 'Graph', description: 'Graph algorithms, BFS, DFS' },
        { id: 'dp', name: 'Dynamic Programming', description: 'Optimization problems, memoization' },
        { id: 'greedy', name: 'Greedy', description: 'Greedy algorithms and optimization' },
        { id: 'backtracking', name: 'Backtracking', description: 'Recursive problem solving' },
        { id: 'twopointer', name: 'Two Pointers', description: 'Two pointer technique' },
        { id: 'slidingwindow', name: 'Sliding Window', description: 'Window-based problems' },
        { id: 'binarysearch', name: 'Binary Search', description: 'Search in sorted arrays' },
        { id: 'heap', name: 'Heap/Priority Queue', description: 'Min/max heap operations' },
        { id: 'trie', name: 'Trie', description: 'Prefix trees and word problems' },
        { id: 'bit', name: 'Bit Manipulation', description: 'Bitwise operations' },
        { id: 'math', name: 'Math', description: 'Mathematical problems' }
    ];

    const generateProblems = (level, days, selectedTopics) => {
        // Helper function to shuffle an array
        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        // 1. Define the difficulty distributions per level
        const distributions = {
            beginner: { easy: 0.60, medium: 0.30, hard: 0.10 },
            intermediate: { easy: 0.25, medium: 0.50, hard: 0.25 },
            pro: { easy: 0.10, medium: 0.30, hard: 0.60 },
        };
        const distribution = distributions[level];

        // 2. Create a unified pool of all problems from the JSON data
        const allProblems = [
            ...problemsData.beginner,
            ...problemsData.intermediate,
            ...problemsData.pro,
        ];
        // Ensure problems are unique by using a Map
        const uniqueProblems = Array.from(new Map(allProblems.map(p => [p.id, p])).values());

        // 3. Filter this pool by selected topics, if any
        let topicFilteredProblems = uniqueProblems;
        if (selectedTopics && selectedTopics.length > 0) {
            const topicNames = selectedTopics.map(topicId => {
                const topic = availableTopics.find(t => t.id === topicId);
                return topic ? topic.name : '';
            }).filter(Boolean);

            const filtered = uniqueProblems.filter(problem =>
                topicNames.some(topicName =>
                    problem.topic.toLowerCase().includes(topicName.toLowerCase())
                )
            );

            // Only apply filter if it results in some problems, otherwise use all topics
            if (filtered.length > 0) {
                topicFilteredProblems = filtered;
            }
        }

        // 4. Separate the filtered problems into difficulty buckets
        const easyPool = shuffleArray(topicFilteredProblems.filter(p => p.difficulty === 'Easy'));
        const mediumPool = shuffleArray(topicFilteredProblems.filter(p => p.difficulty === 'Medium'));
        const hardPool = shuffleArray(topicFilteredProblems.filter(p => p.difficulty === 'Hard'));
        
        // 5. Determine the total number of problems for the plan
        // Let's aim for a consistent number of problems per day for better planning.
        const PROBLEMS_PER_DAY = 3; 
        const totalProblemsInPlan = days * PROBLEMS_PER_DAY;

        // 6. Calculate how many of each difficulty to select
        const numEasy = Math.floor(totalProblemsInPlan * distribution.easy);
        const numMedium = Math.floor(totalProblemsInPlan * distribution.medium);
        const numHard = totalProblemsInPlan - numEasy - numMedium;

        // 7. Select the problems, taking as many as are available up to the calculated number
        const selectedEasy = easyPool.slice(0, numEasy);
        const selectedMedium = mediumPool.slice(0, numMedium);
        const selectedHard = hardPool.slice(0, numHard);

        // 8. Combine into the final pool for the plan and shuffle them
        let finalProblemPool = shuffleArray([
            ...selectedEasy,
            ...selectedMedium,
            ...selectedHard
        ]);

        // 9. Distribute the final, curated pool of problems across the days
        const dailyPlan = [];
        const totalProblemsGenerated = finalProblemPool.length;

        for (let day = 1; day <= days; day++) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + (day - 1));

            // Distribute problems as evenly as possible
            const problemsForThisDay = [];
            const start = Math.floor(totalProblemsGenerated * (day - 1) / days);
            const end = Math.floor(totalProblemsGenerated * day / days);
            
            for (let i = start; i < end; i++) {
                problemsForThisDay.push({
                    ...finalProblemPool[i],
                    status: 'pending',
                    assignedDay: day
                });
            }

            dailyPlan.push({
                day,
                date: currentDate.toDateString(),
                dateObj: new Date(currentDate),
                problems: problemsForThisDay
            });
        }
        return dailyPlan;
    };

    const handleFormSubmit = () => {
        const plan = generateProblems(formData.level, formData.days, formData.topics);
        setStudyPlan(plan);

        // Flatten problems for task manager
        const allProblems = plan.flatMap(day => day.problems);
        setProblems(allProblems);

        setActiveTab('dashboard');
    };

    const toggleProblemStatus = (problemId) => {
        const updateProblemLogic = (problem) => {
            if (problem.id === problemId) {
                const newStatus = problem.status === 'completed' ? 'pending' : 'completed';
                if (newStatus === 'completed') {
                    // When a problem is marked as complete, set its review date and repetition stage.
                    return {
                        ...problem,
                        status: 'completed',
                        lastReviewed: new Date().toISOString(),
                        // If it's the first time, start at stage 0. If re-completing a review, increment the stage.
                        repetitions: problem.repetitions ? problem.repetitions + 1 : 0,
                    };
                } else {
                    // If unmarked, reset its review progress.
                    return {
                        ...problem,
                        status: 'pending',
                        lastReviewed: null,
                        repetitions: 0,
                    };
                }
            }
            return problem;
        };
    
        // Update the master list of problems
        setProblems(prev => prev.map(updateProblemLogic));
    
        // Also update the nested studyPlan state to keep the UI consistent
        setStudyPlan(prevPlan => prevPlan.map(day => ({
            ...day,
            problems: day.problems.map(updateProblemLogic)
        })));
    };

    const addCustomProblem = (customProblem) => {
        const newProblem = {
            id: Date.now(),
            ...customProblem,
            status: 'pending',
            isCustom: true
        };

        // This state is now the single source of truth for the total problem count
        setProblems(prev => [...prev, newProblem]);

        // This state is not being used, you can safely remove it
        // setCustomProblems(prev => [...prev, newProblem]); 

        setStudyPlan(prevPlan => {
            const customDayIndex = prevPlan.findIndex(day => day.day === 'custom');

            // If the "Custom Problems" day doesn't exist yet
            if (customDayIndex === -1) {
                return [
                    ...prevPlan,
                    {
                        day: 'custom',
                        date: 'Custom Problems',
                        dateObj: new Date(),
                        problems: [newProblem] // Create the day with the new problem
                    }
                ];
            }

            // If the "Custom Problems" day already exists
            return prevPlan.map((day, index) => {
                // Find the custom day by its index
                if (index === customDayIndex) {
                    // Return a *new* object for the custom day
                    return {
                        ...day, // Copy the old day's properties
                        problems: [...day.problems, newProblem] // Create a *new* problems array with the new problem added
                    };
                }
                // Return all other days unchanged
                return day;
            });
        });
    };

    const saveNote = (problemId, note) => {
        setNotes(prev => ({ ...prev, [problemId]: note }));
    };

    const getDifficultyColor = (difficulty) => {
        const baseColors = {
            'Easy': isDarkMode ? 'text-green-400 bg-green-900' : 'text-green-600 bg-green-100',
            'Medium': isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-100',
            'Hard': isDarkMode ? 'text-red-400 bg-red-900' : 'text-red-600 bg-red-100',
            'default': isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100'
        };
        return baseColors[difficulty] || baseColors.default;
    };


        const getProgressStats = () => {
        const stats = {
            total: problems.length,
            completed: 0,
            percentage: 0,
            easy: { total: 0, completed: 0, percentage: 0 },
            medium: { total: 0, completed: 0, percentage: 0 },
            hard: { total: 0, completed: 0, percentage: 0 },
        };

        problems.forEach(p => {
            if (p.status === 'completed') {
                stats.completed++;
            }
            switch (p.difficulty) {
                case 'Easy':
                    stats.easy.total++;
                    if (p.status === 'completed') stats.easy.completed++;
                    break;
                case 'Medium':
                    stats.medium.total++;
                    if (p.status === 'completed') stats.medium.completed++;
                    break;
                case 'Hard':
                    stats.hard.total++;
                    if (p.status === 'completed') stats.hard.completed++;
                    break;
            }
        });

        stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        stats.easy.percentage = stats.easy.total > 0 ? Math.round((stats.easy.completed / stats.easy.total) * 100) : 0;
        stats.medium.percentage = stats.medium.total > 0 ? Math.round((stats.medium.completed / stats.medium.total) * 100) : 0;
        stats.hard.percentage = stats.hard.total > 0 ? Math.round((stats.hard.completed / stats.hard.total) * 100) : 0;

        return stats;
    };


    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Header */}
            <header className={`shadow-sm border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* // UPDATED CLASSNAME: Adjusted font size for mobile. */}
                    <h1 className={`text-2xl font-extrabold drop-shadow-xl mb-2 font-mono tracking-wide transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-black'}`}>
  <span className="text-blue-600">&lt;/&gt;</span>CodePulse
</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                    isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <div className="flex items-center gap-3">
                                <img
                                    src={user?.avatar}
                                    alt={user?.name}
                                    className="w-8 h-8 rounded-full border-2 border-blue-200"
                                />
                                <div className="hidden sm:block">
                                    <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                                    <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className={`text-sm px-3 py-1 rounded-lg transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <nav className={`shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>               
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">                   
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto whitespace-nowrap">                      
            {[                  
                { id: 'setup', label: 'Setup', icon: Target },                     
                { id: 'dashboard', label: 'Dashboard', icon: Calendar },                       
                { id: 'tasks', label: 'Task Manager', icon: CheckCircle },                  
            ].map(tab => (                     
                <button                         
                    key={tab.id}                            
                    onClick={() => {
                        if (tab.id !== 'setup' && !studyPlan) {
                            setShowSetupError(true);
                        } else {
                            setActiveTab(tab.id);
                        }
                    }}                      
                    className={`flex items-center gap-2 px-2 sm:px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-300 ${                                
                        activeTab === tab.id                                    
                            ? 'border-blue-500 text-blue-600'                                     
                            : isDarkMode                                   
                                ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'                                     
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'                             
                    } ${tab.id !== 'setup' && !studyPlan ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}                  
                >                       
                    <tab.icon size={18} />                       
                    {tab.label}                 
                </button>                 
            ))}                   
        </div>                  
    </div>               
</nav>

{/* Error Modal - Add this after your navigation */}
{showSetupError && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
            <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium">Setup Required</h3>
            </div>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Complete Personalized setup first and generate your Plan to access Dashboard and Task Manager.
            </p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => setShowSetupError(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        setShowSetupError(false);
                        setActiveTab('setup');
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Go to Setup
                </button>
            </div>
        </div>
    </div>
)}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'setup' && <SetupForm
                    isDarkMode={isDarkMode}
                    formData={formData}
                    setFormData={setFormData}
                    handleFormSubmit={handleFormSubmit}
                    availableTopics={availableTopics}
                />}
                {activeTab === 'dashboard' && studyPlan && (() => {
    const problemsForReview = problems.filter(p => p.status === 'completed' && p.lastReviewed);
    return (
        <Dashboard
            isDarkMode={isDarkMode}
            stats={getProgressStats()}
            spacedRepetition={problemsForReview}
            problems={problems} // Add this line
        />
    );
})()}

                {activeTab === 'tasks' && studyPlan && <TaskManager
                    studyPlan={studyPlan}
                    addCustomProblem={addCustomProblem}
                    toggleProblemStatus={toggleProblemStatus}
                    saveNote={saveNote}
                    isDarkMode={isDarkMode}
                    notes={notes}
                    getDifficultyColor={getDifficultyColor}
                    formatNoteContent={formatNoteContent}
                    insertCodeBlock={insertCodeBlock}
                />}

                {!studyPlan && activeTab !== 'setup' && (
                    <div className="text-center py-12">
                        <Brain className={`mx-auto mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
                        <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Study Plan Created</h3>
                        <p className={`mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create a study plan first to access this feature.</p>
                        <button
                            onClick={() => setActiveTab('setup')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            Create Study Plan
                        </button>
                    </div>
                )}
            </main>
             <footer className={`w-full py-6 mt-auto border-t transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        &copy; {new Date().getFullYear()} CodePulse Tracker. All Rights Reserved.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                         <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Project by <a href="https://www.linkedin.com/in/prakhar3125/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-500 hover:text-blue-400">Prakhar Sinha</a>
                        </p>
                        <a
                            href="https://github.com/prakhar3125"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
             
        </div>
    );
};

export default StudyPlanner;