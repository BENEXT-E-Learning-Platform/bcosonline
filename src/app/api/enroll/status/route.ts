// app/api/enroll/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getClient } from '@/app/(app)/(authenticated)/_actions/getClient'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: await configPromise })
  const { courseId: rawCourseId } = await req.json()

  // Validate courseId
  if (!rawCourseId || typeof rawCourseId !== 'string') {
    return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
  }
  const courseId = rawCourseId

  // Get the authenticated user
  const user = await getClient()
  if (!user) {
    return NextResponse.json({ status: 'not-enrolled' }, { status: 200 }) // No user = not enrolled
  }

  // Check for existing participation
  const existingEnrollment = await payload.find({
    collection: 'participation',
    where: {
      and: [{ client: { equals: user.id } }, { course: { equals: courseId } }],
    },
    limit: 1,
  })

  if (existingEnrollment.totalDocs === 0) {
    return NextResponse.json({ status: 'not-enrolled' }, { status: 200 })
  }

  const participation = existingEnrollment.docs[0]
  return NextResponse.json({ status: participation.status }, { status: 200 })
}
