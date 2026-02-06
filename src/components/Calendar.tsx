'use client';

import { useState, useEffect } from 'react';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun?: string;
  enabled: boolean;
  type: 'tweet' | 'check' | 'research' | 'engagement' | 'report' | 'other';
}

const typeColors: Record<string, string> = {
  tweet: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  check: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  research: 'bg-green-500/20 text-green-400 border-green-500/30',
  engagement: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  report: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function Calendar() {
  const [view, setView] = useState<'list' | 'weekly'>('list');
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCronJobs();
  }, []);

  const fetchCronJobs = async () => {
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch cron jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNextRun = (nextRun: string) => {
    const date = new Date(nextRun);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return 'Overdue';
    if (hours < 1) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h ${minutes}m`;
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.nextRun);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  const enabledJobs = jobs.filter(j => j.enabled);
  const todayJobs = jobs.filter(j => {
    const jobDate = new Date(j.nextRun);
    return jobDate.toDateString() === new Date().toDateString();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-purple-400 text-lg">Loading cron jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: enabledJobs.length.toString(), icon: '⏰' },
          { label: 'Running Today', value: todayJobs.length.toString(), icon: '📅' },
          { label: 'Total Jobs', value: jobs.length.toString(), icon: '📊' },
          { label: 'Disabled', value: jobs.filter(j => !j.enabled).length.toString(), icon: '⏸️' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <span>{stat.icon}</span>
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'list'
              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
              : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          📋 List View
        </button>
        <button
          onClick={() => setView('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'weekly'
              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
              : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          📅 Weekly View
        </button>
        <button
          onClick={fetchCronJobs}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-3">
          {jobs.sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()).map((job) => (
            <div
              key={job.id}
              className={`bg-gray-900/50 border rounded-xl p-4 transition-all ${
                job.enabled ? 'border-gray-800 hover:border-purple-500/30' : 'border-gray-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className={`w-3 h-3 rounded-full ${job.enabled ? 'bg-green-400' : 'bg-gray-600'}`}></div>

                {/* Type Badge */}
                <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${typeColors[job.type] || typeColors.other}`}>
                  {job.type}
                </div>

                {/* Job Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{job.name}</h3>
                  <p className="text-sm text-gray-400">{job.schedule}</p>
                </div>

                {/* Next Run */}
                <div className="text-right">
                  <div className="text-sm font-medium text-purple-400">
                    {formatNextRun(job.nextRun)}
                  </div>
                  {job.lastRun && (
                    <div className="text-xs text-gray-500">
                      Last: {new Date(job.lastRun).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly View */}
      {view === 'weekly' && (
        <div className="grid grid-cols-7 gap-2">
          {getWeekDays().map((date, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 min-h-[200px]">
              <div className={`text-center mb-3 pb-2 border-b border-gray-800 ${
                date.toDateString() === new Date().toDateString() ? 'text-purple-400' : 'text-gray-400'
              }`}>
                <div className="text-xs uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-lg font-bold ${
                  date.toDateString() === new Date().toDateString() ? 'bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''
                }`}>
                  {date.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {getJobsForDay(date).slice(0, 6).map((job) => (
                  <div
                    key={job.id}
                    className={`text-xs p-1.5 rounded border ${typeColors[job.type] || typeColors.other} truncate`}
                    title={job.name}
                  >
                    {job.name}
                  </div>
                ))}
                {getJobsForDay(date).length > 6 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{getJobsForDay(date).length - 6} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
