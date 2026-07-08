'use client';

import { Button } from '@/components/ui/Button';
import { Video, Category } from '@/types';
import { getGrammaticalFields } from '@/lib/grammaticalFields';
import { BulkReportRow } from '@/lib/words';

interface WordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  editingId: number | null;
  formData: {
    word: string;
    meaning: string;
    category_id: string;
    video_id: number | null;
    forms: Record<string, string>;
  };
  setFormData: React.Dispatch<React.SetStateAction<WordFormModalProps['formData']>>;
  categories: Category[];
  videos: Video[];
  videoSearchQuery: string;
  setVideoSearchQuery: (query: string) => void;
  mode?: 'single' | 'bulk';
  setMode?: (mode: 'single' | 'bulk') => void;
  bulkInput?: string;
  setBulkInput?: (val: string) => void;
  bulkReport?: BulkReportRow[] | null;
}

export default function WordFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingId,
  formData,
  setFormData,
  categories,
  videos,
  videoSearchQuery,
  setVideoSearchQuery,
  mode = 'single',
  setMode,
  bulkInput = '',
  setBulkInput,
  bulkReport = null,
}: WordFormModalProps) {
  if (!isOpen) return null;

  const selectedCategoryName = formData.category_id
    ? categories.find(c => c.id.toString() === formData.category_id)?.name ?? null
    : null;

  const grammaticalFields = getGrammaticalFields(selectedCategoryName);

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(videoSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:shadow-2xl dark:shadow-black/50 max-h-[90vh] overflow-y-auto scrollbar-custom">
        {!editingId && !bulkReport && setMode && (
          <div className="mb-4 flex gap-4 border-b border-slate-200 pb-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-1 py-2 text-sm font-medium ${mode === 'single' ? 'border-b-2 border-brand text-brand dark:text-brand-dark' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={`px-1 py-2 text-sm font-medium ${mode === 'bulk' ? 'border-b-2 border-brand text-brand dark:text-brand-dark' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Bulk
            </button>
          </div>
        )}
        
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          {bulkReport ? 'Import Report' : editingId ? 'Edit Word' : 'Add Word'}
        </h2>

        {bulkReport ? (
          <div>
            <div className="max-h-64 overflow-y-auto space-y-2 mb-6 rounded bg-slate-50 p-4 dark:bg-slate-800/50">
              {bulkReport.map((row, i) => (
                <div key={i} className={`text-sm ${row.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {row.success ? '✔' : '✖'} {row.line}. {row.word ? `${row.word} — ` : ''}{row.message}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'single' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Word</label>
                  <input required type="text" value={formData.word} onChange={e => setFormData(prev => ({...prev, word: e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meaning</label>
                  <textarea required rows={2} value={formData.meaning} onChange={e => setFormData(prev => ({...prev, meaning: e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </>
            ) : null}

            {mode === 'single' && grammaticalFields.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {grammaticalFields.map(field => (
                  <div key={field.key} className={grammaticalFields.length === 1 ? 'col-span-2' : 'col-span-1'}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
                    <input
                      type="text"
                      value={formData.forms[field.key] || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        forms: { ...prev.forms, [field.key]: e.target.value }
                      }))}
                      className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {mode === 'bulk' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Words Data (CSV)</label>
                <textarea 
                  required 
                  rows={5} 
                  value={bulkInput} 
                  onChange={e => setBulkInput?.(e.target.value)} 
                  placeholder={
                    selectedCategoryName === 'Verb' ? 'word,meaning,past_simple,past_participle,present_participle,third_person_singular' :
                    selectedCategoryName === 'Noun' ? 'word,meaning,plural' :
                    selectedCategoryName === 'Adjective' ? 'word,meaning,comparative,superlative' :
                    'word,meaning'
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
                <p className="mt-1 text-xs text-slate-500">
                  Provide one word per line.
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select required value={formData.category_id} onChange={e => setFormData(prev => ({...prev, category_id: e.target.value, forms: {}}))} className="mt-1 w-full rounded-md border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

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
              {filteredVideos.map(video => (
                <label key={video.id} className="flex items-center space-x-3 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="selected_video"
                    checked={formData.video_id === video.id}
                    onChange={() => setFormData(prev => ({ ...prev, video_id: video.id }))}
                    className="rounded-full border-slate-300 text-brand focus:ring-brand h-4 w-4 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{video.title}</span>
                </label>
              ))}
              {filteredVideos.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 p-2 text-center">No videos found.</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              {mode === 'bulk' ? 'Import Words' : editingId ? 'Save Changes' : 'Add Word'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
