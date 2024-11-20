import { SquareNumHandler } from './direct/square-num'
import { IHandler } from './handler'

export const Hanlders = {
  group: new Map<string, IHandler>([
  ]),
  direct: new Map<string, IHandler>([
    ['square-num', new SquareNumHandler()]
  ])
}
