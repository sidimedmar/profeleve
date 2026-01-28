import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Quiz, Submission, ViewState, Language, Question, QuestionType } from '../types';

interface AppContextType {
  view: ViewState;
  setView: (view: ViewState) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  activeQuiz: Quiz | null;
  updateActiveQuiz: (quiz: Quiz) => void;
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Dummy Data
const INITIAL_QUIZ: Quiz = {
  id: 'quiz-1',
  title: 'Demo Quiz',
  description: 'Generated from App',
  isActive: true,
  questions: [
    {
      id: 'q1',
      text: 'Quelle est la capitale de la France ? / ما هي عاصمة فرنسا؟',
      type: QuestionType.SINGLE,
      options: [
        { id: 0, text: 'Lyon' },
        { id: 1, text: 'Paris' },
        { id: 2, text: 'Marseille' },
        { id: 3, text: 'Bordeaux' }
      ],
      correctOptionIds: [1],
      points: 5
    }
  ]
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>('landing');
  const [lang, setLang] = useState<Language>('fr');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(INITIAL_QUIZ);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const updateActiveQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
  };

  const addSubmission = (submission: Submission) => {
    setSubmissions(prev => [...prev, submission]);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <AppContext.Provider value={{ 
      view, setView, 
      lang, setLang, 
      activeQuiz, updateActiveQuiz, 
      submissions, addSubmission 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};