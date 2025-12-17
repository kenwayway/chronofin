import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './InputPanel.css';

function InputPanel() {
    const { parentCategories, getSubcategories, accounts, addTransaction } = useData();
    const [isExpanded, setIsExpanded] = useState(false);
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [selectedParentCategory, setSelectedParentCategory] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');
    const [note, setNote] = useState('');
    const panelRef = useRef(null);
    const amountInputRef = useRef(null);

    const filteredParentCategories = parentCategories.filter(c => c.type === type);
    const subcategories = selectedParentCategory ? getSubcategories(selectedParentCategory.id) : [];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const handleExpand = () => {
        setIsExpanded(true);
        setTimeout(() => {
            amountInputRef.current?.focus();
        }, 100);
    };

    const resetForm = () => {
        setAmount('');
        setSelectedParentCategory(null);
        setSelectedCategory(null);
        setNote('');
    };

    const handleSubmit = () => {
        if (!amount || !selectedCategory) return;

        addTransaction({
            type,
            amount: parseFloat(amount),
            category_id: selectedCategory.id,
            account_id: parseInt(accountId),
            note: note.trim(),
            date: Date.now(),
        });

        resetForm();
        setIsExpanded(false);
    };

    const handleSelectParent = (cat) => {
        const subs = getSubcategories(cat.id);
        if (subs.length > 0) {
            // Has subcategories, drill down
            setSelectedParentCategory(cat);
            setSelectedCategory(null);
        } else {
            // No subcategories, toggle selection
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && amount && selectedCategory) {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setIsExpanded(false);
        }
    };

    return (
        <div className={`input-panel ${isExpanded ? 'expanded' : ''}`} ref={panelRef}>
            {/* Expanded content */}
            {isExpanded && (
                <div className="input-panel-expanded">
                    {/* Type Toggle */}
                    <div className="input-type-toggle">
                        <button
                            className={`input-type-btn ${type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => { setType('expense'); setSelectedParentCategory(null); setSelectedCategory(null); }}
                        >
                            Expense
                        </button>
                        <button
                            className={`input-type-btn ${type === 'income' ? 'active income' : ''}`}
                            onClick={() => { setType('income'); setSelectedParentCategory(null); setSelectedCategory(null); }}
                        >
                            Income
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="input-categories">
                        {selectedParentCategory ? (
                            <>
                                <button className="category-back-btn" onClick={handleBackToParent}>
                                    <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                                    Back
                                </button>
                                <div className="category-chips">
                                    {subcategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`category-chip ${selectedCategory?.id === cat.id ? 'selected' : ''}`}
                                            style={{ '--chip-color': cat.color }}
                                            onClick={() => handleSelectSubcategory(cat)}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="category-chips">
                                {filteredParentCategories.map(cat => {
                                    const hasSubs = getSubcategories(cat.id).length > 0;
                                    return (
                                        <button
                                            key={cat.id}
                                            className={`category-chip ${selectedCategory?.id === cat.id ? 'selected' : ''}`}
                                            style={{ '--chip-color': cat.color }}
                                            onClick={() => handleSelectParent(cat)}
                                        >
                                            {cat.name}
                                            {hasSubs && <ChevronRight size={12} style={{ marginLeft: 2, opacity: 0.5 }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Account & Note */}
                    <div className="input-extras">
                        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input-account">
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Add note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="input-note"
                        />
                    </div>
                </div>
            )}

            {/* Main input bar */}
            <div className="input-bar" onClick={!isExpanded ? handleExpand : undefined}>
                <span className="input-currency">¥</span>
                <input
                    ref={amountInputRef}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={isExpanded ? "0.00" : "Add transaction..."}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onFocus={() => !isExpanded && handleExpand()}
                    onKeyDown={handleKeyDown}
                    className="input-amount"
                />
                {isExpanded && (
                    <button
                        className="input-save"
                        onClick={handleSubmit}
                        disabled={!amount || !selectedCategory}
                    >
                        Save
                    </button>
                )}
            </div>
        </div>
    );
}

export default InputPanel;
