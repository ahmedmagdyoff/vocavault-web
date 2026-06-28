import { Video as VideoIcon } from 'lucide-react';
import { Video } from '@/types';
import Link from 'next/link';

interface RecentVideosProps {
  loading: boolean;
  videos: Video[];
  onPlayVideo: (video: { url: string; title: string }) => void;
}

export default function RecentVideos({ loading, videos, onPlayVideo }: RecentVideosProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center">
          <VideoIcon className="w-5 h-5 text-emerald-500 mr-2.5" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Videos</h3>
        </div>
        <Link href="/videos" className="text-sm font-semibold text-brand dark:text-brand-dark hover:text-brand-hover">View All</Link>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-4">Loading...</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-slate-500 py-4">No videos added yet.</div>
      ) : (
        <div className="space-y-4">
          {videos.map(video => (
            <button
              key={video.id}
              onClick={() => onPlayVideo({ url: video.url, title: video.title })}
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
  );
}
