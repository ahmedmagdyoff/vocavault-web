import { TrendingUp } from 'lucide-react';

interface ProgressBar {
  label: string;
  percentage: number;
  colorClass: string;
}

interface LibraryHealthProps {
  loading: boolean;
  bars: ProgressBar[];
}

export default function LibraryHealth({ loading, bars }: LibraryHealthProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <TrendingUp className="w-5 h-5 text-brand mr-2.5" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Library Health</h3>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading...</div>
      ) : (
        <div className="space-y-6 flex-1">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">{bar.label}</span>
                <span className="font-bold text-slate-900 dark:text-white">{bar.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div className={`${bar.colorClass} h-2.5 rounded-full`} style={{ width: `${bar.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
