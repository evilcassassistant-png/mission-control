'use client';

import { useState, useEffect } from 'react';
import ActivityFeed from '@/components/ActivityFeed';
import Calendar from '@/components/Calendar';
import GlobalSearch from '@/components/GlobalSearch';

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'search'>('activity');

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-900/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">😈</span>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-sm text-gray-400">Evil Cass Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'activity', label: '📋 Activity Feed', icon: '📋' },
              { id: 'calendar', label: '📅 Calendar', icon: '📅' },
              { id: 'search', label: '🔍 Global Search', icon: '🔍' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'search' && <GlobalSearch />}
      </div>
    </main>
  );
}
