'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid'

type Venue = {
  id: number
  name: string
  location: string
}

type Event = {
  id: number
  title: string
  description: string
  date: string
  time: string
  venue: {
    name: string
    location: string
  }
  bannerUrl?: string
}

export default function EventPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venueId, setVenueId] = useState<number | string>('')
  const [bannerUrl, setBannerUrl] = useState('')

  const [venues, setVenues] = useState<Venue[]>([])
  const [events, setEvents] = useState<Event[]>([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [dateWarning, setDateWarning] = useState<string>('')

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserRole(payload.role)
    }
  }, [])

  useEffect(() => {
    fetchVenues()
    fetchEvents()
  }, [])

  const fetchVenues = async () => {
    try {
      const res = await api.get('/venues')
      setVenues(res.data)
    } catch {
      setError('Failed to load venues')
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events')
      setEvents(res.data)
    } catch {
      setError('Failed to load events')
    }
  }

  const validateDateTime = (date: string, time: string) => {
    if (!date || !time) return ''
    const selected = new Date(`${date}T${time}`)
    const now = new Date()
    return selected < now ? 'Event cannot be in the past.' : ''
  }

  useEffect(() => {
    const warning = validateDateTime(date, time)
    setDateWarning(warning)
  }, [date, time])

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (userRole !== 'admin') {
      setError('You do not have permission to modify events.')
      return
    }

    const selectedDateTime = new Date(`${date}T${time}`)
    if (selectedDateTime < new Date()) {
      setError('You cannot create an event in the past.')
      return
    }

    const token = localStorage.getItem('token')
    const eventData = {
      title,
      description,
      date,
      time,
      venueId: Number(venueId),
      bannerUrl
    }

    try {
      setLoading(true)
      await api.post('/events', eventData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      resetForm()
      fetchEvents()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (userRole !== 'admin') {
      setError('You do not have permission to delete events.')
      return
    }

    try {
      await api.delete(`/events/${id}`)
      fetchEvents()
      setConfirmDeleteId(null)
    } catch {
      alert('Failed to delete event')
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDate('')
    setTime('')
    setVenueId('')
    setBannerUrl('')
    setDateWarning('')
    setError('')
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

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Create Event</h2>

        <form
          onSubmit={handleCreateOrUpdate}
          className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 space-y-4"
        >
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Event Details</h3>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {dateWarning && <p className="text-sm text-red-500 mt-1">{dateWarning}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Select Venue</label>
            <select
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Venue --</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} ({venue.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Banner Preview"
                className="w-full h-48 object-cover mt-2 rounded-md border"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            disabled={loading || !!dateWarning}
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>

{/* Existing Events */}
<div className="mt-10">
  <h3 className="text-2xl font-semibold text-slate-800 mb-4">Existing Events</h3>
  {events.length === 0 ? (
    <p className="text-gray-500 text-sm">No events available.</p>
  ) : (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-sm border flex flex-col md:flex-row overflow-hidden"
        >
          {event.bannerUrl && (
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-40 w-full md:w-52 object-cover"
            />
          )}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <h4 className="text-xl font-semibold text-slate-800">{event.title}</h4>
              <p className="text-sm text-gray-600">
                {event.date} at {event.time} — {event.venue?.name}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push(`/events/${event.id}/edit`)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setConfirmDeleteId(event.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


        {/* Confirmation Modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Confirm Deletion</h4>
              <p className="text-sm text-gray-600">Are you sure you want to delete this event?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
