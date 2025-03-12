// app/api/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getClient } from '@/app/(app)/(authenticated)/_actions/getClient'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: await configPromise })
  const { courseId: rawCourseId } = await req.json()

  console.log('Received courseId:', rawCourseId, typeof rawCourseId) // Debug log

  // Validate and coerce courseId to string
  if (!rawCourseId || typeof rawCourseId !== 'string') {
    return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
  }

  const courseId = rawCourseId
  // Get the authenticated user using your getClient action
  const user = await getClient()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: No authenticated user' }, { status: 401 })
  }

  // Fetch the course to determine if it’s free or paid
  const course = await payload.findByID({
    collection: 'courses',
    id: courseId,
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Check if the user is already enrolled
  const existingEnrollment = await payload.find({
    collection: 'participation',
    where: {
      and: [{ client: { equals: user.id } }, { course: { equals: courseId } }],
    },
    limit: 1,
  })

  if (existingEnrollment.totalDocs > 0) {
    const participation = existingEnrollment.docs[0]
    const currentStatus = participation.status

    if (currentStatus === 'pending') {
      return NextResponse.json(
        {
          message: 'Your enrollment is pending approval.',
          participation,
        },
        { status: 200 },
      )
    } else if (currentStatus === 'enrolled') {
      return NextResponse.json(
        {
          message: 'Already Enrolled',
          participation,
        },
        { status: 200 },
      )
    }
  }

  // Determine initial status based on course type
  const status = course.isPaid === 'paid' ? 'pending' : 'enrolled'

  // Create participation record
  const participation = await payload.create({
    collection: 'participation',
    data: {
      client: user.id,
      course: course,
      status,
      paymentStatus: course.isPaid === 'paid' ? 'unpaid' : undefined,
    },
  })

  return NextResponse.json({
    message: 'Enrollment successful',
    participation,
  })
}
