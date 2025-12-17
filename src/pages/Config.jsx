import { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronRight, ChevronDown, X, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './Config.css';

// Preset colors
const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b'
];

// Get all available icon names from lucide-react
const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(key =>
    key !== 'default' &&
    key !== 'createLucideIcon' &&
    typeof LucideIcons[key] === 'function' &&
    key[0] === key[0].toUpperCase()
);

function Config() {
    const { categories, parentCategories, getSubcategories, addCategory, updateCategory, deleteCategory } = useData();
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [editingCategory, setEditingCategory] = useState(null);
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryParent, setNewCategoryParent] = useState(null);
    const [iconSearch, setIconSearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        color: PRESET_COLORS[0],
        icon: 'Tag',
    });

    // Filter icons based on search
    const filteredIcons = iconSearch.trim()
        ? ALL_ICON_NAMES.filter(name =>
            name.toLowerCase().includes(iconSearch.toLowerCase())
        ).slice(0, 50)
        : [];

    const toggleExpand = (catId) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(catId)) {
            newSet.delete(catId);
        } else {
            newSet.add(catId);
        }
        setExpandedCategories(newSet);
    };

    const handleAddCategory = () => {
        if (!formData.name.trim()) return;

        addCategory({
            name: formData.name.trim(),
            type: newCategoryParent ? parentCategories.find(c => c.id === newCategoryParent)?.type : formData.type,
            color: formData.color,
            icon: formData.icon.toLowerCase(),
            parent_id: newCategoryParent,
        });

        resetForm();
    };

    const handleEditCategory = (cat) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            type: cat.type,
            color: cat.color,
            icon: cat.icon || 'Tag',
        });
        setIconSearch('');
    };

    const handleUpdateCategory = () => {
        if (!formData.name.trim() || !editingCategory) return;

        updateCategory(editingCategory.id, {
            name: formData.name.trim(),
            color: formData.color,
            icon: formData.icon.toLowerCase(),
        });

        resetForm();
    };

    const handleDeleteCategory = (catId) => {
        if (confirm('Delete this category?')) {
            deleteCategory(catId);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'expense', color: PRESET_COLORS[0], icon: 'Tag' });
        setEditingCategory(null);
        setShowNewCategoryForm(false);
        setNewCategoryParent(null);
        setIconSearch('');
    };

    const renderIcon = (iconName, size = 16) => {
        if (!iconName) return <LucideIcons.Tag size={size} />;
        // Try direct PascalCase first (e.g., "ShoppingCart")
        if (LucideIcons[iconName]) {
            const Icon = LucideIcons[iconName];
            return <Icon size={size} />;
        }
        // Convert kebab-case to PascalCase (e.g., "shopping-cart" -> "ShoppingCart")
        const pascalCase = iconName.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
        const Icon = LucideIcons[pascalCase] || LucideIcons.Tag;
        return <Icon size={size} />;
    };

    const selectIcon = (iconName) => {
        setFormData({ ...formData, icon: iconName });
        setIconSearch('');
    };

    const renderCategoryItem = (cat, isSubcategory = false) => {
        const subcats = getSubcategories(cat.id);
        const hasSubcats = subcats.length > 0;
        const isExpanded = expandedCategories.has(cat.id);

        return (
            <div key={cat.id} className={`category-item ${isSubcategory ? 'subcategory' : ''}`}>
                <div className="category-row">
                    {!isSubcategory && hasSubcats && (
                        <button className="expand-btn" onClick={() => toggleExpand(cat.id)}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}

                    <div className="category-icon" style={{ background: cat.color + '20', color: cat.color }}>
                        {renderIcon(cat.icon || 'tag')}
                    </div>

                    <span className="category-name">{cat.name}</span>

                    <div className="category-actions">
                        {!isSubcategory && (
                            <button
                                className="action-btn"
                                title="Add subcategory"
                                onClick={() => { setNewCategoryParent(cat.id); setShowNewCategoryForm(true); }}
                            >
                                <Plus size={14} />
                            </button>
                        )}
                        <button className="action-btn" title="Edit" onClick={() => handleEditCategory(cat)}>
                            <Edit2 size={14} />
                        </button>
                        <button className="action-btn delete" title="Delete" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {!isSubcategory && hasSubcats && isExpanded && (
                    <div className="subcategory-list">
                        {subcats.map(subcat => renderCategoryItem(subcat, true))}
                    </div>
                )}
            </div>
        );
    };

    const expenseCategories = parentCategories.filter(c => c.type === 'expense');
    const incomeCategories = parentCategories.filter(c => c.type === 'income');

    return (
        <div className="config">
            <section className="config-section">
                <div className="section-header">
                    <button className="btn btn-primary" onClick={() => setShowNewCategoryForm(true)}>
                        <Plus size={16} /> Add Category
                    </button>
                </div>

                <div className="category-group">
                    <h4 className="group-title expense">Expenses</h4>
                    <div className="category-list">
                        {expenseCategories.map(cat => renderCategoryItem(cat))}
                    </div>
                </div>

                <div className="category-group">
                    <h4 className="group-title income">Income</h4>
                    <div className="category-list">
                        {incomeCategories.map(cat => renderCategoryItem(cat))}
                    </div>
                </div>
            </section>

            {(showNewCategoryForm || editingCategory) && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Edit Category' : newCategoryParent ? 'Add Subcategory' : 'Add Category'}</h3>
                            <button className="btn-icon" onClick={resetForm}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Category name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            {!editingCategory && !newCategoryParent && (
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <div className="type-toggle">
                                        <button
                                            className={`type-btn ${formData.type === 'expense' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                                        >
                                            Expense
                                        </button>
                                        <button
                                            className={`type-btn ${formData.type === 'income' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: 'income' })}
                                        >
                                            Income
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <div className="color-picker">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            className={`color-swatch ${formData.color === color ? 'active' : ''}`}
                                            style={{ background: color }}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Icon</label>
                                <div className="icon-input-wrapper">
                                    <span className="icon-preview" style={{ color: formData.color }}>
                                        {renderIcon(formData.icon, 18)}
                                    </span>
                                    <input
                                        type="text"
                                        className="form-input icon-search-input"
                                        placeholder="Search icon... (e.g. coffee, car, home)"
                                        value={iconSearch}
                                        onChange={e => setIconSearch(e.target.value)}
                                    />
                                    <span className="current-icon-name">{formData.icon}</span>
                                </div>

                                {filteredIcons.length > 0 && (
                                    <div className="icon-picker-dropdown">
                                        {filteredIcons.map(iconName => (
                                            <button
                                                key={iconName}
                                                className={`icon-option ${formData.icon === iconName ? 'active' : ''}`}
                                                onClick={() => selectIcon(iconName)}
                                                title={iconName}
                                            >
                                                {renderIcon(iconName, 18)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                                    disabled={!formData.name.trim()}
                                >
                                    <Check size={16} />
                                    {editingCategory ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Config;
