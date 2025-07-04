'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeft } from 'lucide-react';

export default function RegisteredEventsPage() {
  const router = useRouter();
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      api
        .get(`/attendees/user/${payload.sub}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setRegisteredEvents(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch registered events');
          setLoading(false);
        });
    } catch {
      router.push('/login');
    }
  }, [router]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.push('/user-dashboard')}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-purple-700 mb-8 text-center">🎟️ My Registered Events</h1>

      {registeredEvents.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t registered for any events yet.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {registeredEvents.map((eventWrapper) => {
            const event = eventWrapper.event;
            if (!event || !event.id) return null;

            return (
              <div
                key={eventWrapper.id}
                className="card bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-all"
              >
                <figure>
                  <img
                    src={event?.bannerUrl || 'https://via.placeholder.com/400x200?text=Event+Banner'}
                    alt={event?.title || 'Event Banner'}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </figure>
                <div className="card-body p-5">
                  <h3 className="text-xl font-bold text-purple-700 mb-2">{event?.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {event?.description?.slice(0, 100)}...
                  </p>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div>
                      <strong>📅 Date:</strong> {event?.date} at 🕒 {event?.time}
                    </div>
                    <div>
                      <strong>📍 Venue:</strong> {event?.venue?.name}, {event?.venue?.location}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
