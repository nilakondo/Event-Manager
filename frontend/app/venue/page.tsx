'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { PencilSquareIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid'

type Venue = {
  id: number
  name: string
  location: string
}

export default function VenuePage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchVenues = async () => {
    try {
      const res = await api.get('/venues')
      setVenues(res.data)
    } catch {
      setError('Failed to fetch venues.')
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (editingId !== null) {
        const res = await api.patch(`/venues/${editingId}`, { name, location })
        setVenues(prev => prev.map(v => (v.id === editingId ? res.data : v)))
        setEditingId(null)
      } else {
        const res = await api.post('/venues', { name, location })
        setVenues(prev => [...prev, res.data])
      }
      setName('')
      setLocation('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (venue: Venue) => {
    setEditingId(venue.id)
    setName(venue.name)
    setLocation(venue.location)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete(`/venues/${id}`)
      setVenues(prev => prev.filter(v => v.id !== id))
    } catch {
      alert('Failed to delete venue.')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setName('')
    setLocation('')
  }

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

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Venue Management</h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 space-y-4 mb-10"
        >
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {editingId ? 'Edit Venue' : 'Add a New Venue'}
          </h3>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Venue Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? 'Saving...' : editingId ? 'Update Venue' : 'Create Venue'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">All Venues</h3>
          {venues.length === 0 ? (
            <p className="text-gray-500">No venues found.</p>
          ) : (
            <ul className="space-y-3">
              {venues.map((venue) => (
                <li
                  key={venue.id}
                  className="flex justify-between items-center p-4 border rounded-md shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">{venue.name}</p>
                    <p className="text-sm text-gray-500">{venue.location}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(venue)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
