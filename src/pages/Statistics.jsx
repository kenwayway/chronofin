import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './Statistics.css';

function Statistics() {
    const { transactions } = useData();
    const [chartTab, setChartTab] = useState('pie'); // 'pie' or 'bar'
    const [calendarDate, setCalendarDate] = useState(new Date());

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

        let currentAngle = -90;
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

    // Generate bar chart
    const generateBarChart = () => {
        if (sortedCategories.length === 0) return null;

        return (
            <div className="bar-chart">
                {sortedCategories.map(([name, { amount, color }]) => {
                    const percentage = (amount / maxAmount) * 100;
                    return (
                        <div key={name} className="bar-item">
                            <div className="bar-label">{name}</div>
                            <div className="bar-track">
                                <div className="bar-fill" style={{ width: `${percentage}%`, background: color }} />
                            </div>
                            <div className="bar-value">¥{amount.toFixed(0)}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Calendar functions
    const getCalendarDays = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startWeekday = firstDay.getDay();

        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < startWeekday; i++) {
            days.push({ day: null, amount: 0 });
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayStart = new Date(year, month, day).getTime();
            const dayEnd = new Date(year, month, day, 23, 59, 59).getTime();

            const dayTransactions = transactions.filter(
                tx => tx.date >= dayStart && tx.date <= dayEnd
            );

            const dayIncome = dayTransactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + tx.amount, 0);

            const dayExpense = dayTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + tx.amount, 0);

            const net = dayIncome - dayExpense;

            days.push({ day, amount: net, hasTransactions: dayTransactions.length > 0 });
        }

        return days;
    };

    const prevMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
    };

    const calendarDays = getCalendarDays();
    const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

            {/* Chart Section with Tabs */}
            {sortedCategories.length > 0 && (
                <div className="chart-section">
                    <div className="chart-tabs">
                        <button
                            className={`chart-tab ${chartTab === 'pie' ? 'active' : ''}`}
                            onClick={() => setChartTab('pie')}
                        >
                            Pie Chart
                        </button>
                        <button
                            className={`chart-tab ${chartTab === 'bar' ? 'active' : ''}`}
                            onClick={() => setChartTab('bar')}
                        >
                            Bar Chart
                        </button>
                    </div>
                    <div className="chart-content">
                        {chartTab === 'pie' ? (
                            <div className="pie-chart-container">
                                {generatePieChart()}
                            </div>
                        ) : (
                            generateBarChart()
                        )}
                    </div>
                    {/* Legend */}
                    <div className="chart-legend">
                        {sortedCategories.map(([name, { color }]) => (
                            <div key={name} className="legend-item">
                                <span className="legend-dot" style={{ background: color }} />
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div className="calendar-section">
                <div className="calendar-header">
                    <button className="calendar-nav" onClick={prevMonth}>
                        <ChevronLeft size={18} />
                    </button>
                    <h3>{monthName}</h3>
                    <button className="calendar-nav" onClick={nextMonth}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div className="calendar-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="weekday">{d}</div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {calendarDays.map((item, idx) => (
                        <div key={idx} className={`calendar-day ${item.day ? '' : 'empty'} ${item.hasTransactions ? 'has-tx' : ''}`}>
                            {item.day && (
                                <>
                                    <span className="day-number">{item.day}</span>
                                    {item.amount !== 0 && (
                                        <span className={`day-amount ${item.amount > 0 ? 'positive' : 'negative'}`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount.toFixed(0)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Statistics;
