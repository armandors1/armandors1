import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';

interface Result {
  id: string;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: any;
}

const QuizResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const { db } = useFirebase();
  const { user } = useAuth();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const resultsRef = collection(db, 'results');
      const q = query(
        resultsRef,
        where('userId', '==', user?.uid),
        orderBy('completedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const resultsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Result[];
      setResults(resultsData);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Meus Resultados</h2>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-600">Complete alguns quizzes para ver seus resultados aqui!</p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="quiz-card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{results.length}</div>
              <div className="text-gray-600">Quizzes Completados</div>
            </div>
            <div className="quiz-card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{averageScore}%</div>
              <div className="text-gray-600">Pontuação Média</div>
            </div>
            <div className="quiz-card text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {results.filter(r => r.score >= 80).length}
              </div>
              <div className="text-gray-600">Excelentes (80%+)</div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map(result => (
              <div key={result.id} className="quiz-card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {result.quizTitle}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        {result.correctAnswers}/{result.totalQuestions} corretas
                      </span>
                      <span>
                        {result.completedAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não disponível'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold mb-1 ${
                      result.score >= 80 ? 'text-green-600' :
                      result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.score}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.score >= 80 ? 'Excelente' :
                       result.score >= 60 ? 'Bom' : 'Precisa melhorar'}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        result.score >= 80 ? 'bg-green-600' :
                        result.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizResults;