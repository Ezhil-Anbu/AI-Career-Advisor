'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { HomeTab } from '@/components/HomeTab';
import { SalaryTab } from '@/components/SalaryTab';
import { JobsTab } from '@/components/JobsTab';
import { SkillGapTab } from '@/components/SkillGapTab';
import { RoadmapTab } from '@/components/RoadmapTab';
import { ResumeModal } from '@/components/ResumeModal';
import { ExportModal } from '@/components/ExportModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CareerSnapshotModal } from '@/components/CareerSnapshotModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'salary' | 'jobs' | 'skills' | 'roadmap'>('home');
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);

  // User Profile Parameters
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
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState<boolean>(false);
  const [profileConfirmed, setProfileConfirmed] = useState<boolean>(false);
  const [resumeProfile, setResumeProfile] = useState<ResumeParseResult | null>(null);

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
  }, [country, metadata, location]);

  // 3. Fetch Predictions & Recommendations from Backend API
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
    setResumeProfile(parsed);
    if (parsed.extracted_skills.length > 0) {
      setSkills(parsed.extracted_skills);
    }
    setExperience(parsed.estimated_experience);
    if (parsed.extracted_education) {
      setEducation(parsed.extracted_education);
    }
    // Apply location & country extracted from the resume
    if (parsed.country && (parsed.country === 'India' || parsed.country === 'United States')) {
      setCountry(parsed.country);
    }
    if (parsed.location) {
      // location will be set after country updates (useEffect handles default adjustment)
      setLocation(parsed.location);
    }
    setIsResumeModalOpen(false);
    setIsSnapshotOpen(true);
  };

  const handleApplyManualProfile = () => {
    setResumeProfile(null);
    setIsEditProfileModalOpen(false);
    setIsSnapshotOpen(true);
  };

  const handleConfirmSnapshot = (targetRole: string) => {
    setJobTitle(targetRole);
    setProfileConfirmed(true);
    setIsSnapshotOpen(false);
    setActiveTab('home');
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#07090e] text-white">
      {/* ─── Top Header ─── */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        personas={metadata?.sample_personas || []}
        onSelectPersona={handleSelectPersona}
        country={country}
        setCountry={setCountry}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
      />

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 w-full">
        {metadata && (
          <div>
            {/* 1. HOME / SNAPSHOT TAB */}
            {activeTab === 'home' && (
              <HomeTab
                profileConfirmed={profileConfirmed}
                country={country}
                jobTitle={jobTitle}
                experience={experience}
                location={location}
                education={education}
                skills={skills}
                prediction={prediction}
                jobs={jobs}
                skillGap={skillGap}
                roadmap={roadmap}
                personas={metadata.sample_personas || []}
                onSelectPersona={handleSelectPersona}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenResumeModal={() => setIsResumeModalOpen(true)}
                onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
              />
            )}

            {/* 2. SALARY TAB */}
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

            {/* 3. JOBS TAB */}
            {activeTab === 'jobs' && (
              <JobsTab
                jobs={jobs}
                loading={loadingJobs}
                metadata={metadata}
                userSkills={skills}
                onNavigateToSkills={() => setActiveTab('skills')}
              />
            )}

            {/* 4. SKILLS TAB */}
            {activeTab === 'skills' && (
              <SkillGapTab
                skillGap={skillGap}
                loading={loadingRoadmap}
                targetRole={jobTitle}
                userSkills={skills}
                metadata={metadata}
                onToggleSkill={toggleSkill}
                onNavigateToRoadmap={() => setActiveTab('roadmap')}
              />
            )}

            {/* 5. ROADMAP TAB */}
            {activeTab === 'roadmap' && (
              <RoadmapTab
                roadmap={roadmap}
                skillGap={skillGap}
                loading={loadingRoadmap}
                targetRole={jobTitle}
                onNavigateToSkills={() => setActiveTab('skills')}
              />
            )}
          </div>
        )}
      </main>

      {/* ─── Clean Footer ─── */}
      <footer className="mt-16 border-t border-white/10 bg-[#05070a]/90 py-6 text-center text-xs text-white/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">CAREER AI</span>
            <span>•</span>
            <span>Personalized Career & Compensation Advisor</span>
          </div>
          <p>© 2026 CAREER AI Platform. Clear, actionable career insights.</p>
        </div>
      </footer>

      {/* ─── Modals ─── */}
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

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
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
        onApply={handleApplyManualProfile}
      />

      <CareerSnapshotModal
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        onConfirm={handleConfirmSnapshot}
        profile={resumeProfile}
        currentRole={resumeProfile?.role || resumeProfile?.extracted_roles[0] || ''}
        jobTitle={jobTitle}
        experience={experience}
        location={location}
        country={country}
        education={education}
        skills={skills}
        availableRoles={metadata?.job_titles || []}
      />
    </div>
  );
}
