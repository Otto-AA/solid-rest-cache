import { SolidWebSocketInterface } from '../types/types'

export const webSocketAvailabile = () => typeof WebSocket !== 'undefined'

export default class SolidWebSocket implements SolidWebSocketInterface {
    private webSockets: Record<string, WebSocket> = {}
    private onMessageCallbacks: ((url: string) => void)[] = []

    public subscribe = async (wsUrl: string, url: string) => {
      const message = `sub ${url}`
      const socket = await this.getCorrespondingWebSocket(wsUrl)
      socket.send(message)
    }

    public onItemUpdate = (callback: (url: string) => void) => {
      this.onMessageCallbacks.push(callback)
    }

    private getCorrespondingWebSocket = async (wsUrl: string) => {
      if (!(wsUrl in this.webSockets)) { this.webSockets[wsUrl] = await this.openWebSocket(wsUrl) }

      return this.webSockets[wsUrl]
    }

    private openWebSocket = (wsUrl: string): Promise<WebSocket> => {
      const socket = new WebSocket(wsUrl)
      return new Promise((resolve, reject) => {
        socket.onopen = () => resolve(socket)
        socket.onclose = () => delete this.webSockets[wsUrl]
        socket.onmessage = this.handleMessage
      })
    }

    private handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (typeof data === 'string' && data.startsWith('pub ')) {
        const url = data.split(' ')[1]
        this.onMessageCallbacks.forEach(callback => callback(url))
      }
    }
}

export class SolidWebSocketDummy implements SolidWebSocketInterface {
  public onItemUpdate () {}
    public subscribe = () => Promise.reject('subscribe not available on SolidWebSocketDummy')
}
