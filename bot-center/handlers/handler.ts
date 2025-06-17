export interface IHandler {
  run: (param?: string) => Promise<string>
}

export function parseCommand (rawCmd: string): { cmd: string, param: string } {
  const regex = /^\/([a-zA-Z0-9_-]+)\s+(.+)$/

  const match = rawCmd?.match(regex)

  if (match == null) throw new Error(`Invalid command: ${rawCmd}`)

  return {
    cmd: match[1],
    param: match[2].trim()
  }
}
