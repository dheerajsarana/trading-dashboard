import * as XLSX from 'xlsx';
import { Trade } from '../types';

export const parseExcelFile = (file: File): Promise<Trade[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const trades: Trade[] = jsonData.map((row: any) => {
          // Parse the type to determine buy/sell
          const type = row.Type?.toLowerCase().includes('buy') || row.Type?.toLowerCase().includes('long') 
            ? 'buy' 
            : 'sell';

          return {
            openTime: parseExcelDate(row.Time),
            position: row.Position || '',
            symbol: row.Symbol || '',
            type,
            volume: parseFloat(row.Volume) || 0,
            openPrice: parseFloat(row.Price) || 0,
            stopLoss: parseFloat(row['S / L']) || 0,
            takeProfit: parseFloat(row['T / P']) || 0,
            closeTime: parseExcelDate(row.Time_1 || row['Time.1']),
            closePrice: parseFloat(row.Price_1 || row['Price.1']) || 0,
            commission: parseFloat(row.Commission) || 0,
            swap: parseFloat(row.Swap) || 0,
            profit: parseFloat(row.Profit) || 0,
          };
        });

        resolve(trades);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const parseExcelDate = (value: any): Date => {
  if (!value) return new Date();
  
  // If it's already a Date object
  if (value instanceof Date) return value;
  
  // If it's a string
  if (typeof value === 'string') {
    return new Date(value);
  }
  
  // If it's an Excel serial date number
  if (typeof value === 'number') {
    return XLSX.SSF.parse_date_code(value);
  }
  
  return new Date();
};
