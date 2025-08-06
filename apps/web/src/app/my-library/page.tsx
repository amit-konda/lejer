'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'

interface Book {
  id: number
  title: string
  author: string
  description: string
  coverImage: string
  price: string
  maxSupply: string
  currentSupply: string
  isActive: boolean
  contractAddress: string
  tokenId: number
  createdAt: string
}

export default function MyLibraryPage() {
  const { isConnected, address } = useAccount()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected) {
      fetchMyBooks()
    }
  }, [isConnected])

  const fetchMyBooks = async () => {
    try {
      // For MVP, we'll fetch all books
      // In production, this would filter by user's NFT ownership
      const response = await fetch('/api/publish/books')
      const data = await response.json()
      if (data.success) {
        // Mock: show first 3 books as "owned"
        setBooks(data.books.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your library.
          </p>
          <Link
            href="/"
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              📚 Ledgerbound
            </Link>
            <nav className="flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Marketplace
              </Link>
              <Link href="/publish" className="text-gray-700 hover:text-gray-900">
                Publish
              </Link>
              <span className="text-indigo-600 font-medium">My Library</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            My Digital Library
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your collection of NFT books. Click on any book to start reading.
          </p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-3 aspect-h-4">
                  <img
                    src={book.coverImage || '/placeholder-cover.jpg'}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Token ID: {book.tokenId}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Owned
                    </span>
                  </div>
                  {book.contractAddress && (
                    <Link
                      href={`/read/${book.contractAddress}?tokenId=${book.tokenId}`}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center block"
                    >
                      Read Book
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your library is empty
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't purchased any books yet. Start building your collection!
            </p>
            <Link
              href="/"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        )}

        {/* Stats */}
        {books.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{books.length}</div>
                <div className="text-sm text-gray-600">Books Owned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {books.filter(book => book.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {books.length > 0 ? Math.floor(books.reduce((acc, book) => acc + parseFloat(book.price), 0) * 100) / 100 : 0}
                </div>
                <div className="text-sm text-gray-600">Total Value (MATIC)</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 