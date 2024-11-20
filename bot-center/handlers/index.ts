import { SquareNumHandler } from './direct/square-num'
import { CloudflaredHandler } from './group/cloudflared'
import { IHandler } from './handler'

export const Hanlders = {
  group: new Map<string, IHandler>([
    ['cloudflared', new CloudflaredHandler()]
  ]),
  direct: new Map<string, IHandler>([
    ['square-num', new SquareNumHandler()]
  ])
}
