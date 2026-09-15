'use client';

import React from 'react';
import { Award, CheckCircle2, Clock, GraduationCap, MapPin, Search, Sparkles, User, X } from 'lucide-react';
import { ResumeParseResult } from '@/types';
import { ROLE_OPTIONS } from '@/lib/roles';

interface CareerSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetRole: string) => void;
  profile: ResumeParseResult | null;
  currentRole: string;
  jobTitle: string;
  experience: number;
  location: string;
  country: string;
  education: string;
  skills: string[];
  availableRoles: string[];
}

export const CareerSnapshotModal: React.FC<CareerSnapshotModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  profile,
  currentRole,
  jobTitle,
  experience,
  location,
  country,
  education,
  skills,
  availableRoles,
}) => {
  const [targetRole, setTargetRole] = React.useState(jobTitle);
  const [roleSearch, setRoleSearch] = React.useState('');

  if (!isOpen) return null;

  const roles = Array.from(new Set([...ROLE_OPTIONS, ...availableRoles]));
  const filteredRoles = roles.filter((role) => role.toLowerCase().includes(roleSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-xl">
      <div className="glass-panel relative flex max-h-[92vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto border border-orange-500/30 p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close career snapshot"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-400">Profile review</p>
            <h2 className="mt-1 text-2xl font-black text-white">Your Career Snapshot</h2>
            <p className="mt-1 text-sm text-white/60">Review the details we will use to personalize your career insights.</p>
          </div>
        </div>

        {profile?.name && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white">
            <User className="h-4 w-4 text-orange-400" />
            {profile.name}
          </div>
        )}

        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-300">Choose your target role</p>
              <p className="mt-1 text-xs text-white/55">The resume role is only a suggestion.</p>
            </div>
            <span className="rounded-lg border border-orange-400/30 bg-black/20 px-2 py-1 text-xs font-bold text-orange-200">{targetRole}</span>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input value={roleSearch} onChange={(event) => setRoleSearch(event.target.value)} placeholder="Search from 50+ career roles..." className="glass-input w-full py-2 pl-9 pr-3 text-xs" />
          </div>
          <div className="grid max-h-36 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredRoles.map((role) => (
              <button key={role} type="button" onClick={() => setTargetRole(role)} className={`rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition-colors ${targetRole === role ? 'border-orange-400/60 bg-orange-500/20 text-orange-100' : 'border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white'}`}>
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50"><Award className="h-4 w-4" /> Resume role</div>
            <p className="mt-2 text-lg font-bold text-white">{currentRole || 'Not detected'}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400"><Clock className="h-4 w-4" /> Experience</div>
            <p className="mt-2 text-lg font-bold text-white">{experience > 0 ? `${experience} ${experience === 1 ? 'year' : 'years'}` : 'Not detected'}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400"><MapPin className="h-4 w-4" /> Location</div>
            <p className="mt-2 text-lg font-bold text-white">{location}, {country}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400"><GraduationCap className="h-4 w-4" /> Education</div>
            <p className="mt-2 text-lg font-bold text-white">{education}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">Skills detected</span>
            <span className="text-xs font-bold text-orange-300">{skills.length} tracked</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? skills.map((skill) => (
              <span key={skill} className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-200">{skill}</span>
            )) : <span className="text-xs text-white/50">No skills detected yet</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          You can edit these details before continuing from the profile menu.
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <button onClick={onClose} className="btn-glass rounded-xl px-4 py-2.5 text-xs font-semibold">Review later</button>
          <button onClick={() => onConfirm(targetRole)} className="btn-gradient flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" /> Continue to Career Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};