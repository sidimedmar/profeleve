import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ProfessorEditor } from './components/ProfessorEditor';
import { StudentQuiz } from './components/StudentQuiz';
import { Dashboard } from './components/Dashboard';
import { TRANSLATIONS } from './constants';
import { GraduationCap, BookOpen, Globe } from 'lucide-react';

const Main: React.FC = () => {
  const { view, setView, lang, setLang } = useApp();
  const t = TRANSLATIONS[lang];

  // Landing Page Component
  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition text-sm font-bold text-gray-700"
          >
            <Globe size={16} />
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>

        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Kobo<span className="text-primary">Quiz</span> Sim
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            {t.welcome}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Professor Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 group cursor-pointer border border-white hover:border-blue-100"
               onClick={() => {}}>
             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
               <GraduationCap size={32} />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.roleProfessor}</h2>
             <div className="space-y-3 mt-6">
                <button onClick={() => setView('professor-edit')} className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition">
                  {t.createQuiz}
                </button>
                <button onClick={() => setView('professor-dashboard')} className="w-full py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition">
                  {t.viewResults}
                </button>
             </div>
          </div>

          {/* Student Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 group cursor-pointer border border-white hover:border-green-100">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
               <BookOpen size={32} />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.roleStudent}</h2>
             <div className="mt-6">
                <button onClick={() => setView('student-login')} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-lg shadow-green-200">
                  {t.takeQuiz}
                </button>
             </div>
          </div>
        </div>

        <footer className="mt-16 text-gray-400 text-sm">
          Simulating KoboToolbox Workflow • React + Tailwind + Gemini
        </footer>
      </div>
    );
  }

  // Routing Logic
  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'professor-edit' && <ProfessorEditor />}
      {view === 'professor-dashboard' && <Dashboard />}
      {view === 'student-login' && <StudentQuiz />}
      {view === 'student-quiz' && <StudentQuiz />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;