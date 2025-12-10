import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
}

const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return; // Prevent changing answer after reveal
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === currentQuestion.correct_option_index) {
      setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
        <div className="bg-indigo-100 p-4 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
        <p className="text-slate-600 mb-8 text-lg">
          You scored <span className="font-bold text-indigo-600 text-2xl">{score}</span> out of <span className="font-bold text-slate-800 text-2xl">{questions.length}</span>
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
          {currentQuestion.question_text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            let borderClass = "border-slate-200 hover:border-indigo-300";
            let bgClass = "bg-white hover:bg-slate-50";
            let icon = null;

            if (showExplanation) {
              if (index === currentQuestion.correct_option_index) {
                borderClass = "border-green-500 bg-green-50";
                icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
              } else if (index === selectedOption && index !== currentQuestion.correct_option_index) {
                borderClass = "border-red-500 bg-red-50";
                icon = <XCircle className="w-5 h-5 text-red-600" />;
              } else {
                borderClass = "border-slate-200 opacity-60";
              }
            } else if (selectedOption === index) {
              borderClass = "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group ${borderClass} ${bgClass}`}
              >
                <span className={`font-medium ${showExplanation && index === currentQuestion.correct_option_index ? 'text-green-800' : 'text-slate-700'}`}>
                  {option}
                </span>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation & Action */}
      <div className="h-40"> {/* Fixed height to prevent layout shift */}
        {showExplanation ? (
          <div className="animate-fade-in-up">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800 mb-1">Explanation</p>
                <p className="text-blue-700 text-sm leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                selectedOption === null
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Check Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;