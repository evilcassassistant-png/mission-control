import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Activity {
  id: string;
  timestamp: string;
  type: 'tweet' | 'reply' | 'cron' | 'search' | 'memory' | 'task' | 'message';
  title: string;
  description: string;
  status: 'success' | 'pending' | 'failed';
  metadata?: Record<string, string>;
}

export async function GET() {
  try {
    const workspacePath = path.join(process.cwd(), '..');
    const memoryPath = path.join(workspacePath, 'memory');
    
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
    
    const activities: Activity[] = [];
    
    // Try to read today's memory file
    const todayFile = path.join(memoryPath, `${todayStr}.md`);
    if (fs.existsSync(todayFile)) {
      const content = fs.readFileSync(todayFile, 'utf-8');
      const parsed = parseMemoryFile(content, todayStr);
      activities.push(...parsed);
    }
    
    // Also read yesterday's
    const yesterdayFile = path.join(memoryPath, `${yesterdayStr}.md`);
    if (fs.existsSync(yesterdayFile)) {
      const content = fs.readFileSync(yesterdayFile, 'utf-8');
      const parsed = parseMemoryFile(content, yesterdayStr);
      activities.push(...parsed);
    }
    
    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error reading activities:', error);
    return NextResponse.json({ activities: [], error: 'Failed to load activities' }, { status: 500 });
  }
}

function parseMemoryFile(content: string, date: string): Activity[] {
  const activities: Activity[] = [];
  const lines = content.split('\n');
  
  let currentSection = '';
  let activityId = 0;
  
  for (const line of lines) {
    // Detect sections
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
    }
    
    // Parse different types of activities based on content
    if (line.includes('@sama') || line.includes('@noahkagan') || line.includes('@shaunmmaguire')) {
      if (line.includes('reply') || line.includes('replied')) {
        activities.push({
          id: `${date}-${activityId++}`,
          timestamp: `${date}T12:00:00`,
          type: 'reply',
          title: `Twitter Reply`,
          description: line.replace(/[|*#]/g, '').trim().substring(0, 100),
          status: 'success',
        });
      }
    }
    
    if (line.includes('cron') || line.includes('Cron')) {
      activities.push({
        id: `${date}-${activityId++}`,
        timestamp: `${date}T10:00:00`,
        type: 'cron',
        title: 'Cron Job Run',
        description: line.replace(/[|*#]/g, '').trim().substring(0, 100),
        status: 'success',
      });
    }
    
    if (line.includes('research') || line.includes('Research')) {
      activities.push({
        id: `${date}-${activityId++}`,
        timestamp: `${date}T14:00:00`,
        type: 'memory',
        title: 'Research Saved',
        description: line.replace(/[|*#]/g, '').trim().substring(0, 100),
        status: 'success',
      });
    }
  }
  
  return activities;
}
