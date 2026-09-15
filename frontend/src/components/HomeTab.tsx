'use client';

import React from 'react';
import {
  Sparkles,
  UploadCloud,
  FileText,
  DollarSign,
  Briefcase,
  Target,
  MapPin,
  GraduationCap,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  Compass,
  Edit3,
  UserCheck
} from 'lucide-react';
import {
  SalaryPrediction,
  JobMatch,
  SkillGapAnalysis,
  CareerRoadmap,
  SamplePersona,
} from '@/types';

interface HomeTabProps {
  profileConfirmed: boolean;
  country: string;
  jobTitle: string;
  experience: number;
  location: string;
  education: string;
  skills: string[];
  prediction: SalaryPrediction | null;
  jobs: JobMatch[];
  skillGap: SkillGapAnalysis | null;
  roadmap: CareerRoadmap | null;
  personas: SamplePersona[];
  onSelectPersona: (persona: SamplePersona) => void;
  onNavigateTab: (tab: 'home' | 'salary' | 'jobs' | 'skills' | 'roadmap') => void;
  onOpenResumeModal: () => void;
  onOpenEditProfileModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profileConfirmed,
  country,
  jobTitle,
  experience,
  location,
  education,
  skills,
  prediction,
  jobs,
  skillGap,
  roadmap,
  personas,
  onSelectPersona,
  onNavigateTab,
  onOpenResumeModal,
  onOpenEditProfileModal,
}) => {
  const isIndia = country === 'India';

  // Computed top job
  const topJob = jobs.length > 0 ? jobs[0] : null;
  const topScore = topJob ? Math.round(topJob.match_score) : 94;
  const readinessScore = skillGap ? Math.round(skillGap.overall_readiness_score) : 82;
  const missingSkillsCount = skillGap
    ? skillGap.missing_critical.length + skillGap.missing_recommended.length
    : 4;

  return (
    <div className="flex flex-col gap-8">
      {/* ─── 1. HERO / FIRST-TIME LANDING BANNER ─── */}
      <section className="glass-panel relative overflow-hidden p-6 sm:p-10 border border-white/10">
        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-400 mb-4">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>AI Career & Compensation Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Your Career, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Powered by AI.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl font-normal">
            Discover your salary potential, best-fit jobs, skill gaps, and personalized career roadmap — all in a few simple clicks.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenResumeModal}
              className="btn-gradient flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg shadow-orange-500/20"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Your Resume</span>
            </button>

            <button
              onClick={onOpenResumeModal}
              className="btn-glass flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold"
            >
              <FileText className="h-4 w-4 text-orange-400" />
              <span>Paste Resume Text</span>
            </button>

            <button
              onClick={onOpenEditProfileModal}
              className="btn-glass flex items-center gap-1.5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-white/70 hover:text-white"
            >
              <Edit3 className="h-4 w-4 text-white/50" />
              <span>Customize Profile</span>
            </button>
          </div>

          {/* 4-Step Simple Visual Workflow */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs">
                1
              </div>
              <div>
                <div className="text-xs font-bold text-white">Upload</div>
                <div className="text-[11px] text-white/50">Drop your resume</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-white">Analyze</div>
                <div className="text-[11px] text-white/50">Instant profile scan</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-white">Discover</div>
                <div className="text-[11px] text-white/50">Salary & job matches</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs">
                4
              </div>
              <div>
                <div className="text-xs font-bold text-white">Improve</div>
                <div className="text-[11px] text-white/50">Follow your roadmap</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. MAIN DASHBOARD: YOUR CAREER SNAPSHOT ─── */}
      <section className={`flex flex-col gap-4 ${profileConfirmed ? '' : 'hidden'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Career Snapshot</h2>
            <p className="text-xs sm:text-sm text-white/60">
              Here&apos;s what your career profile looks like right now based on our real-time market data.
            </p>
          </div>

          {/* Edit Profile Action */}
          <button
            onClick={onOpenEditProfileModal}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            <Edit3 className="h-3.5 w-3.5 text-orange-400" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Summary Pill Bar */}
        <div className="glass-panel p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white/80 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Award className="h-4 w-4 text-orange-400" />
              {jobTitle}
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <Clock className="h-3.5 w-3.5 text-white/40" />
              {experience} {experience === 1 ? 'year' : 'years'} experience
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <MapPin className="h-3.5 w-3.5 text-white/40" />
              {location}, {country}
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <GraduationCap className="h-3.5 w-3.5 text-white/40" />
              {education} Degree
            </span>
          </div>

          <div className="text-[11px] text-white/40 font-semibold">
            {skills.length} Skills Tracked
          </div>
        </div>

        {/* 4 KEY METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Salary Potential */}
          <div
            onClick={() => onNavigateTab('salary')}
            className="glass-panel glass-panel-hover p-5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Salary Potential
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {prediction ? prediction.formatted_salary : isIndia ? '₹26.7 LPA' : '$145,000 / yr'}
              </div>
              <p className="text-xs text-white/60 mt-1 font-medium">
                Estimated annual salary
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
              <span>Monthly equivalent</span>
              <span className="font-bold text-orange-300">
                {prediction && isIndia
                  ? `~₹${(prediction.predicted_salary / 1200000).toFixed(2)} L/mo`
                  : prediction
                  ? `~$${Math.round(prediction.predicted_salary / 12).toLocaleString()}/mo`
                  : 'Competitive'}
              </span>
            </div>
          </div>

          {/* Metric 2: Best Job Match */}
          <div
            onClick={() => onNavigateTab('jobs')}
            className="glass-panel glass-panel-hover p-5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  Best Job Match
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {topJob ? topJob.job_title : jobTitle}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  {topScore}% Match
                </span>
                <span className="text-xs text-white/60">Excellent Match</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
              <span>Matched Opportunities</span>
              <span className="font-bold text-white">{jobs.length} Openings</span>
            </div>
          </div>

          {/* Metric 3: Career Readiness */}
          <div
            onClick={() => onNavigateTab('roadmap')}
            className="glass-panel glass-panel-hover p-5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4" />
                  Career Readiness
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {readinessScore}%
              </div>
              <p className="text-xs text-white/60 mt-1 font-medium">
                Ready for your target role
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, readinessScore))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metric 4: Skills To Learn */}
          <div
            onClick={() => onNavigateTab('skills')}
            className="glass-panel glass-panel-hover p-5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Skills To Learn
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {missingSkillsCount}
              </div>
              <p className="text-xs text-white/60 mt-1 font-medium">
                Important skills to master
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
              <span>Goal</span>
              <span className="font-bold text-amber-300">Fast Track</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. WHAT SHOULD YOU DO NEXT? ACTION CARDS ─── */}
      <section className={`flex flex-col gap-4 ${profileConfirmed ? '' : 'hidden'}`}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">What should you do next?</h2>
          <p className="text-xs sm:text-sm text-white/60">
            Pick an action below to explore your personalized insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Salary */}
          <button
            onClick={() => onNavigateTab('salary')}
            className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between group transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors">
                  1. Salary
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  See your estimated market salary and compensation breakdown.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-orange-400">
              <span>View Salary Estimate</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Jobs */}
          <button
            onClick={() => onNavigateTab('jobs')}
            className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between group transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  2. Jobs
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Find career opportunities that match your current profile.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>Explore Best Jobs</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Skills */}
          <button
            onClick={() => onNavigateTab('skills')}
            className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between group transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  3. Skills
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Discover the exact skills you need to learn and improve.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <span>View Skills To Learn</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Roadmap */}
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="glass-panel glass-panel-hover p-6 text-left flex flex-col justify-between group transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  4. Roadmap
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Follow your personalized step-by-step career improvement plan.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <span>Open Career Roadmap</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* ─── 4. QUICK SAMPLE PERSONAS (CLEAN FOOTER SECTION) ─── */}
      {profileConfirmed && personas.length > 0 && (
        <section className="glass-panel p-5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Zap className="h-4 w-4 text-orange-400 shrink-0" />
            <span>Want to test with a pre-built profile?</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => onSelectPersona(persona)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/80 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
              >
                <span>{persona.icon}</span>
                <span>{persona.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
