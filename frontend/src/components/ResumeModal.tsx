'use client';

import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Award,
  Check
} from 'lucide-react';
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
  const [parsingStep, setParsingStep] = useState<number>(0);
  const [parseResult, setParseResult] = useState<ResumeParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const progressSteps = [
    'Resume uploaded',
    'Extracting text from PDF',
    'Identifying skills & technologies',
    'Analysing experience & education',
    'Building candidate profile',
  ];

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
    setParsingStep(1);

    const stepInterval = setInterval(() => {
      setParsingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 500);

    try {
      let result: ResumeParseResult;
      if (activeMode === 'upload' && file) {
        result = await parseResumeFile(file);
      } else if (activeMode === 'paste' && rawText.trim()) {
        result = await parseResumeText(rawText);
      } else {
        throw new Error('Please select a file or paste your resume text');
      }

      clearInterval(stepInterval);
      setParsingStep(5);
      setParseResult(result);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setParsingStep(0);
      const message = err instanceof Error ? err.message : 'Failed to analyze resume';
      setError(message);
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

  const handleReset = () => {
    setParseResult(null);
    setError(null);
    setFile(null);
    setRawText('');
    setParsingStep(0);
  };

  // ── Confidence badge ──────────────────────────────────────────────────────
  const ConfidenceBadge = ({ value }: { value?: number | null }) => {
    if (!value) return null;
    const pct = Math.round(value * 100);
    const color = pct >= 85 ? 'text-emerald-400' : pct >= 70 ? 'text-orange-400' : 'text-rose-400';
    return <span className={`ml-1.5 text-[10px] font-bold ${color}`}>{pct}%</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-7 relative flex flex-col gap-5 shadow-2xl border border-white/20 max-h-[92vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Resume Analyzer</h3>
            <p className="text-xs text-white/50">Extract your career profile from a PDF resume.</p>
          </div>
        </div>

        {/* ── Mode Selector ── */}
        {!parseResult && !loading && (
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeMode === 'upload'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Upload PDF File
            </button>
            <button
              onClick={() => setActiveMode('paste')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeMode === 'paste'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Paste Resume Text
            </button>
          </div>
        )}

        {/* ── Upload / Paste Area ── */}
        {!parseResult && !loading && (
          <>
            {activeMode === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-orange-500 bg-orange-500/10'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/20 bg-white/[0.02] hover:border-white/40'
                }`}
              >
                <input
                  type="file"
                  id="resume-upload-input"
                  accept=".pdf,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      setError(null);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="resume-upload-input" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud className="h-10 w-10 text-orange-400 mb-2" />
                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-emerald-400 mt-1">
                        Attached ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-white">Drag & drop your PDF resume here</p>
                      <p className="text-xs text-white/50 mt-1">or click to browse — PDF or TXT</p>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <textarea
                rows={6}
                placeholder="Paste your resume text, professional summary, or LinkedIn bio here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="glass-input w-full p-3.5 text-xs font-medium resize-none"
              />
            )}
          </>
        )}

        {/* ── Loading Progress State ── */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-2">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Analyzing your resume...</span>
            </div>
            <div className="space-y-2">
              {progressSteps.map((step, idx) => {
                const isComplete = parsingStep > idx;
                const isCurrent = parsingStep === idx + 1;
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-2.5 text-xs font-semibold transition-all ${
                      isComplete
                        ? 'text-emerald-300'
                        : isCurrent
                        ? 'text-orange-300 animate-pulse'
                        : 'text-white/30'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                          isCurrent ? 'border-orange-400 text-orange-400' : 'border-white/20'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Error Notification ── */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Rich Parsed Result Preview ── */}
        {parseResult && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Resume Analysis Complete!</span>
              </div>
              {parseResult.pages_processed && (
                <span className="text-[10px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {parseResult.pages_processed} page{parseResult.pages_processed !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Contact Card */}
            <div className="rounded-xl bg-black/20 border border-white/5 p-3 space-y-1.5">
              {parseResult.name && (
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <User className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>{parseResult.name}</span>
                </div>
              )}
              {parseResult.email && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Mail className="h-3.5 w-3.5 text-orange-400/70 shrink-0" />
                  <span>{parseResult.email}</span>
                </div>
              )}
              {parseResult.phone && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Phone className="h-3.5 w-3.5 text-orange-400/70 shrink-0" />
                  <span>{parseResult.phone}</span>
                </div>
              )}
              {parseResult.location && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 text-orange-400/70 shrink-0" />
                  <span>{parseResult.location}{parseResult.country ? `, ${parseResult.country}` : ''}</span>
                </div>
              )}
            </div>

            {/* Role / Exp / Education grid */}
            <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
              <div className="rounded-lg bg-black/20 border border-white/5 p-2">
                <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase mb-1">
                  <Briefcase className="h-3 w-3" /> Role
                </div>
                <span className="font-bold text-white text-[11px] leading-tight">
                  {parseResult.extracted_roles[0] ?? 'Unknown'}
                  <ConfidenceBadge value={parseResult.role_confidence} />
                </span>
              </div>
              <div className="rounded-lg bg-black/20 border border-white/5 p-2">
                <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase mb-1">
                  <Clock className="h-3 w-3" /> Exp
                </div>
                <span className="font-bold text-white">
                  {parseResult.estimated_experience > 0
                    ? `${parseResult.estimated_experience} yr${parseResult.estimated_experience !== 1 ? 's' : ''}`
                    : '—'}
                </span>
              </div>
              <div className="rounded-lg bg-black/20 border border-white/5 p-2">
                <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase mb-1">
                  <GraduationCap className="h-3 w-3" /> Edu
                </div>
                <span className="font-bold text-white">{parseResult.extracted_education}</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <span className="text-[11px] font-bold text-white/70 block mb-1.5">
                Technical Skills ({parseResult.extracted_skills.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {parseResult.extracted_skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {parseResult.certifications && parseResult.certifications.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-white/70 flex items-center gap-1 mb-1.5">
                  <Award className="h-3.5 w-3.5 text-yellow-400" />
                  Certifications ({parseResult.certifications.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parseResult.certifications.map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* UX note: user must review before analysis runs */}
            <p className="text-[10px] text-white/40 italic">
              Review your profile above. Edit if needed, then click &ldquo;Apply to Profile&rdquo; to run career analysis.
            </p>
          </div>
        )}

        {/* ── Modal Actions ── */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4">
          {parseResult ? (
            <button
              onClick={handleReset}
              className="btn-glass rounded-xl px-4 py-2 text-xs"
            >
              ← Analyze Another
            </button>
          ) : (
            <button onClick={onClose} className="btn-glass rounded-xl px-4 py-2 text-xs">
              Cancel
            </button>
          )}

          {parseResult ? (
            <button
              onClick={handleApply}
              className="btn-gradient rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Apply to Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleProcessResume}
              disabled={loading || (activeMode === 'upload' && !file) || (activeMode === 'paste' && !rawText.trim())}
              className="btn-gradient rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze Resume</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
