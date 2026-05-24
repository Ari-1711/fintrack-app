import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Transaction } from "@/data/mockData";
import { format, subDays, subWeeks, subMonths, isSameDay, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { formatCurrency } from "@/utils/utils";

export type FilterType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

interface ChartSectionProps {
  transactions: Transaction[];
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function ChartSection({ transactions, filter, onFilterChange }: ChartSectionProps) {
  
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();

    if (filter === 'Daily') {
      for (let i = 6; i >= 0; i--) {
        const d = subDays(now, i);
        const dayTxs = transactions.filter(t => isSameDay(new Date(t.date), d));
        
        const income = dayTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = dayTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        
        data.push({
          name: format(d, 'EEE'), // Mon, Tue
          income,
          expense
        });
      }
    } else if (filter === 'Weekly') {
      for (let i = 3; i >= 0; i--) {
        const start = startOfWeek(subWeeks(now, i));
        const end = endOfWeek(subWeeks(now, i));
        
        const weekTxs = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));
        
        const income = weekTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = weekTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        
        data.push({
          name: `Week ${format(start, 'd MMM')}`,
          income,
          expense
        });
      }
    } else if (filter === 'Monthly') {
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const monthTxs = transactions.filter(t => format(new Date(t.date), 'M yyyy') === format(d, 'M yyyy'));
        
        const income = monthTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = monthTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        
        data.push({
          name: format(d, 'MMM'), // Jan, Feb
          income,
          expense
        });
      }
    } else if (filter === 'Yearly') {
       for (let i = 11; i >= 0; i--) {
        const d = subMonths(now, i);
        const monthTxs = transactions.filter(t => format(new Date(t.date), 'M yyyy') === format(d, 'M yyyy'));
        
        const income = monthTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = monthTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        
        data.push({
          name: format(d, 'MMM yy'),
          income,
          expense
        });
      }
    }

    return data;
  }, [transactions, filter]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col mb-8 h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-zinc-50">Analytics</h2>
        
        {/* Filter Toggle */}
        <div className="flex p-1 bg-zinc-950 rounded-lg border border-zinc-800">
          {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-zinc-800 text-zinc-50 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#a1a1aa" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip 
              cursor={{ fill: '#27272a', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              itemStyle={{ fontSize: '14px' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Expense" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
