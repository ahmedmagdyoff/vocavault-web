'use client';

import { useEffect } from 'react';
import { X, ExternalLink, Video, Play, Globe } from 'lucide-react';
import { parseVideoUrl } from '@/lib/videoUtils';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  title?: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  const { provider, embedUrl } = parseVideoUrl(videoUrl);
  const isInstagram = provider.startsWith('instagram');
  const platformName = isInstagram ? 'Instagram' : provider.charAt(0).toUpperCase() + provider.slice(1);

  const ProviderIcon = 
    provider === 'youtube' ? Video :
    provider === 'facebook' ? Globe :
    isInstagram ? Video :
    provider === 'tiktok' ? Play :
    Video;

  let modalWidthClass = 'max-w-4xl';
  let videoContainerClass = 'aspect-video';
  
  if (provider === 'youtube') {
    modalWidthClass = 'max-w-5xl';
    videoContainerClass = 'aspect-video';
  } else if (provider === 'tiktok' || provider === 'instagram-reel') {
    modalWidthClass = 'max-w-[340px]'; // Tight fit to remove horizontal empty space
    videoContainerClass = 'aspect-[9/16]';
  } else if (provider === 'instagram-post') {
    modalWidthClass = 'max-w-lg';
    videoContainerClass = 'aspect-square sm:aspect-[4/5]';
  } else if (provider === 'facebook') {
    modalWidthClass = 'max-w-4xl';
    videoContainerClass = 'aspect-video';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={`relative w-full ${modalWidthClass} rounded-2xl bg-white shadow-xl dark:bg-slate-900 dark:shadow-2xl dark:shadow-black/50 overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300`}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 pr-4">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-md">
              {title || 'Video Player'}
            </h3>
            {provider !== 'other' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <ProviderIcon className="h-3.5 w-3.5" />
                {platformName}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className={`relative w-full bg-black flex flex-col ${videoContainerClass} overflow-hidden`}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 absolute inset-0">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                  <ProviderIcon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Watch on {platformName}</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Due to platform restrictions, {platformName} videos cannot be embedded directly in the dashboard.
                </p>
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full rounded-xl bg-brand px-6 py-4 text-base font-bold text-white hover:bg-brand-hover transition-all hover:scale-[1.02] shadow-lg shadow-brand/20"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Open {platformName}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
