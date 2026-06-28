import { BarChart2 } from 'lucide-react';

interface CategoryDistributionProps {
  loading: boolean;
  categoryCounts: [string, number][];
  maxCount: number;
}

export default function CategoryDistribution({ loading, categoryCounts, maxCount }: CategoryDistributionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <BarChart2 className="w-5 h-5 text-purple-500 mr-2.5" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Distribution</h3>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading...</div>
      ) : (
        <div className="space-y-4 flex-1">
          {categoryCounts.map(([name, count]) => {
            const pct = Math.round((count / maxCount) * 100);
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
  );
}
