import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  Sparkles,
  Zap,
  BarChart3,
  Package,
  Search,
  Megaphone
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex sticky top-0 h-screen">
        {/* Logo area */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">Stapler</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 pb-2">Main</p>

          <Link href="/dashboard" className="flex items-center space-x-3 bg-blue-50 text-blue-700 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center transition-colors">
              <LayoutDashboard size={15} className="text-blue-600" />
            </div>
            <span className="text-sm">Analysis</span>
          </Link>

          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 pb-2 pt-3">Design Tools</p>

          <Link href="/dashboard/logo" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Sparkles size={15} className="text-slate-500 group-hover:text-slate-700" />
            </div>
            <span className="text-sm">Logo Designer</span>
          </Link>

          <Link href="/dashboard/charts" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <BarChart3 size={15} className="text-slate-500 group-hover:text-slate-700" />
            </div>
            <span className="text-sm">Charts</span>
          </Link>

          <Link href="/dashboard/brand-kit" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Package size={15} className="text-slate-500 group-hover:text-slate-700" />
            </div>
            <span className="text-sm">Brand Kit</span>
          </Link>

          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 pb-2 pt-3">Marketing</p>

          <Link href="/dashboard/seo" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Search size={15} className="text-slate-500 group-hover:text-slate-700" />
            </div>
            <span className="text-sm">SEO Analyzer</span>
          </Link>

          <Link href="/dashboard/social-content" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Megaphone size={15} className="text-slate-500 group-hover:text-slate-700" />
            </div>
            <span className="text-sm">Social Content</span>
          </Link>
        </nav>

        {/* Upgrade Banner */}
        <div className="mx-3 mb-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs font-bold text-blue-700 mb-1">✨ Pro Plan</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">Unlock unlimited analyses and premium TinyKit outputs.</p>
          <button className="mt-3 w-full text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition-colors shadow-sm">
            Upgrade Now
          </button>
        </div>

        {/* User Footer */}
        <div className="p-3 pt-0">
          <button className="flex w-full items-center space-x-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 rounded-xl font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <LogOut size={15} className="text-slate-500 group-hover:text-slate-700" />
            </div>
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-14 flex items-center px-4 justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-base">Stapler</span>
          </div>
          <button className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
