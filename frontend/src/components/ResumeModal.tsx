'use client';

import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { parseResumeFile, parseResumeText } from '@/lib/api';
import { ResumeParseResult } from '@/types';
import confetti from 'canvas-confetti';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResumeData: (data: ResumeParseResult) => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  onApplyResumeData,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ResumeParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessResume = async () => {
    setError(null);
    setLoading(true);
    try {
      let result: ResumeParseResult;
      if (activeMode === 'upload' && file) {
        result = await parseResumeFile(file);
      } else if (activeMode === 'paste' && rawText.trim()) {
        result = await parseResumeText(rawText);
      } else {
        throw new Error('Please select a file or paste your resume text');
      }

      setParseResult(result);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (parseResult) {
      onApplyResumeData(parseResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
      <div className="glass-panel w-full max-w-lg p-6 relative flex flex-col gap-4 shadow-2xl border border-white/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Resume & CV Parser</h3>
            <p className="text-xs text-white/50">Auto-extract skills, experience, and target roles</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => {
              setActiveMode('upload');
              setParseResult(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              activeMode === 'upload'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Upload PDF / TXT
          </button>
          <button
            onClick={() => {
              setActiveMode('paste');
              setParseResult(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              activeMode === 'paste'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* File Dropzone or Textarea */}
        {activeMode === 'upload' ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragOver
                ? 'border-orange-500 bg-orange-500/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-white/20 bg-white/[0.02] hover:border-white/40'
            }`}
          >
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="h-10 w-10 text-orange-400 mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-white">{file.name}</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">File attached ({(file.size / 1024).toFixed(1)} KB)</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-white">Drag & drop your resume here</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Supports PDF or Plain Text files</p>
                </div>
              )}
            </label>
          </div>
        ) : (
          <textarea
            rows={5}
            placeholder="Paste your CV text, skills summary, or LinkedIn summary here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="glass-input w-full p-3 text-xs font-medium resize-none"
          />
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Result Preview */}
        {parseResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Extracted {parseResult.extracted_skills.length} Technical Skills</span>
            </div>

            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {parseResult.extracted_skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-emerald-500/20">
              <span>Est. Experience: <strong className="text-white">{parseResult.estimated_experience} yrs</strong></span>
              <span>Degree: <strong className="text-white">{parseResult.extracted_education}</strong></span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button onClick={onClose} className="btn-glass rounded-lg px-4 py-2 text-xs">
            Cancel
          </button>
          {parseResult ? (
            <button onClick={handleApply} className="btn-gradient rounded-lg px-5 py-2 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Apply to Profile</span>
            </button>
          ) : (
            <button
              onClick={handleProcessResume}
              disabled={loading || (activeMode === 'upload' && !file) || (activeMode === 'paste' && !rawText.trim())}
              className="btn-gradient rounded-lg px-5 py-2 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Parsing CV...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Extract Skills</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
