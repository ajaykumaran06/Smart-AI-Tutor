import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizData';
import { TOPICS_DATA } from '../data/topicsData';
import { useApp } from '../context/AppContext';

export const QuizzesView: React.FC = () => {
  const { recordQuizAttempt, setCurrentView, setTutorInitialPrompt, setTutorAlgorithmContext } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [quizMode, setQuizMode] = useState<'practice' | 'assessment'>('practice');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Filter questions
  const activeQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter(q => {
      const matchTopic = selectedTopicId === 'all' || q.topicId === selectedTopicId;
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchTopic && matchDiff;
    });
  }, [selectedTopicId, selectedDifficulty]);

  const currentQ: QuizQuestion | undefined = activeQuestions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleSubmitQuiz = () => {
    if (activeQuestions.length === 0) return;
    setQuizSubmitted(true);

    let score = 0;
    const responses = activeQuestions.map((q, idx) => {
      const chosen = selectedAnswers[idx] ?? -1;
      const isCorrect = chosen === q.correctAnswerIndex;
      if (isCorrect) score++;

      return {
        questionId: q.id,
        questionText: q.question,
        chosenIndex: chosen,
        correctIndex: q.correctAnswerIndex,
        isCorrect,
      };
    });

    const percentage = Math.round((score / activeQuestions.length) * 100);

    recordQuizAttempt({
      topicId: selectedTopicId === 'all' ? 'compiler-phases' : selectedTopicId,
      topicTitle: selectedTopicId === 'all' ? 'General Compiler Theory' : activeQuestions[0].topicTitle,
      difficulty: (selectedDifficulty === 'all' ? 'Medium' : selectedDifficulty) as any,
      mode: quizMode,
      score,
      totalQuestions: activeQuestions.length,
      percentage,
      responses,
    });
  };

  const currentScore = useMemo(() => {
    if (!quizSubmitted) return 0;
    return activeQuestions.reduce((acc, q, idx) => {
      return selectedAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc;
    }, 0);
  }, [quizSubmitted, activeQuestions, selectedAnswers]);

  const percentage = activeQuestions.length > 0 ? Math.round((currentScore / activeQuestions.length) * 100) : 0;

  const askTutorAboutMistake = (q: QuizQuestion, chosenIndex: number) => {
    const chosenText = q.options[chosenIndex] || 'None';
    const correctText = q.options[q.correctAnswerIndex];

    setTutorAlgorithmContext({
      type: 'quiz_question_mistake',
      topic: q.topicTitle,
      question: q.question,
      chosenAnswer: chosenText,
      correctAnswer: correctText,
      officialExplanation: q.explanation,
    });
    setTutorInitialPrompt(`In the compiler design quiz question: "${q.question}", I chose "${chosenText}" instead of "${correctText}". Can you explain why my answer is incorrect and clarify the core concept?`);
    setCurrentView('tutor');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Filter & Mode Configuration */}
      <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compiler Design Assessments</h3>
              <p className="text-xs text-slate-400">Curated question bank with instant explanations and diagnostic tracking</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setQuizMode('practice');
                handleResetQuiz();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                quizMode === 'practice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Practice Mode (Instant Feedback)
            </button>
            <button
              onClick={() => {
                setQuizMode('assessment');
                handleResetQuiz();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                quizMode === 'assessment'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assessment Mode (Exam Test)
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Filter by Curriculum Topic:
            </label>
            <select
              value={selectedTopicId}
              onChange={e => {
                setSelectedTopicId(e.target.value);
                handleResetQuiz();
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Topics (Comprehensive Mock Exam)</option>
              {TOPICS_DATA.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Difficulty Tier:
            </label>
            <select
              value={selectedDifficulty}
              onChange={e => {
                setSelectedDifficulty(e.target.value);
                handleResetQuiz();
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard (Exam-level problems)</option>
            </select>
          </div>
        </div>
      </div>

      {activeQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0e1424] border border-slate-800/80 text-slate-400 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No questions match the selected filters</h4>
          <p className="text-xs">Try selecting "All Topics" or adjusting the difficulty level.</p>
        </div>
      ) : !quizSubmitted ? (
        /* Active Question Card */
        <div className="rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden p-8 space-y-6">
          {/* Question Stepper Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs text-slate-400">
            <span className="font-mono text-indigo-400 font-semibold">
              Question {currentQuestionIndex + 1} of {activeQuestions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">{currentQ?.topicTitle}</span>
              <span>·</span>
              <span className="font-mono text-violet-400 font-semibold">{currentQ?.difficulty}</span>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-bold text-white leading-relaxed">
            {currentQ?.question}
          </h3>

          {/* Option Choices */}
          <div className="space-y-3 pt-2">
            {currentQ?.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
              const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
              const isCorrectOpt = optIdx === currentQ.correctAnswerIndex;

              // In practice mode, reveal right away if answered
              const showPracticeFeedback = quizMode === 'practice' && isAnswered;

              let btnStyle = 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300';
              if (showPracticeFeedback) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'bg-red-950/40 border-red-500 text-red-200 ring-1 ring-red-500';
                }
              } else if (isSelected) {
                btnStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl text-left border text-sm font-medium transition-all flex items-center gap-3.5 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Practice Mode Instant Explanation Box */}
          {quizMode === 'practice' && selectedAnswers[currentQuestionIndex] !== undefined && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 animate-fadeIn text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Explanation & Rationale</span>
                </span>
                {selectedAnswers[currentQuestionIndex] !== currentQ?.correctAnswerIndex && (
                  <button
                    onClick={() => askTutorAboutMistake(currentQ!, selectedAnswers[currentQuestionIndex])}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain why this is wrong</span>
                  </button>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentQ?.explanation}
              </p>
            </div>
          )}

          {/* Navigation & Submit Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Previous
            </button>

            {currentQuestionIndex < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="rounded-2xl bg-[#0e1424] border border-slate-800/80 shadow-xl overflow-hidden p-8 space-y-8">
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Quiz Completed!</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span
                className={`text-4xl font-extrabold font-mono ${
                  percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {percentage}%
              </span>
              <span className="text-slate-400 text-sm">
                ({currentScore} / {activeQuestions.length} correct)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {percentage >= 70
                ? 'Excellent understanding! Your mastery score has been updated in your profile.'
                : 'Good attempt. Review the questions you missed below or ask the AI Tutor for clarification.'}
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setCurrentView('progress')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                View Mastery Progress
              </button>
            </div>
          </div>

          {/* Question-by-Question Review List */}
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <h4 className="text-sm font-bold text-white">Question Review</h4>
            {activeQuestions.map((q, idx) => {
              const chosen = selectedAnswers[idx];
              const isCorrect = chosen === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border space-y-2 text-xs ${
                    isCorrect
                      ? 'bg-slate-900/50 border-slate-800'
                      : 'bg-red-950/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-white">
                      Q{idx + 1}: {q.question}
                    </span>
                    <span
                      className={`font-mono font-bold shrink-0 ${
                        isCorrect ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <p>
                      Your answer: <strong>{q.options[chosen] || 'None'}</strong>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-300 font-semibold">
                        Correct answer: {q.options[q.correctAnswerIndex]}
                      </p>
                    )}
                  </div>

                  <p className="text-slate-400 pt-1 leading-relaxed">{q.explanation}</p>

                  {!isCorrect && (
                    <button
                      onClick={() => askTutorAboutMistake(q, chosen ?? -1)}
                      className="mt-2 flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask AI Tutor to explain why my answer was wrong</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
