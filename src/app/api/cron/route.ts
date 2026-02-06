import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'cron-jobs.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const jobs = JSON.parse(data);
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error reading cron jobs:', error);
    return NextResponse.json({ jobs: [], error: 'Failed to load cron jobs' }, { status: 500 });
  }
}
