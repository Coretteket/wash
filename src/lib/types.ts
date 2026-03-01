import z from 'zod'

export const MachinesSchema = z.object({
  washers: z.number().min(0),
  dryers: z.number().min(0),
})

export const BookingSchema = z.object({
  date: z.string(),
  time: z.string(),
  machine: z.string(),
  status: z.enum(['ready', 'busy', 'finished', 'unknown']),
})

export const BookingsSchema = z.array(BookingSchema)

export const BalanceSchema = z
  .string()
  .transform((s) => s.replace(',', '.'))
  .pipe(z.coerce.number())

export const WashDataSchema = z.object({
  balance: z.number(),
  machines: MachinesSchema,
  bookings: BookingsSchema,
})

export type MachinesData = z.infer<typeof MachinesSchema>
export type Booking = z.infer<typeof BookingSchema>
export type WashData = z.infer<typeof WashDataSchema>
