import React from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const sampleBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    year: 2020,
    genre: "Fiction",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    isbn: "9780525559474",
    coverUrl: "https://picsum.photos/seed/midnight/400/600",
    avgRating: 4.5,
    reviewCount: 1200
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    year: 2021,
    genre: "Sci-Fi",
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.",
    isbn: "9780593135204",
    coverUrl: "https://picsum.photos/seed/hailmary/400/600",
    avgRating: 4.8,
    reviewCount: 850
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    year: 2022,
    genre: "Fiction",
    description: "In this exhilarating novel, two friends—often in love, but never lovers—become creative partners in a world of video game design.",
    isbn: "9780593321201",
    coverUrl: "https://picsum.photos/seed/tomorrow/400/600",
    avgRating: 4.6,
    reviewCount: 950
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    year: 2017,
    genre: "Historical Fiction",
    description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life.",
    isbn: "9781501161933",
    coverUrl: "https://picsum.photos/seed/evelyn/400/600",
    avgRating: 4.7,
    reviewCount: 2500
  }
];

export const SeedData: React.FC = () => {
  const seed = async () => {
    try {
      // Add books
      for (const book of sampleBooks) {
        const bookRef = doc(collection(db, 'books'));
        await setDoc(bookRef, book);
      }

      // Add yearly lists
      const years = [2020, 2021, 2022, 2017];
      for (const year of years) {
        const listRef = doc(db, 'yearly_lists', `${year}_notable`);
        await setDoc(listRef, {
          year,
          category: "Notable Titles",
          bookIds: [] // In a real app, we'd link the book IDs
        });
      }

      alert('Database seeded successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    }
  };

  return (
    <div className="p-4 bg-brand-rose/10 border border-brand-rose rounded-lg mb-8">
      <h3 className="font-bold text-brand-terracotta mb-2">Admin Tools</h3>
      <button 
        onClick={seed}
        className="px-4 py-2 bg-brand-terracotta text-white rounded hover:bg-brand-terracotta-dark transition-colors"
      >
        Seed Sample Data
      </button>
    </div>
  );
};
