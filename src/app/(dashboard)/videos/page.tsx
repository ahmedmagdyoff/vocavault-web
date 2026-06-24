'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Video as VideoIcon, Search, Trash2, Edit } from 'lucide-react';
import { videosApi } from '@/lib/videos';
import { Video } from '@/types';
import toast from 'react-hot-toast';
import VideoModal from '@/components/VideoModal';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', platform: 'other' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  const detectPlatform = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    return 'other';
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewVideo({ ...newVideo, url, platform: detectPlatform(url) });
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewVideo({ title: '', url: '', platform: 'other' });
    setIsModalOpen(true);
  };

  const openEditModal = (video: Video) => {
    setEditingId(video.id);
    setNewVideo({ title: video.title, url: video.url, platform: video.platform });
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videosApi.getVideos();
      setVideos(response.data);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await videosApi.deleteVideo(id);
        toast.success('Video deleted successfully');
        setVideos(videos.filter(v => v.id !== id));
      } catch (error) {
        toast.error('Failed to delete video');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await videosApi.updateVideo(editingId, newVideo);
        setVideos(videos.map(v => v.id === editingId ? response.data : v));
        toast.success('Video updated successfully');
      } else {
        const response = await videosApi.createVideo(newVideo);
        setVideos([response.data, ...videos]);
        toast.success('Video added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${editingId ? 'update' : 'add'} video`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.platform.toLowerCase().includes(q) ||
      v.url.toLowerCase().includes(q)
    );
  }, [videos, searchQuery]);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Videos</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Manage your saved video sources.</p>
        </div>
        <Button onClick={openAddModal} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>

      <div className="mb-6 flex items-center rounded-md border border-slate-200 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-0 bg-transparent py-2 pl-3 focus:ring-0 sm:text-sm dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Added Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">Loading...</td>
              </tr>
            ) : filteredVideos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500">
                  {videos.length === 0 ? 'No videos found. Add one to get started!' : 'No videos matching your search.'}
                </td>
              </tr>
            ) : (
              filteredVideos.map((video) => (
                <tr key={video.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setPlayingVideo({ url: video.url, title: video.title })}
                        className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        title="Play video"
                      >
                        <VideoIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setPlayingVideo({ url: video.url, title: video.title })}
                        className="font-medium text-slate-900 hover:text-brand dark:text-white dark:hover:text-brand-dark text-left"
                      >
                        {video.title}
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200 capitalize">
                      {video.platform}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(video.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button onClick={() => openEditModal(video)} className="text-brand hover:text-brand-hover dark:text-brand-dark dark:hover:text-brand-hover mr-4">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:shadow-2xl dark:shadow-black/50">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Video' : 'Add Video'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input required type="text" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
                <input required type="url" value={newVideo.url} onChange={handleUrlChange} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>{editingId ? 'Save Changes' : 'Add Video'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <VideoModal 
        isOpen={!!playingVideo} 
        onClose={() => setPlayingVideo(null)} 
        videoUrl={playingVideo?.url || null}
        title={playingVideo?.title}
      />
    </div>
  );
}
