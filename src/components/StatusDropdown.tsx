import React, { useState } from 'react';
import { Bookmark, Clock, CheckCircle, Pause, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addScrapedBookToLibrary } from '../services/bookService';

interface StatusDropdownProps {
  book: any;
  onStatusUpdate?: (status: string) => void;
  className?: string;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ book, onStatusUpdate, className = "" }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const statuses = [
    { id: 'want_to_read', label: 'Want to Read', icon: Bookmark, color: 'text-brand-wood' },
    { id: 'reading', label: 'Reading', icon: Clock, color: 'text-brand-green' },
    { id: 'read', label: 'Read', icon: CheckCircle, color: 'text-brand-accent' },
    { id: 'paused', label: 'Pause', icon: Pause, color: 'text-gray-400' },
  ];

  const handleStatusSelect = async (statusId: string) => {
    if (!user) {
      alert('Please sign in to track your reading.');
      return;
    }

    setIsUpdating(true);
    setIsOpen(false);
    try {
      await addScrapedBookToLibrary(user.uid, book, statusId);
      setCurrentStatus(statusId);
      if (onStatusUpdate) onStatusUpdate(statusId);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="w-full bookshelf-btn-secondary text-xs"
      >
        <div className="flex items-center gap-2">
          {isUpdating ? (
            <Loader2 className="animate-spin text-brand-wood" size={14} />
          ) : currentStatus ? (
            (() => {
              const s = statuses.find(st => st.id === currentStatus);
              return s ? <s.icon size={14} className={s.color} /> : <Bookmark size={14} />;
            })()
          ) : (
            <Bookmark size={14} className="text-brand-wood" />
          )}
          <span>
            {isUpdating ? 'Updating...' : currentStatus ? statuses.find(s => s.id === currentStatus)?.label : 'Add to Shelf'}
          </span>
        </div>
        <ChevronDown size={14} className={`transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-full paper-card rounded-sm shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {statuses.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusSelect(status.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-brand-green/10 transition-colors text-left border-b border-brand-wood/5 last:border-0"
            >
              <status.icon size={16} className={status.color} />
              <span>{status.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
