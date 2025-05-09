import { Link } from '@inertiajs/react';

export default function TagBadge({ tag, showDelete = false, onDelete = null }) {
    return (
        <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ 
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: tag.color
            }}
        >
            {tag.name}
            {showDelete && (
                <button 
                    type="button"
                    onClick={() => onDelete(tag)}
                    className="ml-1.5 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-gray-300 hover:bg-opacity-30"
                >
                    ×
                </button>
            )}
        </span>
    );
}