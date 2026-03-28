import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import ConnectClubLogo, { ConnectClubShield } from './ConnectClubLogo';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  DollarSign,
  Calculator,
  GraduationCap,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/marketplace', label: 'Opportunities', icon: Briefcase },
  { path: '/introductions', label: 'Introductions', icon: ChevronRight },
  { path: '/commissions', label: 'Commissions', icon: DollarSign },
  { path: '/network', label: 'My Network', icon: Users },
  { path: '/tax-center', label: 'Tax Center', icon: Calculator },
  { path: '/education', label: 'Education', icon: GraduationCap },
];

const adminItems = [
  { path: '/admin', label: 'Admin Panel', icon: Settings },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-toggle"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="ml-4">
          <ConnectClubShield className="h-10" />
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'} lg:translate-x-0`}
        data-testid="sidebar"
      >
        <div className="p-4 border-b border-border">
          <ConnectClubLogo className="h-14" />
        </div>

        <nav className="p-4 flex flex-col h-[calc(100vh-88px)]">
          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  data-testid={`nav-${item.path.slice(1)}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <span className="overline px-4">Admin</span>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`nav-${item.path.slice(1)}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* User section */}
          <div className="pt-4 border-t border-border">
            <div className="px-4 py-2">
              <p className="font-medium text-sm truncate">{user?.name || 'Member'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
