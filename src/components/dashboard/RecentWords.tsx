import { Clock } from 'lucide-react';
import { Word } from '@/types';
import Link from 'next/link';

interface RecentWordsProps {
  loading: boolean;
  words: Word[];
}

export default function RecentWords({ loading, words }: RecentWordsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-brand mr-2.5" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Words</h3>
        </div>
        <Link href="/words" className="text-sm font-semibold text-brand dark:text-brand-dark hover:text-brand-hover">View All</Link>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-4">Loading...</div>
      ) : words.length === 0 ? (
        <div className="text-center text-slate-500 py-4">No words added yet.</div>
      ) : (
        <div className="space-y-4">
          {words.map(word => (
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
  );
}
