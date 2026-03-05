import React from 'react';
import { motion } from 'motion/react';

export const Leaf = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    initial={{ rotate: -5 }}
    animate={{ rotate: 5 }}
    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 21 3c-1.4 4-2 5.5-3.1 11.2A7 7 0 0 1 11 20z" />
    <path d="M11 20l2-2" />
  </motion.svg>
);

export const Coffee = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    initial={{ y: 0 }}
    animate={{ y: -2 }}
    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </motion.svg>
);

export const BookLine = ({ className }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    whileHover={{ scale: 1.05 }}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </motion.svg>
);

export const CozyLoading = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="relative mb-6">
      <Coffee className="w-16 h-16 text-brand-wood/40" />
      <motion.div 
        className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-4 bg-brand-wood/20 rounded-full"
            animate={{ 
              y: [-10, -20], 
              opacity: [0, 1, 0],
              scale: [1, 1.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "easeOut" 
            }}
          />
        ))}
      </motion.div>
    </div>
    <p className="text-brand-wood font-serif italic text-lg animate-pulse">{message}</p>
    <div className="mt-4 flex gap-2">
      <Leaf className="w-5 h-5 text-brand-green/40" />
      <BookLine className="w-5 h-5 text-brand-wood/20" />
      <Leaf className="w-5 h-5 text-brand-green/40 rotate-180" />
    </div>
  </div>
);
