import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="w-full border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <Image src="/logo.svg" alt="Stapler Logo" width={100} height={32} className="object-contain" priority />
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="#home" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Home</Link>
              <Link href="#process" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Process</Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-white to-slate-50">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-tight">
          We bring <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">solutions</span> to make life easier.
        </h1>
        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Transform any website into a professional, conversion-focused brand in minutes using our Generative AI Agent.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Get Started for Free
            </Button>
          </Link>
        </div>
        
        {/* Placeholder for Hero Video/Image */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden aspect-video flex items-center justify-center relative group cursor-pointer">
           <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/10 transition-colors z-10"></div>
           <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl z-20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 brightness-0 invert">
            <Image src="/logo.svg" alt="Stapler Logo" width={100} height={32} className="object-contain" />
          </div>
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Stapler AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
