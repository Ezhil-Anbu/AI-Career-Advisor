'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Target,
  Plus,
  Compass,
  Zap,
  Check,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SkillGapAnalysis, AppMetadata } from '@/types';

interface SkillGapTabProps {
  skillGap: SkillGapAnalysis | null;
  loading: boolean;
  targetRole: string;
  userSkills: string[];
  metadata: AppMetadata | null;
  onToggleSkill: (skill: string) => void;
  onNavigateToRoadmap: () => void;
}

export const SkillGapTab: React.FC<SkillGapTabProps> = ({
  skillGap,
  loading,
  targetRole,
  userSkills,
  metadata,
  onToggleSkill,
  onNavigateToRoadmap,
}) => {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  if (loading) {
    return (
      <div className="glass-panel p-16 text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-spin mb-3">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-white">Analyzing Skill Alignment...</p>
        <p className="text-xs text-white/50 mt-1">Comparing competencies against market requirements</p>
      </div>
    );
  }

  if (!skillGap) {
    return (
      <div className="glass-panel p-12 text-center">
        <Target className="h-10 w-10 text-white/30 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">No Skill Data Available</h3>
        <p className="text-xs text-white/50 mt-1">Select your skills to analyze prerequisites.</p>
      </div>
    );
  }

  const readinessScore = Math.round(skillGap.overall_readiness_score);

  const filteredAllSkills = metadata
    ? metadata.all_skills.filter((s) =>
        s.toLowerCase().includes(skillSearch.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ─── Header & Readiness Banner ─── */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 text-xs font-bold text-orange-400 mb-2">
            <Target className="h-3.5 w-3.5" />
            <span>Target Role Alignment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Skills for <span className="text-orange-400">{targetRole}</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-xl">
            See the skills you already have, and the highest priority skills you need to learn.
          </p>
        </div>

        {/* Readiness Card */}
        <div className="w-full md:w-56 glass-panel p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">Career Readiness</span>
            <span className="font-black text-emerald-400 text-sm">{readinessScore}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, readinessScore))}%` }}
            />
          </div>
          <div className="text-[11px] text-white/50 text-right">
            {readinessScore >= 80 ? 'Well Prepared' : 'In Progress'}
          </div>
        </div>
      </div>

      {/* ─── 1. YOUR SKILLS (MASTERED) ─── */}
      <section className="glass-panel p-6 sm:p-7 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Your Skills</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Skills that match your career profile ({userSkills.length} Verified).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {userSkills.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 shadow-sm"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>{skill}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 2. SKILLS TO LEARN (PRIORITIZED GAPS) ─── */}
      <section className="glass-panel p-6 sm:p-7 border border-white/10 rounded-2xl space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span>Skills To Learn</span>
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Key skills needed to qualify for senior and lead openings in this role.
          </p>
        </div>

        {/* Priority Groups */}
        <div className="space-y-4">
          {/* Critical / High Priority */}
          {skillGap.missing_critical.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
                  High Priority
                </span>
                <span className="text-xs font-semibold text-white/70">Required for most interviews</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {skillGap.missing_critical.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-200"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended / Medium Priority */}
          {skillGap.missing_recommended.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Medium Priority
                </span>
                <span className="text-xs font-semibold text-white/70">Increases competitive advantage</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {skillGap.missing_recommended.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Curated Learning Resources */}
        {skillGap.learning_resources.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-orange-400" />
              Curated Courses & Learning Resources
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skillGap.learning_resources.map((res) => (
                <a
                  key={res.skill}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-orange-500/40 hover:bg-orange-500/5 group flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                        {res.title}
                      </h4>
                      <ExternalLink className="h-3.5 w-3.5 text-white/40 shrink-0 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{res.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                    <span className="font-semibold text-orange-400">Master {res.skill}</span>
                    <span className="text-white/40 text-[10px]">Free / Online</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── 3. PROGRESSIVE DISCLOSURE: VIEW & ADD ALL SKILLS ─── */}
      <section className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowAllSkills(!showAllSkills)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div>
            <h3 className="text-sm font-bold text-white">View & Manage All Tracked Skills</h3>
            <p className="text-xs text-white/50">Explore the full library of technical skills and add them to your profile.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-1 text-white/70">
            {showAllSkills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {showAllSkills && (
          <div className="p-6 border-t border-white/10 space-y-3 bg-white/[0.01]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="glass-input w-full pl-9 pr-3 py-1.5 text-xs font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredAllSkills.map((skill) => {
                const isSelected = userSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-orange-500/60 bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-200 font-bold'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-orange-400" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ─── 4. BOTTOM ACTION: GO TO ROADMAP ─── */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Ready to start improving?</h4>
            <p className="text-xs text-white/50">Follow your 90-day step-by-step career milestone roadmap.</p>
          </div>
        </div>

        <button
          onClick={onNavigateToRoadmap}
          className="btn-gradient flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold shrink-0"
        >
          <span>Follow Your Roadmap</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
