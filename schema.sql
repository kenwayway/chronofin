-- ChronoFin Database Schema
-- SQLite schema for Cloudflare D1

-- Accounts table: tracks different financial accounts (bank, cash, digital wallets)
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('bank', 'cash', 'digital', 'credit')),
    initial_balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'CNY',
    color TEXT NOT NULL DEFAULT '#6366f1', -- hex color for UI
    icon TEXT NOT NULL DEFAULT 'wallet', -- lucide icon name
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Categories table: predefined and custom categories for transactions
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    color TEXT NOT NULL,
    icon TEXT NOT NULL, -- lucide icon name
    is_custom INTEGER NOT NULL DEFAULT 0, -- 0 = predefined, 1 = user-created
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Transactions table: all income/expense/transfer records
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
    amount REAL NOT NULL CHECK(amount > 0),
    category_id INTEGER,
    note TEXT,
    date INTEGER NOT NULL, -- unix timestamp
    transfer_to_account_id INTEGER, -- nullable, only for transfers
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (transfer_to_account_id) REFERENCES accounts(id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- Insert default categories
-- Expense categories
INSERT INTO categories (name, type, color, icon) VALUES
    ('餐饮', 'expense', '#ef4444', 'utensils'),
    ('交通', 'expense', '#f59e0b', 'car'),
    ('购物', 'expense', '#ec4899', 'shopping-bag'),
    ('娱乐', 'expense', '#8b5cf6', 'gamepad-2'),
    ('住房', 'expense', '#10b981', 'home'),
    ('医疗', 'expense', '#06b6d4', 'heart-pulse'),
    ('教育', 'expense', '#3b82f6', 'graduation-cap'),
    ('日用', 'expense', '#84cc16', 'package'),
    ('其他支出', 'expense', '#64748b', 'more-horizontal');

-- Income categories
INSERT INTO categories (name, type, color, icon) VALUES
    ('工资', 'income', '#22c55e', 'briefcase'),
    ('奖金', 'income', '#fbbf24', 'trophy'),
    ('投资收益', 'income', '#14b8a6', 'trending-up'),
    ('兼职', 'income', '#a78bfa', 'users'),
    ('其他收入', 'income', '#64748b', 'more-horizontal');

-- Insert sample accounts (for testing)
INSERT INTO accounts (name, type, initial_balance, color, icon) VALUES
    ('现金', 'cash', 500.00, '#10b981', 'banknote'),
    ('中国银行', 'bank', 5000.00, '#3b82f6', 'building-2'),
    ('微信', 'digital', 1000.00, '#22c55e', 'smartphone'),
    ('支付宝', 'digital', 1500.00, '#06b6d4', 'credit-card');
