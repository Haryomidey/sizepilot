import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { motion } from 'motion/react';
import { 
  Zap,
  ArrowRight,
  Maximize2
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-white selection:text-black scroll-smooth font-sans">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 border-2 border-black rotate-45"></div>
            </div>
            SizePilot
          </Link>
          <div className="flex items-center gap-6">
            {/* <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-[#52525b] hover:text-white transition-colors">Sign In</Link> */}
            <Button size="sm" asChild className="rounded-lg text-xs font-bold px-4">
              <Link to="/dashboard">Workspace</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden bg-workspace">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl md:text-[5.5rem] font-bold tracking-tighter mb-8 leading-[0.9] uppercase"
          >
            Digital <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-border-hover">Geometric</span> <br />
            Balance.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base md:text-lg text-[#52525b] mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Professional file optimization workspace for modern engineering. 
            Automate file constraints with surgical accuracy through a minimalist geometric interface.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto rounded-lg text-sm font-bold h-12 px-8 uppercase tracking-widest" asChild>
              <Link to="/dashboard">Enter Workspace</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 group rounded-lg text-sm font-bold h-12 px-8 uppercase tracking-widest border-border" asChild>
              <Link to="/dashboard?mode=ai">
                AI Controller
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 p-10 bg-workspace border border-border rounded-xl flex flex-col justify-between min-h-75">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#52525b] mb-4">Core Engine</h3>
                <h2 className="text-3xl font-bold tracking-tight mb-4 leading-none uppercase">Surgical <br />Compression.</h2>
                <p className="text-sm text-[#52525b] leading-relaxed max-w-sm">Set exact target sizes down to the KB. Perfect for government portal requirements and enterprise data limits.</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center self-end">
                <Maximize2 size={24} className="text-black" />
              </div>
            </div>

            <div className="p-8 bg-workspace border border-border rounded-xl group hover:border-[#3f3f46] transition-colors">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#52525b] mb-4">Automation</h3>
              <h4 className="text-xl font-bold mb-3 uppercase tracking-tighter">AI Command</h4>
              <p className="text-xs text-[#52525b] leading-relaxed mb-6">Natural language interface for complex batch processing rules.</p>
              <ArrowRight size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-8 bg-workspace border border-border rounded-xl group hover:border-[#3f3f46] transition-colors">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#52525b] mb-4">Privacy</h3>
              <h4 className="text-xl font-bold mb-3 uppercase tracking-tighter">Local Stack</h4>
              <p className="text-xs text-[#52525b] leading-relaxed mb-6">Zero latency processing. Files stay in your browser, never hitting a server.</p>
              <Zap size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-border bg-surface-dim">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-6 tracking-tight">
              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                <div className="w-2.5 h-2.5 border-2 border-black rotate-45"></div>
              </div>
              SizePilot
            </div>
            <p className="text-[#52525b] text-sm max-w-xs leading-relaxed">
              Geometric file optimization workspace for professional engineers and creative teams.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-16">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-6">Resources</h4>
              <ul className="space-y-3 text-[#52525b] text-xs font-medium">
                <li><Link to="/compress-image" className="hover:text-white transition-colors">Image Optimizer</Link></li>
                <li><Link to="/compress-video" className="hover:text-white transition-colors">Video Compressor</Link></li>
                <li><Link to="/compress-pdf" className="hover:text-white transition-colors">PDF Tools</Link></li>
                <li><Link to="/batch" className="hover:text-white transition-colors">Batch Jobs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-6">Governance</h4>
              <ul className="space-y-3 text-[#52525b] text-xs font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Protocol</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-border text-[9px] uppercase tracking-[0.2em] font-mono text-[#3f3f46] flex justify-between">
          <span>&copy; 2026 SIZEPILOT LABS</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
