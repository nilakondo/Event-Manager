// app/user-notifications/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function NotificationDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .get(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotification(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Notification not found.');
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <span className="loading loading-dots loading-lg text-purple-700" />
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-red-500 text-lg">{error || 'Notification not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-purple-100">
        <button
          onClick={() => router.push('/user-notifications')}
          className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Notifications
        </button>

        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          {notification.event?.title || 'Notification'}
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          {new Date(notification.createdAt).toLocaleString()}
        </p>

        <div className="whitespace-pre-wrap text-gray-800 text-base">{notification.message}</div>
      </div>
    </div>
  );
}
