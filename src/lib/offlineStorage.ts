import Dexie, { Table } from 'dexie';
import { supabase } from '@/lib/supabaseClient';

export interface PendingTransaction {
  id?: number;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  date: string;
}

class FinTrackDatabase extends Dexie {
  pendingTransactions!: Table<PendingTransaction, number>;

  constructor() {
    super('FinTrackOffline');
    this.version(1).stores({
      pendingTransactions: '++id, user_id, date'
    });
  }
}

export const db = new FinTrackDatabase();

/**
 * Menyimpan transaksi secara lokal ketika aplikasi sedang offline.
 */
export async function savePendingTransaction(data: Omit<PendingTransaction, 'id'>) {
  try {
    await db.pendingTransactions.add(data);
    console.log('Transaction saved offline successfully.');
  } catch (error) {
    console.error('Failed to save transaction offline:', error);
    throw error;
  }
}

/**
 * Sinkronisasi data offline ke Supabase.
 * Dipanggil ketika aplikasi kembali online.
 */
export async function syncOfflineData() {
  if (!navigator.onLine) {
    console.log('Currently offline, sync aborted.');
    return;
  }

  try {
    // Ambil semua transaksi yang tertunda
    const pendingTxs = await db.pendingTransactions.toArray();
    
    if (pendingTxs.length === 0) {
      console.log('No pending transactions to sync.');
      return;
    }

    console.log(`Found ${pendingTxs.length} pending transaction(s). Syncing to Supabase...`);

    // Proses sinkronisasi
    for (const tx of pendingTxs) {
      // Kita hapus properti 'id' lokal (Dexie) karena Supabase akan membuat UUID
      const { id, ...supabaseData } = tx;

      const { error } = await supabase
        .from('transactions')
        .insert([supabaseData]);

      if (!error) {
        // Hapus dari database lokal jika berhasil disinkronkan
        await db.pendingTransactions.delete(tx.id!);
        console.log(`Synced transaction ${tx.id} successfully.`);
      } else {
        console.error(`Failed to sync transaction ${tx.id}:`, error.message);
      }
    }
    
    console.log('Sync process completed.');
  } catch (error) {
    console.error('Error during offline sync process:', error);
  }
}


