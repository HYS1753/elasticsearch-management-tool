'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DictionaryType, DictionaryEntity } from '@/types/dictionary';
import { createDictionaryEntry, updateDictionaryEntry } from '@/lib/client-api/dictionary';

interface DictionaryDialogProps {
  type: DictionaryType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: DictionaryEntity | null;
}

export function DictionaryDialog({ type, isOpen, onClose, onSuccess, initialData }: DictionaryDialogProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [word, setWord] = useState('');
  const [compoundWord, setCompoundWord] = useState('');
  const [components, setComponents] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [incorrect, setIncorrect] = useState('');
  const [corrected, setCorrected] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        setComment(initialData.comment || '');
        if (type === 'user' || type === 'stopword') setWord((initialData as any).word || '');
        if (type === 'decompound') {
          setCompoundWord((initialData as any).compound_word || '');
          setComponents(((initialData as any).components || []).join(', '));
        }
        if (type === 'synonym') setSynonyms(((initialData as any).synonyms || []).join(', '));
        if (type === 'correction') {
          setIncorrect((initialData as any).incorrect || '');
          setCorrected((initialData as any).corrected || '');
        }
      } else {
        // Reset
        setWord(''); setCompoundWord(''); setComponents(''); setSynonyms(''); setIncorrect(''); setCorrected(''); setComment('');
      }
    }
  }, [isOpen, initialData, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let payload: any = { comment, author: 'admin' }; // hardcoded author for now
      let key = '';

      if (type === 'user' || type === 'stopword') {
        payload.word = word;
        key = word;
      } else if (type === 'decompound') {
        payload.compound_word = compoundWord;
        payload.components = components.split(',').map(s => s.trim()).filter(Boolean);
        key = compoundWord;
      } else if (type === 'synonym') {
        payload.synonyms = synonyms.split(',').map(s => s.trim()).filter(Boolean);
        key = payload.synonyms[0]; // Usually first synonym is key
      } else if (type === 'correction') {
        payload.incorrect = incorrect;
        payload.corrected = corrected;
        key = incorrect;
      }

      if (isEditing) {
        // Exclude key from update payload if it's the identifier, but it's handled by backend usually
        await updateDictionaryEntry(type, key, payload);
      } else {
        await createDictionaryEntry(type, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)} Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {(type === 'user' || type === 'stopword') && (
            <div className="space-y-2">
              <Label>Word</Label>
              <Input value={word} onChange={(e) => setWord(e.target.value)} disabled={isEditing} required />
            </div>
          )}

          {type === 'decompound' && (
            <>
              <div className="space-y-2">
                <Label>Compound Word</Label>
                <Input value={compoundWord} onChange={(e) => setCompoundWord(e.target.value)} disabled={isEditing} required />
              </div>
              <div className="space-y-2">
                <Label>Components (comma separated)</Label>
                <Input value={components} onChange={(e) => setComponents(e.target.value)} required />
              </div>
            </>
          )}

          {type === 'synonym' && (
            <div className="space-y-2">
              <Label>Synonyms (comma separated)</Label>
              <Input value={synonyms} onChange={(e) => setSynonyms(e.target.value)} required />
            </div>
          )}

          {type === 'correction' && (
            <>
              <div className="space-y-2">
                <Label>Incorrect Word</Label>
                <Input value={incorrect} onChange={(e) => setIncorrect(e.target.value)} disabled={isEditing} required />
              </div>
              <div className="space-y-2">
                <Label>Corrected Word</Label>
                <Input value={corrected} onChange={(e) => setCorrected(e.target.value)} required />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
