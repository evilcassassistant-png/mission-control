import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SearchResult {
  id: string;
  type: 'memory' | 'document' | 'task' | 'conversation';
  title: string;
  content: string;
  path: string;
  date: string;
  relevance: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    const workspacePath = path.join(process.cwd(), '..');
    const results: SearchResult[] = [];
    
    // Search through key files
    const filesToSearch = [
      { path: 'MEMORY.md', type: 'memory' as const },
      { path: 'SOUL.md', type: 'document' as const },
      { path: 'USER.md', type: 'document' as const },
      { path: 'TOOLS.md', type: 'document' as const },
      { path: 'research/crypto-narratives-2026.md', type: 'memory' as const },
      { path: 'content/tweet-queue.md', type: 'task' as const },
      { path: 'content/tweet-stats.json', type: 'task' as const },
    ];
    
    // Also search memory directory
    const memoryDir = path.join(workspacePath, 'memory');
    if (fs.existsSync(memoryDir)) {
      const memoryFiles = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
      for (const file of memoryFiles) {
        filesToSearch.push({ path: `memory/${file}`, type: 'memory' as const });
      }
    }
    
    let resultId = 0;
    
    for (const file of filesToSearch) {
      const fullPath = path.join(workspacePath, file.path);
      
      if (!fs.existsSync(fullPath)) continue;
      
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.includes(query)) {
          // Calculate relevance based on frequency
          const matches = (lowerContent.match(new RegExp(query, 'g')) || []).length;
          const relevance = Math.min(1, matches * 0.1 + 0.5);
          
          // Extract relevant snippet
          const index = lowerContent.indexOf(query);
          const start = Math.max(0, index - 50);
          const end = Math.min(content.length, index + query.length + 150);
          const snippet = content.substring(start, end).replace(/\n/g, ' ').trim();
          
          // Get title from first heading or filename
          const titleMatch = content.match(/^#\s+(.+)/m);
          const title = titleMatch ? titleMatch[1] : file.path.split('/').pop() || file.path;
          
          // Get date from filename or file stats
          const dateMatch = file.path.match(/(\d{4}-\d{2}-\d{2})/);
          const stats = fs.statSync(fullPath);
          const date = dateMatch ? dateMatch[1] : stats.mtime.toISOString().split('T')[0];
          
          results.push({
            id: `search-${resultId++}`,
            type: file.type,
            title,
            content: snippet + '...',
            path: file.path,
            date,
            relevance,
          });
        }
      } catch (e) {
        // Skip files that can't be read
        continue;
      }
    }
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
