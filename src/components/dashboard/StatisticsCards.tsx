import { LucideIcon } from 'lucide-react';

interface StatItem {
  name: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface StatisticsCardsProps {
  stats: StatItem[];
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
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
  );
}
