import React from 'react';
import { motion } from 'motion/react';
import { Star, Plus } from 'lucide-react';
import { Leaf } from './DecorativeElements';
import { Link } from 'react-router-dom';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  year: number;
  rating: number;
  coverUrl: string;
  status?: 'want_to_read' | 'reading' | 'read' | 'paused';
}

const statusColors = {
  want_to_read: 'bg-brand-wood text-brand-paper',
  reading: 'bg-brand-green text-brand-wood-dark',
  read: 'bg-brand-accent text-white',
  paused: 'bg-gray-400 text-white',
};

const statusLabels = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  read: 'Read',
  paused: 'Paused',
};

export const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  year,
  rating,
  coverUrl,
  status,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="paper-card rounded-sm overflow-hidden flex flex-col h-full group"
    >
      <Link to={`/book/${id}`} className="relative aspect-[2/3] overflow-hidden border-b border-brand-wood/10">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-wood/0 group-hover:bg-brand-wood/5 transition-colors" />
        <div className="absolute top-2 left-2">
          <Leaf className="w-4 h-4 text-brand-green/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {status && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusColors[status]}`}>
            {statusLabels[status]}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link to={`/book/${id}`} className="hover:text-brand-wood transition-colors">
            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2">{title}</h3>
          </Link>
          <div className="flex items-center gap-1 text-brand-accent">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-text-secondary text-sm mb-2">{author}</p>
        <p className="text-text-secondary/60 text-xs mt-auto">{year}</p>
        
        <button className="mt-4 w-full py-2 bg-brand-green text-brand-wood-dark rounded-sm text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-green-dark transition-colors shadow-sm border-l-4 border-black/5">
          <Plus size={16} />
          <span>Add to Shelf</span>
        </button>
      </div>
    </motion.div>
  );
};
