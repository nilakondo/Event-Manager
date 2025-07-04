// app/user-notifications/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { BellIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function UserNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .get('/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, [router]);

  const handleClick = (id: number) => {
    router.push(`/user-notifications/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <span className="loading loading-dots loading-lg text-purple-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-sm mb-6 bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-center gap-2 mb-8">
          <BellIcon className="w-8 h-8 text-purple-700" />
          <h1 className="text-3xl font-bold text-purple-800">Your Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">You have no notifications right now.</p>
        ) : (
          <div className="grid gap-5">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleClick(notification.id)}
                className="bg-white border border-purple-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-5 rounded-xl cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-purple-700">
                    {notification.event?.title || 'Event'}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 line-clamp-2">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
