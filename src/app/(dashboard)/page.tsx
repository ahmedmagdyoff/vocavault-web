'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Video as VideoIcon, FolderTree, Flame, Target, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useVocabularyData } from '@/hooks/useVocabularyData';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import VideoModal from '@/components/VideoModal';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import LibraryHealth from '@/components/dashboard/LibraryHealth';
import CategoryDistribution from '@/components/dashboard/CategoryDistribution';
import WordOfTheDay from '@/components/dashboard/WordOfTheDay';
import RecentWords from '@/components/dashboard/RecentWords';
import RecentVideos from '@/components/dashboard/RecentVideos';

export default function DashboardPage() {
  const { user } = useAuth();
  const { words, videos, categories, loading } = useVocabularyData();
  const { streak } = useLearningProgress();
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  const totalWords = words.length;
  const totalVideos = videos.length;
  const totalCategories = categories.length;
  const wordsWithForms = words.filter(w => w.forms && w.forms.length > 0).length;

  const stats = [
    { name: 'Total Words', value: loading ? '...' : totalWords.toString(), icon: BookOpen, color: 'text-brand bg-brand/10 dark:bg-brand-dark/20 dark:text-brand-dark' },
    { name: 'Total Videos', value: loading ? '...' : totalVideos.toString(), icon: VideoIcon, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { name: 'Categories', value: loading ? '...' : totalCategories.toString(), icon: FolderTree, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
    { name: 'Words With Forms', value: loading ? '...' : wordsWithForms.toString(), icon: FileText, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(c => counts[c.name] = 0);
    words.forEach(w => {
      if (w.category?.name) {
        counts[w.category.name] = (counts[w.category.name] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [words, categories]);
  const maxCategoryCount = Math.max(1, ...categoryCounts.map(c => c[1]));

  const wordsWithVideos = words.filter(w => w.videos && w.videos.length > 0).length;
  const uncategorized = words.filter(w => !w.category_id).length;

  const healthBars = [
    { label: 'Words with Grammatical Forms', percentage: totalWords > 0 ? Math.round((wordsWithForms / totalWords) * 100) : 0, colorClass: 'bg-brand' },
    { label: 'Words Linked to Videos', percentage: totalWords > 0 ? Math.round((wordsWithVideos / totalWords) * 100) : 0, colorClass: 'bg-emerald-500' },
    { label: 'Uncategorized Words', percentage: totalWords > 0 ? Math.round((uncategorized / totalWords) * 100) : 0, colorClass: 'bg-orange-500' },
  ];

  const wordOfTheDay = useMemo(() => {
    if (words.length === 0) return null;
    const today = Math.floor(Date.now() / 86400000);
    const index = today % words.length;
    return words[index];
  }, [words]);

  const recentWords = words.slice(0, 5);
  const recentVideos = videos.slice(0, 5);

  return (
    <div className="pb-12 space-y-6">

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-brand to-indigo-800 dark:from-brand-hover dark:to-slate-900 rounded-2xl p-8 text-white shadow-md">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋
          </h1>
          <p className="text-white/90 opacity-90">
            Track your vocabulary progress and jump right back into learning.
          </p>
        </div>
        <div className="flex items-center gap-6 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-100 text-sm font-medium mb-1 uppercase tracking-widest"><Flame className="w-4 h-4 text-orange-400" /> Streak</div>
            <div className="text-3xl font-black">{streak} <span className="text-lg font-medium text-blue-200">Day{streak !== 1 ? 's' : ''}</span></div>
          </div>
          <div className="w-px h-12 bg-white/20"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-blue-100 text-sm font-medium mb-1 uppercase tracking-widest"><Target className="w-4 h-4 text-emerald-400" /> Library</div>
            <div className="text-3xl font-black">{loading ? '-' : totalWords} <span className="text-lg font-medium text-white/80">Words</span></div>
          </div>
        </div>
      </div>

      <StatisticsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <LibraryHealth loading={loading} bars={healthBars} />
          <CategoryDistribution loading={loading} categoryCounts={categoryCounts} maxCount={maxCategoryCount} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <WordOfTheDay loading={loading} word={wordOfTheDay} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentWords loading={loading} words={recentWords} />
            <RecentVideos loading={loading} videos={recentVideos} onPlayVideo={setPlayingVideo} />
          </div>
        </div>
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
