import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Home, Star, BarChart3, ShieldCheck, CreditCard, BookOpen, Settings, Bell, Search, Menu, X, UserCircle } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
const NAV_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['tenant', 'owner', 'admin'] },
    { name: 'Boardings', icon: Home, path: '/boardings', roles: ['tenant', 'owner', 'admin'] },
    { name: 'Bookings', icon: BookOpen, path: '/bookings', roles: ['tenant', 'owner'] },
    { name: 'Payments', icon: CreditCard, path: '/payments', roles: ['tenant', 'owner'] },
    { name: 'Reviews', icon: Star, path: '/reviews', roles: ['tenant', 'owner', 'admin'] },
    { name: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['owner', 'admin'] },
    { name: 'Moderation', icon: ShieldCheck, path: '/moderation', roles: ['admin'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['tenant', 'owner', 'admin'] },
];
export function DashboardLayout() {
    const { role, setRole } = useRole();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const filteredNavItems = NAV_ITEMS.filter(item => item.roles.includes(role));
    return (<div className="flex h-screen bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (<div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
              <span className="font-poppins font-bold text-xl tracking-tight">RentEase</span>
            </Link>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => (<Link key={item.name} to={item.path} className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                  ${location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `} onClick={() => setIsSidebarOpen(false)}>
                <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}/>
                <span className="font-medium text-sm">{item.name}</span>
                {location.pathname === item.path && (<div className="ml-auto w-1 h-4 bg-blue-600 rounded-full"/>)}
              </Link>))}
          </nav>

          {/* Footer Sidebar Info */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 font-medium mb-1">CURRENT ROLE</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold capitalize text-slate-900">{role}</span>
                <div className="w-2 h-2 rounded-full bg-green-500"/>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 z-30">
          <div className="flex items-center gap-6 flex-1">
            <button className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-600"/>
            </button>
            <div className="relative max-w-xl w-full hidden md:block group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
              <input type="text" placeholder="Search boarding near Malabe..." className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-[15px] font-medium text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm"/>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-3 hover:bg-slate-50 rounded-2xl relative transition-all duration-300 group">
              <Bell className="w-6 h-6 text-slate-600 group-hover:text-blue-600"/>
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-[2.5px] border-white ring-2 ring-red-100"/>
            </button>
            
            <div className="h-8 w-px bg-slate-100 mx-2"/>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-4 py-2 px-3 hover:bg-slate-50 rounded-2xl transition-all duration-300 group">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[15px] font-bold text-slate-900 leading-none mb-1">John Doe</span>
                    <span className="text-[12px] text-slate-400 font-semibold capitalize tracking-wide">{role}</span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100 ring-4 ring-blue-50/50 group-hover:scale-105 transition-transform">
                    JD
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 mt-2">
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Platform Switcher</p>
                  <p className="text-xs text-slate-500">Change your perspective on RentEase</p>
                </div>
                <DropdownMenuItem onClick={() => setRole('tenant')} className={`rounded-xl px-4 py-3 mb-1 gap-3 ${role === 'tenant' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'tenant' ? 'bg-blue-100' : 'bg-slate-50 text-slate-400'}`}>
                    <UserCircle className="w-4 h-4"/>
                  </div>
                  Tenant Platform
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('owner')} className={`rounded-xl px-4 py-3 mb-1 gap-3 ${role === 'owner' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'owner' ? 'bg-blue-100' : 'bg-slate-50 text-slate-400'}`}>
                    <Home className="w-4 h-4"/>
                  </div>
                  Owner Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('admin')} className={`rounded-xl px-4 py-3 mb-1 gap-3 ${role === 'admin' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'admin' ? 'bg-blue-100' : 'bg-slate-50 text-slate-400'}`}>
                    <ShieldCheck className="w-4 h-4"/>
                  </div>
                  Central Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50"/>
                <DropdownMenuItem className="rounded-xl px-4 py-3 text-red-500 font-bold hover:bg-red-50">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                    <X className="w-4 h-4"/>
                  </div>
                  Logout Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>);
}

