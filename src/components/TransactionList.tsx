import { Transaction } from "@/data/mockData";
import { formatCurrency, getCategoryIcon } from "@/utils/utils";
import { format, isToday, isYesterday } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const displayTransactions = transactions.slice(0, 15); // Show latest 15

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-50">Recent Transactions</h2>
      </div>
      
      <div className="overflow-y-auto flex-1 p-6 space-y-6 max-h-[600px]">
        {displayTransactions.map((tx) => {
          const Icon = getCategoryIcon(tx.category);
          const isIncome = tx.type === 'income';

          return (
            <div key={tx.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-50">{tx.description}</h3>
                  <div className="flex items-center text-sm text-zinc-400 gap-2 mt-0.5">
                    <span>{tx.category}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>
              </div>
              <div className={`font-semibold ${isIncome ? 'text-emerald-400' : 'text-zinc-50'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
