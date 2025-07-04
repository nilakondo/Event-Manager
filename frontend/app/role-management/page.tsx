'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

// UserRole type definition
export type UserRole = 'admin' | 'user';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export default function RoleManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      setError('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (email: string, newRole: UserRole) => {
    const adminCount = users.filter((u) => u.role === 'admin').length;

    // Prevent removing last admin
    if (newRole === 'user') {
      const targetUser = users.find((u) => u.email === email);
      if (targetUser?.role === 'admin' && adminCount <= 1) {
        setError('At least one admin must remain.');
        return;
      }
    }

    try {
      await api.patch('/users/role', { email, role: newRole });
      setError('');
      fetchUsers();
    } catch (err: any) {
      setError('Failed to update role');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage User Roles</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="min-w-full bg-white border border-gray-200 rounded-md overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="py-3 px-4 border-b">Name</th>
            <th className="py-3 px-4 border-b">Email</th>
            <th className="py-3 px-4 border-b">Role</th>
            <th className="py-3 px-4 border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isOnlyAdmin =
              user.role === 'admin' &&
              users.filter((u) => u.role === 'admin').length === 1;

            return (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4 capitalize">{user.role}</td>
                <td className="py-3 px-4">
                  {user.role === 'user' ? (
                    <button
                      onClick={() => handleRoleChange(user.email, 'admin')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(user.email, 'user')}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm disabled:opacity-50"
                      disabled={isOnlyAdmin}
                    >
                      Revoke Admin
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
