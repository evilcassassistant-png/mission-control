import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SearchResult {
  id: string;
  type: 'memory' | 'document' | 'task';
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
    const indexPath = path.join(process.cwd(), 'data', 'search-index.json');
    
    if (!fs.existsSync(indexPath)) {
      return NextResponse.json({ results: [] });
    }
    
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const results: SearchResult[] = [];
    let resultId = 0;
    
    for (const item of index) {
      const searchText = `${item.title} ${item.preview}`.toLowerCase();
      
      if (searchText.includes(query)) {
        const matches = (searchText.match(new RegExp(query, 'g')) || []).length;
        const relevance = Math.min(1, matches * 0.1 + 0.5);
        
        results.push({
          id: `search-${resultId++}`,
          type: item.type,
          title: item.title,
          content: item.preview,
          path: item.path,
          date: item.date,
          relevance
        });
      }
    }
    
    results.sort((a, b) => b.relevance - a.relevance);
    
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
