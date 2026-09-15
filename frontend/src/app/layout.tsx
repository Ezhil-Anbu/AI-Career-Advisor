import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CAREER AI | Your Career, Powered by AI',
  description: 'Discover your salary potential, best-fit jobs, skill gaps, and personalized career roadmap.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="relative min-h-screen bg-[#07090e] text-[#f4f2ee] antialiased selection:bg-orange-500/30 selection:text-orange-200 font-sans">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <div className="ambient-glow-3" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
