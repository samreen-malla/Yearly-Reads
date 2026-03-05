/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getBookById, updateBookStatus, Book as BookType, getUserShelf, getYearlyLists, getBooksByYear, YearlyList } from './services/bookService';
import { Star, Clock, CheckCircle, Bookmark, Pause, ArrowLeft, MessageSquare, Search as SearchIcon, Filter, SlidersHorizontal, LogIn, LogOut, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { db, signInWithGoogle, logout } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { BookCard } from './components/BookCard';
import { YearSection } from './components/YearSection';
import { SeedData } from './components/SeedData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { getTrendingBooks, discoverBooksByYearAndGenre, getTopBook, ScrapedBook, searchBooksOnWeb } from './services/geminiService';
import { StatusDropdown } from './components/StatusDropdown';
import { Leaf, Coffee, BookLine, CozyLoading } from './components/DecorativeElements';

const Home = () => {
  const [lists, setLists] = useState<YearlyList[]>([]);
  const [booksByYear, setBooksByYear] = useState<Record<number, BookType[]>>({});
  const [loading, setLoading] = useState(true);
  
  // Web Discovery State
  const [trendingBooks, setTrendingBooks] = useState<ScrapedBook[]>([]);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    let unsubBooks: (() => void)[] = [];
    
    const unsubLists = getYearlyLists((fetchedLists) => {
      setLists(fetchedLists);
      setLoading(false);
      
      // Clear old listeners
      unsubBooks.forEach(unsub => unsub());
      unsubBooks = [];

      // Fetch books for each year efficiently
      fetchedLists.forEach(list => {
        const unsub = getBooksByYear(list.year, (books) => {
          setBooksByYear(prev => ({ ...prev, [list.year]: books }));
        });
        unsubBooks.push(unsub);
      });
    });

    return () => {
      unsubLists();
      unsubBooks.forEach(unsub => unsub());
    };
  }, []);

  const handleWebScrape = async () => {
    setIsScraping(true);
    const results = await getTrendingBooks();
    setTrendingBooks(results);
    setIsScraping(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CozyLoading message="Dusting off the shelves..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      {/* Background Decorations */}
      <Leaf className="absolute -left-10 top-20 w-32 h-32 text-brand-green/10 -rotate-12 pointer-events-none hidden xl:block" />
      <Coffee className="absolute -right-10 top-40 w-24 h-24 text-brand-wood/5 rotate-12 pointer-events-none hidden xl:block" />
      <BookLine className="absolute -left-20 bottom-40 w-40 h-40 text-brand-wood/5 -rotate-6 pointer-events-none hidden xl:block" />

      <header className="mb-16 text-center relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-20">
          <Leaf className="w-8 h-8 text-brand-green" />
          <BookLine className="w-8 h-8 text-brand-wood" />
          <Leaf className="w-8 h-8 text-brand-green rotate-180" />
        </div>
        <h1 className="text-6xl font-serif font-black text-brand-wood mb-4 tracking-tighter">
          Discover the Best Books <br /> of Every Year
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
          Curated lists of bestsellers, award winners, and most-read books since 2010.
        </p>
        
        <button 
          onClick={handleWebScrape}
          disabled={isScraping}
          className="bookshelf-btn"
        >
          {isScraping ? <Loader2 className="animate-spin mr-2" size={24} /> : <Sparkles className="mr-2" size={24} />}
          <span>{isScraping ? 'Looking for you...' : 'Discover Trending Books'}</span>
        </button>
      </header>

      {/* Web Scraped Results */}
      {trendingBooks.length > 0 && (
        <div className="mb-20 relative">
          <Leaf className="absolute -right-10 top-0 w-24 h-24 text-brand-green/10 rotate-45 pointer-events-none" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-wood rounded-lg text-white">
              <Wand2 size={24} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-wood">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingBooks.map((book, idx) => (
              <div key={idx} className="paper-card p-8 rounded-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-brand-green/20 text-brand-wood text-xs font-bold rounded-sm uppercase tracking-wider">
                    {book.genre}
                  </span>
                  <span className="text-brand-wood font-serif font-bold">{book.year}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">{book.title}</h3>
                <p className="text-brand-wood font-medium mb-4">by {book.author}</p>
                <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-4">{book.description}</p>
                <StatusDropdown book={book} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {lists.length === 0 ? (
        <div className="text-center py-20 paper-card rounded-sm border-dashed">
          <p className="text-text-secondary italic mb-4">The shelves are currently being stocked.</p>
          <Link to="/explore" className="text-brand-wood font-bold hover:underline">
            Explore all books →
          </Link>
        </div>
      ) : (
        <div className="space-y-4 relative">
          <Coffee className="absolute -left-12 top-1/2 w-20 h-20 text-brand-wood/5 -rotate-12 pointer-events-none hidden xl:block" />
          {lists.map((list) => (
            <YearSection 
              key={list.id} 
              year={list.year} 
              books={booksByYear[list.year] || []} 
            />
          ))}
        </div>
      )}
    </div>
  );
};


const Explore = () => {
  const [searchParams] = useSearchParams();
  const yearParam = searchParams.get('year');
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(yearParam ? parseInt(yearParam) : 'all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  
  // Top Book State
  const [topBook, setTopBook] = useState<ScrapedBook | null>(null);
  const [isFetchingTop, setIsFetchingTop] = useState(false);

  // Web Discovery State (for when local DB is empty)
  const [webBooks, setWebBooks] = useState<ScrapedBook[]>([]);
  const [isFetchingWeb, setIsFetchingWeb] = useState(false);

  useEffect(() => {
    setLoading(true);
    setWebBooks([]); // Reset web results on filter change
    
    let q = query(collection(db, 'books'), orderBy('year', 'desc'));
    
    if (selectedYear !== 'all') {
      q = query(collection(db, 'books'), where('year', '==', selectedYear));
    }

    const unsub = onSnapshot(q, async (snapshot) => {
      let fetchedBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookType));
      if (selectedGenre !== 'all') {
        fetchedBooks = fetchedBooks.filter(b => b.genre === selectedGenre);
      }
      setBooks(fetchedBooks);
      setLoading(false);

      // If local DB is empty and we have specific filters, try fetching from web
      if (fetchedBooks.length === 0 && (selectedYear !== 'all' || selectedGenre !== 'all')) {
        setIsFetchingWeb(true);
        const results = await discoverBooksByYearAndGenre(
          selectedYear === 'all' ? 2026 : selectedYear as number, 
          selectedGenre === 'all' ? 'Fiction' : selectedGenre
        );
        setWebBooks(results);
        setIsFetchingWeb(false);
      }
    });

    // Automatically fetch top book from web when filters change
    const fetchTop = async () => {
      setIsFetchingTop(true);
      const result = await getTopBook(
        selectedYear === 'all' ? undefined : selectedYear as number,
        selectedGenre === 'all' ? undefined : selectedGenre
      );
      setTopBook(result);
      setIsFetchingTop(false);
    };
    fetchTop();

    return () => unsub();
  }, [selectedYear, selectedGenre]);

  const years = Array.from({ length: 17 }, (_, i) => 2026 - i);
  const genres = ['Fiction', 'Sci-Fi', 'Historical Fiction', 'Non-Fiction', 'Mystery', 'Fantasy'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-black mb-4">Explore Collections</h1>
        <p className="text-text-secondary">Browse through curated lists and find your next favorite read.</p>
      </header>

      {/* Top Book Highlight - Always visible, updates automatically */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-accent rounded-lg text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-wood">Featured Recommendation</h2>
            <p className="text-sm text-text-secondary">
              The top book {selectedYear !== 'all' || selectedGenre !== 'all' ? 'matching your filters' : 'trending now'}
            </p>
          </div>
        </div>

        {isFetchingTop ? (
          <div className="bg-brand-cream/50 animate-pulse h-48 rounded-sm border border-brand-accent/20 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-accent" size={32} />
          </div>
        ) : topBook ? (
          <div className="paper-card p-8 rounded-sm border-2 border-brand-accent/20 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-48 aspect-[2/3] bg-white rounded-sm shadow-md flex items-center justify-center text-center p-4 border border-brand-accent/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">{topBook.genre}</p>
                <h4 className="font-serif font-bold text-lg leading-tight">{topBook.title}</h4>
                <p className="text-xs text-text-secondary mt-2">{topBook.author}</p>
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-sm uppercase tracking-wider">
                  {topBook.genre}
                </span>
                <span className="text-brand-accent font-serif font-bold">{topBook.year}</span>
              </div>
              <h3 className="text-3xl font-serif font-bold mb-2">{topBook.title}</h3>
              <p className="text-xl text-brand-accent font-medium mb-4">by {topBook.author}</p>
              <p className="text-text-secondary text-lg leading-relaxed mb-6 max-w-3xl">
                {topBook.description}
              </p>
              <StatusDropdown book={topBook} className="w-full md:w-64" />
            </div>
          </div>
        ) : (
          <div className="p-12 paper-card border border-dashed border-brand-accent/20 rounded-sm text-center">
            <p className="text-text-secondary italic">
              {selectedYear !== 'all' || selectedGenre !== 'all' 
                ? "No specific recommendation found for these filters, but you can still browse the collection below."
                : "Searching for the perfect recommendation..."}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Sidebar Filters */}
        <div className="md:w-64 space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
              <Clock size={14} /> Publication Year
            </h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedYear('all')}
                className={`px-3 py-1.5 rounded-sm text-sm font-bold transition-all ${selectedYear === 'all' ? 'bg-brand-wood text-white shadow-md' : 'bg-brand-cream text-text-secondary hover:bg-brand-wood/10 border border-brand-wood/10'}`}
              >
                All Time
              </button>
              {years.map(y => (
                <button 
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 rounded-sm text-sm font-bold transition-all ${selectedYear === y ? 'bg-brand-wood text-white shadow-md' : 'bg-brand-cream text-text-secondary hover:bg-brand-wood/10 border border-brand-wood/10'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
              <Filter size={14} /> Genre
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedGenre('all')}
                className={`w-full text-left px-3 py-2 rounded-sm text-sm font-bold transition-all ${selectedGenre === 'all' ? 'bg-brand-green/20 text-brand-wood border-l-4 border-brand-wood' : 'text-text-secondary hover:bg-brand-wood/5'}`}
              >
                All Genres
              </button>
              {genres.map(g => (
                <button 
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm font-bold transition-all ${selectedGenre === g ? 'bg-brand-green/20 text-brand-wood border-l-4 border-brand-wood' : 'text-text-secondary hover:bg-brand-wood/5'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <CozyLoading message="Checking our local archives..." />
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map(book => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          ) : isFetchingWeb ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 paper-card rounded-sm border-dashed">
              <CozyLoading message="Looking for you... This might take a moment while we brew some tea." />
            </div>
          ) : webBooks.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-6 p-3 bg-brand-green/10 rounded-sm border border-brand-green/20">
                <Wand2 size={16} className="text-brand-wood" />
                <p className="text-sm font-bold text-brand-wood uppercase tracking-wider">Discovered for you</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {webBooks.map((book, idx) => (
                  <div key={idx} className="paper-card p-6 rounded-sm">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-brand-green/20 text-brand-wood text-[10px] font-black rounded-sm uppercase tracking-tighter">
                        {book.genre}
                      </span>
                      <span className="text-brand-wood font-serif font-bold text-sm">{book.year}</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-1 leading-tight">{book.title}</h3>
                    <p className="text-brand-wood font-medium text-sm mb-3">by {book.author}</p>
                    <p className="text-text-secondary text-xs leading-relaxed mb-4 line-clamp-3">{book.description}</p>
                    <StatusDropdown book={book} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 paper-card rounded-sm border-dashed">
              <p className="text-text-secondary italic">No books found matching your filters in our collection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [webResults, setWebResults] = useState<ScrapedBook[]>([]);
  const [searchingWeb, setSearchingWeb] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchingWeb(true);
    setWebResults([]);
    
    // Web Search only
    const webBooks = await searchBooksOnWeb(searchTerm);
    setWebResults(webBooks);
    setSearchingWeb(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      <Leaf className="absolute -left-20 top-40 w-40 h-40 text-brand-green/5 -rotate-12 pointer-events-none" />
      <Coffee className="absolute -right-20 bottom-40 w-32 h-32 text-brand-wood/5 rotate-12 pointer-events-none" />

      <header className="mb-12 text-center">
        <div className="flex justify-center gap-2 mb-4 opacity-30">
          <BookLine className="w-6 h-6 text-brand-wood" />
          <Leaf className="w-6 h-6 text-brand-green" />
        </div>
        <h1 className="text-4xl font-serif font-black mb-4 tracking-tight text-brand-wood">Search the Library</h1>
        <p className="text-text-secondary">Find books by title, author, or genre in our digital library.</p>
      </header>

      <form onSubmit={handleSearch} className="relative mb-16">
        <input 
          type="text" 
          placeholder="Search for books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-4 pl-14 pr-6 paper-card border-2 border-brand-wood/10 rounded-sm focus:border-brand-wood focus:outline-none text-lg shadow-sm transition-all"
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" size={24} />
        <button 
          type="submit"
          disabled={searchingWeb}
          className="absolute right-3 top-1/2 -translate-y-1/2 bookshelf-btn py-2 disabled:opacity-50"
        >
          {searchingWeb ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      <div>
        <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-brand-wood">
          <Wand2 size={20} /> Search Results
        </h2>
        {searchingWeb ? (
          <div className="py-10 paper-card rounded-sm border-dashed">
            <CozyLoading message="Looking for you... Almost there!" />
          </div>
        ) : webResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {webResults.map((book, idx) => (
              <div key={idx} className="paper-card p-6 rounded-sm relative group overflow-hidden">
                <Leaf className="absolute -right-2 -bottom-2 w-12 h-12 text-brand-green/5 rotate-12 pointer-events-none group-hover:text-brand-green/10 transition-colors" />
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 bg-brand-green/20 text-brand-wood text-[10px] font-black rounded-sm uppercase tracking-tighter">
                    {book.genre}
                  </span>
                  <span className="text-brand-wood font-serif font-bold text-sm">{book.year}</span>
                </div>
                <h3 className="font-serif font-bold text-lg mb-1 leading-tight">{book.title}</h3>
                <p className="text-brand-wood font-medium text-sm mb-3">by {book.author}</p>
                <p className="text-text-secondary text-xs leading-relaxed mb-4 line-clamp-3">{book.description}</p>
                <StatusDropdown book={book} />
              </div>
            ))}
          </div>
        ) : searchTerm && !searchingWeb ? (
          <div className="text-center py-10 paper-card rounded-sm border-dashed">
            <p className="text-text-secondary italic">No results found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="text-center py-10 bg-brand-cream/30 rounded-sm border border-dashed border-brand-wood/10">
            <p className="text-text-secondary text-sm">AI-powered search results will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = getBookById(id, (fetchedBook) => {
      setBook(fetchedBook);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    if (!user || !id) {
      alert('Please sign in to track your reading.');
      return;
    }
    setUpdating(true);
    await updateBookStatus(user.uid, id, status);
    setUpdating(false);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-wood" size={48} /></div>;
  if (!book) return <div className="p-20 text-center">Book not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-brand-wood mb-8 transition-colors font-bold"
      >
        <ArrowLeft size={20} />
        <span>Back to library</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: Cover and Actions */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-24">
            <div className="paper-card p-2 rounded-sm shadow-xl mb-8">
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-full rounded-sm object-cover aspect-[2/3]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Reading Status</h3>
              <button 
                disabled={updating}
                onClick={() => handleStatusUpdate('want_to_read')}
                className="w-full bookshelf-btn-secondary"
              >
                <Bookmark size={18} className="mr-2" />
                Want to Read
              </button>
              <button 
                disabled={updating}
                onClick={() => handleStatusUpdate('reading')}
                className="w-full bookshelf-btn-secondary !bg-brand-green/40"
              >
                <Clock size={18} className="mr-2" />
                Reading
              </button>
              <button 
                disabled={updating}
                onClick={() => handleStatusUpdate('read')}
                className="w-full bookshelf-btn-secondary !bg-brand-accent/40"
              >
                <CheckCircle size={18} className="mr-2" />
                Read
              </button>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-brand-wood font-bold text-sm mb-2">
              <span>{book.year}</span>
              <span className="w-1 h-1 bg-brand-wood/30 rounded-full" />
              <span>{book.genre}</span>
            </div>
            <h1 className="text-5xl font-serif font-black mb-4 leading-tight text-brand-wood-dark">{book.title}</h1>
            <p className="text-2xl text-text-secondary font-serif italic mb-6">by {book.author}</p>
            
            <div className="flex items-center gap-6 py-6 border-y border-brand-wood/10">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-brand-accent mb-1">
                  <Star size={20} fill="currentColor" />
                  <span className="text-xl font-bold">{book.avgRating}</span>
                </div>
                <span className="text-xs text-text-secondary uppercase tracking-tighter font-bold">{book.reviewCount} Reviews</span>
              </div>
              <div className="w-px h-10 bg-brand-wood/10" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-text-primary">ISBN</span>
                <span className="text-xs text-text-secondary uppercase tracking-tighter font-bold">{book.isbn}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-stone max-w-none mb-12">
            <h3 className="text-xl font-serif font-bold mb-4 text-brand-wood">Summary</h3>
            <p className="text-text-primary leading-relaxed text-lg">
              {book.description}
            </p>
          </div>

          <div className="paper-card rounded-sm p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-2xl font-serif font-bold text-brand-wood">Community Reviews</h3>
              <button className="bookshelf-btn py-2">
                <MessageSquare size={18} className="mr-2" />
                Write a Review
              </button>
            </div>
            
            <div className="text-center py-12">
              <p className="text-text-secondary italic">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Shelves = () => {
  const { user, loading: authLoading } = useAuth();
  const [shelfItems, setShelfItems] = useState<any[]>([]);
  const [books, setBooks] = useState<Record<string, BookType>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = getUserShelf(user.uid, async (items) => {
      setShelfItems(items);
      
      // Fetch book details for each shelf item
      const bookPromises = items.map(async (item) => {
        if (!books[item.bookId]) {
          const bookDoc = await getDoc(doc(db, 'books', item.bookId));
          if (bookDoc.exists()) {
            return { id: bookDoc.id, ...bookDoc.data() } as BookType;
          }
        }
        return null;
      });

      const fetchedBooks = await Promise.all(bookPromises);
      const newBooks = { ...books };
      fetchedBooks.forEach(b => {
        if (b) newBooks[b.id] = b;
      });
      setBooks(newBooks);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (authLoading || loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-wood" size={48} /></div>;
  if (!user) return <div className="p-20 text-center text-text-secondary italic">Please sign in to view your shelves.</div>;

  const buckets = {
    reading: shelfItems.filter(i => i.status === 'reading'),
    want_to_read: shelfItems.filter(i => i.status === 'want_to_read'),
    read: shelfItems.filter(i => i.status === 'read'),
    paused: shelfItems.filter(i => i.status === 'paused'),
  };

  const BucketSection = ({ title, items, colorClass }: { title: string, items: any[], colorClass: string }) => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
        <h2 className="text-2xl font-serif font-bold text-brand-wood">{title}</h2>
        <span className="text-sm text-text-secondary bg-brand-cream px-2 py-0.5 rounded-sm border border-brand-wood/10">
          {items.length}
        </span>
      </div>
      
      {items.length === 0 ? (
        <div className="p-12 paper-card border border-dashed border-brand-wood/10 rounded-sm text-center">
          <p className="text-text-secondary italic">No books in this shelf yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => {
            const book = books[item.bookId];
            if (!book) return null;
            return <BookCard key={book.id} {...book} status={item.status} />;
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-black mb-2 text-brand-wood">My Digital Bookshelf</h1>
        <p className="text-text-secondary">Organize and track your personal reading journey.</p>
      </header>

      <BucketSection title="Currently Reading" items={buckets.reading} colorClass="bg-brand-green" />
      <BucketSection title="Want to Read" items={buckets.want_to_read} colorClass="bg-brand-wood" />
      <BucketSection title="Finished" items={buckets.read} colorClass="bg-brand-accent" />
      <BucketSection title="On Hold" items={buckets.paused} colorClass="bg-gray-400" />
    </div>
  );
};

const Profile = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return (
    <div className="max-w-md mx-auto mt-20 p-8 paper-card rounded-sm text-center">
      <h2 className="text-2xl font-serif font-bold mb-4 text-brand-wood">Welcome Back</h2>
      <p className="text-text-secondary mb-8">Sign in to track your reading journey and join the community.</p>
      <button 
        onClick={signInWithGoogle}
        className="bookshelf-btn w-full"
      >
        <LogIn size={20} className="mr-2" />
        Sign in with Google
      </button>
    </div>
  );

  const isAdmin = user.email === "samreen.oiai@gmail.com";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="paper-card rounded-sm p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt={user.displayName || 'User'} 
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-serif font-bold text-brand-wood">{user.displayName}</h1>
            <p className="text-text-secondary">{user.email}</p>
            <div className="mt-2 flex justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 bg-brand-green/20 text-brand-wood text-xs font-bold rounded-sm uppercase tracking-wider">
                Reader
              </span>
              {isAdmin && (
                <span className="px-3 py-1 bg-brand-wood/20 text-brand-wood text-xs font-bold rounded-sm uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-white/50 rounded-sm border border-brand-wood/5 text-center">
            <p className="text-3xl font-serif font-bold text-brand-wood">0</p>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Books Read</p>
          </div>
          <div className="p-4 bg-white/50 rounded-sm border border-brand-wood/5 text-center">
            <p className="text-3xl font-serif font-bold text-brand-wood">0</p>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Reviews</p>
          </div>
          <div className="p-4 bg-white/50 rounded-sm border border-brand-wood/5 text-center">
            <p className="text-3xl font-serif font-bold text-brand-wood">0</p>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Want to Read</p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="px-6 py-2 border border-brand-wood/20 text-brand-wood rounded-sm font-bold hover:bg-brand-wood hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {isAdmin && <SeedData />}
    </div>
  );
};


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-brand-paper">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/shelves" element={<Shelves />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          
          <footer className="bg-brand-cream border-t border-brand-wood/10 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-1.5 bg-brand-wood rounded text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <span className="font-serif font-bold text-brand-wood">YearlyReads</span>
              </div>
              <p className="text-text-secondary text-sm">© 2026 YearlyReads. A cozy corner for book lovers.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

