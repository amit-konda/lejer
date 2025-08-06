'use client'

import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { ethers } from 'ethers'
import Link from 'next/link'

export default function PublishPage() {
  const { isConnected, address } = useAccount()
  const { signMessage } = useSignMessage()
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    price: '',
    maxSupply: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.epub')) {
      setFile(selectedFile)
    } else {
      alert('Please select a valid EPUB file')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    if (!file) {
      alert('Please select an EPUB file')
      return
    }

    setLoading(true)
    try {
      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('epub', file)
      uploadData.append('title', formData.title)
      uploadData.append('author', formData.author)
      uploadData.append('description', formData.description)
      uploadData.append('coverImage', formData.coverImage)
      uploadData.append('price', formData.price)
      uploadData.append('maxSupply', formData.maxSupply)

      // Upload to backend
      const response = await fetch('/api/publish', {
        method: 'POST',
        body: uploadData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setUploadResult(result)
      setStep(2)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload book')
    } finally {
      setLoading(false)
    }
  }

  const deployContract = async () => {
    if (!uploadResult) return

    setLoading(true)
    try {
      // For MVP, we'll simulate contract deployment
      // In production, this would interact with the actual smart contract
      const message = `Deploy Ledgerbound Book Contract\nTitle: ${formData.title}\nAuthor: ${formData.author}\nTimestamp: ${Date.now()}`
      
      const signature = await signMessage({ message })
      
      // Simulate contract deployment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock contract address and token ID
      const contractAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      const tokenId = Math.floor(Math.random() * 1000) + 1

      // Update book with contract info
      await fetch(`/api/publish/books/${uploadResult.bookId}/contract`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress,
          tokenId
        })
      })

      setStep(3)
    } catch (error) {
      console.error('Contract deployment error:', error)
      alert('Failed to deploy contract')
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
            You need to connect your wallet to publish a book.
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
              <span className="text-indigo-600 font-medium">Publish</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Publish Your Book</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EPUB File *
                </label>
                <input
                  type="file"
                  accept=".epub"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Only EPUB files are supported. Maximum size: 50MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (MATIC) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Supply *
                  </label>
                  <input
                    type="number"
                    name="maxSupply"
                    value={formData.maxSupply}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Book'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Book Uploaded Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your book has been encrypted and stored securely. Now let's deploy the smart contract.
              </p>
              <button
                onClick={deployContract}
                disabled={loading}
                className="bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deploying Contract...' : 'Deploy Smart Contract'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Book Published Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your book is now live on the blockchain as an NFT. Readers can now purchase and read your book.
              </p>
              <Link
                href="/"
                className="bg-indigo-600 text-white py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors"
              >
                View in Marketplace
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 