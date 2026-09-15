'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Award,
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Compass
} from 'lucide-react';
import { SalaryPrediction, JobMatch, SkillGapAnalysis, CareerRoadmap } from '@/types';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  experience: number;
  location: string;
  country: string;
  education: string;
  skills: string[];
  prediction: SalaryPrediction | null;
  jobs: JobMatch[];
  skillGap: SkillGapAnalysis | null;
  roadmap: CareerRoadmap | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  experience,
  location,
  country,
  education,
  skills,
  prediction,
  jobs,
  skillGap,
  roadmap,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      if (reportRef.current) {
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#07090e',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Career-Report-${jobTitle.replace(/\s+/g, '-')}.pdf`);

        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 relative flex flex-col gap-4 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Career Intelligence Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-glass flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn-gradient flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div
          ref={reportRef}
          className="rounded-2xl border border-white/10 bg-[#0a0e17] p-6 text-white space-y-5"
        >
          {/* Brand & Candidate Profile */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-extrabold tracking-wider uppercase text-orange-400">
                CAREER AI REPORT
              </span>
              <h1 className="text-2xl font-extrabold mt-0.5">{jobTitle}</h1>
              <p className="text-xs text-white/60 mt-0.5">
                {location}, {country} • {experience} Yrs Exp • {education} Degree
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-white/40">Readiness Score</span>
              <div className="text-2xl font-black text-emerald-400">
                {skillGap ? Math.round(skillGap.overall_readiness_score) : 85}%
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <DollarSign className="h-4 w-4 text-orange-400 mx-auto mb-1" />
              <div className="text-[10px] text-white/50 font-semibold uppercase">Estimated Salary</div>
              <div className="text-sm font-extrabold text-orange-300 mt-0.5">
                {prediction?.formatted_salary || '₹26.7 LPA'}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <Award className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-[10px] text-white/50 font-semibold uppercase">Top Match Score</div>
              <div className="text-sm font-extrabold text-emerald-300 mt-0.5">
                {jobs.length > 0 ? Math.round(jobs[0].match_score) : 94}% Match
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <Briefcase className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] text-white/50 font-semibold uppercase">Opportunities</div>
              <div className="text-sm font-extrabold text-cyan-300 mt-0.5">
                {jobs.length} Matched Roles
              </div>
            </div>
          </div>

          {/* Core Skills Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Your Skills Profile ({skills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-white/80"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          {/* Top Matched Positions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Top Matched Roles
            </h4>
            <div className="space-y-2">
              {jobs.slice(0, 3).map((job) => (
                <div
                  key={job.job_id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{job.job_title}</div>
                    <div className="text-[11px] text-white/50">{job.company} • {job.location}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-300">{job.salary_range}</span>
                    <div className="text-[10px] font-semibold text-emerald-400">{Math.round(job.match_score)}% Match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 90-Day Action Roadmap Summary */}
          {roadmap && (
            <div className="border-t border-white/10 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Career Roadmap Milestones
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                {roadmap.milestones.map((ms) => (
                  <div key={ms.phase} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                    <div className="font-bold text-orange-400">{ms.timeline}</div>
                    <div className="text-white/70 mt-0.5 line-clamp-2">{ms.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer watermark */}
          <div className="text-center pt-2 text-[10px] text-white/30 border-t border-white/5">
            Generated via CAREER AI® Intelligence Platform
          </div>
        </div>
      </div>
    </div>
  );
};
