import React, { useState, useEffect } from 'react';
import { Plus, LogOut, LayoutDashboard, ListOrdered, Wallet, Smartphone } from 'lucide-react';
import { Transaction } from '@/data/mockData';
import { SummaryCards } from '@/components/SummaryCards';
import { ChartSection, FilterType } from '@/components/ChartSection';
import { TransactionList } from '@/components/TransactionList';
import { SideForm } from '@/components/SideForm';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabaseClient';
import { syncOfflineData } from '@/lib/offlineStorage';
import { Capacitor } from '@capacitor/core';

// Mobile bottom nav tabs
type MobileTab = 'dashboard' | 'transactions';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('Weekly');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>('dashboard');

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
      if (session) fetchTransactions(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchTransactions(session.user.id);
      } else {
        setTransactions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Offline Sync Listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = async () => {
      if (session) {
        await syncOfflineData();
        // Refresh the UI with the newly synced transactions
        fetchTransactions(session.user.id);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [session]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (!error && data) setTransactions(data);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: session.user.id,
        amount: newTx.amount,
        type: newTx.type,
        category: newTx.category,
        description: newTx.description || null,
        date: newTx.date,
      }])
      .select();
    if (error) throw error;
    if (data) {
      setTransactions(prev =>
        [data[0], ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }
  };

  const handleLogout = async () => supabase.auth.signOut();

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((a, c) => a + Number(c.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, c) => a + Number(c.amount), 0);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Auth />;

  // ── Shared header ──────────────────────────────────────────────────────────
  const Header = () => {
    const isNative = Capacitor.isNativePlatform();
    
    return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
            <span className="font-black text-zinc-950 text-lg leading-none">F</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">FinTrack</h1>
          
          {!isNative && (
            <a
              href="/fintrack-v1.apk"
              download="FinTrack-v1.apk"
              className="ml-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-full transition-colors shadow-sm"
              title="Download APK"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Download APK</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-zinc-500 truncate max-w-[180px]">
            {session.user.email}
          </span>
          {/* Desktop add button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-2 rounded-xl transition-colors shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
  };

  // ── Mobile bottom nav ──────────────────────────────────────────────────────
  const BottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>

        {/* FAB center */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px] font-medium">Transactions</span>
        </button>
      </div>
    </nav>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">

        {/* ═══════════════════════════════════════════════════════
            MOBILE  (< lg):  single-column, tab-switched
            ═══════════════════════════════════════════════════════ */}
        <div className="block lg:hidden space-y-5">
          {/* Summary cards always visible */}
          <SummaryCards income={totalIncome} expense={totalExpense} />

          {activeTab === 'dashboard' ? (
            <ChartSection
              transactions={transactions}
              filter={filter}
              onFilterChange={setFilter}
            />
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            TABLET  (md … lg):  2-column grid
               Col 1 (5/12): Summary + TransactionList
               Col 2 (7/12): Chart
            ═══════════════════════════════════════════════════════ */}
        <div className="hidden md:grid lg:hidden grid-cols-12 gap-6">
          {/* Left: summary + list */}
          <div className="col-span-5 space-y-5">
            <SummaryCards income={totalIncome} expense={totalExpense} />
            <div className="h-[520px]">
              <TransactionList transactions={transactions} />
            </div>
          </div>
          {/* Right: chart */}
          <div className="col-span-7">
            <ChartSection
              transactions={transactions}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            DESKTOP  (≥ lg):  3-column grid
               Col 1 (3/12): Sidebar (summary + form-inline hint)
               Col 2 (5/12): Chart
               Col 3 (4/12): Recent Transactions
            ═══════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid grid-cols-12 gap-6">
          {/* ── Col 1: Sidebar ── */}
          <aside className="col-span-3 space-y-5">
            {/* Mini balance card */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
              <div className="flex items-center gap-3 text-zinc-400 mb-3">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <Wallet className="w-4 h-4 text-zinc-100" />
                </div>
                <span className="text-sm font-medium">Net Balance</span>
              </div>
              <p className={`text-3xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-zinc-50' : 'text-rose-400'}`}>
                Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500 mb-0.5">Income</p>
                  <p className="text-emerald-400 font-semibold">
                    Rp {totalIncome.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-0.5">Expense</p>
                  <p className="text-rose-400 font-semibold">
                    Rp {totalExpense.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick-add shortcut */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 hover:bg-emerald-500/5 text-zinc-400 hover:text-emerald-400 rounded-2xl py-5 font-medium transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              New Transaction
            </button>

            {/* Summary stat cards */}
            <SummaryCards income={totalIncome} expense={totalExpense} compact />
          </aside>

          {/* ── Col 2: Analytics Chart ── */}
          <section className="col-span-5">
            <ChartSection
              transactions={transactions}
              filter={filter}
              onFilterChange={setFilter}
            />
          </section>

          {/* ── Col 3: Recent Transactions ── */}
          <section className="col-span-4 h-[620px]">
            <TransactionList transactions={transactions} />
          </section>
        </div>
      </main>

      {/* Mobile bottom nav (< lg) */}
      <BottomNav />

      {/* Global Side-Form / Bottom Sheet */}
      <SideForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAdd={handleAddTransaction}
        userId={session.user.id}
      />
    </div>
  );
}
