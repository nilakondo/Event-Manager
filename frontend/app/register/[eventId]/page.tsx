'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';

export default function RegisterEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.eventId);

  const [event, setEvent] = useState<any>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!eventId) return;

    api.get(`/events/${eventId}`)
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch event data');
        setLoading(false);
      });
  }, [eventId]);

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!selectedTicketId) {
      setError('Please select a ticket type');
      return;
    }

    try {
      await api.post(
        `/attendees/${eventId}/register/${selectedTicketId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Successfully registered!');
      setTimeout(() => router.push('/user-dashboard'), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading event...</div>;
  }

  if (!event) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">{event.title}</h1>
      <p className="text-gray-700 mb-6">{event.description}</p>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Select a Ticket Type:</h2>
        {event.ticketTypes.length > 0 ? (
          <ul className="space-y-3">
            {event.ticketTypes.map((ticket: any) => (
              <li
                key={ticket.id}
                className={`p-4 border rounded cursor-pointer hover:bg-purple-50 ${selectedTicketId === ticket.id ? 'border-purple-600' : 'border-gray-300'}`}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{ticket.name}</span>
                  <span className="text-purple-700 font-semibold">{ticket.price}৳</span>
                </div>
                <p className="text-sm text-gray-600">
                  Available: {ticket.remainingTickets}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">No ticket types available.</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

      <button
        onClick={handleRegister}
        className="btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        disabled={!selectedTicketId}
      >
        Confirm Registration
      </button>
    </div>
  );
}
