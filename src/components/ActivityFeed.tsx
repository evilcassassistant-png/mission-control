'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  timestamp: string;
  type: 'tweet' | 'reply' | 'cron' | 'search' | 'memory' | 'task' | 'message';
  title: string;
  description: string;
  status: 'success' | 'pending' | 'failed';
  metadata?: Record<string, string>;
}

const typeColors: Record<string, string> = {
  tweet: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reply: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  cron: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  search: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  memory: 'bg-green-500/20 text-green-400 border-green-500/30',
  task: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  message: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const typeIcons: Record<string, string> = {
  tweet: '🐦',
  reply: '💬',
  cron: '⏰',
  search: '🔍',
  memory: '🧠',
  task: '✅',
  message: '📨',
};

const statusIcons: Record<string, string> = {
  success: '✅',
  pending: '⏳',
  failed: '❌',
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const todayCount = activities.filter(a => {
    const date = new Date(a.timestamp);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  const successCount = activities.filter(a => a.status === 'success').length;
  const successRate = activities.length > 0 ? Math.round((successCount / activities.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-purple-400 text-lg">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Actions Today', value: todayCount.toString(), icon: '⚡' },
          { label: 'Replies Sent', value: activities.filter(a => a.type === 'reply').length.toString(), icon: '💬' },
          { label: 'Cron Jobs Run', value: activities.filter(a => a.type === 'cron').length.toString(), icon: '⏰' },
          { label: 'Success Rate', value: `${successRate}%`, icon: '✅' },
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={fetchActivities}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500/30 text-purple-300 border border-purple-500/50 hover:bg-purple-500/40 transition-all"
        >
          🔄 Refresh
        </button>
        {['all', 'tweet', 'reply', 'cron', 'memory', 'task'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === type
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {type === 'all' ? '📊 All' : `${typeIcons[type] || '📁'} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.slice(0, 20).map((activity) => (
          <div
            key={activity.id}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Type Badge */}
              <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${typeColors[activity.type] || typeColors.task}`}>
                {typeIcons[activity.type] || '📁'} {activity.type}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{activity.title}</h3>
                  <span className="text-lg">{statusIcons[activity.status] || '✅'}</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{activity.description}</p>
                
                {/* Metadata */}
                {activity.metadata && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {formatTime(activity.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No activities found
        </div>
      )}
    </div>
  );
}
