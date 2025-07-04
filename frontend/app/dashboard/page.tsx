'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BriefcaseIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { TicketIcon as TicketSolidIcon } from '@heroicons/react/24/solid';

interface SidebarLinkProps {
  icon: React.ReactNode;
  text: string;
  href: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, text, href }) => (
  <Link
    href={href}
    className="flex items-center space-x-3 p-3 rounded-lg text-gray-100 hover:bg-blue-600 hover:text-white transition-colors duration-200 font-medium"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAuthenticated(true);
        setUserName(payload.name || 'Admin');
        setUserRole(payload.role);

        if (payload.role !== 'admin') {
          router.push('/user-dashboard');
        }
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Loading home page...</p>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-6 flex flex-col border-r border-slate-700">
        <div className="flex items-center mb-10">
          <span className="text-2xl font-bold tracking-tight text-white">Event Manager</span>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<BuildingOffice2Icon className="h-5 w-5" />} text="Manage Venues" href="/venue" />
          <SidebarLink icon={<BriefcaseIcon className="h-5 w-5" />} text="Create Event" href="/events" />
          <SidebarLink icon={<TicketIcon className="h-5 w-5" />} text="Ticket Management" href="/tickets" />
          <SidebarLink icon={<UserGroupIcon className="h-5 w-5" />} text="Manage Attendees" href="/attendees" />
          <SidebarLink icon={<BellIcon className="h-5 w-5" />} text="Send Notification" href="/notifications" />
          <SidebarLink icon={<UserCircleIcon className="h-5 w-5" />} text="Role Management" href="/role-management" />
          {/* New Sidebar Link for All Events */}
          <SidebarLink icon={<TicketIcon className="h-5 w-5" />} text="All Events" href="/home" />
        </nav>
        <div className="mt-auto text-sm pt-6 border-t border-slate-700 text-slate-400">
          <p>Event Portal</p>
          <p className="mt-1">© 2025 All Rights Reserved</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-semibold text-slate-800">Welcome</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-600">
              <UserCircleIcon className="h-7 w-7" />
              <span className="font-medium">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <section className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NavigationCard
              icon={<BriefcaseIcon className="h-10 w-10 text-blue-500" />}
              title="Event Management"
              description="Add a new event to your portal."
              href="/events"
            />
            <NavigationCard
              icon={<BuildingOffice2Icon className="h-10 w-10 text-green-500" />}
              title="Manage Venues"
              description="Add or update event locations."
              href="/venue"
            />
            <NavigationCard
              icon={<TicketSolidIcon className="h-10 w-10 text-pink-500" />}
              title="Ticket Management"
              description="Add or update ticket types."
              href="/tickets"
            />
            <NavigationCard
              icon={<UserGroupIcon className="h-10 w-10 text-purple-500" />}
              title="Manage Attendees"
              description="View, add, or remove event participants."
              href="/attendees"
            />
            <NavigationCard
              icon={<BellIcon className="h-10 w-10 text-yellow-500" />}
              title="Send Notification"
              description="Send notifications to your event attendees."
              href="/notifications"
            />
            <NavigationCard
              icon={<UserCircleIcon className="h-10 w-10 text-indigo-500" />}
              title="Role Management"
              description="Update user roles (admin/user)."
              href="/role-management"
            />
            {/* All Events Card */}
            <NavigationCard
              icon={<TicketIcon className="h-10 w-10 text-teal-500" />}
              title="All Events"
              description="View all events created in your portal."
              href="/upcoming-events"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

interface NavigationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ icon, title, description, href }) => (
  <Link
    href={href}
    className="flex flex-col items-center p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition hover:scale-[1.02] duration-200 cursor-pointer"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </Link>
);
