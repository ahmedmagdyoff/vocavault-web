'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { Word } from '@/types';
import { useVocabularyData } from '@/hooks/useVocabularyData';
import { wordsApi, BulkReportRow } from '@/lib/words';
import { formatFormType } from '@/lib/formatFormType';
import toast from 'react-hot-toast';
import VideoModal from '@/components/VideoModal';
import WordFormModal from '@/components/WordFormModal';
import WordDetailsModal from '@/components/WordDetailsModal';

export default function WordsPage() {
  const { words, videos, categories, loading, setWords } = useVocabularyData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkInput, setBulkInput] = useState('');
  const [bulkReport, setBulkReport] = useState<BulkReportRow[] | null>(null);

  const handleModeChange = (newMode: 'single' | 'bulk') => {
    setMode(newMode);
    if (newMode === 'single') {
      setBulkInput('');
      setBulkReport(null);
    } else {
      setFormData(prev => ({ ...prev, word: '', meaning: '', forms: {} }));
      setBulkReport(null);
    }
  };

  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    category_id: '',
    video_id: null as number | null,
    forms: {} as Record<string, string>,
  });

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this word?')) {
      try {
        await wordsApi.deleteWord(id);
        toast.success('Word deleted successfully');
        setWords(prev => prev.filter(w => w.id !== id));
      } catch {
        toast.error('Failed to delete word');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ word: '', meaning: '', category_id: '', video_id: null, forms: {} });
    setMode('single');
    setBulkInput('');
    setBulkReport(null);
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
      video_id: word.videos && word.videos.length > 0 ? word.videos[0].id : null,
      forms: formRecord,
    });
    setMode('single');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!formData.video_id) {
        toast.error('Please select exactly one video');
        return;
      }

      if (mode === 'bulk') {
        const payload = {
          rows: bulkInput,
          category_id: formData.category_id,
          video_id: formData.video_id,
        };
        const res = await wordsApi.bulkCreateWords(payload);
        setBulkReport(res.report);
        const wordsRes = await wordsApi.getWords();
        setWords(wordsRes.data);
      } else {
        const formsPayload = Object.entries(formData.forms)
          .filter(([, value]) => value.trim() !== '')
          .map(([form_type, value]) => ({ form_type, value }));

        const payload = {
          ...formData,
          category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
          forms: formsPayload.length > 0 ? formsPayload : undefined,
        };

        if (editingId) {
          const res = await wordsApi.updateWord(editingId, payload);
          setWords(prev => prev.map(w => w.id === editingId ? res.data : w));
          toast.success('Word updated successfully');
        } else {
          const res = await wordsApi.createWord(payload);
          setWords(prev => [res.data, ...prev]);
          toast.success('Word added successfully');
        }
        setIsModalOpen(false);
      }
    } catch {
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
            <div key={word.id} onClick={() => { setSelectedWord(word); setIsDetailsModalOpen(true); }} className="group relative cursor-pointer flex flex-col h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
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
                    {word.forms.map(form => (
                      <div key={form.id} className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{formatFormType(form.form_type)}:</span> {form.value}
                      </div>
                    ))}
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

      <WordFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        videos={videos}
        mode={mode}
        setMode={handleModeChange}
        bulkInput={bulkInput}
        setBulkInput={setBulkInput}
        bulkReport={bulkReport}
      />

      <WordDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        word={selectedWord}
        onPlayVideo={setPlayingVideo}
      />

      <VideoModal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        videoUrl={playingVideo?.url || null}
        title={playingVideo?.title}
      />
    </div>
  );
}
