import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { QuestionType, Submission } from '../types';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export const StudentQuiz: React.FC = () => {
  const { lang, activeQuiz, addSubmission, setView } = useApp();
  const t = TRANSLATIONS[lang];

  const [step, setStep] = useState<'login' | 'quiz' | 'result'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null);

  if (!activeQuiz || !activeQuiz.isActive) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl text-gray-600">{t.noQuizActive}</h2>
        <button onClick={() => setView('landing')} className="mt-4 text-primary underline">{t.back}</button>
      </div>
    );
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) setStep('quiz');
  };

  const handleOptionSelect = (qId: string, optId: number, type: QuestionType) => {
    setAnswers(prev => {
      const current = prev[qId] || [];
      if (type === QuestionType.SINGLE) {
        return { ...prev, [qId]: [optId] };
      } else {
        if (current.includes(optId)) {
          return { ...prev, [qId]: current.filter(id => id !== optId) };
        } else {
          return { ...prev, [qId]: [...current, optId] };
        }
      }
    });
  };

  const handleSubmit = () => {
    let score = 0;
    let totalPoints = 0;

    activeQuiz.questions.forEach(q => {
      totalPoints += q.points;
      const studentAns = answers[q.id] || [];
      const correctAns = q.correctOptionIds;
      
      // Simple exact match logic for full points
      const isCorrect = 
        studentAns.length === correctAns.length && 
        studentAns.every(val => correctAns.includes(val));
      
      if (isCorrect) {
        score += q.points;
      }
    });

    const result: Submission = {
      id: crypto.randomUUID(),
      studentName: name,
      studentPhone: phone,
      answers,
      score,
      totalPoints,
      percentage: totalPoints > 0 ? (score / totalPoints) * 100 : 0,
      timestamp: Date.now()
    };

    addSubmission(result);
    setSubmissionResult(result);
    setStep('result');
  };

  if (step === 'login') {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <button onClick={() => setView('landing')} className="mb-4 text-gray-500 flex items-center gap-2"><ArrowLeft size={16}/> {t.back}</button>
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">{t.welcome}</h2>
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.studentName}</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.studentPhone}</label>
            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition">{t.startQuiz}</button>
        </form>
      </div>
    );
  }

  if (step === 'result' && submissionResult) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.submit} Success!</h2>
        <p className="text-gray-600 mb-6">{t.studentName}: {submissionResult.studentName}</p>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <p className="text-sm text-gray-500 uppercase tracking-wide">{t.score}</p>
          <div className="text-5xl font-extrabold text-primary mt-2">
            {submissionResult.percentage.toFixed(0)}%
          </div>
          <p className="text-gray-600 mt-2">{submissionResult.score} / {submissionResult.totalPoints} pts</p>
        </div>

        <button onClick={() => setView('landing')} className="mt-8 w-full py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{activeQuiz.title}</h1>
        <p className="text-gray-500 text-sm">{activeQuiz.description}</p>
      </div>

      <div className="space-y-6">
        {activeQuiz.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{idx + 1}. {q.text}</h3>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{q.points} pts</span>
            </div>

            <div className="space-y-3">
              {q.options.map(opt => {
                const isSelected = (answers[q.id] || []).includes(opt.id);
                return (
                  <label key={opt.id} className={`flex items-center p-3 rounded border cursor-pointer transition-all ${isSelected ? 'border-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type={q.type === QuestionType.SINGLE ? 'radio' : 'checkbox'}
                      name={q.id}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(q.id, opt.id, q.type)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="mx-3 text-gray-700">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center z-10">
        <button 
          onClick={handleSubmit}
          className="bg-primary text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
        >
          {t.submit}
        </button>
      </div>
    </div>
  );
};