'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  MapPin,
  GraduationCap,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  Building2,
  Info
} from 'lucide-react';
import { AppMetadata, SalaryPrediction } from '@/types';

interface SalaryTabProps {
  metadata: AppMetadata;
  country: string;
  jobTitle: string;
  setJobTitle: (val: string) => void;
  experience: number;
  setExperience: (val: number) => void;
  location: string;
  setLocation: (val: string) => void;
  education: string;
  setEducation: (val: string) => void;
  companySize: string;
  setCompanySize: (val: string) => void;
  employmentType: string;
  setEmploymentType: (val: string) => void;
  skills: string[];
  setSkills: (val: string[]) => void;
  prediction: SalaryPrediction | null;
  loading: boolean;
}

export const SalaryTab: React.FC<SalaryTabProps> = ({
  metadata,
  country,
  jobTitle,
  setJobTitle,
  experience,
  setExperience,
  location,
  setLocation,
  education,
  setEducation,
  companySize,
  setCompanySize,
  employmentType,
  setEmploymentType,
  skills,
  setSkills,
  prediction,
  loading,
}) => {
  const [showDetailedMarketAnalysis, setShowDetailedMarketAnalysis] = useState(false);
  const isIndia = country === 'India';
  const availableLocations = isIndia ? metadata.locations_india : metadata.locations_us;

  // Calculate monthly salary estimate
  const monthlySalary = prediction
    ? isIndia
      ? `₹${(prediction.predicted_salary / 1200000).toFixed(2)} L/month`
      : `$${Math.round(prediction.predicted_salary / 12).toLocaleString()} / month`
    : isIndia
    ? '₹2.22 L/month'
    : '$12,080 / month';

  // Calculate realistic low & high range (±15%)
  const lowRangeFormatted = prediction
    ? isIndia
      ? `₹${((prediction.predicted_salary * 0.85) / 100000).toFixed(1)}L`
      : `$${Math.round((prediction.predicted_salary * 0.85) / 1000)}k`
    : isIndia
    ? '₹22.7L'
    : '$123k';

  const highRangeFormatted = prediction
    ? isIndia
      ? `₹${((prediction.predicted_salary * 1.15) / 100000).toFixed(1)}L`
      : `$${Math.round((prediction.predicted_salary * 1.15) / 1000)}k`
    : isIndia
    ? '₹30.7L'
    : '$167k';

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* ─── 1. DOMINANT MAIN RESULT CARD ─── */}
      <section className="glass-panel p-6 sm:p-10 border border-orange-500/20 relative overflow-hidden bg-gradient-to-b from-orange-500/[0.07] via-transparent to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Your Estimated Salary
            </span>

            {/* Dominant Headline Number */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                {prediction ? prediction.formatted_salary : isIndia ? '₹26.7 LPA' : '$145,000 / yr'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/70 pt-1">
              <span className="font-semibold text-white">Estimated annual compensation</span>
              <span>•</span>
              <span className="text-orange-300 font-bold">{monthlySalary}</span>
            </div>
          </div>

          {/* Reliability Badge */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-left sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="h-3.5 w-3.5" />
                Estimate Reliability
              </div>
              <div className="text-sm font-black text-emerald-300 mt-0.5">
                {prediction ? `${Math.round(prediction.confidence_score)}% High` : '94% High'}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Salary Range Slider Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">Estimated Market Range</span>
            <span className="font-bold text-white">
              {lowRangeFormatted} — {highRangeFormatted}
            </span>
          </div>

          {/* Range Visual Bar */}
          <div className="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute left-[15%] right-[15%] top-0 bottom-0 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 rounded-full"
            />
            {/* Center Pointer */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white shadow-lg -translate-x-1/2 rounded-full" />
          </div>

          <div className="flex justify-between text-[11px] text-white/40 pt-0.5">
            <span>Entry / Conservative ({lowRangeFormatted})</span>
            <span className="text-orange-300 font-bold">Expected Target</span>
            <span>Top Tier ({highRangeFormatted})</span>
          </div>
        </div>
      </section>

      {/* ─── 2. WHAT AFFECTS YOUR SALARY? (SIMPLE PARAMETERS) ─── */}
      <section className="glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">What affects your salary?</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Change your experience, role, location, and skills to see how your compensation adjusts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Target Job Role */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-orange-400" />
              Target Role
            </label>
            <select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 text-xs font-medium cursor-pointer"
            >
              {metadata.job_titles.map((title) => (
                <option key={title} value={title} className="bg-[#0e121e]">
                  {title}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 text-xs font-medium cursor-pointer"
            >
              {availableLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-[#0e121e]">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Highest Education */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-orange-400" />
              Education Degree
            </label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 text-xs font-medium cursor-pointer"
            >
              {metadata.education_levels.map((edu) => (
                <option key={edu} value={edu} className="bg-[#0e121e]">
                  {edu}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience Slider */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              Years of Experience: <span className="text-orange-300 font-bold">{experience} Years</span>
            </label>
            <span className="text-[11px] text-white/50">
              {experience < 2 ? 'Junior' : experience < 5 ? 'Mid-Level' : experience < 9 ? 'Senior' : 'Lead'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={experience}
            onChange={(e) => setExperience(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-2 bg-white/10 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-white/40 mt-1.5 font-medium">
            <span>0 Years</span>
            <span>5 Years</span>
            <span>10 Years</span>
            <span>20 Years</span>
          </div>
        </div>

        {/* Skills Selector */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white/80">
              Your Skills ({skills.length} included in calculation)
            </label>
            <span className="text-[11px] text-white/40">Toggle skills to see value impact</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {metadata.all_skills.slice(0, 24).map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-orange-500/60 bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-200 font-bold shadow-sm'
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
      </section>

      {/* ─── 3. PROGRESSIVE DISCLOSURE: DETAILED MARKET ANALYSIS ─── */}
      <section className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowDetailedMarketAnalysis(!showDetailedMarketAnalysis)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-orange-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                View detailed market analysis
              </h3>
              <p className="text-xs text-white/50">
                Explore market percentiles, peer comparison, and 3-year compensation outlook.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-1 text-white/70">
            {showDetailedMarketAnalysis ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {showDetailedMarketAnalysis && prediction && (
          <div className="p-6 border-t border-white/10 space-y-6 bg-white/[0.01]">
            {/* How your salary compares */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-white/60">How your salary compares</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  Your estimate is{' '}
                  <span
                    className={
                      prediction.market_benchmark.percent_diff >= 0
                        ? 'text-emerald-400 font-black'
                        : 'text-rose-400 font-black'
                    }
                  >
                    {prediction.market_benchmark.percent_diff >= 0 ? '+' : ''}
                    {prediction.market_benchmark.percent_diff}%
                  </span>{' '}
                  vs the market average for <span className="text-orange-300">{jobTitle}</span> in{' '}
                  <span className="text-white">{location}</span>.
                </div>
              </div>
            </div>

            {/* Percentiles Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
                Market Compensation Percentiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                  <span className="text-[11px] text-white/50">25th Percentile</span>
                  <div className="text-base font-bold text-white mt-1">
                    {isIndia
                      ? `₹${(prediction.percentiles.p25 / 100000).toFixed(1)} LPA`
                      : `$${Math.round(prediction.percentiles.p25 / 1000)}k / yr`}
                  </div>
                  <span className="text-[10px] text-white/40">Entry competitive</span>
                </div>

                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-center">
                  <span className="text-[11px] text-orange-400 font-semibold">Median (50th Percentile)</span>
                  <div className="text-base font-black text-orange-200 mt-1">
                    {isIndia
                      ? `₹${(prediction.percentiles.median / 100000).toFixed(1)} LPA`
                      : `$${Math.round(prediction.percentiles.median / 1000)}k / yr`}
                  </div>
                  <span className="text-[10px] text-orange-300/70">Market benchmark</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                  <span className="text-[11px] text-white/50">90th Percentile</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {isIndia
                      ? `₹${(prediction.percentiles.p90 / 100000).toFixed(1)} LPA`
                      : `$${Math.round(prediction.percentiles.p90 / 1000)}k / yr`}
                  </div>
                  <span className="text-[10px] text-white/40">Top performers</span>
                </div>
              </div>
            </div>

            {/* Your Salary Outlook (3-Year Trajectory) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                Your Salary Outlook (Next 3 Years)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {prediction.forecast_3yr.map((item, idx) => {
                  const valFmt = isIndia
                    ? `₹${(item.salary / 100000).toFixed(1)} LPA`
                    : `$${Math.round(item.salary / 1000)}k`;
                  return (
                    <div
                      key={item.year}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        idx === 0
                          ? 'border-white/10 bg-white/[0.02]'
                          : 'border-orange-500/20 bg-orange-500/5'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-white/50">{item.year}</div>
                      <div className="text-sm font-extrabold text-orange-300 mt-1">{valFmt}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{item.experience} yrs exp</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
