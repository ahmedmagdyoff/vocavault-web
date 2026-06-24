'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Shuffle, Eye } from 'lucide-react';
import { wordsApi } from '@/lib/words';
import { categoriesApi } from '@/lib/categories';
import { videosApi } from '@/lib/videos';
import { Word, Category, Video } from '@/types';
import toast from 'react-hot-toast';
import VideoModal from '@/components/VideoModal';

export default function LearnPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');

  // Study State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMeaningRevealed, setIsMeaningRevealed] = useState(false);
  const [isFormsRevealed, setIsFormsRevealed] = useState(false);

  const [dailyReviewed, setDailyReviewed] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);

  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchData();
    loadProgress();
  }, []);

  const fetchData = async () => {
    try {
      const [wordsRes, catsRes, videosRes] = await Promise.all([
        wordsApi.getWords(),
        categoriesApi.getCategories(),
        videosApi.getVideos()
      ]);
      setWords(wordsRes.data);
      setCategories(catsRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      toast.error('Failed to load learning data');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem('voca_vault_progress');
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        
        setTotalReviewed(data.totalReviewed || 0);
        
        if (data.dailyStats && data.dailyStats[today]) {
          setDailyReviewed(data.dailyStats[today]);
        } else {
          // Initialize today's stats if missing
          setDailyReviewed(0);
        }
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  };

  const saveProgress = () => {
    try {
      const stored = localStorage.getItem('voca_vault_progress');
      let data = stored ? JSON.parse(stored) : { totalReviewed: 0, dailyStats: {} };
      const today = new Date().toISOString().split('T')[0];

      data.totalReviewed = (data.totalReviewed || 0) + 1;
      data.dailyStats[today] = (data.dailyStats[today] || 0) + 1;

      localStorage.setItem('voca_vault_progress', JSON.stringify(data));
      setTotalReviewed(data.totalReviewed);
      setDailyReviewed(data.dailyStats[today]);
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesCategory = selectedCategory ? word.category?.id?.toString() === selectedCategory : true;
      const matchesVideo = selectedVideo ? word.videos?.some(v => v.id.toString() === selectedVideo) : true;
      return matchesCategory && matchesVideo;
    });
  }, [words, selectedCategory, selectedVideo]);

  // Handle resetting state when changing words
  const changeWord = (newIndex: number) => {
    if (filteredWords.length === 0) return;
    
    // Only save progress if we actually studied something (e.g., they hit next to move on)
    // For simplicity, any navigation increments progress
    saveProgress();

    setIsMeaningRevealed(false);
    setIsFormsRevealed(false);
    setCurrentIndex(newIndex);
  };

  // If filters change and current index is out of bounds, reset index
  useEffect(() => {
    if (filteredWords.length > 0 && currentIndex >= filteredWords.length) {
      setCurrentIndex(0);
      setIsMeaningRevealed(false);
      setIsFormsRevealed(false);
    }
  }, [filteredWords, currentIndex]);

  const handleNext = () => {
    if (filteredWords.length <= 1) return;
    const nextIdx = (currentIndex + 1) % filteredWords.length;
    changeWord(nextIdx);
  };

  const handlePrev = () => {
    if (filteredWords.length <= 1) return;
    const prevIdx = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
    changeWord(prevIdx);
  };

  const handleRandom = () => {
    if (filteredWords.length <= 1) return;
    let randIdx = currentIndex;
    while (randIdx === currentIndex) {
      randIdx = Math.floor(Math.random() * filteredWords.length);
    }
    changeWord(randIdx);
  };

  const currentWord = filteredWords[currentIndex];

  return (
    <div className="pb-12">
      <div className="mb-8 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Mode</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Master your vocabulary with interactive flashcards.</p>
        </div>
        
        {/* Progress Stats */}
        <div className="flex gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Today</div>
            <div className="text-lg font-bold text-brand dark:text-brand-dark">{dailyReviewed}</div>
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total</div>
            <div className="text-lg font-bold text-brand dark:text-brand-dark">{totalReviewed}</div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <select 
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentIndex(0); }}
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select 
          value={selectedVideo}
          onChange={(e) => { setSelectedVideo(e.target.value); setCurrentIndex(0); }}
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All Videos</option>
          {videos.map(video => (
            <option key={video.id} value={video.id}>{video.title}</option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-8 md:p-12 border border-slate-200/60 dark:border-slate-800 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand mb-4 dark:border-slate-700 dark:border-t-brand-dark"></div>
             <p className="text-slate-500 font-medium">Loading flashcards...</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300">No words found</h3>
            <p className="mt-2 text-slate-500">Try adjusting your filters to find words to study.</p>
          </div>
        ) : (
          <>
            {/* Flashcard */}
            <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-8 md:p-12 border border-slate-200/60 dark:border-slate-800 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
              
              {/* Progress indicator */}
              <div className="absolute top-4 right-6 text-sm font-medium text-slate-400">
                {currentIndex + 1} / {filteredWords.length}
              </div>

              {/* Main Word */}
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 text-center tracking-tight">
                {currentWord.word}
              </h2>

              <div className="w-full max-w-lg flex flex-col gap-5">
                
                {/* Meaning Section */}
                {isMeaningRevealed ? (
                  <div className="bg-brand/5 dark:bg-slate-800/50 rounded-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-300 border border-brand/20 dark:border-slate-700">
                    <span className="mb-3 inline-flex w-fit rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-hover dark:bg-brand-dark/20 dark:text-brand-dark">
                      {currentWord.category?.name || 'Unknown'}
                    </span>
                    <p className="text-3xl text-slate-800 dark:text-slate-200 font-medium">{currentWord.meaning}</p>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsMeaningRevealed(true)} 
                    variant="outline" 
                    className="w-full h-14 text-lg border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Eye className="mr-2 h-5 w-5" /> Reveal Meaning
                  </Button>
                )}

                {/* Grammatical Forms Section */}
                {currentWord.forms && currentWord.forms.length > 0 && (
                  isFormsRevealed ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                        {currentWord.forms.map(form => (
                          <div key={form.id} className="text-center bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                              {form.form_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </div>
                            <div className="font-semibold text-lg text-slate-900 dark:text-white">{form.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setIsFormsRevealed(true)} 
                      variant="outline" 
                      className="w-full h-14 text-lg border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Eye className="mr-2 h-5 w-5" /> Reveal Grammatical Forms
                    </Button>
                  )
                )}

                {/* Related Videos (Only show if meaning is revealed, as a bonus contextual hint) */}
                {currentWord.videos && currentWord.videos.length > 0 && isMeaningRevealed && (
                  <div className="mt-2 pt-5 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-500">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 text-center uppercase tracking-widest">Found In Context</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentWord.videos.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => setPlayingVideo({ url: v.url, title: v.title })}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          🎥 {v.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button 
                onClick={handlePrev} 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 border-2"
                disabled={filteredWords.length <= 1}
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Previous
              </Button>
              
              <Button 
                onClick={handleRandom} 
                size="lg" 
                className="h-14 px-8 text-lg font-bold shadow-md shadow-brand/20"
                disabled={filteredWords.length <= 1}
              >
                <Shuffle className="mr-2 h-5 w-5" /> Random
              </Button>
              
              <Button 
                onClick={handleNext} 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 border-2"
                disabled={filteredWords.length <= 1}
              >
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </div>

      <VideoModal 
        isOpen={!!playingVideo} 
        onClose={() => setPlayingVideo(null)} 
        videoUrl={playingVideo?.url || null}
        title={playingVideo?.title}
      />
    </div>
  );
}
