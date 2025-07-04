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

export default function HomePage() {
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
            {/* Header */}
            <div className="navbar bg-purple-700 text-white px-8 py-6 shadow-md min-h-[100px] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <img
                        src="https://via.placeholder.com/40"  // Replace with your logo URL
                        alt="Event Manager Logo"
                        className="w-10 h-10"
                    />
                    <span className="text-3xl font-extrabold tracking-wide">🎟️ Event Manager</span>
                </div>

                <div className="flex space-x-3">
                    <button
                        className="btn btn-sm bg-[#39FF14] text-black hover:bg-[#32e010] rounded-full px-5 py-2 text-base font-medium transition-all duration-300"
                        onClick={() => router.push('/login')}
                    >
                        Login
                    </button>
                    <button
                        className="btn btn-sm bg-orange-600 text-white hover:bg-orange-700 rounded-full px-5 py-2 text-base font-medium transition-all duration-300"
                        onClick={() => router.push('/register')}
                    >
                        Register
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="hero min-h-[30vh] py-8 bg-gradient-to-br from-purple-100 via-white to-purple-200 text-center">
                <div className="hero-content flex-col">
                    <h1 className="text-4xl font-extrabold text-purple-700">Discover & Join the Best Events Around You</h1>
                    <p className="py-4 max-w-xl text-gray-600">
                        Browse exciting events, book your spot, and never miss a moment. Your next experience awaits!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-1/2">
                        <input
                            type="text"
                            placeholder="Search by title or location"
                            className="input bg-white border border-black w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Events Section */}
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
                                        <div>
                                            <strong className="text-purple-700">📅 Date:</strong> {event.date} at 🕒 {event.time}
                                        </div>
                                        <div>
                                            <strong className="text-purple-700">📍 Venue:</strong> {event.venue.name}, {event.venue.location}
                                        </div>
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

            {/* Why Choose Us Section */}
            <section className="bg-gradient-to-r from-purple-50 via-white to-purple-100 py-12 text-center">
                <h2 className="text-3xl font-bold mb-6 text-purple-700">💡 Why Choose Event Manager?</h2>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3 px-6">
                    <div className="p-4 rounded-lg bg-white border shadow">
                        <h3 className="font-bold text-lg text-purple-600">🎯 Easy Registration</h3>
                        <p className="text-sm text-gray-600">Seamless registration and ticket booking experience.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white border shadow">
                        <h3 className="font-bold text-lg text-purple-600">🗺️ Discover Events</h3>
                        <p className="text-sm text-gray-600">Find events by location, date, or category in seconds.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white border shadow">
                        <h3 className="font-bold text-lg text-purple-600">🔔 Instant Updates</h3>
                        <p className="text-sm text-gray-600">Get notifications and reminders about your events.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer items-center p-6 bg-purple-700 text-white mt-10">
                <div className="items-center grid-flow-col">
                    <p>© {new Date().getFullYear()} Event Manager. All rights reserved.</p>
                </div>
                <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                    <a className="link link-hover text-white">Terms</a>
                    <a className="link link-hover text-white">Privacy</a>
                    <a className="link link-hover text-white">Contact</a>
                </div>
            </footer>
        </div>
    )
}
