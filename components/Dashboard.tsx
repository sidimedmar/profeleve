import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Download } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { lang, submissions, setView } = useApp();
  const t = TRANSLATIONS[lang];

  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc, curr) => acc + curr.percentage, 0) / submissions.length)
    : 0;

  const chartData = submissions.map((s, i) => ({
    name: s.studentName.split(' ')[0], // First name for chart
    score: s.percentage
  }));

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Score', 'Total', 'Percentage', 'Time'];
    const rows = submissions.map(s => [
      s.studentName,
      s.studentPhone,
      s.score,
      s.totalPoints,
      s.percentage.toFixed(2) + '%',
      new Date(s.timestamp).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quiz_results.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => setView('landing')} className="flex items-center text-gray-600 hover:text-primary">
          <ArrowLeft className="w-5 h-5 mx-2" /> {t.back}
        </button>
        <h2 className="text-3xl font-bold text-slate-800">{t.dashboard}</h2>
        <button onClick={exportCSV} className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-4 py-2 rounded border border-green-200">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase">{t.totalSubmissions}</h3>
          <p className="text-4xl font-bold text-slate-800 mt-2">{submissions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase">{t.averageScore}</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{avgScore.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 h-80">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">{t.studentName}</th>
                <th className="p-4 text-sm font-semibold text-gray-600">{t.studentPhone}</th>
                <th className="p-4 text-sm font-semibold text-gray-600">{t.score}</th>
                <th className="p-4 text-sm font-semibold text-gray-600">%</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{sub.studentName}</td>
                  <td className="p-4 text-gray-500">{sub.studentPhone}</td>
                  <td className="p-4 text-gray-600">{sub.score} / {sub.totalPoints}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.percentage.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(sub.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};