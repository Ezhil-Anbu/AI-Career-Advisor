'use client';

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  ListTodo,
  Award,
  Target
} from 'lucide-react';
import { CareerRoadmap, SkillGapAnalysis } from '@/types';
import confetti from 'canvas-confetti';

interface RoadmapTabProps {
  roadmap: CareerRoadmap | null;
  skillGap: SkillGapAnalysis | null;
  loading: boolean;
  targetRole: string;
  onNavigateToSkills: () => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  roadmap,
  skillGap,
  loading,
  targetRole,
  onNavigateToSkills,
}) => {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleActionItem = (itemKey: string) => {
    if (completedItems.includes(itemKey)) {
      setCompletedItems(completedItems.filter((k) => k !== itemKey));
    } else {
      const nextCompleted = [...completedItems, itemKey];
      setCompletedItems(nextCompleted);
      // Small celebration on milestone completion
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin mb-3">
          <Sparkles className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-white">Generating Personalized Career Roadmap...</p>
        <p className="text-xs text-white/50 mt-1">Structuring milestones and action items</p>
      </div>
    );
  }

  if (!roadmap || roadmap.milestones.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <Compass className="h-10 w-10 text-white/30 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">No Roadmap Generated</h3>
        <p className="text-xs text-white/50 mt-1">Select a target role or update skills to view your career plan.</p>
      </div>
    );
  }

  // Calculate overall milestone progress
  const totalActionItems = roadmap.milestones.reduce(
    (acc, ms) => acc + ms.action_items.length,
    0
  );
  const progressPercent = totalActionItems > 0
    ? Math.round((completedItems.length / totalActionItems) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Header & Progress Banner ─── */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-bold text-cyan-400 mb-2">
            <Compass className="h-3.5 w-3.5" />
            <span>Target Role Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Your Career Roadmap for <span className="text-orange-400">{targetRole}</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-xl">
            Follow these step-by-step milestones to close your skill gaps and become fully job-ready.
          </p>
        </div>

        {/* Progress Card */}
        <div className="w-full md:w-64 glass-panel p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">Roadmap Progress</span>
            <span className="font-bold text-cyan-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <div className="text-[11px] text-white/50 text-right">
            {completedItems.length} of {totalActionItems} tasks completed
          </div>
        </div>
      </div>

      {/* ─── Vertical Clean Timeline ─── */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:absolute before:left-8 sm:before:left-12 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-orange-500 before:via-cyan-500 before:to-emerald-500 before:opacity-30">
        {roadmap.milestones.map((ms, idx) => {
          const milestoneTasks = ms.action_items.map((_, itemIdx) => `${ms.phase}-${itemIdx}`);
          const milestoneCompleted = milestoneTasks.filter((k) => completedItems.includes(k)).length;
          const isAllDone = milestoneTasks.length > 0 && milestoneCompleted === milestoneTasks.length;

          return (
            <div
              key={ms.phase}
              className="relative flex items-start gap-4 sm:gap-6 group"
            >
              {/* Timeline Step Circle Badge */}
              <div
                className={`relative z-10 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border-2 font-black text-sm transition-all shadow-lg ${
                  isAllDone
                    ? 'border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'border-orange-500/50 bg-[#0d121f] text-orange-400 shadow-orange-500/10'
                }`}
              >
                {isAllDone ? (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                ) : (
                  <span>0{idx + 1}</span>
                )}
              </div>

              {/* Milestone Content Card */}
              <div className="flex-1 glass-panel p-5 sm:p-6 border border-white/10 rounded-2xl space-y-4">
                {/* Milestone Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                      Phase {idx + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{ms.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/70">
                      <Calendar className="h-3.5 w-3.5 text-orange-400" />
                      {ms.timeline}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  {ms.description}
                </p>

                {/* Skills Targeted in this Phase */}
                {ms.skills_to_acquire && ms.skills_to_acquire.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-white/50">Skills Focus:</span>
                    {ms.skills_to_acquire.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Checklist */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-bold text-white/60">
                    <span className="flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5 text-orange-400" />
                      Action Checklist
                    </span>
                    <span className="text-[11px] text-white/40">
                      {milestoneCompleted} of {ms.action_items.length} done
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {ms.action_items.map((item, itemIdx) => {
                      const itemKey = `${ms.phase}-${itemIdx}`;
                      const isDone = completedItems.includes(itemKey);

                      return (
                        <button
                          key={itemKey}
                          type="button"
                          onClick={() => toggleActionItem(itemKey)}
                          className={`w-full flex items-start gap-3 rounded-xl p-3 text-left text-xs sm:text-sm transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 line-through opacity-85'
                              : 'bg-white/[0.02] border border-white/5 text-white/85 hover:bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 mt-0.5 transition-colors ${
                              isDone ? 'text-emerald-400' : 'text-white/30'
                            }`}
                          />
                          <span className="leading-snug">{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
