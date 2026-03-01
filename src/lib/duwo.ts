import type { Frame, Page } from 'playwright'
import {
  BalanceSchema,
  BookingSchema,
  MachinesSchema,
  WashDataSchema,
} from './types'
import type { WashData } from './types'

export async function login(page: Page) {
  await page.goto('https://duwo.multiposs.nl/')
  const frame = page.frame({ url: /login\/index\.php/ })!
  await frame.locator('#UserInput').fill(process.env.MULTIPOSS_EMAIL!)
  await frame.locator('#PwdInput').fill(process.env.MULTIPOSS_PASSWORD!)
  await frame.locator('#BtnLogin').click()
  return frame
}

export function parseStatus(
  className: string | null,
): 'ready' | 'busy' | 'finished' | 'unknown' {
  if (className?.includes('BookingReady')) return 'ready'
  if (className?.includes('BookingBusy')) return 'busy'
  if (className?.includes('BookingFinished')) return 'finished'
  return 'unknown'
}

export function formatMachine(raw: string) {
  if (raw === 'Washing mach') return 'Washer'
  if (raw === 'Dryer') return 'Dryer'
  return raw
}

export async function parseData(frame: Frame): Promise<WashData> {
  await frame.locator('#MachineAvailabilityTable').waitFor()

  const machineRows = await frame
    .locator('#MachineAvailabilityTable table tr')
    .all()

  let washers = 0
  let dryers = 0

  for (const row of machineRows.slice(1)) {
    const cells = await row.locator('td').all()
    if (cells.length < 3) continue
    const [, machine, status] = await Promise.all(
      cells.map((c) => c.textContent()),
    )
    const available = Number(status?.split(':')[1]) || 0
    if (machine?.trim() === 'Washing mach') washers += available
    else dryers += available
  }

  await frame.locator('#BookingTable').waitFor()

  const bookingRows = await frame.locator('#BookingTable table tr').all()
  const bookings = []
  for (const row of bookingRows.slice(1)) {
    const cells = await row.locator('td').all()
    if (cells.length < 4) continue
    const [date, time, , machine] = await Promise.all(
      cells.map((c) => c.textContent()),
    )
    const machineClass = await cells[3].locator('p').getAttribute('class')
    bookings.push(
      BookingSchema.parse({
        date: date?.trim(),
        time: time?.trim().replace(/->|→/g, ' - '),
        machine: formatMachine(machine?.trim() ?? ''),
        status: parseStatus(machineClass),
      }),
    )
  }

  const balanceText = await frame.locator('#LblUserCredits').textContent()

  return WashDataSchema.parse({
    balance: BalanceSchema.parse(balanceText),
    machines: MachinesSchema.parse({ washers, dryers }),
    bookings,
  })
}

export async function parseQR(frame: Frame) {
  const qrBuffer = await frame.locator('#QR_container').screenshot()
  return `data:image/png;base64,${qrBuffer.toString('base64')}`
}
