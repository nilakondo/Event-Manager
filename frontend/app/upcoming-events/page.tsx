'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

type TicketType = {
  id: number
  name: string
  price: string
  quantity: number
  registeredCount: number
  remainingTickets: number
}

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
  bannerUrl?: string
  venue: Venue
  ticketTypes: TicketType[]
  remainingTickets: number
}

export default function UpcomingEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
  }, [])

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.venue.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100">
      {/* Header (no login/register buttons) */}
      <div className="navbar bg-purple-700 text-white px-8 py-6 shadow-md min-h-[100px] flex items-center">
        <div className="flex items-center space-x-3">
          <img src="https://via.placeholder.com/40" alt="Event Manager Logo" className="w-10 h-10" />
          <span className="text-3xl font-extrabold tracking-wide">🎟️ Event Manager</span>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-sm bg-purple-600 text-white rounded-full px-4 py-2 hover:bg-purple-700 ml-auto"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Search */}
      <div className="hero min-h-[30vh] py-8 bg-gradient-to-br from-purple-100 via-white to-purple-200 text-center">
        <div className="hero-content flex-col">
          <h1 className="text-4xl font-extrabold text-purple-700">Find Events You Love</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-1/2 mt-4">
            <input
              type="text"
              placeholder="Search by title or location"
              className="input bg-white border border-black w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <section className="px-6 py-12">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-purple-700">🎉 Upcoming Events</h2>
        {filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">No events found.</p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map(event => (
              <div key={event.id} className="card bg-white shadow-lg hover:shadow-2xl transition border border-purple-100 rounded-lg">
                <figure>
                  <img
                    src={event.bannerUrl || 'https://via.placeholder.com/400x200?text=Event+Banner'}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </figure>
                <div className="card-body">
                  <h3 className="text-2xl font-bold text-purple-700 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{event.description.slice(0, 100)}...</p>

                  <div className="text-sm mt-2 text-gray-700 space-y-2">
                    <div><strong className="text-purple-700">📅 Date:</strong> {event.date} at 🕒 {event.time}</div>
                    <div><strong className="text-purple-700">📍 Venue:</strong> {event.venue.name}, {event.venue.location}</div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {event.ticketTypes.length > 0 ? (
                      event.ticketTypes.map(ticket => (
                        <div key={ticket.id} className="text-xs text-gray-600">
                          🎟️ <span className="font-semibold">{ticket.name}</span> — {ticket.price}৳ ({ticket.remainingTickets} left)
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-red-500">No ticket types available</div>
                    )}
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => router.push(`/register/${event.id}`)}
                      className={`btn btn-sm bg-orange-500 text-white hover:bg-orange-600 rounded-full px-4 py-1.5 text-sm ${event.remainingTickets === 0 ? 'btn-disabled' : ''}`}
                      disabled={event.remainingTickets === 0}
                    >
                      {event.remainingTickets === 0 ? 'Sold Out' : 'Register Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
