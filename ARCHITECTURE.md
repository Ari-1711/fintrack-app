# FinTrack - Architecture & Security Blueprint

## Tech Stack
- Frontend: React.js (Vite)
- Database & Auth: Supabase
- Validation: Zod (Strict schema validation)
- UI Library: Tailwind CSS

## Database Schema (PostgreSQL / Supabase)
1. table: profiles
   - id: uuid (references auth.users, primary key)
   - email: text
   - updated_at: timestamp

2. table: transactions
   - id: uuid (primary key, default gen_random_uuid())
   - user_id: uuid (references auth.users, not null)
   - type: text (check constraint: 'income' OR 'expense')
   - amount: numeric (constraint: amount > 0)
   - category: text
   - description: text
   - date: timestamp (default now())

## Security Requirements (PONDASI UTAMA)
1. Row-Level Security (RLS) WAJIB aktif di semua tabel.
2. User HANYA boleh mengakses data miliknya sendiri (transactions.user_id = auth.uid()).
3. Validasi input 'amount' harus ketat menggunakan Zod (Tidak boleh minus atau kosong).
4. Gunakan Environment Variables (.env) untuk API Key. JANGAN di-hardcode.