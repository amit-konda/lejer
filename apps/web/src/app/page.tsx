'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
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

export default function Home() {
  const { isConnected } = useAccount()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/publish/books')
      const data = await response.json()
      if (data.success) {
        setBooks(data.books)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">📚 Ledgerbound</h1>
            </div>
            
            <nav className="flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Marketplace
              </Link>
              <Link href="/publish" className="text-gray-700 hover:text-gray-900">
                Publish
              </Link>
              {isConnected && (
                <Link href="/my-library" className="text-gray-700 hover:text-gray-900">
                  My Library
                </Link>
              )}
              <ConnectButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Digital Books as NFTs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Own, trade, and read digital books securely on the blockchain. 
            Each book is tokenized as an NFT with built-in royalties for authors.
          </p>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">
                      {parseFloat(book.price).toFixed(2)} MATIC
                    </span>
                    <span className="text-sm text-gray-500">
                      {book.currentSupply}/{book.maxSupply} sold
                    </span>
                  </div>
                  {book.contractAddress && (
                    <Link
                      href={`/read/${book.contractAddress}?tokenId=${book.tokenId}`}
                      className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center block"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No books available yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to publish a book on Ledgerbound!
            </p>
            <Link
              href="/publish"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Publish Your Book
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
