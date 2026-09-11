'use client';

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Milestone,
  Calendar,
  Sparkles,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { SkillGapAnalysis, CareerRoadmap } from '@/types';

interface SkillGapTabProps {
  skillGap: SkillGapAnalysis | null;
  roadmap: CareerRoadmap | null;
  loading: boolean;
  targetRole: string;
}

export const SkillGapTab: React.FC<SkillGapTabProps> = ({
  skillGap,
  roadmap,
  loading,
  targetRole,
}) => {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleActionItem = (itemKey: string) => {
    if (completedItems.includes(itemKey)) {
      setCompletedItems(completedItems.filter((k) => k !== itemKey));
    } else {
      setCompletedItems([...completedItems, itemKey]);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-spin mb-3">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-white">Generating 90-Day Career Intelligence Roadmap...</p>
        <p className="text-xs text-white/50 mt-1">Analyzing curriculum requirements and skill gaps</p>
      </div>
    );
  }

  if (!skillGap || !roadmap) {
    return (
      <div className="glass-panel p-12 text-center">
        <Compass className="h-10 w-10 text-white/30 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">No Roadmap Available</h3>
        <p className="text-xs text-white/50 mt-1">Select a target role and skills to view your career path.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Banner: Readiness Score */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-xl shadow-lg shadow-orange-500/20">
            {Math.round(skillGap.overall_readiness_score)}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Career Readiness Index for <span className="text-orange-400">{targetRole}</span>
              </h2>
              <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
                AI Target Path
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              You possess {skillGap.matched_skills.length} core competencies. Closing{' '}
              {skillGap.missing_critical.length + skillGap.missing_recommended.length} skill gaps will put you in the 90th percentile of candidates.
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full md:w-56 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white/60">Profile Completeness</span>
            <span className="text-orange-300">{Math.round(skillGap.overall_readiness_score)}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(10, skillGap.overall_readiness_score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recommended Learning & 90-Day Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Learning Resources */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <BookOpen className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Curated Certification Courses</h3>
            </div>

            <div className="flex flex-col gap-3">
              {skillGap.learning_resources.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-emerald-200">No Critical Gaps Detected!</p>
                  <p className="text-[11px] text-emerald-300/70 mt-0.5">
                    Your skill profile strongly aligns with {targetRole} market benchmarks.
                  </p>
                </div>
              ) : (
                skillGap.learning_resources.map((res) => {
                  const isCritical = res.priority === 'Critical';
                  return (
                    <a
                      key={res.skill}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition-all hover:border-orange-500/40 hover:bg-orange-500/5 group flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                              {res.title}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                isCritical
                                  ? 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
                                  : 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                              }`}
                            >
                              {res.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{res.description}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-white/40 shrink-0 group-hover:text-orange-400 transition-colors" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-400">
                        <span>Master {res.skill}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 90-Day Interactive Milestone Roadmap */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Milestone className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">90-Day Career Milestone Roadmap</h3>
              </div>
              <span className="text-xs text-white/40 font-medium">
                {completedItems.length} Checklist Items Done
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {roadmap.milestones.map((ms, msIdx) => (
                <div
                  key={ms.phase}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/40 text-[11px] font-bold text-orange-300">
                        {msIdx + 1}
                      </div>
                      <h4 className="text-xs font-bold text-white">{ms.phase}</h4>
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-orange-400" />
                      {ms.timeline}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-orange-300/90 mb-1">{ms.title}</p>
                  <p className="text-xs text-white/50 mb-3">{ms.description}</p>

                  {/* Action Checklist */}
                  <div className="space-y-1.5 border-t border-white/10 pt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                      <ListTodo className="h-3 w-3" />
                      Actionable Milestones
                    </div>
                    {ms.action_items.map((item, itemIdx) => {
                      const itemKey = `${ms.phase}-${itemIdx}`;
                      const isDone = completedItems.includes(itemKey);
                      return (
                        <button
                          key={itemKey}
                          type="button"
                          onClick={() => toggleActionItem(itemKey)}
                          className={`w-full flex items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-all ${
                            isDone
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 line-through opacity-80'
                              : 'bg-white/[0.02] border border-white/5 text-white/80 hover:bg-white/5'
                          }`}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                              isDone ? 'text-emerald-400' : 'text-white/30'
                            }`}
                          />
                          <span className="leading-snug">{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
