'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { wordsApi } from '@/lib/words';
import { categoriesApi } from '@/lib/categories';
import { videosApi } from '@/lib/videos';
import { Word, Category, Video } from '@/types';
import toast from 'react-hot-toast';
import VideoModal from '@/components/VideoModal';

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    category_id: '',
    video_ids: [] as number[],
    forms: {} as Record<string, string>,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wordsRes, catsRes, videosRes] = await Promise.all([
        wordsApi.getWords(),
        categoriesApi.getCategories(),
        videosApi.getVideos()
      ]);
      setWords(wordsRes.data);
      setCategories(catsRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      toast.error('Failed to load vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this word?')) {
      try {
        await wordsApi.deleteWord(id);
        toast.success('Word deleted successfully');
        setWords(words.filter(w => w.id !== id));
      } catch (error) {
        toast.error('Failed to delete word');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ word: '', meaning: '', category_id: '', video_ids: [], forms: {} });
    setVideoSearchQuery('');
    setIsModalOpen(true);
  };

  const openEditModal = (word: Word, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(word.id);
    
    const formRecord: Record<string, string> = {};
    if (word.forms) {
      word.forms.forEach(f => formRecord[f.form_type] = f.value);
    }

    setFormData({
      word: word.word,
      meaning: word.meaning,
      category_id: word.category_id ? word.category_id.toString() : '',
      video_ids: word.videos?.map(v => v.id) || [],
      forms: formRecord,
    });
    setVideoSearchQuery('');
    setIsModalOpen(true);
  };

  const openDetailsModal = (word: Word) => {
    setSelectedWord(word);
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formsPayload = Object.entries(formData.forms)
        .filter(([_, value]) => value.trim() !== '')
        .map(([form_type, value]) => ({ form_type, value }));

      const payload = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        forms: formsPayload.length > 0 ? formsPayload : undefined,
      };

      if (editingId) {
        const res = await wordsApi.updateWord(editingId, payload);
        setWords(words.map(w => w.id === editingId ? res.data : w));
        toast.success('Word updated successfully');
      } else {
        const res = await wordsApi.createWord(payload);
        setWords([res.data, ...words]);
        toast.success('Word added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Failed to ${editingId ? 'update' : 'add'} word`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? word.category?.id?.toString() === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [words, searchQuery, selectedCategory]);

  const getSelectedCategoryName = () => {
    if (!formData.category_id) return null;
    const cat = categories.find(c => c.id.toString() === formData.category_id);
    return cat ? cat.name : null;
  };

  const renderFormFields = () => {
    const categoryName = getSelectedCategoryName();
    if (!categoryName) return null;

    let fields: { key: string; label: string }[] = [];
    if (categoryName === 'Verb') {
      fields = [
        { key: 'past_simple', label: 'Past Simple' },
        { key: 'past_participle', label: 'Past Participle' },
        { key: 'present_participle', label: 'Present Participle' },
        { key: 'third_person_singular', label: 'Third Person Singular' },
      ];
    } else if (categoryName === 'Noun') {
      fields = [
        { key: 'plural', label: 'Plural' },
      ];
    } else if (categoryName === 'Adjective') {
      fields = [
        { key: 'comparative', label: 'Comparative' },
        { key: 'superlative', label: 'Superlative' },
      ];
    } else {
      return null;
    }

    return (
      <div className="grid grid-cols-2 gap-4 pt-2">
        {fields.map(field => (
          <div key={field.key} className={fields.length === 1 ? 'col-span-2' : 'col-span-1'}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
            <input 
              type="text" 
              value={formData.forms[field.key] || ''} 
              onChange={e => setFormData({
                ...formData, 
                forms: { ...formData.forms, [field.key]: e.target.value }
              })} 
              className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Words</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Your personal vocabulary library.</p>
        </div>
        <Button onClick={openAddModal} className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" /> Add Word
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex flex-1 items-center rounded-md border border-slate-200 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent py-2 pl-3 focus:ring-0 sm:text-sm dark:text-white"
          />
        </div>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading vocabulary...</div>
      ) : words.length === 0 ? (
        <div className="text-center text-slate-500 py-12">No words found. Start building your library!</div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center text-slate-500 py-12">No words found matching your filters.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWords.map((word) => (
            <div key={word.id} onClick={() => openDetailsModal(word)} className="group relative cursor-pointer flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100 flex gap-2">
                <button onClick={(e) => openEditModal(word, e)} className="text-slate-400 hover:text-brand dark:hover:text-brand-dark">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={(e) => handleDelete(word.id, e)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <span className="mb-4 inline-flex w-fit rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-hover dark:bg-brand-dark/20 dark:text-brand-dark">
                {word.category?.name || 'Unknown'}
              </span>
              <h3 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">{word.word}</h3>
              <p className="mb-4 text-lg text-slate-600 dark:text-slate-400">{word.meaning}</p>

              <div className="mt-auto">
                {word.forms && word.forms.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {word.forms.map(form => {
                      let displayType = form.form_type;
                      if (displayType === 'past_simple') displayType = 'Past Simple';
                      if (displayType === 'past_participle') displayType = 'Past Participle';
                      if (displayType === 'present_participle') displayType = 'Present Participle';
                      if (displayType === 'third_person_singular') displayType = 'Third Person Singular';
                      
                      return (
                        <div key={form.id} className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{displayType.replace(/_/g, ' ')}:</span> {form.value}
                        </div>
                      );
                    })}
                  </div>
                )}

                {word.videos && word.videos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">Found in {word.videos.length} video{word.videos.length === 1 ? '' : 's'}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:shadow-2xl dark:shadow-black/50 max-h-[90vh] overflow-y-auto scrollbar-custom">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Word' : 'Add Word'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Word</label>
                <input required type="text" value={formData.word} onChange={e => setFormData({...formData, word: e.target.value})} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meaning</label>
                <textarea required rows={2} value={formData.meaning} onChange={e => setFormData({...formData, meaning: e.target.value})} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value, forms: {}})} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {renderFormFields()}

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Videos</label>
                
                <input 
                  type="text" 
                  placeholder="Search videos..." 
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <div className="mt-2 max-h-32 overflow-y-auto rounded-md border border-slate-200 p-2 dark:border-slate-800 space-y-1">
                  {videos.filter(v => v.title.toLowerCase().includes(videoSearchQuery.toLowerCase())).map(video => (
                    <label key={video.id} className="flex items-center space-x-3 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.video_ids.includes(video.id)}
                        onChange={(e) => {
                          const newVideoIds = e.target.checked 
                            ? [...formData.video_ids, video.id] 
                            : formData.video_ids.filter(id => id !== video.id);
                          setFormData({ ...formData, video_ids: newVideoIds });
                        }}
                        className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{video.title}</span>
                    </label>
                  ))}
                  {videos.filter(v => v.title.toLowerCase().includes(videoSearchQuery.toLowerCase())).length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 p-2 text-center">No videos found.</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>{editingId ? 'Save Changes' : 'Add Word'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:shadow-2xl dark:shadow-black/50 max-h-[90vh] overflow-y-auto scrollbar-custom">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="mb-2 inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-hover dark:bg-brand-dark/20 dark:text-brand-dark">
                  {selectedWord.category?.name || 'Unknown'}
                </span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedWord.word}</h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mt-1">{selectedWord.meaning}</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
            </div>

            {selectedWord.forms && selectedWord.forms.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">Grammatical Forms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedWord.forms.map(form => (
                    <div key={form.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {form.form_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">{form.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedWord.videos && selectedWord.videos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">Found In</h3>
                <div className="space-y-3">
                  {selectedWord.videos.map(video => (
                    <button 
                      key={video.id} 
                      onClick={() => setPlayingVideo({ url: video.url, title: video.title })}
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
