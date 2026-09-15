'use client';

import React from 'react';
import {
  X,
  Briefcase,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  GraduationCap,
  Clock
} from 'lucide-react';
import { JobMatch } from '@/types';

interface JobDetailModalProps {
  job: JobMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSkills: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onNavigateToSkills,
}) => {
  if (!isOpen || !job) return null;

  const matchScore = Math.round(job.match_score);
  const isHighMatch = matchScore >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 relative flex flex-col gap-5 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Company & Match Gauge */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 pr-8">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-white/15 to-white/5 border border-white/10 font-black text-white text-lg">
              {job.company.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">{job.job_title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/60">
                <span className="font-semibold text-white/80">{job.company}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-orange-400" />
                  {job.location}, {job.country}
                </span>
              </div>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 font-black text-sm shadow-md ${
                isHighMatch
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/20'
                  : 'border-orange-400 bg-orange-500/10 text-orange-300 shadow-orange-500/20'
              }`}
            >
              {matchScore}%
            </div>
            <span className="text-[10px] font-bold text-white/50 uppercase mt-1">
              {isHighMatch ? 'Excellent Match' : 'Good Fit'}
            </span>
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <div className="text-[10px] font-semibold text-emerald-400 uppercase">Compensation</div>
            <div className="font-bold text-white mt-0.5">{job.salary_range}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
            <div className="text-[10px] font-semibold text-white/50 uppercase">Experience</div>
            <div className="font-bold text-white mt-0.5">{job.experience_req}+ Years</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
            <div className="text-[10px] font-semibold text-white/50 uppercase">Education</div>
            <div className="font-bold text-white mt-0.5">{job.education_req} Degree</div>
          </div>
        </div>

        {/* Why this matches you */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Why this matches you
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Strong technical skill match</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Experience level aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Education requirement met</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Market location compatible</span>
            </div>
          </div>
        </div>

        {/* Strengths & Missing Skills Breakdown */}
        <div className="space-y-4">
          {/* Matched Strengths */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your Strengths ({job.matched_skills.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.matched_skills.length > 0 ? (
                job.matched_skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                  >
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-white/40">No exact direct overlap found</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <XCircle className="h-4 w-4" />
              <span>Skills to improve ({job.missing_skills.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.missing_skills.length > 0 ? (
                job.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300"
                  >
                    + {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-300">You have all the required skills for this job!</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button
            onClick={() => {
              onClose();
              onNavigateToSkills();
            }}
            className="w-full sm:w-auto btn-glass flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-orange-300 hover:text-white"
          >
            <span>See Skills To Learn</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <a
            href={job.apply_url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-gradient flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold"
          >
            <span>Apply For Position</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
