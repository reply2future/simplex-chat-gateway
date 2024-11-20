import { IHandler } from '../handler'

export class SquareNumHandler implements IHandler {
  async run (param?: string): Promise<string> {
    if (param == null) return 'this is not a number'

    const n = +param
    const reply =
      typeof n === 'number' && !isNaN(n)
        ? `${n} * ${n} = ${n * n}`
        : 'this is not a number'
    return reply
  }
}
