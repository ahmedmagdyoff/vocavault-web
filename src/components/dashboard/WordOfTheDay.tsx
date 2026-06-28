import { Sparkles, Video as VideoIcon } from 'lucide-react';
import { Word } from '@/types';
import { formatFormType } from '@/lib/formatFormType';

interface WordOfTheDayProps {
  loading: boolean;
  word: Word | null;
}

export default function WordOfTheDay({ loading, word }: WordOfTheDayProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full -z-0"></div>

      <div className="flex items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <Sparkles className="w-5 h-5 text-yellow-500 mr-2.5" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Word of the Day</h3>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading...</div>
      ) : !word ? (
        <div className="text-center text-slate-500 py-12">Add some words to see the Word of the Day!</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-8 relative z-10">
          <div className="flex-1">
            <span className="mb-3 inline-flex w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
              {word.category?.name || 'Unknown'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{word.word}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium mb-6">{word.meaning}</p>

            {word.videos && word.videos.length > 0 && (
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <VideoIcon className="w-4 h-4 mr-2" />
                Found in {word.videos.length} video{word.videos.length === 1 ? '' : 's'}
              </div>
            )}
          </div>

          {word.forms && word.forms.length > 0 && (
            <div className="sm:w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Grammatical Forms</h4>
              <div className="space-y-2">
                {word.forms.map(form => (
                  <div key={form.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatFormType(form.form_type)}
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
  );
}
