import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, User, Library } from 'lucide-react';
import { Leaf, BookLine } from './DecorativeElements';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-brand-paper/80 backdrop-blur-md border-b border-brand-wood/10 overflow-hidden">
      <Leaf className="absolute -left-4 top-0 w-12 h-12 text-brand-green/5 rotate-45 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-wood rounded-lg text-white group-hover:bg-brand-wood-dark transition-colors">
              <BookLine className="w-6 h-6" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight text-brand-wood">
              YearlyReads
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/explore" className="text-text-secondary hover:text-brand-wood font-medium transition-colors">
              Explore
            </Link>
            <Link to="/search" className="text-text-secondary hover:text-brand-wood font-medium transition-colors">
              Search
            </Link>
            <Link to="/shelves" className="text-text-secondary hover:text-brand-wood font-medium transition-colors">
              My Shelves
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/search" className="p-2 text-text-secondary hover:text-brand-wood transition-colors">
              <Search size={20} />
            </Link>
            <Link to="/profile" className="flex items-center gap-2 p-1 pl-3 pr-1 bg-brand-cream border border-brand-wood/10 rounded-full hover:shadow-sm transition-all">
              <span className="text-sm font-medium text-text-primary">Profile</span>
              <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-brand-wood-dark">
                <User size={18} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
