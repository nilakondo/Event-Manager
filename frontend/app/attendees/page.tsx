'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'
import {
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

type Event = {
  id: number
  title: string
  bannerUrl?: string
  date: string
  venue: {
    name: string
    location: string
  }
}

type Attendee = {
  id: number
  name: string
  email: string
  createdAt: string
  ticketType: {
    name: string
    price: number
  }
}

export default function AttendeePage() {
  const router = useRouter()

  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events')
        setEvents(res.data)
        setFilteredEvents(res.data)
      } catch {
        setError('Failed to fetch events')
      }
    }

    fetchEvents()
  }, [])

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(term) ||
      event.venue?.name?.toLowerCase().includes(term) ||
      event.date.toLowerCase().includes(term)
    )
    setFilteredEvents(filtered)
  }, [searchTerm, events])

  // Load attendees
  useEffect(() => {
    if (!selectedEvent) return

    const fetchAttendees = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/attendees/event/${selectedEvent}`)
        setAttendees(res.data)
      } catch {
        setError('Failed to load attendees')
      } finally {
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [selectedEvent])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this attendee?')) return

    try {
      await api.delete(`/attendees/${id}`)
      setAttendees((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('Failed to delete attendee')
    }
  }

  const handleDownloadCSV = async () => {
    try {
      const res = await api.get(`/attendees/${selectedEvent}/download`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `event-${selectedEvent}-attendees.csv`)
      document.body.appendChild(link)
      link.click()
    } catch {
      alert('Failed to download CSV')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-bold"
        >
          <ArrowLeftIcon className="h-6 w-6 mr-1" />
          Back to Dashboard
        </button>

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Attendee Management</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search events by title, venue, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event.id)}
              className={`cursor-pointer border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition ${
                selectedEvent === event.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={
                  event.bannerUrl || 'https://via.placeholder.com/400x200.png?text=No+Banner'
                }
                alt={event.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.venue?.name} — {event.date}</p>
                {selectedEvent === event.id && (
                  <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Selected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Download Button */}
        {selectedEvent && attendees.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>
        )}

        {/* Attendee List */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Attendees</h3>
          {loading ? (
            <p>Loading attendees...</p>
          ) : attendees.length === 0 ? (
            <p className="text-gray-500">No attendees found for this event.</p>
          ) : (
            <ul className="space-y-3">
              {attendees.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center p-4 border rounded-md shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">{a.name}</p>
                    <p className="text-sm text-gray-500">{a.email}</p>
                    <p className="text-sm text-gray-600">
                      {a.ticketType?.name} — BDT {Number(a.ticketType?.price).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
