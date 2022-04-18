// db.ts
import Dexie, { Table } from 'dexie';

export interface StockObservation {
    id?: number;
    date: Date;
    symbol: string;
    adjustedClose: string;          // Save it as as string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  stockObservation!: Table<StockObservation>;

  constructor() {
    super('PandaWatch');
    this.version(1).stores({
      stockObservation: '++id, date, symbol, adjustedClose, &[date+symbol]'
    });
  }
}

export const db = new MySubClassedDexie();