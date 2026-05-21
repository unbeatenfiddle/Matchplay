import Papa from 'papaparse';
import { DailyFile, SalesRow } from '@/types';
import { classifyCategory } from './categoryConfig';

function normalizeCategory(raw: string): string {
  return raw.trim().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/[$,"]/g, '')) || 0;
}

function extractDate(rows: string[][]): string {
  for (const row of rows) {
    if (row[0]?.trim() === 'Date Range' && row[1]) {
      const dateStr = row[1].split(' - ')[0].trim();
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [m, d, y] = parts;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }
  }
  return '';
}

function transformRows(allRows: string[][], filename: string, source: 'preloaded' | 'uploaded'): DailyFile {
  const date = extractDate(allRows);

  const headerIdx = allRows.findIndex(r => r[0]?.trim() === 'Minor Class');
  const dataRows = headerIdx >= 0 ? allRows.slice(headerIdx + 1) : [];

  let totalRevenue = 0;
  let totalQty = 0;
  const salesRows: SalesRow[] = [];

  for (const row of dataRows) {
    const cat = row[0]?.trim() ?? '';
    if (!cat || cat === 'Minor Class') continue;

    if (cat === 'Total') {
      totalQty = parseInt(row[2] ?? '0', 10) || 0;
      totalRevenue = parseAmount(row[3] ?? '0');
      continue;
    }

    const item = row[1]?.trim() ?? '';
    const quantity = parseInt(row[2] ?? '0', 10) || 0;
    const amount = parseAmount(row[3] ?? '0');
    const category = normalizeCategory(cat);

    salesRows.push({
      date,
      category,
      item,
      quantity,
      amount,
      foodOrBev: classifyCategory(cat),
    });
  }

  return { date, filename, source, rows: salesRows, totalRevenue, totalQty };
}

export async function parseCSVText(text: string, filename: string, source: 'preloaded' | 'uploaded' = 'uploaded'): Promise<DailyFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: false,
      complete: (results) => {
        try {
          resolve(transformRows(results.data, filename, source));
        } catch (e) {
          reject(e);
        }
      },
      error: reject,
    });
  });
}

export async function parseCSVFile(file: File): Promise<DailyFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: false,
      complete: (results) => {
        try {
          resolve(transformRows(results.data, file.name, 'uploaded'));
        } catch (e) {
          reject(e);
        }
      },
      error: reject,
    });
  });
}
