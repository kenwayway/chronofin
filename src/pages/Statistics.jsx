import { useData } from '../contexts/DataContext';
import { Download } from 'lucide-react';
import './Statistics.css';

function Statistics() {
    const { transactions, categories } = useData();

    // Calculate stats for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

    const monthTransactions = transactions.filter(
        tx => tx.date >= startOfMonth && tx.date <= endOfMonth
    );

    const totalIncome = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = totalIncome - totalExpense;

    // Category breakdown
    const categoryStats = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((stats, tx) => {
            const catName = tx.category?.name || 'Uncategorized';
            if (!stats[catName]) {
                stats[catName] = { amount: 0, color: tx.category?.color || '#64748b' };
            }
            stats[catName].amount += tx.amount;
            return stats;
        }, {});

    const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1].amount - a[1].amount);
    const maxAmount = sortedCategories[0]?.[1].amount || 1;

    // Generate pie chart SVG
    const generatePieChart = () => {
        if (sortedCategories.length === 0) return null;

        const size = 200;
        const center = size / 2;
        const radius = 80;

        let currentAngle = -90; // Start from top
        const paths = [];

        sortedCategories.forEach(([name, { amount, color }]) => {
            const percentage = (amount / totalExpense) * 100;
            const angle = (percentage / 100) * 360;

            const startAngle = (currentAngle * Math.PI) / 180;
            const endAngle = ((currentAngle + angle) * Math.PI) / 180;

            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            const largeArc = angle > 180 ? 1 : 0;

            const pathD = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            paths.push(
                <path key={name} d={pathD} fill={color} />
            );

            currentAngle += angle;
        });

        return (
            <svg viewBox={`0 0 ${size} ${size}`} className="pie-chart">
                {paths}
                <circle cx={center} cy={center} r={40} fill="var(--color-bg-secondary)" />
            </svg>
        );
    };

    // Export transactions as CSV
    const handleExport = () => {
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Account'];
        const rows = transactions.map(tx => [
            new Date(tx.date).toISOString().split('T')[0],
            tx.type,
            tx.category?.name || 'Uncategorized',
            tx.amount.toFixed(2),
            tx.note || '',
            tx.account?.name || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `chronofin-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="statistics">
            {/* Export Button */}
            <div className="stats-actions">
                <button className="export-btn" onClick={handleExport}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card income-card">
                    <div className="summary-label">Income</div>
                    <div className="summary-amount income">+¥{totalIncome.toFixed(2)}</div>
                </div>

                <div className="summary-card expense-card">
                    <div className="summary-label">Expense</div>
                    <div className="summary-amount expense">-¥{totalExpense.toFixed(2)}</div>
                </div>
            </div>

            <div className="balance-card">
                <div className="summary-label">Balance</div>
                <div className={`summary-amount ${balance >= 0 ? 'income' : 'expense'}`}>
                    {balance >= 0 ? '+' : ''}¥{balance.toFixed(2)}
                </div>
            </div>

            {/* Pie Chart */}
            {sortedCategories.length > 0 && (
                <div className="pie-chart-section">
                    <h3>Expense Distribution</h3>
                    <div className="pie-chart-container">
                        {generatePieChart()}
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {sortedCategories.length > 0 && (
                <div className="category-breakdown">
                    <h3>Expense by Category</h3>

                    {sortedCategories.map(([name, { amount, color }]) => {
                        const percentage = (amount / maxAmount) * 100;
                        const ofTotal = (amount / totalExpense) * 100;

                        return (
                            <div key={name} className="category-stat">
                                <div className="category-stat-header">
                                    <span className="category-color-dot" style={{ background: color }} />
                                    <span className="category-name">{name}</span>
                                    <span className="category-amount">¥{amount.toFixed(2)}</span>
                                </div>

                                <div className="category-bar-bg">
                                    <div
                                        className="category-bar"
                                        style={{
                                            width: `${percentage}%`,
                                            background: color,
                                        }}
                                    />
                                </div>

                                <div className="category-percent text-sm text-tertiary">
                                    {ofTotal.toFixed(1)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Statistics;
