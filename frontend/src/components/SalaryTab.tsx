'use client';

import React from 'react';
import { TrendingUp, ShieldCheck, Sparkles, Building2, MapPin, GraduationCap, Clock, Award } from 'lucide-react';
import { AppMetadata, SalaryPrediction } from '@/types';
import { SpeedometerGauge } from './SpeedometerGauge';

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
  const isIndia = country === 'India';
  const availableLocations = isIndia ? metadata.locations_india : metadata.locations_us;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Input Parameters Panel */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Salary Estimator Parameters</h2>
                <p className="text-xs text-white/50">Trained on real market compensation datasets</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Zero Leakage ML
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job Role */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-orange-400" />
                Target Job Title
              </label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 text-xs font-medium cursor-pointer"
              >
                {metadata.job_titles.map((title) => (
                  <option key={title} value={title} className="bg-[#0e121e] text-white">
                    {title}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                Market Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 text-xs font-medium cursor-pointer"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0e121e] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience Range Slider */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                Years of Relevant Experience
              </label>
              <span className="rounded-lg bg-orange-500/20 border border-orange-500/40 px-2.5 py-0.5 text-xs font-bold text-orange-300">
                {experience} {experience === 1 ? 'Year' : 'Years'}
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
            <div className="flex justify-between text-[10px] text-white/40 mt-1 font-medium">
              <span>Fresher / 0 Yrs</span>
              <span>Mid / 5 Yrs</span>
              <span>Senior / 10 Yrs</span>
              <span>Lead / 20 Yrs</span>
            </div>
          </div>

          {/* Education Level */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-white/70 mb-2 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-orange-400" />
              Highest Education
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {metadata.education_levels.map((edu) => (
                <button
                  key={edu}
                  type="button"
                  onClick={() => setEducation(edu)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all text-center ${
                    education === edu
                      ? 'border-orange-500/50 bg-orange-500/20 text-orange-200 font-bold shadow-sm'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {edu}
                </button>
              ))}
            </div>
          </div>

          {/* Company Size & Employment Type */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-orange-400" />
                Company Scale
              </label>
              <div className="flex flex-wrap gap-1.5">
                {metadata.company_sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setCompanySize(size)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      companySize === size
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-200 font-bold'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Employment Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {metadata.employment_types.map((emp) => (
                  <button
                    key={emp}
                    type="button"
                    onClick={() => setEmploymentType(emp)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      employmentType === emp
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-200 font-bold'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
                    }`}
                  >
                    {emp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Tags */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/70">
                Core Skill Set ({skills.length} Selected)
              </label>
              <span className="text-[11px] text-white/40">Click to toggle skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {metadata.all_skills.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-orange-500/60 bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-200 font-bold shadow-sm'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Output & Intelligence Dashboard */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {prediction ? (
          <div className="glass-panel p-6 flex flex-col justify-between h-full">
            {/* Speedometer Gauge Widget */}
            <div className="border-b border-white/10 pb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  ML Prediction Model
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Confidence: {prediction.confidence_score}%
                </span>
              </div>
              <SpeedometerGauge
                value={prediction.predicted_salary}
                formattedValue={prediction.formatted_salary}
                percentiles={prediction.percentiles}
                currencySymbol={prediction.currency_symbol}
              />
            </div>

            {/* Market Comparison Card */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-white/60">Market Benchmark Comparison</span>
                <span
                  className={`font-bold ${
                    prediction.market_benchmark.percent_diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {prediction.market_benchmark.percent_diff >= 0 ? '+' : ''}
                  {prediction.market_benchmark.percent_diff}% vs Avg
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                The predicted salary for a <strong className="text-white">{jobTitle}</strong> in{' '}
                <strong className="text-white">{location}</strong> with {experience} yrs experience is{' '}
                <span className="text-orange-300 font-semibold">{prediction.formatted_salary}</span>.
              </p>
            </div>

            {/* 3-Year Growth Trajectory */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 mb-3">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                <span>3-Year Career Compensation Trajectory</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {prediction.forecast_3yr.map((item, idx) => {
                  const valFmt = isIndia
                    ? `₹${(item.salary / 100000).toFixed(1)} L`
                    : `$${Math.round(item.salary / 1000)}k`;
                  return (
                    <div
                      key={item.year}
                      className={`rounded-xl border p-2.5 text-center transition-all ${
                        idx === 0
                          ? 'border-white/10 bg-white/[0.02]'
                          : 'border-orange-500/20 bg-orange-500/5'
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-white/50">{item.year}</div>
                      <div className="text-xs font-bold text-orange-300 mt-0.5">{valFmt}</div>
                      <div className="text-[9px] text-white/40 mt-0.5">{item.experience} yrs</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 animate-spin mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Calculating Compensation...</h3>
            <p className="text-xs text-white/50 mt-1">Adjust sliders or choose a persona to see live predictions</p>
          </div>
        )}
      </div>
    </div>
  );
};
