// components/EnrollButton.tsx (unchanged)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
interface EnrollButtonProps {
  courseId: string
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    'not-enrolled' | 'pending' | 'enrolled' | null
  >(null)
  const router = useRouter()
  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      try {
        const response = await fetch('/api/enroll/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: String(courseId) }),
        })
        const data = await response.json()
        if (response.ok) {
          setEnrollmentStatus(data.status || 'not-enrolled')
        } else {
          console.error('Failed to fetch enrollment status', data.error)
          setEnrollmentStatus('not-enrolled')
        }
      } catch (error) {
        console.error('Error fetching enrollmetn status:', error)
        setEnrollmentStatus('not-enrolled')
      }
    }
    fetchEnrollmentStatus()
  }, [courseId])

  const handleClick = async () => {
    if (enrollmentStatus === 'enrolled') {
      // Redirect to /study-space if already enrolled
      router.push('/study-space')
      return
    }
    // Otherwise, attempt enrollment
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Enrollment failed')
      }

      setMessage(data.message)

      // Update enrollment status based on the response
      setEnrollmentStatus(data.participation.status === 'enrolled' ? 'enrolled' : 'pending')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  let buttonText: string
  let buttonStyles: string

  switch (enrollmentStatus) {
    case 'enrolled':
      buttonText = 'Start Learning'
      buttonStyles = 'bg-green-600 hover:bg-green-700 text-white'
      break
    case 'pending':
      buttonText = 'Pending Approval'
      buttonStyles = 'bg-gradient-to-r from-yellow-500 to-amber-700 text-white'
      break
    case 'not-enrolled':
    default:
      buttonText = 'Enroll Now'
      buttonStyles = 'bg-blue-600 hover:bg-blue-700 text-white'
      break
  }

  if (loading) {
    buttonText = 'Processing...'
  }
  return (
    <div>
      <button
        className={`w-full px-4 py-2 rounded-md font-semibold transition-colors   
         ${buttonStyles}`}
        onClick={handleClick}
        disabled={loading || enrollmentStatus === null}
      >
        {buttonText}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  )
}
