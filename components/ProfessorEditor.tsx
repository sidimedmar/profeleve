import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Question, QuestionType, Option } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Trash2, Save, Wand2, ArrowLeft } from 'lucide-react';
import { generateQuestionFromTopic } from '../services/geminiService';

export const ProfessorEditor: React.FC = () => {
  const { lang, activeQuiz, updateActiveQuiz, setView } = useApp();
  const t = TRANSLATIONS[lang];
  const [questions, setQuestions] = useState<Question[]>(activeQuiz?.questions || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      text: '',
      type: QuestionType.SINGLE,
      options: [{ id: 0, text: '' }, { id: 1, text: '' }],
      correctOptionIds: [],
      points: 1
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: string, optId: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      return {
        ...q,
        options: q.options.map(o => o.id === optId ? { ...o, text } : o)
      };
    }));
  };

  const toggleCorrectOption = (qId: string, optId: number) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const isSelected = q.correctOptionIds.includes(optId);
      let newCorrectIds = [];
      if (q.type === QuestionType.SINGLE) {
        newCorrectIds = [optId];
      } else {
        newCorrectIds = isSelected 
          ? q.correctOptionIds.filter(id => id !== optId)
          : [...q.correctOptionIds, optId];
      }
      return { ...q, correctOptionIds: newCorrectIds };
    }));
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const newId = q.options.length > 0 ? Math.max(...q.options.map(o => o.id)) + 1 : 0;
      return { ...q, options: [...q.options, { id: newId, text: '' }] };
    }));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handlePublish = () => {
    updateActiveQuiz({
      id: activeQuiz?.id || crypto.randomUUID(),
      title: activeQuiz?.title || 'New Quiz',
      description: 'Updated by Professor',
      isActive: true,
      questions
    });
    alert(t.publishQuiz + ' Success!');
    setView('landing');
  };

  const handleAiGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    const newQ = await generateQuestionFromTopic(aiTopic, lang);
    setIsGenerating(false);
    if (newQ) {
      setQuestions([...questions, newQ as Question]);
      setAiTopic('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setView('landing')} className="flex items-center text-gray-600 hover:text-primary">
          <ArrowLeft className="w-5 h-5 mx-2" /> {t.back}
        </button>
        <h2 className="text-2xl font-bold text-slate-800">{t.createQuiz}</h2>
      </div>

      {/* AI Generator Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-8 border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          <Wand2 className="w-4 h-4 mx-2" /> {t.generateWithAI}
        </h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder={t.topicPrompt}
            className="flex-1 p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={handleAiGenerate}
            disabled={isGenerating || !aiTopic}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? t.generating : t.generateWithAI}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-gray-500">Q{idx + 1}</span>
              <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.questionText}</label>
                <input 
                  type="text" 
                  value={q.text} 
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.points}</label>
                  <input 
                    type="number" 
                    value={q.points} 
                    onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={q.type} 
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value={QuestionType.SINGLE}>{t.typeSingle}</option>
                    <option value={QuestionType.MULTIPLE}>{t.typeMultiple}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{t.options}</label>
              {q.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input 
                    type={q.type === QuestionType.SINGLE ? 'radio' : 'checkbox'}
                    name={`correct-${q.id}`}
                    checked={q.correctOptionIds.includes(opt.id)}
                    onChange={() => toggleCorrectOption(q.id, opt.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input 
                    type="text" 
                    value={opt.text}
                    onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                    placeholder={t.optionText}
                    className={`flex-1 p-2 border rounded ${q.correctOptionIds.includes(opt.id) ? 'border-green-500 bg-green-50' : ''}`}
                  />
                </div>
              ))}
              <button onClick={() => addOption(q.id)} className="text-sm text-blue-600 hover:underline mt-2">
                + {t.options}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={handleAddQuestion} className="flex-1 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2">
          <Plus className="w-5 h-5" /> {t.addQuestion}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-center z-10">
        <button 
          onClick={handlePublish}
          className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Save className="w-5 h-5" /> {t.publishQuiz}
        </button>
      </div>
    </div>
  );
};