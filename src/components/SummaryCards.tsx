import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

interface SummaryCardsProps {
  income: number;
  expense: number;
  compact?: boolean; // sidebar mode: vertical stack, smaller text
}

export function SummaryCards({ income, expense, compact = false }: SummaryCardsProps) {
  const balance = income - expense;

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  if (compact) {
    // Sidebar-friendly vertical stack (desktop only)
    return (
      <div className="space-y-3">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-medium">Total Income</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">{formatRp(income)}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-xs font-medium">Total Expense</span>
          </div>
          <div className="text-xl font-bold text-rose-400">{formatRp(expense)}</div>
        </div>
      </div>
    );
  }

  // Full 3-card horizontal row (mobile + tablet)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Total Balance */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 text-zinc-400 mb-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <Wallet className="w-4 h-4 text-zinc-100" />
          </div>
          <span className="text-sm font-medium">Total Balance</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-zinc-50">
          {formatRp(balance)}
        </div>
      </div>

      {/* Income */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 text-zinc-400 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-medium">Total Income</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
          {formatRp(income)}
        </div>
      </div>

      {/* Expense */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 text-zinc-400 mb-3">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-sm font-medium">Total Expense</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-rose-400">
          {formatRp(expense)}
        </div>
      </div>
    </div>
  );
}
