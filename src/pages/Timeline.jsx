import { format, isToday, isYesterday } from 'date-fns';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useData } from '../contexts/DataContext';
import TransactionForm from '../components/TransactionForm';
import InputPanel from '../components/InputPanel';
import ContextMenu from '../components/ContextMenu';
import './Timeline.css';

// Render icon from lucide-react
const renderIcon = (iconName, size = 16) => {
    if (!iconName) return <LucideIcons.Tag size={size} />;
    const pascalCase = iconName.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    const Icon = LucideIcons[pascalCase] || LucideIcons.Tag;
    return <Icon size={size} />;
};

function Timeline() {
    const { transactions, deleteTransaction } = useData();
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, tx) => {
        const dateKey = format(new Date(tx.date), 'yyyy-MM-dd');
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(tx);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

    const getDateLabel = (dateString) => {
        const date = new Date(dateString);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM d, EEEE');
    };

    const handleContextMenu = (e, tx) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            transaction: tx,
        });
    };

    const handleEdit = () => {
        if (contextMenu) {
            setEditingTransaction(contextMenu.transaction);
            setShowEditForm(true);
            setContextMenu(null);
        }
    };

    const handleDelete = () => {
        if (contextMenu) {
            deleteTransaction(contextMenu.transaction.id);
            setContextMenu(null);
        }
    };

    return (
        <div className="timeline">
            {sortedDates.length === 0 ? (
                <div className="empty-state">
                    <p className="text-secondary">No transactions yet</p>
                    <p className="text-sm text-tertiary">Tap below to add your first entry</p>
                </div>
            ) : (
                <div className="timeline-content">
                    {sortedDates.map(dateKey => (
                        <div key={dateKey} className="timeline-day">
                            <div className="date-header">
                                <span className="date-label">{getDateLabel(dateKey)}</span>
                            </div>

                            <div className="transactions-list">
                                {groupedTransactions[dateKey].map(tx => (
                                    <div
                                        key={tx.id}
                                        className="transaction-card"
                                        style={{ '--category-color': tx.category?.color || '#999' }}
                                        onContextMenu={(e) => handleContextMenu(e, tx)}
                                    >
                                        <div className="transaction-icon" style={{ background: tx.category?.color + '30', color: tx.category?.color }}>
                                            {renderIcon(tx.category?.icon)}
                                        </div>

                                        <div className="transaction-info">
                                            <div className="transaction-category">
                                                {tx.parentCategory && `${tx.parentCategory.name} › `}
                                                {tx.category?.name || 'Uncategorized'}
                                            </div>
                                            <div className="transaction-meta">
                                                <span>{tx.account?.name}</span>
                                                {tx.note && <span> · {tx.note}</span>}
                                            </div>
                                        </div>

                                        <div className="transaction-amount">
                                            <span className={tx.type === 'income' ? 'income' : 'expense'}>
                                                {tx.type === 'income' ? '+' : '-'}
                                                ¥{tx.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Input Panel - chronolog style */}
            <InputPanel />

            {/* Edit Transaction Modal */}
            {showEditForm && (
                <TransactionForm
                    isOpen={showEditForm}
                    onClose={() => { setShowEditForm(false); setEditingTransaction(null); }}
                    transaction={editingTransaction}
                />
            )}
        </div>
    );
}

export default Timeline;
