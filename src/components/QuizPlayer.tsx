import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: any;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const { db } = useFirebase();
  const { user } = useAuth();

  useEffect(() => {
    if (!showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      calculateScore();
    }
  };

  const calculateScore = async () => {
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Save result to Firebase
    try {
      await addDoc(collection(db, 'results'), {
        quizId: quiz.id,
        quizTitle: quiz.title,
        userId: user?.uid,
        userEmail: user?.email,
        score: finalScore,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        answers: selectedAnswers,
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="quiz-card text-center">
          <div className="text-6xl mb-6">
            {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Concluído!</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">{score}%</div>
          <p className="text-xl text-gray-600 mb-8">
            Você acertou {quiz.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length} de {quiz.questions.length} perguntas
          </p>

          <div className="space-y-4 mb-8">
            {quiz.questions.map((question, index) => (
              <div key={index} className="text-left p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">{question.question}</h4>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded ${
                        optionIndex === question.correctAnswer
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : selectedAnswers[index] === optionIndex
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-white'
                      }`}
                    >
                      {option}
                      {optionIndex === question.correctAnswer && ' ✓'}
                      {selectedAnswers[index] === optionIndex && optionIndex !== question.correctAnswer && ' ✗'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onComplete}
            className="btn-primary"
          >
            Ver Resultados
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="quiz-card">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Pergunta {currentQuestion + 1} de {quiz.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              Tempo: {timeLeft}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`option-button ${
                  selectedAnswers[currentQuestion] === index ? 'selected' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center">
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 rounded-full bg-current"></div>
                    )}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            {selectedAnswers[currentQuestion] !== undefined ? 'Resposta selecionada' : 'Selecione uma resposta'}
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;