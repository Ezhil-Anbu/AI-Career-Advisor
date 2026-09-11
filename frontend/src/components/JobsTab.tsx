'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { JobMatch, AppMetadata } from '@/types';

interface JobsTabProps {
  jobs: JobMatch[];
  loading: boolean;
  metadata: AppMetadata;
  userSkills: string[];
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  loading,
  metadata,
  userSkills,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [minScore, setMinScore] = useState(50);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  const toggleBookmark = (id: number) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((bId) => bId !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain =
      selectedDomain === 'All' ||
      job.domain.toLowerCase() === selectedDomain.toLowerCase();

    const matchesScore = job.match_score >= minScore;

    return matchesSearch && matchesDomain && matchesScore;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search role, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2 text-xs font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Domain Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-white/60 font-medium">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="glass-input px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="All" className="bg-[#0e121e]">All Domains</option>
              {metadata.domains.map((dom) => (
                <option key={dom} value={dom} className="bg-[#0e121e]">
                  {dom}
                </option>
              ))}
            </select>
          </div>

          {/* Min Match % Slider */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60 font-medium">Min Match:</span>
            <span className="text-orange-300 font-bold">{minScore}%</span>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 accent-orange-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-spin mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">Matching Career Opportunities...</p>
          <p className="text-xs text-white/50 mt-1">Analyzing multi-factor cosine vector similarity</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Briefcase className="h-10 w-10 text-white/30 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Matched Jobs Found</h3>
          <p className="text-xs text-white/50 mt-1">Try relaxing the minimum match score or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isBookmarked = bookmarkedIds.includes(job.job_id);
            const isHighMatch = job.match_score >= 80;

            return (
              <div
                key={job.job_id}
                className="glass-panel glass-panel-hover p-5 flex flex-col justify-between relative overflow-hidden"
              >
                {/* High Match Badge Glow */}
                {isHighMatch && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500/20 to-transparent px-3 py-1 text-[10px] font-bold text-orange-300 border-b border-l border-orange-500/30 rounded-bl-xl flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Top Recommendation
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 font-bold text-white text-base">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight hover:text-orange-300 transition-colors">
                          {job.job_title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                          <span className="font-semibold text-white/80">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-orange-400" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Radial Score Gauge */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-extrabold text-xs shadow-md ${
                          isHighMatch
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/20'
                            : job.match_score >= 65
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-amber-500/20'
                            : 'border-rose-400 bg-rose-500/10 text-rose-300 shadow-rose-500/20'
                        }`}
                      >
                        {Math.round(job.match_score)}%
                      </div>
                      <span className="text-[9px] font-bold text-white/40 uppercase mt-0.5">Match</span>
                    </div>
                  </div>

                  {/* Badges: Salary, Experience, Degree */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                      💰 {job.salary_range}
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/70">
                      ⏳ {job.experience_req}+ Yrs Exp
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/70">
                      🎓 {job.education_req}
                    </span>
                  </div>

                  {/* Skills Alignment */}
                  <div className="space-y-2 mb-4 border-t border-white/10 pt-3">
                    {/* Matched Skills */}
                    {job.matched_skills.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Matched Skills ({job.matched_skills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.matched_skills.map((s) => (
                            <span
                              key={s}
                              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {job.missing_skills.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Missing Prerequisites ({job.missing_skills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.missing_skills.map((s) => (
                            <span
                              key={s}
                              className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                  <button
                    onClick={() => toggleBookmark(job.job_id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isBookmarked
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5 text-orange-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>Save Job</span>
                      </>
                    )}
                  </button>

                  <a
                    href={job.apply_url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold"
                  >
                    <span>Apply Role</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
