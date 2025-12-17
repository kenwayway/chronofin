import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import './ContextMenu.css';

function ContextMenu({ x, y, onClose, onEdit, onDelete }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Adjust position if menu would go off screen
    const adjustedX = Math.min(x, window.innerWidth - 160);
    const adjustedY = Math.min(y, window.innerHeight - 100);

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ left: adjustedX, top: adjustedY }}
        >
            {onEdit && (
                <button className="context-menu-item" onClick={onEdit}>
                    <Edit3 size={16} />
                    <span>Edit</span>
                </button>
            )}
            <button className="context-menu-item context-menu-item-danger" onClick={onDelete}>
                <Trash2 size={16} />
                <span>Delete</span>
            </button>
        </div>
    );
}

export default ContextMenu;
