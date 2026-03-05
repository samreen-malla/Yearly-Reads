import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScrapedBook {
  title: string;
  author: string;
  year: number;
  genre: string;
  description: string;
  coverUrl?: string;
}

const getCachedData = (key: string) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache expires after 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

export const discoverBooksByYearAndGenre = async (year: number, genre: string): Promise<ScrapedBook[]> => {
  const cacheKey = `discovery-${year}-${genre}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `Find a list of 5 highly-rated books published in ${year} in the genre "${genre}". 
  Return as a JSON array of objects with keys: title, author, year, genre, description.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const results = JSON.parse(text);
    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error discovering books:", error);
    return [];
  }
};

export const getTrendingBooks = async (): Promise<ScrapedBook[]> => {
  const cacheKey = 'trending-books';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `Find a list of 6 trending or highly-anticipated books currently popular in 2025 and 2026. 
  For each book, provide:
  1. Title
  2. Author
  3. A brief description (1-2 sentences)
  4. Genre
  5. Year
  
  Return the data as a JSON array of objects with keys: title, author, year, genre, description.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const results = JSON.parse(text);
    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error fetching trending books:", error);
    return [];
  }
};

export const getTopBook = async (year?: number, genre?: string): Promise<ScrapedBook | null> => {
  const cacheKey = `topbook-${year || 'any'}-${genre || 'any'}`;
  const cached = getCachedData(cacheKey);
  if (cached !== null) return cached;

  const context = year && genre 
    ? `published in ${year} in the genre "${genre}"` 
    : year 
      ? `published in ${year}` 
      : genre 
        ? `in the genre "${genre}"` 
        : "currently trending in 2025-2026";

  const prompt = `Quickly find the single most famous or top-rated book ${context}. 
  Return a JSON object with keys: title, author, year, genre, description.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      setCachedData(cacheKey, null);
      return null;
    }
    
    const result = JSON.parse(text);
    setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching top book:", error);
    return null;
  }
};

export const searchBooksOnWeb = async (query: string): Promise<ScrapedBook[]> => {
  const cacheKey = `search-web-${query.toLowerCase().replace(/\s+/g, '-')}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const prompt = `Books for query: "${query}". Max 5. JSON array: [{title, author, year, genre, description}].`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const results = JSON.parse(text);
    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error searching books on web:", error);
    return [];
  }
};
