import { subDays, subMonths, format, isSameDay, isSameWeek, isSameMonth, isSameYear } from "date-fns";

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift'],
  expense: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Health']
};

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Generate for the last 365 days
  for (let i = 0; i < 365; i++) {
    const currentDay = subDays(now, i);
    
    // Add 1-3 transactions per day randomly
    const numTx = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numTx; j++) {
      const isIncome = Math.random() > 0.8; // 20% chance of income
      const type: TransactionType = isIncome ? 'income' : 'expense';
      
      const categoryList = CATEGORIES[type];
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      
      let amount = 0;
      let title = "";
      
      if (type === 'income') {
        amount = category === 'Salary' ? 5000 : Math.floor(Math.random() * 1000) + 100;
        title = `${category} Payment`;
      } else {
        amount = Math.floor(Math.random() * 150) + 10;
        if (category === 'Housing') amount = 1500;
        title = `${category} Expense`;
      }
      
      // Make some recent ones specific
      if (i < 7) {
        if (category === 'Food') title = ['Starbucks', 'UberEats', 'Whole Foods', 'Local Restaurant'][Math.floor(Math.random() * 4)];
        if (category === 'Transport') title = ['Uber', 'Gas Station', 'Subway'][Math.floor(Math.random() * 3)];
        if (category === 'Shopping') title = ['Amazon', 'Target', 'Apple Store'][Math.floor(Math.random() * 3)];
      }

      transactions.push({
        id: `tx-${i}-${j}-${Math.random().toString(36).substr(2, 9)}`,
        description: title,
        amount,
        type,
        category,
        date: currentDay.toISOString()
      });
    }
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
