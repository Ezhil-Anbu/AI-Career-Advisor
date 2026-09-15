'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Briefcase,
  BookOpen,
  Compass,
  FileText,
  Download,
  Menu,
  X,
  Home,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { SamplePersona } from '@/types';

interface HeaderProps {
  activeTab: 'home' | 'salary' | 'jobs' | 'skills' | 'roadmap';
  setActiveTab: (tab: 'home' | 'salary' | 'jobs' | 'skills' | 'roadmap') => void;
  personas: SamplePersona[];
  onSelectPersona: (persona: SamplePersona) => void;
  country: string;
  setCountry: (country: string) => void;
  onOpenResumeModal: () => void;
  onOpenExportModal: () => void;
  onOpenEditProfileModal: () => void;
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
  onOpenEditProfileModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const navItems: { id: 'home' | 'salary' | 'jobs' | 'skills' | 'roadmap'; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'salary', label: 'Salary', icon: DollarSign },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: BookOpen },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090e]/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* ─── Brand Logo ─── */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07090e]">
                <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  CAREER <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">Smart Career & Salary Advisor</p>
            </div>
          </div>

          {/* ─── Desktop Navigation Tabs ─── */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ─── Right Controls: Currency, Upload, Export ─── */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Country Selector */}
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
              <button
                onClick={() => setCountry('India')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  country === 'India'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                🇮🇳 INR (₹)
              </button>
              <button
                onClick={() => setCountry('United States')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
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
              className="btn-gradient flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Upload Resume</span>
            </button>

            {/* Export CTA */}
            <button
              onClick={onOpenExportModal}
              className="btn-glass flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 text-white/70" />
              <span>Export</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenResumeModal}
              className="btn-gradient flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Resume</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Expandable Navigation Menu ─── */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 md:hidden">
            <div className="grid grid-cols-5 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-[10px] font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'text-white/60 hover:text-white bg-white/[0.02]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs w-full">
                <button
                  onClick={() => setCountry('India')}
                  className={`flex-1 rounded-md py-1 font-semibold text-center ${
                    country === 'India' ? 'bg-orange-500 text-white' : 'text-white/60'
                  }`}
                >
                  🇮🇳 INR (₹)
                </button>
                <button
                  onClick={() => setCountry('United States')}
                  className={`flex-1 rounded-md py-1 font-semibold text-center ${
                    country === 'United States' ? 'bg-orange-500 text-white' : 'text-white/60'
                  }`}
                >
                  🇺🇸 USD ($)
                </button>
              </div>

              <button
                onClick={() => {
                  onOpenExportModal();
                  setMobileMenuOpen(false);
                }}
                className="btn-glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
