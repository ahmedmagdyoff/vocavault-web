'use client';

import { useState, useEffect } from 'react';
import { wordsApi } from '@/lib/words';
import { videosApi } from '@/lib/videos';
import { categoriesApi } from '@/lib/categories';
import { Word, Video, Category } from '@/types';

interface VocabularyData {
  words: Word[];
  videos: Video[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  refetch: () => Promise<void>;
}

/**
 * Shared hook for fetching words, videos, and categories.
 * Used by dashboard, words, learn, and videos pages.
 */
export function useVocabularyData(): VocabularyData {
  const [words, setWords] = useState<Word[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wordsRes, videosRes, categoriesRes] = await Promise.all([
        wordsApi.getWords(),
        videosApi.getVideos(),
        categoriesApi.getCategories(),
      ]);
      setWords(wordsRes.data);
      setVideos(videosRes.data);
      setCategories(categoriesRes.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { words, videos, categories, loading, error, setWords, setVideos, refetch: fetchAll };
}
