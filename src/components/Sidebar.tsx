'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Video, LayoutDashboard, LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Learn', href: '/learn', icon: GraduationCap },
    { name: 'Videos', href: '/videos', icon: Video },
    { name: 'Words', href: '/words', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 text-slate-600 shadow-sm md:hidden dark:bg-slate-800 dark:text-slate-300"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
            <h1 className="text-xl font-bold text-brand dark:text-brand-dark">VocaVault</h1>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand/10 text-brand-hover dark:bg-brand-dark/20 dark:text-brand-dark'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-brand-hover dark:text-brand-dark' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-4 flex items-center px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-medium text-brand-hover dark:bg-brand-dark/20 dark:text-brand-dark">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-32">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
