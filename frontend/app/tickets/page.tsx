'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import { PencilSquareIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

type Event = {
  id: number
  title: string
  bannerUrl?: string
}

type TicketType = {
  id: number
  name: string
  price: number
  quantity: number
  event?: Event
}

export default function TicketPage() {
  const router = useRouter()

  const [events, setEvents] = useState<Event[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [eventId, setEventId] = useState<number | string>('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchTickets()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events')
      setEvents(res.data)
    } catch {
      setError('Failed to load events.')
    }
  }

  const fetchTickets = async () => {
    try {
      const res = await api.get('/ticket-types')
      setTickets(res.data)
    } catch {
      setError('Failed to load tickets.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const parsedEventId = Number(eventId)
    const parsedPrice = parseFloat(price)
    const parsedQuantity = parseInt(quantity)

    if (!name || isNaN(parsedEventId) || isNaN(parsedPrice) || isNaN(parsedQuantity)) {
      setError('Please fill all fields correctly.')
      setLoading(false)
      return
    }

    const data = {
      name,
      price: parsedPrice,
      quantity: parsedQuantity,
      eventId: parsedEventId,
    }

    try {
      if (editingId !== null) {
        await api.patch(`/ticket-types/${editingId}`, data)
        await fetchTickets() // ✅ Refetch after edit
      } else {
        const res = await api.post('/ticket-types', data)
        setTickets(prev => [...prev, res.data])
      }
      resetForm()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setPrice('')
    setQuantity('')
    setEventId('')
    setEditingId(null)
  }

  const handleEdit = (ticket: TicketType) => {
    setEditingId(ticket.id)
    setName(ticket.name)
    setPrice(ticket.price.toString())
    setQuantity(ticket.quantity.toString())
    setEventId(ticket.event?.id || '')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete(`/ticket-types/${id}`)
      setTickets(prev => prev.filter(t => t.id !== id))
    } catch {
      alert('Failed to delete ticket.')
    }
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

        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Manage Ticket Types</h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 space-y-4 mb-10"
        >
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {editingId ? 'Edit Ticket' : 'Add a New Ticket'}
          </h3>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Ticket Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price (BDT)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Select Event</label>
            <select
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? 'Saving...' : editingId ? 'Update Ticket' : 'Create Ticket'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Ticket List */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">All Tickets</h3>
          {tickets.length === 0 ? (
            <p className="text-gray-500">No tickets found.</p>
          ) : (
            <ul className="space-y-4">
              {tickets.map(ticket => (
                <li
                  key={ticket.id}
                  className="flex flex-col md:flex-row border rounded-lg shadow-sm overflow-hidden"
                >
                  {ticket.event?.bannerUrl && (
                    <img
                      src={ticket.event.bannerUrl}
                      alt={ticket.event.title}
                      className="h-32 w-full md:w-48 object-cover"
                    />
                  )}
                  <div className="flex flex-1 justify-between items-center p-4">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{ticket.name}</p>
                      <p className="text-sm text-gray-600">
                        ৳{ticket.price} • {ticket.quantity} available
                      </p>
                      <p className="text-sm text-gray-500">Event: {ticket.event?.title}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
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
