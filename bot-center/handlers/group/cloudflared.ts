import { IHandler } from '../handler'
import axios from 'axios'

export class CloudflaredHandler implements IHandler {
  async run (param?: string): Promise<string> {
    if (process.env.CLOUDFLARED_USER == null || process.env.CLOUDFLARED_PASSWORD == null || process.env.CLOUDFLARED_URL == null) { throw new Error('Please set the environment variable for cloudflared handler first') }
    if (param == null || !['start', 'stop'].includes(param)) return 'Please set the option `start/stop`'

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.CLOUDFLARED_USER}:${process.env.CLOUDFLARED_PASSWORD}`).toString(
        'base64'
      )}`
    }

    const response = await axios.post(process.env.CLOUDFLARED_URL, { action: param }, { headers })
    return JSON.stringify(response.data)
  }
}
