'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, CheckCircle, XCircle, FileText, Loader2 } from 'lucide-react';
import { useData, UploadResult } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

export function UploadZone() {
  const { uploadFiles, state } = useData();
  const [dragging, setDragging] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: File[]) {
    const csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
    if (!csvFiles.length) return;
    setProcessing(true);
    setResults([]);
    const r = await uploadFiles(csvFiles);
    setResults(r);
    setProcessing(false);
  }

  function onDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    setDragCount(e.dataTransfer.items?.length ?? 0);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragging(false);
      setDragCount(0);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    setDragCount(0);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  const okCount = results.filter(r => r.ok).length;
  const errCount = results.filter(r => !r.ok).length;

  return (
    <Card>
      <SectionHeader
        title="Upload Daily Sales CSV"
        subtitle={`${state.files.length} file${state.files.length !== 1 ? 's' : ''} loaded · single or bulk upload supported`}
      />

      {/* Drop zone */}
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !processing && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-colors ${
          processing
            ? 'border-gray-200 bg-gray-50 cursor-default'
            : dragging
              ? 'border-blue-400 bg-blue-50 cursor-copy'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv" multiple className="hidden" onChange={onChange} />

        <div className={`p-3 rounded-full ${dragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
          {processing
            ? <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            : <Upload className={`w-6 h-6 ${dragging ? 'text-blue-600' : 'text-gray-400'}`} />
          }
        </div>

        <div className="text-center">
          {processing ? (
            <p className="text-sm font-medium text-gray-600">Processing files…</p>
          ) : dragging ? (
            <>
              <p className="text-sm font-semibold text-blue-700">
                Drop {dragCount > 1 ? `${dragCount} files` : 'file'}
              </p>
              <p className="text-xs text-blue-500 mt-0.5">Release to upload</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Drop CSV files here</p>
              <p className="text-xs text-gray-400 mt-1">
                Click to browse · drag one or many files at once
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload results */}
      {results.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Upload results
            </p>
            {okCount > 0 && (
              <span className="text-xs bg-emerald-100 text-emerald-700 font-medium rounded-full px-2 py-0.5">
                {okCount} added
              </span>
            )}
            {errCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 font-medium rounded-full px-2 py-0.5">
                {errCount} failed
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 text-sm rounded-lg px-3 py-2 ${
                  r.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {r.ok
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                  : <XCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                }
                <FileText className="w-4 h-4 flex-shrink-0 opacity-50" />
                <span className="truncate text-xs font-mono opacity-70 max-w-[140px]">{r.filename}</span>
                {r.ok ? (
                  <span className="ml-auto text-xs font-semibold whitespace-nowrap">
                    → {formatDate(r.date)}
                  </span>
                ) : (
                  <span className="ml-auto text-xs opacity-80 truncate">{r.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loaded files list */}
      {state.files.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Loaded Files</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {state.files.map(f => (
              <div key={f.date} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>
                  {new Date(f.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                </span>
                {f.source === 'uploaded' && <span className="text-blue-500 font-medium">↑</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
