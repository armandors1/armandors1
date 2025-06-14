import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import QuizCreator from './QuizCreator';
import QuizPlayer from './QuizPlayer';
import QuizResults from './QuizResults';

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

const QuizDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'play' | 'results'>('dashboard');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth, db } = useFirebase();
  const { user } = useAuth();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      const snapshot = await getDocs(query(quizzesRef, orderBy('createdAt', 'desc')));
      const quizzesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quiz[];
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleQuizCreated = () => {
    loadQuizzes();
    setActiveTab('dashboard');
  };

  const handlePlayQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveTab('play');
  };

  const handleQuizCompleted = () => {
    setActiveTab('results');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Quiz</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Olá, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'create', label: 'Criar Quiz' },
              { key: 'results', label: 'Resultados' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Quizzes Disponíveis</h2>
              <button
                onClick={() => setActiveTab('create')}
                className="btn-primary"
              >
                Criar Novo Quiz
              </button>
            </div>

            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum quiz encontrado</h3>
                <p className="text-gray-600 mb-6">Comece criando seu primeiro quiz!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  Criar Quiz
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="quiz-card">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{quiz.questions.length} perguntas</span>
                      <span>Por: {quiz.createdBy}</span>
                    </div>
                    <button
                      onClick={() => handlePlayQuiz(quiz)}
                      className="btn-primary w-full"
                    >
                      Jogar Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <QuizCreator onQuizCreated={handleQuizCreated} />
        )}

        {activeTab === 'play' && selectedQuiz && (
          <QuizPlayer quiz={selectedQuiz} onComplete={handleQuizCompleted} />
        )}

        {activeTab === 'results' && (
          <QuizResults />
        )}
      </main>
    </div>
  );
};

export default QuizDashboard;