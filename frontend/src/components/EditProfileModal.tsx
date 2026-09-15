'use client';

import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Award,
  MapPin,
  Clock,
  GraduationCap,
  Sparkles,
  Check,
  Search,
  Building2
} from 'lucide-react';
import { AppMetadata } from '@/types';
import { ROLE_OPTIONS } from '@/lib/roles';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: AppMetadata | null;
  country: string;
  jobTitle: string;
  setJobTitle: (title: string) => void;
  experience: number;
  setExperience: (exp: number) => void;
  location: string;
  setLocation: (loc: string) => void;
  education: string;
  setEducation: (edu: string) => void;
  companySize: string;
  setCompanySize: (size: string) => void;
  employmentType: string;
  setEmploymentType: (type: string) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  onApply: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
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
  onApply,
}) => {
  const [skillSearch, setSkillSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen || !metadata) return null;

  const isIndia = country === 'India';
  const availableLocations = isIndia ? metadata.locations_india : metadata.locations_us;

  const filteredSkills = metadata.all_skills.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 relative flex flex-col gap-5 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customize Career Profile</h3>
              <p className="text-xs text-white/50">Adjust your experience, target role, and skills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Inputs */}
        <div className="space-y-4">
          {/* Target Role & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-orange-400" />
                Target Job Role
              </label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="glass-input w-full px-3 py-2 text-xs font-medium cursor-pointer"
              >
                {Array.from(new Set([...ROLE_OPTIONS, ...metadata.job_titles])).map((title) => (
                  <option key={title} value={title} className="bg-[#0e121e] text-white">
                    {title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                Location ({country})
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input w-full px-3 py-2 text-xs font-medium cursor-pointer"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0e121e] text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience Range */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-orange-400" />
                Years of Experience
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
              <span>0 Yrs (Entry)</span>
              <span>5 Yrs (Mid)</span>
              <span>10 Yrs (Senior)</span>
              <span>20 Yrs (Lead)</span>
            </div>
          </div>

          {/* Highest Education */}
          <div>
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

          {/* Skills Management */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/80">
                Your Skills ({skills.length} Selected)
              </label>
              <span className="text-[10px] text-white/40">Select all that you know</span>
            </div>

            {/* Search skill */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search skills to add/remove..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="glass-input w-full pl-8 pr-3 py-1.5 text-xs font-medium"
              />
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
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

          {/* Progressive Disclosure: Advanced Options */}
          <div className="border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1"
            >
              <span>{showAdvanced ? '− Hide advanced options' : '+ Show advanced options (Company size & type)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-orange-400" />
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="glass-input w-full px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  >
                    {metadata.company_sizes.map((size) => (
                      <option key={size} value={size} className="bg-[#0e121e]">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="glass-input w-full px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  >
                    {metadata.employment_types.map((emp) => (
                      <option key={emp} value={emp} className="bg-[#0e121e]">
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="btn-gradient flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
