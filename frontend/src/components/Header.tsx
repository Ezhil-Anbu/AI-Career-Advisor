'use client';

import React from 'react';
import { Sparkles, FileText, Download, Briefcase, DollarSign, MapPin, Compass, Zap } from 'lucide-react';
import { SamplePersona } from '@/types';

interface HeaderProps {
  activeTab: 'salary' | 'jobs' | 'skills';
  setActiveTab: (tab: 'salary' | 'jobs' | 'skills') => void;
  personas: SamplePersona[];
  onSelectPersona: (persona: SamplePersona) => void;
  country: string;
  setCountry: (country: string) => void;
  onOpenResumeModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  personas,
  onSelectPersona,
  country,
  setCountry,
  onOpenResumeModal,
  onOpenExportModal,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090e]/70 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/25">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07090e]">
                <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  CAREER <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">AI®</span>
                </span>
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  Enterprise ML
                </span>
              </div>
              <p className="text-xs text-white/50">Next-Gen Career Intelligence & Salary Forecaster</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('salary')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === 'salary'
                  ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Salary Forecaster</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Job Matcher</span>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === 'skills'
                  ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Skill Gap & Roadmap</span>
            </button>
          </nav>

          {/* Action CTAs: Country Toggle, Resume Upload & Export */}
          <div className="flex items-center gap-2">
            {/* Country Selector */}
            <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
              <button
                onClick={() => setCountry('India')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  country === 'India'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🇮🇳 INR (₹)
              </button>
              <button
                onClick={() => setCountry('United States')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  country === 'United States'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🇺🇸 USD ($)
              </button>
            </div>

            {/* Resume Upload CTA */}
            <button
              onClick={onOpenResumeModal}
              className="btn-glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              title="Upload PDF Resume to auto-extract skills"
            >
              <FileText className="h-3.5 w-3.5 text-orange-400" />
              <span className="hidden sm:inline">Upload CV</span>
            </button>

            {/* Export Report CTA */}
            <button
              onClick={onOpenExportModal}
              className="btn-gradient flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold"
              title="Export Career Blueprint Report"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* 1-Click Quick-Start Personas Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-orange-400 shrink-0">
            <Zap className="h-3.5 w-3.5" />
            <span>Quick Personas:</span>
          </div>
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className="flex items-center gap-1.5 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300 active:scale-95"
            >
              <span>{persona.icon}</span>
              <span>{persona.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
