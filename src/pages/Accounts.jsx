import { useState } from 'react';
import { Wallet, Building2, Smartphone, CreditCard, Banknote, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './Accounts.css';

const ACCOUNT_ICONS = {
    'wallet': Wallet,
    'building-2': Building2,
    'smartphone': Smartphone,
    'credit-card': CreditCard,
    'banknote': Banknote,
};

const ACCOUNT_TYPE_LABELS = {
    'bank': 'Bank Account',
    'cash': 'Cash',
    'digital': 'Digital Wallet',
    'credit': 'Credit Card',
};

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b'
];

function Accounts() {
    const { accounts, totalBalance, addAccount, updateAccount, deleteAccount } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank',
        color: PRESET_COLORS[0],
        icon: 'wallet',
        initial_balance: 0
    });

    const getIcon = (iconName) => {
        const Icon = ACCOUNT_ICONS[iconName] || Wallet;
        return <Icon size={24} />;
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'bank',
            color: PRESET_COLORS[0],
            icon: 'wallet',
            initial_balance: 0
        });
        setEditingAccount(null);
        setShowModal(false);
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            color: account.color,
            icon: account.icon,
            initial_balance: account.initial_balance
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this account?')) {
            deleteAccount(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const accountData = {
            name: formData.name.trim(),
            type: formData.type,
            color: formData.color,
            icon: formData.icon,
            initial_balance: parseFloat(formData.initial_balance)
        };

        if (editingAccount) {
            updateAccount(editingAccount.id, accountData);
        } else {
            addAccount(accountData);
        }

        resetForm();
    };

    return (
        <div className="accounts">
            <div className="accounts-header">
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add Account
                </button>
            </div>

            {/* Total Balance Card */}
            <div className="total-balance-card">
                <span className="text-sm text-secondary">Total Balance</span>
                <div className="total-balance">
                    <span className="currency">¥</span>
                    <span className="amount">{totalBalance.toFixed(2)}</span>
                </div>
            </div>

            {/* Accounts List */}
            <div className="accounts-list">
                {accounts.map(account => (
                    <div key={account.id} className="account-card">
                        <div className="account-main">
                            <div className="account-icon" style={{ background: account.color + '20' }}>
                                <span style={{ color: account.color }}>
                                    {getIcon(account.icon)}
                                </span>
                            </div>

                            <div className="account-info">
                                <div className="account-name">{account.name}</div>
                                <div className="account-type text-tertiary">
                                    {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                                </div>
                            </div>

                            <div className="account-balance">
                                ¥{account.balance.toFixed(2)}
                            </div>
                        </div>

                        <div className="account-actions">
                            <button className="action-btn" onClick={() => handleEdit(account)}>
                                <Edit2 size={14} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleDelete(account.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingAccount ? 'Edit Account' : 'Add Account'}</h3>
                            <button className="btn-icon" onClick={resetForm}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Account Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-input"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Initial Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.initial_balance}
                                    onChange={e => setFormData({ ...formData, initial_balance: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <div className="color-picker">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`color-swatch ${formData.color === color ? 'active' : ''}`}
                                            style={{ background: color }}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Icon</label>
                                <div className="icon-picker">
                                    {Object.entries(ACCOUNT_ICONS).map(([name, Icon]) => (
                                        <button
                                            key={name}
                                            type="button"
                                            className={`icon-option ${formData.icon === name ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon: name })}
                                        >
                                            <Icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={16} />
                                    {editingAccount ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Accounts;
