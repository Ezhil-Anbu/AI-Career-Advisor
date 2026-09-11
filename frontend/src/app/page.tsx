'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, DollarSign, Briefcase, Compass, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import {
  AppMetadata,
  SalaryPrediction,
  JobMatch,
  SkillGapAnalysis,
  CareerRoadmap,
  SamplePersona,
  ResumeParseResult,
} from '@/types';
import {
  fetchMetadata,
  predictSalary,
  recommendJobs,
  analyzeSkillGap,
  generateRoadmap,
} from '@/lib/api';
import { Header } from '@/components/Header';
import { SalaryTab } from '@/components/SalaryTab';
import { JobsTab } from '@/components/JobsTab';
import { SkillGapTab } from '@/components/SkillGapTab';
import { ResumeModal } from '@/components/ResumeModal';
import { ExportModal } from '@/components/ExportModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'salary' | 'jobs' | 'skills'>('salary');
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);

  // User Parameters
  const [country, setCountry] = useState<string>('India');
  const [jobTitle, setJobTitle] = useState<string>('Data Scientist');
  const [experience, setExperience] = useState<number>(3.5);
  const [location, setLocation] = useState<string>('Bangalore');
  const [education, setEducation] = useState<string>('Master');
  const [companySize, setCompanySize] = useState<string>('Medium');
  const [employmentType, setEmploymentType] = useState<string>('Full-time');
  const [skills, setSkills] = useState<string[]>([
    'Python',
    'Machine Learning',
    'SQL',
    'Pandas',
    'Statistics',
    'Scikit-learn',
  ]);

  // Model Inferences
  const [prediction, setPrediction] = useState<SalaryPrediction | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);

  // UI States
  const [loadingSalary, setLoadingSalary] = useState<boolean>(false);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // 1. Initial Metadata Load
  useEffect(() => {
    async function init() {
      const data = await fetchMetadata();
      setMetadata(data);
    }
    init();
  }, []);

  // 2. Adjust default location when country changes
  useEffect(() => {
    if (metadata) {
      if (country === 'India') {
        if (!metadata.locations_india.includes(location)) {
          setLocation(metadata.locations_india[0] || 'Bangalore');
        }
      } else {
        if (!metadata.locations_us.includes(location)) {
          setLocation(metadata.locations_us[0] || 'San Francisco');
        }
      }
    }
  }, [country, metadata]);

  // 3. Fetch Predictions & Recommendations
  const updateInsights = useCallback(async () => {
    setLoadingSalary(true);
    setLoadingJobs(true);
    setLoadingRoadmap(true);

    try {
      const [salRes, jobsRes, gapRes, roadRes] = await Promise.all([
        predictSalary({
          country,
          job_title: jobTitle,
          experience,
          education,
          location,
          company_size: companySize,
          employment_type: employmentType,
          skills,
        }),
        recommendJobs({
          user_skills: skills,
          target_role: jobTitle,
          experience,
          education,
          location,
          country,
          top_k: 12,
        }),
        analyzeSkillGap({
          user_skills: skills,
          target_role: jobTitle,
          experience,
        }),
        generateRoadmap({
          user_skills: skills,
          target_role: jobTitle,
          experience,
        }),
      ]);

      setPrediction(salRes);
      setJobs(jobsRes.jobs || []);
      setSkillGap(gapRes);
      setRoadmap(roadRes);
    } catch (err) {
      console.error('Error updating insights:', err);
    } finally {
      setLoadingSalary(false);
      setLoadingJobs(false);
      setLoadingRoadmap(false);
    }
  }, [country, jobTitle, experience, education, location, companySize, employmentType, skills]);

  useEffect(() => {
    updateInsights();
  }, [updateInsights]);

  // Handle 1-Click Persona selection
  const handleSelectPersona = (persona: SamplePersona) => {
    setCountry(persona.country);
    setJobTitle(persona.job_title);
    setExperience(persona.experience);
    setEducation(persona.education);
    setLocation(persona.location);
    setCompanySize(persona.company_size);
    setSkills(persona.skills);
  };

  // Handle parsed resume autofill
  const handleApplyResumeData = (parsed: ResumeParseResult) => {
    if (parsed.extracted_skills.length > 0) {
      setSkills(parsed.extracted_skills);
    }
    if (parsed.extracted_roles.length > 0) {
      setJobTitle(parsed.extracted_roles[0]);
    }
    if (parsed.estimated_experience > 0) {
      setExperience(parsed.estimated_experience);
    }
    if (parsed.extracted_education) {
      setEducation(parsed.extracted_education);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        personas={metadata?.sample_personas || []}
        onSelectPersona={handleSelectPersona}
        country={country}
        setCountry={setCountry}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Hero Glass Banner */}
        <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 mb-3">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>AI-Powered Career & Compensation Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Design Your <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">Career Trajectory</span> with Precision ML
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl">
              Benchmark your compensation across Indian and US tech markets, discover high-match role openings, and close critical skill gaps with custom 90-day learning roadmaps.
            </p>

            {/* Quick KPI stats */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-lg font-black text-white">92.4%</div>
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Model R² Accuracy</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-lg font-black text-orange-400">120+</div>
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Tracked Tech Skills</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-lg font-black text-emerald-400">30+</div>
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Target Job Titles</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-lg font-black text-cyan-400">Dual Market</div>
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">INR ₹ / USD $</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {metadata && (
          <div>
            {activeTab === 'salary' && (
              <SalaryTab
                metadata={metadata}
                country={country}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                experience={experience}
                setExperience={setExperience}
                location={location}
                setLocation={setLocation}
                education={education}
                setEducation={setEducation}
                companySize={companySize}
                setCompanySize={setCompanySize}
                employmentType={employmentType}
                setEmploymentType={setEmploymentType}
                skills={skills}
                setSkills={setSkills}
                prediction={prediction}
                loading={loadingSalary}
              />
            )}

            {activeTab === 'jobs' && (
              <JobsTab
                jobs={jobs}
                loading={loadingJobs}
                metadata={metadata}
                userSkills={skills}
              />
            )}

            {activeTab === 'skills' && (
              <SkillGapTab
                skillGap={skillGap}
                roadmap={roadmap}
                loading={loadingRoadmap}
                targetRole={jobTitle}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 bg-[#05070a]/80 py-6 text-center text-xs text-white/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">CAREER AI® Pro</span>
            <span>•</span>
            <span>Full-Stack SaaS (Next.js & FastAPI)</span>
          </div>
          <p>© 2026 CAREER AI® Intelligence Platform. Zero Data Leakage ML Models.</p>
        </div>
      </footer>

      {/* Modals */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onApplyResumeData={handleApplyResumeData}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        jobTitle={jobTitle}
        experience={experience}
        location={location}
        country={country}
        education={education}
        skills={skills}
        prediction={prediction}
        jobs={jobs}
        skillGap={skillGap}
        roadmap={roadmap}
      />
    </div>
  );
}
