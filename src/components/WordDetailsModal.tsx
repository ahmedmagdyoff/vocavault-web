'use client';

import { Word } from '@/types';
import { formatFormType } from '@/lib/formatFormType';

interface WordDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word | null;
  onPlayVideo: (video: { url: string; title: string }) => void;
}

export default function WordDetailsModal({ isOpen, onClose, word, onPlayVideo }: WordDetailsModalProps) {
  if (!isOpen || !word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:shadow-2xl dark:shadow-black/50 max-h-[90vh] overflow-y-auto scrollbar-custom">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="mb-2 inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-hover dark:bg-brand-dark/20 dark:text-brand-dark">
              {word.category?.name || 'Unknown'}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{word.word}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mt-1">{word.meaning}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
        </div>

        {word.forms && word.forms.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">Grammatical Forms</h3>
            <div className="grid grid-cols-2 gap-3">
              {word.forms.map(form => (
                <div key={form.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {formatFormType(form.form_type)}
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">{form.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {word.videos && word.videos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">Found In</h3>
            <div className="space-y-3">
              {word.videos.map(video => (
                <button
                  key={video.id}
                  onClick={() => onPlayVideo({ url: video.url, title: video.title })}
                  className="block w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="font-medium text-slate-900 dark:text-white">🎥 {video.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
