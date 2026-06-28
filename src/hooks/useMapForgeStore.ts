import { useState, useCallback, useEffect } from 'react';
import {
  loadState,
  saveState,
  type AppState,
  type Plugin,
  type Tag,
  type UploadedFile,
} from '@/types/mapforge';

export function useMapForgeStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addPlugin = useCallback((plugin: Omit<Plugin, 'id' | 'dl'>) => {
    setState((prev) => {
      const newPlugin: Plugin = {
        ...plugin,
        id: prev.nextId,
        dl: 0,
      };
      return {
        ...prev,
        plugins: [...prev.plugins, newPlugin],
        nextId: prev.nextId + 1,
      };
    });
  }, []);

  const removePlugin = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      plugins: prev.plugins.filter((p) => p.id !== id),
    }));
  }, []);

  const updatePlugin = useCallback((id: number, data: Partial<Plugin>) => {
    setState((prev) => ({
      ...prev,
      plugins: prev.plugins.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
  }, []);

  const addTag = useCallback((tag: Tag) => {
    setState((prev) => {
      if (prev.tags.find((t) => t.id === tag.id)) return prev;
      return {
        ...prev,
        tags: [...prev.tags, tag],
      };
    });
  }, []);

  const removeTag = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.id !== id),
      plugins: prev.plugins.map((p) => ({
        ...p,
        tags: p.tags.filter((t) => t !== id),
      })),
    }));
  }, []);

  const addFile = useCallback((file: UploadedFile) => {
    setState((prev) => ({
      ...prev,
      files: [...prev.files, file],
    }));
  }, []);

  const removeFile = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
      plugins: prev.plugins.map((p) =>
        p.fileId === id ? { ...p, fileId: undefined } : p
      ),
    }));
  }, []);

  const tagById = useCallback(
    (id: string) => {
      return state.tags.find((t) => t.id === id) || { label: id, color: '#7D8590' };
    },
    [state.tags]
  );

  const incrementDownload = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      plugins: prev.plugins.map((p) =>
        p.id === id ? { ...p, dl: p.dl + 1 } : p
      ),
    }));
  }, []);

  return {
    state,
    addPlugin,
    removePlugin,
    addTag,
    removeTag,
    addFile,
    removeFile,
    tagById,
    incrementDownload,
    updatePlugin,
  };
}
