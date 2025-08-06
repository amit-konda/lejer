'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface BookContent {
  title: string
  chapters: Array<{
    title: string
    content: string
  }>
  metadata: {
    author: string
    language: string
    publisher: string
  }
}

export default function ReaderPage({ params }: { params: { contractAddress: string } }) {
  const { isConnected, address } = useAccount()
  const { signMessage } = useSignMessage()
  const searchParams = useSearchParams()
  const tokenId = searchParams.get('tokenId')

  const [bookContent, setBookContent] = useState<BookContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChapter, setCurrentChapter] = useState(0)

  const readBook = async () => {
    if (!isConnected || !address || !tokenId) {
      setError('Please connect your wallet and ensure you own this book')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create message for signature
      const message = `Access Ledgerbound Book\nContract: ${params.contractAddress}\nToken ID: ${tokenId}\nTimestamp: ${Date.now()}`

      // Sign message
      const signature = await signMessage({ message })

      // For MVP, we'll simulate the secure reader
      // In production, this would use the actual WASM module
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock book content
      const mockContent: BookContent = {
        title: 'Sample Book Title',
        chapters: [
          {
            title: 'Chapter 1: The Beginning',
            content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`
          },
          {
            title: 'Chapter 2: The Journey Continues',
            content: `Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`
          }
        ],
        metadata: {
          author: 'Sample Author',
          language: 'en',
          publisher: 'Ledgerbound'
        }
      }

      setBookContent(mockContent)
    } catch (error) {
      console.error('Error reading book:', error)
      setError('Failed to load book content. Please ensure you own this NFT.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && tokenId) {
      readBook()
    }
  }, [isConnected, tokenId])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to read this book.
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
    <div className="min-h-screen bg-gray-50">
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
              <span className="text-indigo-600 font-medium">Reader</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Book Content...
            </h2>
            <p className="text-gray-600">
              Verifying ownership and decrypting content securely.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        )}

        {bookContent && (
          <div className="bg-white rounded-lg shadow-md">
            {/* Book Header */}
            <div className="p-8 border-b">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {bookContent.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                by {bookContent.metadata.author}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Language: {bookContent.metadata.language}</span>
                <span>Publisher: {bookContent.metadata.publisher}</span>
              </div>
            </div>

            {/* Chapter Navigation */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Chapters:</span>
                {bookContent.chapters.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentChapter(index)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentChapter === index
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {bookContent.chapters[currentChapter].title}
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {bookContent.chapters[currentChapter].content}
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                disabled={currentChapter === 0}
                className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous Chapter
              </button>
              <span className="text-sm text-gray-500 self-center">
                Chapter {currentChapter + 1} of {bookContent.chapters.length}
              </span>
              <button
                onClick={() => setCurrentChapter(Math.min(bookContent.chapters.length - 1, currentChapter + 1))}
                disabled={currentChapter === bookContent.chapters.length - 1}
                className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Chapter
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 