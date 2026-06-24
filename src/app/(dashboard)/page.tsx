'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Video as VideoIcon, FolderTree, Flame, Sparkles, Target, BarChart2, TrendingUp, Clock, FileText } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { videosApi } from '@/lib/videos';
import { wordsApi } from '@/lib/words';
import { categoriesApi } from '@/lib/categories';
import { Word, Video as VideoType, Category } from '@/types';
import Link from 'next/link';
import VideoModal from '@/components/VideoModal';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [words, setWords] = useState<Word[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wordsRes, videosRes, categoriesRes] = await Promise.all([
          wordsApi.getWords(),
          videosApi.getVideos(),
          categoriesApi.getCategories()
        ]);
        
        setWords(wordsRes.data);
        setVideos(videosRes.data);
        setCategories(categoriesRes.data);

        // Load streak from local progress (placeholder logic)
        const stored = localStorage.getItem('voca_vault_progress');
        if (stored) {
          const data = JSON.parse(stored);
          const today = new Date().toISOString().split('T')[0];
          if (data.dailyStats && data.dailyStats[today]) {
             setStreak(1); // Placeholder: 1 Day streak if they reviewed today
          }
        }
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  // Category Distribution
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

  // Learning Progress
  const pctForms = totalWords > 0 ? Math.round((wordsWithForms / totalWords) * 100) : 0;
  const wordsWithVideos = words.filter(w => w.videos && w.videos.length > 0).length;
  const pctVideos = totalWords > 0 ? Math.round((wordsWithVideos / totalWords) * 100) : 0;
  const uncategorized = words.filter(w => !w.category_id).length;
  const pctUncategorized = totalWords > 0 ? Math.round((uncategorized / totalWords) * 100) : 0;

  // Recent 5
  const recentWords = words.slice(0, 5);
  const recentVideos = videos.slice(0, 5);

  // Word of the Day
  const wordOfTheDay = useMemo(() => {
    if (words.length === 0) return null;
    const today = Math.floor(Date.now() / 86400000);
    const index = today % words.length;
    return words[index];
  }, [words]);

  return (
    <div className="pb-12 space-y-6">
      
      {/* 1. Welcome Section */}
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

      {/* 2. Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress & Distribution */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 6. Learning Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <TrendingUp className="w-5 h-5 text-brand mr-2.5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Library Health</h3>
            </div>
            
            {loading ? <div className="text-center text-slate-400 py-8">Loading...</div> : (
              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Words with Grammatical Forms</span>
                    <span className="font-bold text-slate-900 dark:text-white">{pctForms}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                    <div className="bg-brand h-2.5 rounded-full" style={{ width: `${pctForms}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Words Linked to Videos</span>
                    <span className="font-bold text-slate-900 dark:text-white">{pctVideos}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${pctVideos}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Uncategorized Words</span>
                    <span className="font-bold text-slate-900 dark:text-white">{pctUncategorized}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${pctUncategorized}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Category Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <BarChart2 className="w-5 h-5 text-purple-500 mr-2.5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Distribution</h3>
            </div>
            
            {loading ? <div className="text-center text-slate-400 py-8">Loading...</div> : (
              <div className="space-y-4 flex-1">
                {categoryCounts.map(([name, count]) => {
                  const pct = Math.round((count / maxCategoryCount) * 100);
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 7. Word of the Day */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full -z-0"></div>
            
            <div className="flex items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
              <Sparkles className="w-5 h-5 text-yellow-500 mr-2.5" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Word of the Day</h3>
            </div>
            
            {loading ? <div className="text-center text-slate-400 py-12">Loading...</div> : !wordOfTheDay ? (
              <div className="text-center text-slate-500 py-12">Add some words to see the Word of the Day!</div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                <div className="flex-1">
                  <span className="mb-3 inline-flex w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                    {wordOfTheDay.category?.name || 'Unknown'}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{wordOfTheDay.word}</h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 font-medium mb-6">{wordOfTheDay.meaning}</p>
                  
                  {wordOfTheDay.videos && wordOfTheDay.videos.length > 0 && (
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                       <VideoIcon className="w-4 h-4 mr-2" />
                       Found in {wordOfTheDay.videos.length} video{wordOfTheDay.videos.length === 1 ? '' : 's'}
                    </div>
                  )}
                </div>
                
                {wordOfTheDay.forms && wordOfTheDay.forms.length > 0 && (
                  <div className="sm:w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Grammatical Forms</h4>
                    <div className="space-y-2">
                      {wordOfTheDay.forms.map(form => (
                        <div key={form.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 dark:text-slate-400">
                            {form.form_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{form.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 4. Recent Words */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-brand mr-2.5" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Words</h3>
                </div>
                <Link href="/words" className="text-sm font-semibold text-brand dark:text-brand-dark hover:text-brand-hover">View All</Link>
              </div>
              
              {loading ? <div className="text-center text-slate-400 py-4">Loading...</div> : recentWords.length === 0 ? (
                <div className="text-center text-slate-500 py-4">No words added yet.</div>
              ) : (
                <div className="space-y-4">
                  {recentWords.map(word => (
                    <div key={word.id} className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{word.word}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full">{word.category?.name || 'Uncategorized'}</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{word.meaning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Recent Videos */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center">
                  <VideoIcon className="w-5 h-5 text-emerald-500 mr-2.5" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Videos</h3>
                </div>
                <Link href="/videos" className="text-sm font-semibold text-brand dark:text-brand-dark hover:text-brand-hover">View All</Link>
              </div>
              
              {loading ? <div className="text-center text-slate-400 py-4">Loading...</div> : recentVideos.length === 0 ? (
                <div className="text-center text-slate-500 py-4">No videos added yet.</div>
              ) : (
                <div className="space-y-4">
                  {recentVideos.map(video => (
                    <button 
                      key={video.id} 
                      onClick={() => setPlayingVideo({ url: video.url, title: video.title })}
                      className="group flex w-full text-left items-start gap-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 pb-3 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        🎥
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{video.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{video.platform || 'Video Link'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
