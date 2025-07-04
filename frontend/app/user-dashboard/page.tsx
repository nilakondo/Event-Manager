'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  TicketIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { TicketIcon as TicketSolidIcon } from '@heroicons/react/24/solid';
import api from '@/lib/axios';

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
        console.log('Token Payload:', payload);

        setIsAuthenticated(true);
        setUserName(payload.name || 'User'); // Get user name from the token's payload
        // If the user's role is not 'user', redirect them (in case they are an admin)
        if (payload.role !== 'user') {
          router.push('/');
        }
      } catch {
        router.push('/login'); // Redirect to login if token is invalid
      }
    } else {
      router.push('/login'); // If there's no token, redirect to login
    }

    setLoading(false); // Once the token check is done, stop loading
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token on logout
    setIsAuthenticated(false);
    router.push('/login'); // Redirect to login after logout
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null; // If not authenticated, show nothing

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-6 flex flex-col border-r border-slate-700">
        <div className="flex items-center mb-10">
          <span className="text-2xl font-bold tracking-tight text-white">Event Manager</span>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<CalendarDaysIcon className="h-5 w-5" />} text="Search Events" href="/upcoming-events" />
          <SidebarLink icon={<TicketSolidIcon className="h-5 w-5" />} text="Registered Events" href="/registered-events" />
          <SidebarLink icon={<BellIcon className="h-5 w-5" />} text="Notifications" href="/user-notifications" />
          <SidebarLink icon={<TicketIcon className="h-5 w-5" />} text="My Tickets" href="/my-tickets" />
        </nav>
        <div className="mt-auto text-sm pt-6 border-t border-slate-700 text-slate-400">
          <p>Event Portal</p>
          <p className="mt-1">© 2025 All Rights Reserved</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          {/* Dynamic welcome message */}
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
              icon={<CalendarDaysIcon className="h-10 w-10 text-blue-500" />}
              title="Search Upcoming Events"
              description="Find and explore new events to join."
              href="/upcoming-events"
            />
            <NavigationCard
              icon={<TicketSolidIcon className="h-10 w-10 text-pink-500" />}
              title="Registered Events"
              description="View and manage your registered events."
              href="/registered-events"
            />
            <NavigationCard
              icon={<BellIcon className="h-10 w-10 text-yellow-500" />}
              title="Notifications"
              description="Read notifications from organizers."
              href="/user-notifications"
            />
            <NavigationCard
              icon={<TicketIcon className="h-10 w-10 text-green-500" />}
              title="My Tickets"
              description="Download your tickets in PDF format."
              href="/my-tickets"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

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
