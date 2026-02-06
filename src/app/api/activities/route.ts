import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'activities.json');
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      const activities = JSON.parse(data);
      return NextResponse.json({ activities });
    }
    
    return NextResponse.json({ activities: [] });
  } catch (error) {
    console.error('Error reading activities:', error);
    return NextResponse.json({ activities: [], error: 'Failed to load activities' }, { status: 500 });
  }
}
