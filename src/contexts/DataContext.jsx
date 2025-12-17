import { createContext, useContext, useState } from 'react';

const DataContext = createContext();

// Hierarchical categories with subcategories
const mockCategories = [
    // Expense categories with subcategories
    { id: 1, name: 'Food', type: 'expense', color: '#ef4444', icon: 'utensils', parent_id: null },
    { id: 101, name: 'Dining Out', type: 'expense', color: '#ef4444', icon: 'utensils', parent_id: 1 },
    { id: 102, name: 'Groceries', type: 'expense', color: '#ef4444', icon: 'shopping-cart', parent_id: 1 },
    { id: 103, name: 'Coffee', type: 'expense', color: '#ef4444', icon: 'coffee', parent_id: 1 },

    { id: 2, name: 'Transport', type: 'expense', color: '#f59e0b', icon: 'car', parent_id: null },
    { id: 201, name: 'Subway', type: 'expense', color: '#f59e0b', icon: 'train', parent_id: 2 },
    { id: 202, name: 'Taxi', type: 'expense', color: '#f59e0b', icon: 'car', parent_id: 2 },
    { id: 203, name: 'Gas', type: 'expense', color: '#f59e0b', icon: 'fuel', parent_id: 2 },

    { id: 3, name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping-bag', parent_id: null },
    { id: 301, name: 'Clothes', type: 'expense', color: '#ec4899', icon: 'shirt', parent_id: 3 },
    { id: 302, name: 'Electronics', type: 'expense', color: '#ec4899', icon: 'smartphone', parent_id: 3 },
    { id: 303, name: 'Home', type: 'expense', color: '#ec4899', icon: 'home', parent_id: 3 },

    { id: 4, name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: 'gamepad-2', parent_id: null },
    { id: 401, name: 'Movies', type: 'expense', color: '#8b5cf6', icon: 'film', parent_id: 4 },
    { id: 402, name: 'Games', type: 'expense', color: '#8b5cf6', icon: 'gamepad-2', parent_id: 4 },
    { id: 403, name: 'Subscriptions', type: 'expense', color: '#8b5cf6', icon: 'tv', parent_id: 4 },

    { id: 5, name: 'Bills', type: 'expense', color: '#10b981', icon: 'receipt', parent_id: null },
    { id: 501, name: 'Rent', type: 'expense', color: '#10b981', icon: 'home', parent_id: 5 },
    { id: 502, name: 'Utilities', type: 'expense', color: '#10b981', icon: 'zap', parent_id: 5 },
    { id: 503, name: 'Phone', type: 'expense', color: '#10b981', icon: 'phone', parent_id: 5 },

    { id: 6, name: 'Health', type: 'expense', color: '#06b6d4', icon: 'heart-pulse', parent_id: null },
    { id: 7, name: 'Other', type: 'expense', color: '#64748b', icon: 'more-horizontal', parent_id: null },

    // Income categories
    { id: 8, name: 'Salary', type: 'income', color: '#22c55e', icon: 'briefcase', parent_id: null },
    { id: 9, name: 'Bonus', type: 'income', color: '#fbbf24', icon: 'trophy', parent_id: null },
    { id: 10, name: 'Investment', type: 'income', color: '#14b8a6', icon: 'trending-up', parent_id: null },
    { id: 11, name: 'Freelance', type: 'income', color: '#a78bfa', icon: 'users', parent_id: null },
    { id: 12, name: 'Other Income', type: 'income', color: '#64748b', icon: 'more-horizontal', parent_id: null },
];

const mockAccounts = [
    { id: 1, name: 'Cash', type: 'cash', color: '#10b981', icon: 'banknote', initial_balance: 500, currency: 'CAD' },
    { id: 2, name: 'Bank of China', type: 'bank', color: '#3b82f6', icon: 'building-2', initial_balance: 5000, currency: 'CNY' },
    { id: 3, name: 'WeChat Pay', type: 'digital', color: '#22c55e', icon: 'smartphone', initial_balance: 1000, currency: 'CNY' },
    { id: 4, name: 'Alipay', type: 'digital', color: '#06b6d4', icon: 'credit-card', initial_balance: 1500, currency: 'CNY' },
];

const mockTransactions = [
    { id: 1, account_id: 1, type: 'expense', amount: 45.50, category_id: 101, note: 'Lunch', date: Date.now() - 86400000 },
    { id: 2, account_id: 2, type: 'income', amount: 8000, category_id: 8, note: 'Monthly salary', date: Date.now() - 172800000 },
    { id: 3, account_id: 3, type: 'expense', amount: 15, category_id: 201, note: 'Metro', date: Date.now() - 259200000 },
];

export function DataProvider({ children }) {
    const [categories, setCategories] = useState(mockCategories);
    const [accounts, setAccounts] = useState(mockAccounts);
    const [transactions, setTransactions] = useState(mockTransactions);

    // Get parent categories only
    const parentCategories = categories.filter(c => c.parent_id === null);

    // Get subcategories for a parent
    const getSubcategories = (parentId) => {
        return categories.filter(c => c.parent_id === parentId);
    };

    // Add category
    const addCategory = (category) => {
        const maxId = Math.max(...categories.map(c => c.id), 0);
        const newCategory = {
            ...category,
            id: maxId + 1,
        };
        setCategories([...categories, newCategory]);
    };

    // Update category
    const updateCategory = (id, updates) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
        ));
    };

    // Delete category (and its subcategories)
    const deleteCategory = (id) => {
        setCategories(categories.filter(cat => cat.id !== id && cat.parent_id !== id));
    };

    // Calculate account balances
    const getAccountBalance = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;

        let balance = account.initial_balance;

        transactions.forEach(tx => {
            if (tx.account_id === accountId) {
                if (tx.type === 'income') {
                    balance += tx.amount;
                } else if (tx.type === 'expense') {
                    balance -= tx.amount;
                } else if (tx.type === 'transfer') {
                    balance -= tx.amount;
                }
            }

            if (tx.transfer_to_account_id === accountId) {
                balance += tx.amount;
            }
        });

        return balance;
    };

    const accountsWithBalances = accounts.map(account => ({
        ...account,
        balance: getAccountBalance(account.id),
    }));

    const totalBalance = accountsWithBalances.reduce((sum, acc) => sum + acc.balance, 0);

    // Add transaction
    const addTransaction = (transaction) => {
        const newTransaction = {
            ...transaction,
            id: Math.max(...transactions.map(t => t.id), 0) + 1,
            created_at: Date.now(),
            updated_at: Date.now(),
        };
        setTransactions([newTransaction, ...transactions]);
    };

    // Update transaction
    const updateTransaction = (id, updates) => {
        setTransactions(transactions.map(tx =>
            tx.id === id ? { ...tx, ...updates, updated_at: Date.now() } : tx
        ));
    };

    // Delete transaction
    const deleteTransaction = (id) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    // Add account
    const addAccount = (account) => {
        const newAccount = {
            ...account,
            id: Math.max(...accounts.map(a => a.id), 0) + 1,
            created_at: Date.now(),
            updated_at: Date.now(),
        };
        setAccounts([...accounts, newAccount]);
    };

    const updateAccount = (id, updates) => {
        setAccounts(accounts.map(acc =>
            acc.id === id ? { ...acc, ...updates, updated_at: Date.now() } : acc
        ));
    };

    const deleteAccount = (id) => {
        // Check if account has transactions
        const hasTransactions = transactions.some(tx => tx.account_id === id);
        if (hasTransactions) {
            alert('Cannot delete account with existing transactions.');
            return;
        }
        setAccounts(accounts.filter(acc => acc.id !== id));
    };

    // Get enriched transactions (with category and account data)
    const enrichedTransactions = transactions.map(tx => {
        const category = categories.find(c => c.id === tx.category_id);
        const parentCategory = category?.parent_id ? categories.find(c => c.id === category.parent_id) : null;
        return {
            ...tx,
            category,
            parentCategory,
            account: accounts.find(a => a.id === tx.account_id),
        };
    });

    return (
        <DataContext.Provider value={{
            categories,
            parentCategories,
            getSubcategories,
            addCategory,
            updateCategory,
            deleteCategory,
            accounts: accountsWithBalances,
            transactions: enrichedTransactions,
            totalBalance,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addAccount,
            updateAccount,
            deleteAccount,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
}
