import { ArrowRight, Shield, Truck, Radio, BarChart3, Zap, Globe, Lock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { GetStartedButton } from '@/components/GetStartedButton';

const FEATURES = [
  {
    icon: Truck,
    title: 'Fleet Management',
    description: 'Monitor vehicle health, schedule maintenance, and optimize asset utilization across your entire fleet in real-time.',
  },
  {
    icon: Radio,
    title: 'Live Dispatch & Routing',
    description: 'AI-powered route optimization with live GPS tracking, dynamic re-routing, and automated driver assignment.',
  },
  {
    icon: Shield,
    title: 'Safety & Compliance',
    description: 'Automated safety inspections, regulatory compliance tracking, and incident reporting with full audit trails.',
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Fuel cost analysis, revenue forecasting, and operational expense tracking with actionable dashboards.',
  },
];

const ROLES = [
  { name: 'Fleet Manager', code: 'FLEET_MANAGER', desc: 'Full vehicle lifecycle management, maintenance scheduling, and fleet performance analytics.' },
  { name: 'Dispatcher', code: 'DISPATCHER', desc: 'Real-time route optimization, driver coordination, and live shipment tracking.' },
  { name: 'Safety Officer', code: 'SAFETY_OFFICER', desc: 'Compliance inspections, incident management, and regulatory audit preparation.' },
  { name: 'Financial Analyst', code: 'FINANCIAL_ANALYST', desc: 'Cost analysis, fuel spend tracking, revenue forecasting, and P&L dashboards.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-mono flex flex-col items-center transition-colors">

      {/* Structural Container */}
      <div className="w-full max-w-[1200px] min-h-screen border-x border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] flex flex-col relative transition-colors">

        <Navbar />

        {/* ═══════════════ HERO SECTION ═══════════════ */}
        <section className="flex flex-col items-center pt-24 pb-20 px-6 md:px-10">

          {/* Badge */}
          <div className="mb-6 flex items-center gap-2 text-[11px] font-mono tracking-wider text-gray-500 dark:text-gray-400 uppercase">
            <span>✦</span>
            <span>Enterprise Transit Operations Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-mono font-medium tracking-tight text-center max-w-3xl leading-[1.1] mb-6 text-black dark:text-white">
            The operational layer for your entire fleet.
          </h1>


          <p className="text-gray-500 dark:text-gray-400 text-center text-sm md:text-base max-w-xl mb-10 leading-relaxed">
            Manage live routes, fleet maintenance, safety compliance, and financial analytics — all from one secure, role-based platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <GetStartedButton />
            <a
              href="#features"
              className="border border-gray-300 dark:border-gray-700 text-[14px] font-semibold px-7 py-3.5 text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
            >
              Explore Platform
            </a>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* ═══════════════ FEATURES SECTION ═══════════════ */}
        <section id="features" className="py-20 px-6 md:px-10">
          <div className="text-center mb-16">
            <div className="mb-4 flex justify-center">
              <div className="text-[11px] font-mono tracking-wider text-gray-500 dark:text-gray-400 uppercase inline-flex items-center gap-2">
                <span>✦</span>
                <span>Core Capabilities</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black dark:text-white">
              Everything you need to run operations
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              Four integrated modules that cover the full spectrum of transit operations management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-[#0F0F0F] p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <feature.icon size={22} className="text-black dark:text-white shrink-0" />
                    <h3 className="text-lg font-bold tracking-tight text-black dark:text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
                <a href="#" className="mt-6 text-[13px] font-semibold text-black dark:text-white flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* ═══════════════ ROLES SECTION ═══════════════ */}
        <section id="roles" className="py-20 px-6 md:px-10">
          <div className="text-center mb-16">
            <div className="mb-4 flex justify-center">
              <div className="text-[11px] font-mono tracking-wider text-gray-500 dark:text-gray-400 uppercase inline-flex items-center gap-2">
                <span>✦</span>
                <span>Role-Based Access</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black dark:text-white">
              One platform, four operational views
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              Each team member sees exactly what they need. No clutter, no confusion — just their operational domain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            {ROLES.map((role, i) => (
              <div key={role.code} className="bg-white dark:bg-[#0F0F0F] p-8 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[13px] font-bold font-mono text-gray-500 dark:text-gray-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-black dark:text-white">{role.name}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{role.desc}</p>
                <div className="mt-4 text-[11px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {role.code}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* ═══════════════ INFRASTRUCTURE SECTION ═══════════════ */}
        <section id="infrastructure" className="py-20 px-6 md:px-10">
          <div className="text-center mb-16">
            <div className="mb-4 flex justify-center">
              <div className="text-[11px] font-mono tracking-wider text-gray-500 dark:text-gray-400 uppercase inline-flex items-center gap-2">
                <span>✦</span>
                <span>Built for Scale</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black dark:text-white">
              Enterprise-grade infrastructure
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
              Designed for reliability, security, and performance at every layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            {[
              { icon: Zap, title: 'Real-Time Processing', desc: 'Sub-second GPS updates and live dispatch with event-driven architecture.' },
              { icon: Globe, title: 'Multi-Region Ready', desc: 'Deploy across regions with automatic failover and data residency compliance.' },
              { icon: Lock, title: 'Zero-Trust Security', desc: 'RBAC enforcement, encrypted tokens, and complete audit logging on every action.' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-[#0F0F0F] p-8 md:p-10 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon size={20} className="text-black dark:text-white shrink-0" />
                  <h3 className="text-base font-bold tracking-tight text-black dark:text-white">{item.title}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* ═══════════════ CTA SECTION ═══════════════ */}
        <section className="py-20 px-6 md:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black dark:text-white">
            Ready to modernize your operations?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm leading-relaxed mb-8">
            Get started in seconds. Authenticate with your role and access your operational dashboard immediately.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[14px] font-semibold px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Sign In to Dashboard <ArrowRight size={16} />
          </Link>
        </section>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-800" />

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="py-10 px-6 md:px-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
                <path d="M12 2v20M17 5l-10 14M22 12H2M19 17L5 7" />
              </svg>
              <span className="font-bold text-sm tracking-tight text-black dark:text-white">TransitOps</span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-widest">
              © 2026 TransitOps. All rights reserved.
            </p>
          </div>

          <div className="flex gap-12 text-[13px]">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Platform</h4>
              <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                <li><a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#roles" className="hover:text-black dark:hover:text-white transition-colors">Roles</a></li>
                <li><a href="#infrastructure" className="hover:text-black dark:hover:text-white transition-colors">Infrastructure</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-3">Company</h4>
              <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}