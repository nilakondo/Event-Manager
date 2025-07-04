'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Ticket {
  id: number;
  name: string;
  email: string;
  ticketType: {
    name: string;
  };
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: {
      name: string;
      location: string;
    };
  };
}

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
          setTickets(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch tickets');
          setLoading(false);
        });
    } catch (err) {
      console.error('JWT parse error:', err);
      router.push('/login');
    }
  }, [router]);

  const handlePreview = async (ticketId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await api.get(`/attendees/${ticketId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url); // Preview in new tab
    } catch (err) {
      console.error('PDF preview failed:', err);
      alert('Failed to preview ticket PDF.');
    }
  };

  const handleDownload = async (ticketId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await api.get(`/attendees/${ticketId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download ticket PDF.');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading tickets...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* 🔙 Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/user-dashboard')}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold text-purple-700 mb-8 text-center">🎫 My Tickets</h1>

      {tickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets found.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-all">
              <div className="card-body p-6">
                <h3 className="text-xl font-bold text-purple-700 mb-2">{ticket.event.title}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>📅 Date:</strong> {ticket.event.date} at {ticket.event.time}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>📍 Venue:</strong> {ticket.event.venue.name}, {ticket.event.venue.location}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>🎟️ Ticket Type:</strong> {ticket.ticketType?.name}
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handlePreview(ticket.id)}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white w-full"
                  >
                    Preview PDF
                  </button>
                  <button
                    onClick={() => handleDownload(ticket.id)}
                    className="btn bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
