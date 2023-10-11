import { isToday } from './index'

export function avatarText(value: string) {
  if (!value)
    return ''
  const nameArray = value.split(' ')

  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

// TODO: Try to implement this: https://twitter.com/fireship_dev/status/1565424801216311297
export function kFormatter(num: number) {
  const regex = /\B(?=(\d{3})+(?!\d))/g

  return Math.abs(num) > 9999 ? `${Math.sign(num) * +((Math.abs(num) / 1000).toFixed(1))}k` : Math.abs(num).toFixed(0).replace(regex, ',')
}

/**
 * Format and return date in Humanize format
 * Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 * Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Intl.DateTimeFormatOptions} formatting Intl object to format with
 */
export function formatDate(value: string, formatting: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value)
    return value

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * Return short human friendly month representation of date
 * Can also convert date to only time if date is of today (Better UX)
 * @param {String} value date to format
 * @param {Boolean} toTimeForCurrentDay Shall convert to time if day is today/current
 */
export function formatDateToMonthShort(value: string, toTimeForCurrentDay = true) {
  const date = new Date(value)
  let formatting: Record<string, string> = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(date))
    formatting = { hour: 'numeric', minute: 'numeric' }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

export const prefixWithPlus = (value: number) => value > 0 ? `+${value}` : value

//  Formatted asSxx
export const formatSeason = (value: string) => value ? `S${value.padStart(2, '0')}` : ''

//  Formatted asxx[TGMK]B
export function formatFileSize(bytes: number) {
  if (bytes < 0)
    throw new Error(' The number of bytes cannot be negative。')

  const units = ['B', 'K', 'M', 'G', 'T']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

//  Formatting time seconds as minutes, hours, and seconds
export function formatSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let formattedTime = ''

  if (hours > 0)
    formattedTime += `${hours} Hourly`

  if (minutes > 0)
    formattedTime += `${minutes} Ingredient`

  if ((remainingSeconds > 0 || formattedTime === '') && hours <= 0)
    formattedTime += `${remainingSeconds} Unit of angle or arc equivalent one sixtieth of a degree`

  return formattedTime
}

// YYYY-MM-DD  Change intoDate
export function parseDate(dateString: string): Date | null {
  if (!dateString)
    return null
  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day)
}

//  File size formatting
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0)
    return '0 bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}
