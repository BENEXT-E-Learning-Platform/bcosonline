// collections/Participation.ts
import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'

export const Participation: CollectionConfig = {
  slug: 'participation',
  admin: {
    useAsTitle: 'client',
    defaultColumns: ['client', 'course', 'status'],
    group: 'Clients',
  },
  access: {
    create: authenticated, // Authenticated clients can enroll
    read: authenticated, // Only read own enrollments
    update: ({ req: { user } }) => (user ? { client: { equals: user.id.toString() } } : false), // Only read own enrollments
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'individualAccount',
      required: true,
      label: 'Client',
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Enrolled', value: 'enrolled' },
      ],
      defaultValue: 'pending',
      required: true,
      label: 'Enrollment Status',
    },
    {
      name: 'paymentStatus', // Optional: For paid courses
      type: 'select',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'unpaid',
      label: 'Payment Status',
      admin: { condition: (data) => data.course?.isPaid === 'paid' },
    },
    {
      name: 'examCompleted', // New field
      type: 'checkbox',
      label: 'Exam Completed',
      defaultValue: false,
      admin: { readOnly: true, description: 'Automatically set when exam is graded successfully' },
    },
  ],
  timestamps: true,
}
