import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building,
  Shield,
  CreditCard,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  Users,
  Zap,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform duration-300">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Tenantly <span className="text-blue-600 font-medium">Portal</span></span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-slate-100/60"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 py-2 px-4 rounded-xl shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/60 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold text-blue-700 tracking-wide uppercase shadow-sm">
              <Zap className="h-3.5 w-3.5 text-blue-600 fill-blue-100" />
              <span>Next-Gen Rental Management</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Modernizing the Rent & Lease Experience for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Everyone</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto mb-10">
              A unified platform for landlords and tenants. Manage flats, coordinate digital agreements, track automated rent schedules, and process payments effortlessly.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200 group text-base"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl shadow-sm hover:shadow transition-all duration-200 text-base"
              >
                <span>See Features</span>
              </a>
            </div>
          </div>

          {/* Interactive CSS App Mockup */}
          <div className="relative max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-3 sm:p-4 md:p-6 shadow-blue-900/5">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4 sm:mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="h-4 w-40 bg-slate-100 rounded-md ml-4 text-[10px] text-slate-400 flex items-center justify-center">
                portal.Tenantly.com
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Sidebar Mock */}
              <div className="md:col-span-1 border-r border-slate-100 pr-0 md:pr-6 hidden md:block">
                <div className="space-y-4">
                  <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <div className="h-2 w-20 bg-slate-800 rounded" />
                  </div>
                  <div className="space-y-2 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 rounded-lg px-3 flex items-center space-x-3">
                        <div className="h-4 w-4 rounded-full bg-slate-200" />
                        <div className="h-2 w-16 bg-slate-300 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area Mock */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-800 rounded" />
                    <div className="h-2.5 w-48 bg-slate-400 rounded" />
                  </div>
                  <span className="inline-flex h-6 w-20 bg-emerald-100 rounded-full text-emerald-700 text-[10px] font-bold items-center justify-center">
                    All Clear
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-400 rounded" />
                      <div className="h-4 w-24 bg-slate-800 rounded" />
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-slate-400 rounded" />
                      <div className="h-4 w-24 bg-slate-800 rounded" />
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="h-3 w-28 bg-slate-700 rounded" />
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-200/60 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="h-7 w-7 rounded-full bg-slate-200" />
                          <div className="space-y-1">
                            <div className="h-2.5 w-16 bg-slate-800 rounded" />
                            <div className="h-1.5 w-24 bg-slate-400 rounded" />
                          </div>
                        </div>
                        <div className="h-5 w-16 bg-blue-100 rounded-md flex items-center justify-center text-[10px] font-bold text-blue-700">
                          Review
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl mb-4">
              Everything you need in a rental ecosystem
            </h2>
            <p className="text-lg text-slate-600">
              Forget clunky spreadsheets and scattered chats. Tenantly brings structure, verification, and transparency to lease cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Flat & Property Directory</h3>
              <p className="text-slate-600 leading-relaxed">
                Add, organize, and view all properties and rooms dynamically. Easily keep tabs on lease status, flat vacancies, and tenant profiles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Rent & Payment Tracker</h3>
              <p className="text-slate-600 leading-relaxed">
                Seamlessly track rent obligations, security deposits, and transaction history. Upload receipts to get verification instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Tenant Approvals</h3>
              <p className="text-slate-600 leading-relaxed">
                Review and approve tenants as a landlord before granting access. Ensure security by manually approving lease connections.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-12 w-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Lease Document Hub</h3>
              <p className="text-slate-600 leading-relaxed">
                Access your digital rental agreements and security documents anytime. A centralized vault prevents disputes and keeps data safe.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Approvals Ledger</h3>
              <p className="text-slate-600 leading-relaxed">
                Real-time dashboard queues for outstanding tenant requests, payment confirmations, and lease adjustments. Less admin, more speed.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Two-Sided Synergy</h3>
              <p className="text-slate-600 leading-relaxed">
                Separate tailored experiences optimized specifically for what you need—whether you are listing multiple properties or paying monthly rent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Segmentation Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl mb-4">
              Designed for both sides of the lease
            </h2>
            <p className="text-lg text-slate-600">
              Tenantly bridges the communication gap between property managers and residents.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Landlord Features Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/50 rounded-full px-3 py-1 mb-6 text-xs font-semibold text-blue-700">
                  <span>For Landlords & Managers</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Minimize Administration. Maximize Profit.</h3>
                <p className="text-slate-600 mb-6">
                  Manage multiple rooms, flat inventories, rent payment logs, and tenant connection requests directly from an integrated dashboard dashboard.
                </p>
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Create flat listings with specific rent & security configurations',
                    'View consolidated financial balances and deposit statements',
                    'Manually approve or reject tenant registration requests',
                    'Confirm rent payment receipts uploaded by tenants'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center space-x-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 mt-4 group"
              >
                <span>Register as Landlord</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Tenant Features Card */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/50 rounded-full px-3 py-1 mb-6 text-xs font-semibold text-emerald-700">
                  <span>For Tenants & Residents</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Pay Rent Safely. Hold Lease Records.</h3>
                <p className="text-slate-600 mb-6">
                  Log in to check due balances, review active security deposits, easily upload receipt proofs, and review agreements in your secure portal.
                </p>
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Register and link to your flat within seconds',
                    'View clear monthly rent balances and security deposits',
                    'Upload payment receipt files/images to verify rent',
                    'Access tenancy documents digitally anytime, anywhere'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center space-x-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 mt-4 group"
              >
                <span>Sign Up as Tenant</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Callout */}
      <section className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">99.9%</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">On-Time Approvals</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-1">500+</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Active Leases</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">₹1Cr+</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Rents Collected</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 mb-1">24/7</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Agreement Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to upgrade your property experience?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Get started today. Whether you're a landlord managing multiple properties or a tenant trying to log rent receipts, Tenantly Portal has got you covered.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all duration-150 active:scale-[0.99] text-base"
            >
             Join Now!
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700/60 transition-all duration-150 active:scale-[0.99] text-base"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-slate-950 text-slate-500 py-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-400 tracking-tight">Tenantly Portal</span>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Tenantly. All rights reserved. Built with modern styling & rich user experience.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;