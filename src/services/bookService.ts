import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, orderBy, limit, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  description: string;
  isbn: string;
  coverUrl: string;
  avgRating: number;
  reviewCount: number;
}

export interface YearlyList {
  id: string;
  year: number;
  category: string;
  bookIds: string[];
}

export const getBooksByYear = (year: number, callback: (books: Book[]) => void) => {
  const q = query(collection(db, 'books'), where('year', '==', year), limit(20));
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
    callback(books);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'books');
  });
};

export const getYearlyLists = (callback: (lists: YearlyList[]) => void) => {
  const q = query(collection(db, 'yearly_lists'), orderBy('year', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as YearlyList));
    callback(lists);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'yearly_lists');
  });
};

export const getBookById = (id: string, callback: (book: Book | null) => void) => {
  const docRef = doc(db, 'books', id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Book);
    } else {
      callback(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `books/${id}`);
  });
};

export const updateBookStatus = async (userId: string, bookId: string, status: string) => {
  const shelfRef = doc(db, `users/${userId}/shelves`, bookId);
  try {
    await setDoc(shelfRef, {
      status,
      updatedAt: new Date().toISOString(),
      progress: 0
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}/shelves/${bookId}`);
  }
};

export const addScrapedBookToLibrary = async (userId: string, book: any, status: string) => {
  try {
    // Check if book already exists in library
    const q = query(collection(db, 'books'), where('title', '==', book.title), where('author', '==', book.author));
    const snapshot = await getDocs(q);
    
    let bookId: string;
    
    if (snapshot.empty) {
      // Create new book entry
      const newBookRef = doc(collection(db, 'books'));
      bookId = newBookRef.id;
      await setDoc(newBookRef, {
        title: book.title,
        author: book.author,
        year: book.year,
        genre: book.genre,
        description: book.description,
        isbn: book.isbn || `WEB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        coverUrl: book.coverUrl || `https://picsum.photos/seed/${encodeURIComponent(book.title)}/400/600`,
        avgRating: 4.5,
        reviewCount: Math.floor(Math.random() * 1000) + 100
      });
    } else {
      bookId = snapshot.docs[0].id;
    }
    
    // Update user shelf
    await updateBookStatus(userId, bookId, status);
    return bookId;
  } catch (err) {
    console.error("Error adding scraped book to library:", err);
    throw err;
  }
};

export const getUserShelf = (userId: string, callback: (items: any[]) => void) => {
  const shelfRef = collection(db, `users/${userId}/shelves`);
  return onSnapshot(shelfRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ bookId: doc.id, ...doc.data() }));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/shelves`);
  });
};
