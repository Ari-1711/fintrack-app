import { useState } from "react";
import { LayoutDashboard, ListOrdered, X, PlusCircle, Loader2 } from "lucide-react";
import { Transaction, TransactionType } from "@/data/mockData";
import { savePendingTransaction } from "@/lib/offlineStorage";

interface SideFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, "id">) => Promise<void>;
  userId: string;
}

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investments", "Gift"],
  expense: ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Shopping", "Health"],
};

export function SideForm({ isOpen, onClose, onAdd, userId }: SideFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const txData = {
        type,
        amount: parsed,
        description,
        category,
        date: new Date(date).toISOString(),
      };

      if (navigator.onLine) {
        await onAdd(txData);
        setAmount("");
        setDescription("");
        onClose();
      } else {
        await savePendingTransaction({
          user_id: userId,
          ...txData,
        });
        setSuccessMsg('Transaksi disimpan offline');
        setAmount("");
        setDescription("");
        // Keep form open for a second so user sees the message, or close it immediately
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer — slides in from right on md+, bottom sheet on mobile */}
      <div className="fixed z-50 bottom-0 inset-x-0 md:inset-y-0 md:inset-x-auto md:right-0 md:w-full md:max-w-md bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 shadow-2xl flex flex-col rounded-t-3xl md:rounded-none transition-transform duration-300">
        {/* Handle bar for mobile sheet */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-50">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-h-[80vh] md:max-h-none">
          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 border border-emerald-500/20">
                {successMsg}
              </div>
            )}

            {/* Type Toggle */}
            <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              {(["expense", "income"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    type === t
                      ? t === "expense"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">Rp</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                placeholder="e.g. Morning Coffee"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 appearance-none transition-all"
              >
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 [color-scheme:dark] transition-all"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button
            type="submit"
            form="tx-form"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Save Transaction
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
