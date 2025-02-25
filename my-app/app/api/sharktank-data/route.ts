import { NextResponse } from 'next/server';
import * as d3 from 'd3';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'sharktank.csv');
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.error('CSV file not found at:', filePath);
      return NextResponse.json(
        { error: 'Data file not found' }, 
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    if (!fileContent) {
      console.error('Empty file content');
      return NextResponse.json(
        { error: 'Empty data file' }, 
        { status: 500 }
      );
    }

    const data = d3.csvParse(fileContent);
    
    if (!data || !data.length) {
      console.error('No data parsed from CSV');
      return NextResponse.json(
        { error: 'Failed to parse data' }, 
        { status: 500 }
      );
    }

    console.log('Sample data:', data[0]); // This will help debug column names
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' }, 
      { status: 500 }
    );
  }
}