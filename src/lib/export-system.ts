
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction, Goal } from '@/store/useAppStore';

export class ExportSystem {
  /**
   * Obtiene todos los datos de un usuario desde Firestore.
   */
  private static async getAllUserData(userId: string): Promise<{ transactions: Transaction[]; goals: Goal[] }> {
    try {
      const transactionsRef = collection(db, 'users', userId, 'transactions');
      const goalsRef = collection(db, 'users', userId, 'goals');

      const [transactionsSnap, goalsSnap] = await Promise.all([
        getDocs(transactionsRef),
        getDocs(goalsRef)
      ]);

      const transactions = transactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Goal[];

      return { transactions, goals };

    } catch (error) {
      console.error("Error fetching user data for export:", error);
      return { transactions: [], goals: [] };
    }
  }

  /**
   * Genera un respaldo completo de los datos del usuario en formato JSON.
   */
  static async exportToJSON(userId: string) {
    const userData = await this.getAllUserData(userId);
    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finassist-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Exporta la lista de transacciones a un archivo CSV.
   */
  static exportToCSV(transactions: Transaction[]) {
    const headers = ['id', 'date', 'description', 'category', 'amount', 'type', 'createdAt'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.id,
        t.date,
        `"${t.description.replace(/"/g, '""')}"`, // Escapar comillas dobles
        t.category,
        t.amount,
        t.type,
        t.createdAt
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finassist-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
