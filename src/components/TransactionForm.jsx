import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './TransactionForm.css';

function TransactionForm({ isOpen, onClose, transaction = null }) {
    const { parentCategories, getSubcategories, accounts, addTransaction, updateTransaction, categories } = useData();
    const [type, setType] = useState(transaction?.type || 'expense');
    const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
    const [accountId, setAccountId] = useState(transaction?.account_id?.toString() || accounts[0]?.id?.toString() || '');
    const [note, setNote] = useState(transaction?.note || '');
    const [date, setDate] = useState(
        transaction?.date
            ? new Date(transaction.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    // Category selection state
    const [selectedParentCategory, setSelectedParentCategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const isEditing = !!transaction;
    const filteredParentCategories = parentCategories.filter(c => c.type === type);
    const subcategories = selectedParentCategory ? getSubcategories(selectedParentCategory.id) : [];

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setAmount(transaction.amount?.toString() || '');
            setAccountId(transaction.account_id?.toString() || '');
            setNote(transaction.note || '');
            setDate(new Date(transaction.date).toISOString().split('T')[0]);

            // Initialize category selection
            const cat = categories.find(c => c.id === transaction.category_id);
            if (cat) {
                setSelectedCategory(cat);
                if (cat.parent_id) {
                    const parent = categories.find(c => c.id === cat.parent_id);
                    setSelectedParentCategory(parent);
                } else {
                    setSelectedParentCategory(null);
                }
            }
        }
    }, [transaction, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!amount || !selectedCategory || !accountId) {
            alert('Please fill in all required fields');
            return;
        }

        const txData = {
            type,
            amount: parseFloat(amount),
            category_id: selectedCategory.id,
            account_id: parseInt(accountId),
            note: note.trim(),
            date: new Date(date).getTime(),
        };

        if (isEditing && updateTransaction) {
            updateTransaction(transaction.id, txData);
        } else {
            addTransaction(txData);
        }

        onClose();
    };

    const handleSelectParent = (cat) => {
        const subs = getSubcategories(cat.id);
        if (subs.length > 0) {
            setSelectedParentCategory(cat);
            setSelectedCategory(null);
        } else {
            if (selectedCategory?.id === cat.id) {
                setSelectedCategory(null);
            } else {
                setSelectedCategory(cat);
            }
            setSelectedParentCategory(null);
        }
    };

    const handleSelectSubcategory = (cat) => {
        if (selectedCategory?.id === cat.id) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(cat);
        }
    };

    const handleBackToParent = () => {
        setSelectedParentCategory(null);
        setSelectedCategory(null);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="text-lg font-semibold">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Type Toggle */}
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={`type-button ${type === 'expense' ? 'active expense-bg' : ''}`}
                            onClick={() => {
                                setType('expense');
                                setSelectedCategory(null);
                                setSelectedParentCategory(null);
                            }}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            className={`type-button ${type === 'income' ? 'active income-bg' : ''}`}
                            onClick={() => {
                                setType('income');
                                setSelectedCategory(null);
                                setSelectedParentCategory(null);
                            }}
                        >
                            Income
                        </button>
                    </div>

                    {/* Amount */}
                    <div className="form-group">
                        <label className="form-label">Amount *</label>
                        <div className="amount-input">
                            <span className="currency-symbol">¥</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <div className="category-selection-area">
                            {selectedParentCategory ? (
                                <>
                                    <button type="button" className="category-back-btn" onClick={handleBackToParent}>
                                        <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                                        Back to Categories
                                    </button>
                                    <div className="category-grid">
                                        {subcategories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                className={`category-button ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                                style={{
                                                    '--category-color': cat.color
                                                }}
                                                onClick={() => handleSelectSubcategory(cat)}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="category-grid">
                                    {filteredParentCategories.map(cat => {
                                        const hasSubs = getSubcategories(cat.id).length > 0;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                className={`category-button ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                                                style={{
                                                    '--category-color': cat.color
                                                }}
                                                onClick={() => handleSelectParent(cat)}
                                            >
                                                {cat.name}
                                                {hasSubs && <ChevronRight size={14} style={{ marginLeft: 4, opacity: 0.5 }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account */}
                    <div className="form-group">
                        <label className="form-label">Account *</label>
                        <select
                            className="form-input"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            required
                        >
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} (¥{account.balance.toFixed(2)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">Date *</label>
                        <input
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Note */}
                    <div className="form-group">
                        <label className="form-label">Note</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Add a note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TransactionForm;
