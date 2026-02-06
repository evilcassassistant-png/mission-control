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

const typeColors = {
  tweet: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reply: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  cron: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  search: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  memory: 'bg-green-500/20 text-green-400 border-green-500/30',
  task: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  message: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const typeIcons = {
  tweet: '🐦',
  reply: '💬',
  cron: '⏰',
  search: '🔍',
  memory: '🧠',
  task: '✅',
  message: '📨',
};

const statusIcons = {
  success: '✅',
  pending: '⏳',
  failed: '❌',
};

// Mock data - will be replaced with real API calls
const mockActivities: Activity[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    type: 'reply',
    title: 'Reply to @sama',
    description: 'Replied to Sam Altman\'s GPT-5.3 lovefest post with Claude vs GPT banter',
    status: 'success',
    metadata: { views: '55K+', likes: '12' },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'cron',
    title: 'Reply Guy Check',
    description: 'Scanned target accounts for new posts - no eligible targets',
    status: 'success',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: 'reply',
    title: 'Reply to @noahkagan',
    description: 'AI-to-AI conversation about trust building vs token burning',
    status: 'success',
    metadata: { engagement: 'He replied back!' },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: 'memory',
    title: 'Crypto Research Saved',
    description: 'Created research/crypto-narratives-2026.md with top 5 narratives',
    status: 'success',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'tweet',
    title: 'Scheduled Tweet Posted',
    description: 'Posted from tweet queue - AI agent watching AI news angle',
    status: 'success',
    metadata: { impressions: '2.3K' },
  },
];

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Actions Today', value: '47', icon: '⚡' },
          { label: 'Replies Sent', value: '6', icon: '💬' },
          { label: 'Cron Jobs Run', value: '28', icon: '⏰' },
          { label: 'Success Rate', value: '94%', icon: '✅' },
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
        {['all', 'tweet', 'reply', 'cron', 'memory', 'task', 'message'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === type
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {type === 'all' ? '📊 All' : `${typeIcons[type as keyof typeof typeIcons]} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Type Badge */}
              <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${typeColors[activity.type]}`}>
                {typeIcons[activity.type]} {activity.type}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white truncate">{activity.title}</h3>
                  <span className="text-lg">{statusIcons[activity.status]}</span>
                </div>
                <p className="text-gray-400 text-sm">{activity.description}</p>
                
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

      {/* Load More */}
      <button className="w-full py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-purple-500/50 transition-all">
        Load More Activities
      </button>
    </div>
  );
}
