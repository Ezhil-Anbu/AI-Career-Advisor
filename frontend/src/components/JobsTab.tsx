'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Eye
} from 'lucide-react';
import { JobMatch, AppMetadata } from '@/types';
import { JobDetailModal } from './JobDetailModal';

interface JobsTabProps {
  jobs: JobMatch[];
  loading: boolean;
  metadata: AppMetadata;
  userSkills: string[];
  onNavigateToSkills: () => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  jobs,
  loading,
  metadata,
  userSkills,
  onNavigateToSkills,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [minScore, setMinScore] = useState(50);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobMatch | null>(null);

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
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Best Jobs For You</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Career opportunities ranked by compatibility with your current skillset.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
            {filteredJobs.length} Matched Roles
          </span>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-3 justify-between border border-white/10">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search role, company, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9 pr-3 py-2 text-xs font-medium"
          />
        </div>

        {/* Filter options */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Domain Dropdown */}
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

          {/* Min Match % Filter */}
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

      {/* ─── Jobs Grid ─── */}
      {loading ? (
        <div className="glass-panel p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-spin mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">Matching Career Opportunities...</p>
          <p className="text-xs text-white/50 mt-1">Comparing your skills against live job listings</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-panel p-12 text-center border border-white/10">
          <Briefcase className="h-10 w-10 text-white/30 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Matched Jobs Found</h3>
          <p className="text-xs text-white/50 mt-1">Try lowering the minimum match score or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => {
            const isBookmarked = bookmarkedIds.includes(job.job_id);
            const matchScore = Math.round(job.match_score);
            const isHighMatch = matchScore >= 80;

            return (
              <div
                key={job.job_id}
                className="glass-panel glass-panel-hover p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden border border-white/10 rounded-2xl"
              >
                <div>
                  {/* Top Row: Company & Match Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 font-bold text-white text-base">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-snug hover:text-orange-300 transition-colors">
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

                    {/* Score Badge */}
                    <div className="flex flex-col items-end shrink-0">
                      <div
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                          isHighMatch
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : matchScore >= 65
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {matchScore}% Match
                      </div>
                      <span className="text-[10px] text-white/40 font-semibold mt-0.5">
                        {isHighMatch ? 'Excellent Match' : 'Good Fit'}
                      </span>
                    </div>
                  </div>

                  {/* Badges: Salary, Experience, Degree */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                      💰 {job.salary_range}
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs font-medium text-white/70">
                      ⏳ {job.experience_req}+ Yrs
                    </span>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs font-medium text-white/70">
                      🎓 {job.education_req}
                    </span>
                  </div>

                  {/* Skills Alignment */}
                  <div className="space-y-2 mb-4 border-t border-white/10 pt-3 text-xs">
                    {/* Matched skills */}
                    {job.matched_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] font-bold text-emerald-400 mr-1">You have:</span>
                        {job.matched_skills.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                          >
                            ✓ {s}
                          </span>
                        ))}
                        {job.matched_skills.length > 4 && (
                          <span className="text-[10px] text-white/40">
                            +{job.matched_skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Missing skills */}
                    {job.missing_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[11px] font-bold text-amber-400 mr-1">Missing:</span>
                        {job.missing_skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300"
                          >
                            + {s}
                          </span>
                        ))}
                        {job.missing_skills.length > 3 && (
                          <span className="text-[10px] text-white/40">
                            +{job.missing_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobForModal(job)}
                      className="btn-glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-orange-300 hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5 text-orange-400" />
                      <span>View Match</span>
                    </button>

                    <button
                      onClick={() => toggleBookmark(job.job_id)}
                      className={`flex items-center gap-1 rounded-lg p-1.5 text-xs transition-all ${
                        isBookmarked
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                      title="Save Job"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-orange-400" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <a
                    href={job.apply_url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold"
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

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJobForModal}
        isOpen={!!selectedJobForModal}
        onClose={() => setSelectedJobForModal(null)}
        onNavigateToSkills={onNavigateToSkills}
      />
    </div>
  );
};
