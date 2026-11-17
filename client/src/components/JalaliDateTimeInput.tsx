import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"

type Props = {
  id?: string
  /** Local datetime as 'YYYY-MM-DDTHH:mm' (the project's internal publishDate format). */
  value: string
  onChange: (next: string) => void
  required?: boolean
  className?: string
}

function splitValue(value: string): { date: string; time: string } {
  const m = (value ?? "").match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/)
  if (m) {
    return { date: m[1], time: m[2] }
  }
  return { date: "", time: "12:00" }
}

/**
 * Jalali/Gregorian-aware replacement for a native `datetime-local` input.
 * Date part uses the project's Jalali DatePicker; time stays a plain HH:mm input.
 */
export function JalaliDateTimeInput({ id, value, onChange, required, className }: Props) {
  const { date, time } = splitValue(value)

  return (
    <div className={"flex items-center gap-2 " + (className ?? "")}>
      <div className="min-w-0 flex-1">
        <DatePicker
          id={id}
          value={date}
          required={required}
          onChange={(iso) => {
            if (!iso) {
              onChange("")
              return
            }
            onChange(`${iso}T${time}`)
          }}
        />
      </div>
      <Input
        type="time"
        aria-label="time"
        className="w-[110px] shrink-0"
        value={time}
        required={required}
        onChange={(e) => {
          const nextTime = e.target.value || "00:00"
          const fallbackDate = date || new Date().toISOString().slice(0, 10)
          onChange(`${fallbackDate}T${nextTime}`)
        }}
      />
    </div>
  )
}
