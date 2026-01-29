import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { ArrowLeft, Download, TrendingUp, Users, Award, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { lang, submissions, setView } = useApp();
  const t = TRANSLATIONS[lang];

  // Calculations
  const metrics = useMemo(() => {
    if (submissions.length === 0) return { avg: 0, high: 0, low: 0 };
    const scores = submissions.map(s => s.percentage);
    return {
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      high: Math.max(...scores),
      low: Math.min(...scores)
    };
  }, [submissions]);

  // Data for Student Scores Bar Chart
  const studentPerformanceData = useMemo(() => {
    return submissions.map(s => ({
      name: s.studentName.split(' ')[0],
      score: s.percentage,
      fullName: s.studentName
    }));
  }, [submissions]);

  // Data for Score Distribution (Histogram)
  const distributionData = useMemo(() => {
    const ranges = [
      { name: '0-20%', min: 0, max: 20 },
      { name: '21-40%', min: 21, max: 40 },
      { name: '41-60%', min: 41, max: 60 },
      { name: '61-80%', min: 61, max: 80 },
      { name: '81-100%', min: 81, max: 100 },
    ];
    return ranges.map(r => ({
      name: r.name,
      count: submissions.filter(s => s.percentage >= r.min && s.percentage <= r.max).length
    }));
  }, [submissions]);

  // Data for Submission Timeline
  const timelineData = useMemo(() => {
    if (submissions.length === 0) return [];
    // Group by minute for granularity
    const grouped = submissions.reduce((acc, curr) => {
      const date = new Date(curr.timestamp);
      // Format: HH:MM
      const key = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [submissions]);

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

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('landing')} className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 text-gray-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-bold text-slate-800">{t.dashboard}</h2>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-5 py-2.5 rounded-lg font-medium shadow-sm transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{t.totalSubmissions}</p>
            <p className="text-3xl font-bold text-slate-800">{submissions.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{t.averageScore}</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.avg.toFixed(1)}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{t.highestScore}</p>
            <p className="text-3xl font-bold text-green-600">{metrics.high.toFixed(0)}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Award size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{t.lowestScore}</p>
            <p className="text-3xl font-bold text-red-500">{metrics.low.toFixed(0)}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.scoreDistribution}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.submissionTimeline}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" padding={{ left: 20, right: 20 }} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Student Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 h-96">
         <h3 className="text-lg font-bold text-gray-800 mb-6">{t.viewResults} (Individual)</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 shadow-lg rounded-lg border text-sm">
                        <p className="font-bold">{data.fullName}</p>
                        <p className="text-blue-600">{data.score.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Detailed Submissions</h3>
        </div>
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
                  <td className="p-4 text-gray-400 text-sm">{new Date(sub.timestamp).toLocaleTimeString()} {new Date(sub.timestamp).toLocaleDateString()}</td>
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