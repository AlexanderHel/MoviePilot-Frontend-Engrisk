// 👉 IsEmpty
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === '')
    return true

  return !!(Array.isArray(value) && value.length === 0)
}

// 👉 IsNullOrUndefined
export function isNullOrUndefined(value: unknown): value is undefined | null {
  return value === null || value === undefined
}

// 👉 IsEmptyArray
export function isEmptyArray(arr: unknown): boolean {
  return Array.isArray(arr) && arr.length === 0
}

// 👉 IsObject
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)
}

export function isToday(date: Date) {
  const today = new Date()

  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  )
}

//  Calculate the time difference， Come (or go) backxx Skyxx Hourlyxx Minutes
export function calculateTimeDifference(inputTime: string): string {
  if (!inputTime)
    return ''

  const inputDate = new Date(inputTime)
  const currentDate = new Date()

  const timeDifference = currentDate.getTime() - inputDate.getTime()
  const secondsDifference = Math.floor(timeDifference / 1000)

  if (secondsDifference < 60) {
    return `${secondsDifference} Unit of angle or arc equivalent one sixtieth of a degree`
  }
  else if (secondsDifference < 3600) {
    const minutes = Math.floor(secondsDifference / 60)

    return `${minutes} Minutes`
  }
  else if (secondsDifference < 86400) {
    const hours = Math.floor(secondsDifference / 3600)

    return `${hours} Hourly`
  }
  else {
    const days = Math.floor(secondsDifference / 86400)

    return `${days} Sky`
  }
}

//  Determining an arraysubArray Is it in another arraymainArray Center
export function isContained(subArray: any[], mainArray: any[]): boolean {
  return subArray.every(element => mainArray.includes(element))
}

//  Determine if there is an intersection of two arrays
export function isIntersected(array1: any[], array2: any[]): boolean {
  return array1.some(element => array2.includes(element))
}

export function isNullOrEmptyObject(obj: any): boolean {
  //  First determine if the null  Maybe undefined
  if (obj === null || obj === undefined)
    return true

  //  Then determine if the object is empty
  return !!(typeof obj === 'object' && Object.keys(obj).length === 0)
}
