import React from 'react';
import { BookCard } from './BookCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface YearSectionProps {
  year: number;
  books: any[];
}

export const YearSection: React.FC<YearSectionProps> = ({ year, books }) => {
  return (
    <section className="py-12 border-b border-brand-wood/5 last:border-0">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif font-black text-brand-wood mb-2">{year}</h2>
          <p className="text-text-secondary italic">The most notable books of the year</p>
        </div>
        <Link 
          to={`/explore?year=${year}`}
          className="flex items-center gap-1 text-sm font-bold text-brand-wood hover:underline underline-offset-4"
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.slice(0, 5).map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>
    </section>
  );
};
