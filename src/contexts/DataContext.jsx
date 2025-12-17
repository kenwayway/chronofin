import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

// Default data for local development (when API is not available)
const defaultCategories = [
    { id: 1, name: 'Food', type: 'expense', color: '#ef4444', icon: 'utensils', parent_id: null },
    { id: 101, name: 'Dining Out', type: 'expense', color: '#ef4444', icon: 'utensils', parent_id: 1 },
    { id: 102, name: 'Groceries', type: 'expense', color: '#ef4444', icon: 'shopping-cart', parent_id: 1 },
    { id: 103, name: 'Coffee', type: 'expense', color: '#ef4444', icon: 'coffee', parent_id: 1 },
    { id: 2, name: 'Transport', type: 'expense', color: '#f59e0b', icon: 'car', parent_id: null },
    { id: 201, name: 'Subway', type: 'expense', color: '#f59e0b', icon: 'train', parent_id: 2 },
    { id: 202, name: 'Taxi', type: 'expense', color: '#f59e0b', icon: 'car', parent_id: 2 },
    { id: 3, name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping-bag', parent_id: null },
    { id: 4, name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: 'gamepad-2', parent_id: null },
    { id: 5, name: 'Bills', type: 'expense', color: '#10b981', icon: 'receipt', parent_id: null },
    { id: 6, name: 'Health', type: 'expense', color: '#06b6d4', icon: 'heart-pulse', parent_id: null },
    { id: 7, name: 'Other', type: 'expense', color: '#64748b', icon: 'more-horizontal', parent_id: null },
    { id: 8, name: 'Salary', type: 'income', color: '#22c55e', icon: 'briefcase', parent_id: null },
    { id: 9, name: 'Bonus', type: 'income', color: '#fbbf24', icon: 'trophy', parent_id: null },
    { id: 10, name: 'Investment', type: 'income', color: '#14b8a6', icon: 'trending-up', parent_id: null },
    { id: 11, name: 'Other Income', type: 'income', color: '#64748b', icon: 'more-horizontal', parent_id: null },
];

const defaultAccounts = [
    { id: 1, name: 'Cash', type: 'cash', color: '#10b981', icon: 'banknote', initial_balance: 0, currency: 'CAD' },
];

export function DataProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [catRes, accRes, txRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/accounts'),
                    fetch('/api/transactions')
                ]);

                if (catRes.ok && accRes.ok && txRes.ok) {
                    const [cats, accs, txs] = await Promise.all([
                        catRes.json(),
                        accRes.json(),
                        txRes.json()
                    ]);
                    setCategories(cats.length > 0 ? cats : defaultCategories);
                    setAccounts(accs.length > 0 ? accs : defaultAccounts);
                    setTransactions(txs);
                } else {
                    // API not available, use defaults
                    console.warn('API not available, using default data');
                    setCategories(defaultCategories);
                    setAccounts(defaultAccounts);
                    setTransactions([]);
                }
            } catch (err) {
                console.warn('Failed to fetch data, using defaults:', err);
                setCategories(defaultCategories);
                setAccounts(defaultAccounts);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get parent categories only
    const parentCategories = categories.filter(c => c.parent_id === null);

    // Get subcategories for a parent
    const getSubcategories = (parentId) => {
        return categories.filter(c => c.parent_id === parentId);
    };

    // Add category
    const addCategory = async (category) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(category)
            });
            if (res.ok) {
                const newCat = await res.json();
                setCategories([...categories, newCat]);
            }
        } catch (err) {
            console.error('Failed to add category:', err);
        }
    };

    // Update category
    const updateCategory = async (id, updates) => {
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                setCategories(categories.map(cat =>
                    cat.id === id ? { ...cat, ...updates } : cat
                ));
            }
        } catch (err) {
            console.error('Failed to update category:', err);
        }
    };

    // Delete category
    const deleteCategory = async (id) => {
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(categories.filter(cat => cat.id !== id && cat.parent_id !== id));
            }
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    // Calculate account balances
    const getAccountBalance = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;

        let balance = account.initial_balance || 0;

        transactions.forEach(tx => {
            if (tx.account_id === accountId) {
                if (tx.type === 'income') {
                    balance += tx.amount;
                } else if (tx.type === 'expense') {
                    balance -= tx.amount;
                }
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
    const addTransaction = async (transaction) => {
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });
            if (res.ok) {
                const newTx = await res.json();
                setTransactions([newTx, ...transactions]);
            }
        } catch (err) {
            console.error('Failed to add transaction:', err);
        }
    };

    // Update transaction
    const updateTransaction = async (id, updates) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                setTransactions(transactions.map(tx =>
                    tx.id === id ? { ...tx, ...updates } : tx
                ));
            }
        } catch (err) {
            console.error('Failed to update transaction:', err);
        }
    };

    // Delete transaction
    const deleteTransaction = async (id) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTransactions(transactions.filter(t => t.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete transaction:', err);
        }
    };

    // Add account
    const addAccount = async (account) => {
        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(account)
            });
            if (res.ok) {
                const newAcc = await res.json();
                setAccounts([...accounts, newAcc]);
            }
        } catch (err) {
            console.error('Failed to add account:', err);
        }
    };

    // Update account
    const updateAccount = async (id, updates) => {
        try {
            const res = await fetch(`/api/accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                setAccounts(accounts.map(acc =>
                    acc.id === id ? { ...acc, ...updates } : acc
                ));
            }
        } catch (err) {
            console.error('Failed to update account:', err);
        }
    };

    // Delete account
    const deleteAccount = async (id) => {
        const hasTransactions = transactions.some(tx => tx.account_id === id);
        if (hasTransactions) {
            alert('Cannot delete account with existing transactions.');
            return;
        }
        try {
            const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAccounts(accounts.filter(acc => acc.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete account:', err);
        }
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
            loading,
            error,
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
