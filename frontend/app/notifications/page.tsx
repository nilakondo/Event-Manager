'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

type Event = {
  id: number;
  title: string;
  bannerUrl?: string;
};

export default function SendNotificationPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch {
        setError('Failed to fetch events.');
      }
    };
    fetchEvents();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedEvent || !message) {
      setError('Please select an event and enter a message.');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/notifications/${selectedEvent.id}`, { message });
      setSuccess('✅ Notification sent successfully!');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleResetSelection = () => {
    setSelectedEvent(null);
    setMessage('');
    setSuccess('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full w-10 h-10"
        >
          <ArrowLeftIcon className="h-6 w-6 text-slate-700" />
        </button>

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Send Notification</h2>

        <form
          onSubmit={handleSendNotification}
          className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 space-y-6"
        >
          <h3 className="text-xl font-semibold text-slate-700">Select Event</h3>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Event Selection */}
          {selectedEvent ? (
            <div className="relative border rounded-xl overflow-hidden shadow-md ring-2 ring-blue-500">
              <img
                src={
                  selectedEvent.bannerUrl ||
                  'https://via.placeholder.com/400x200.png?text=No+Banner'
                }
                alt={selectedEvent.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3 flex justify-between items-center">
                <p className="font-semibold text-slate-700">{selectedEvent.title}</p>
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <button
                type="button"
                onClick={handleResetSelection}
                className="absolute top-2 right-2 text-xs bg-white text-red-500 px-2 py-1 rounded hover:bg-red-100"
              >
                Change Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleSelect(event)}
                  className="cursor-pointer border rounded-xl overflow-hidden shadow-md transition hover:shadow-lg"
                >
                  <img
                    src={
                      event.bannerUrl ||
                      'https://via.placeholder.com/400x200.png?text=No+Banner'
                    }
                    alt={event.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3 flex justify-between items-center">
                    <p className="font-semibold text-slate-700">{event.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message Input */}
          {selectedEvent && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1 mt-4">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Write your message here..."
                  className="w-full min-h-[150px] border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
                disabled={loading}
              >
                {loading ? 'Sending Notification...' : 'Send Notification'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
