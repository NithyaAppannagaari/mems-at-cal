type ClassValue = string | undefined | null | false | ClassValue[]

function flatten(val: ClassValue): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.flatMap(flatten)
  return [val]
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.flatMap(flatten).filter(Boolean).join(" ")
}
