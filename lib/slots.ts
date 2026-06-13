// Logica condivisa degli slot orari — usata sia dal book page (BookPageContent)
// sia dal form della landing, così restano identici. Stessi slot anche in
// app/api/availability/route.ts (giorni feriali: pranzo + sera; weekend: pomeriggio).

export type SlotGroup = { id: 'lunch' | 'evening' | 'afternoon'; slots: string[] }

function pad(n: number) { return String(n).padStart(2, '0') }

export function getTimeSlots(dateStr: string): SlotGroup[] {
  if (!dateStr) return []
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  const isWeekend = dow === 0 || dow === 6

  if (isWeekend) {
    const slots: string[] = []
    for (let h = 13; h <= 18; h++) {
      slots.push(`${pad(h)}:00`)
      slots.push(`${pad(h)}:30`)
    }
    return [{ id: 'afternoon', slots }]
  } else {
    const evening: string[] = []
    for (let h = 18; h <= 21; h++) {
      evening.push(`${h}:00`)
      if (h < 21) evening.push(`${h}:30`)
    }
    return [
      { id: 'lunch',   slots: ['12:00', '12:30'] },
      { id: 'evening', slots: evening },
    ]
  }
}

export function getTomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
