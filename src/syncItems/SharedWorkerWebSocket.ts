import { SolidWebSocketInterface, SharedWorkerEvent, SWEventTypes, SWSubscriptionEvent } from '../types/types'
// @ts-ignore
import workerScript from 'raw-loader!./sharedWorker'
import { webSocketAvailabile } from './SolidWebSocket'
import btoa from 'btoa'

export const sharedWorkerAvailable = () => webSocketAvailabile() && typeof SharedWorker !== 'undefined'

export default class SharedWorkerWebSocket implements SolidWebSocketInterface {
    private worker: SharedWorker.SharedWorker
    private onMessageCallbacks: ((url: string) => void)[] = []

    constructor () {
      const url = 'data:application/javascript;base64,' + btoa(workerScript)
      this.worker = new SharedWorker(url)
      this.worker.addEventListener('message', this.handleMessage)
      this.worker.port.start()
    }

    public subscribe = async (wsUrl: string, url: string) => {
      const message: SWSubscriptionEvent = {
        type: SWEventTypes.SUBSCRIBE,
        value: {
          wsUrl,
          url
        }
      }
      this.worker.port.postMessage(message)
    }

    public onItemUpdate = (callback: (url: string) => void) => {
      this.onMessageCallbacks.push(callback)
    }

    private handleMessage = (event: SharedWorkerEvent) => {
      const { type, value } = event.data
      if (type === SWEventTypes.ITEM_UPDATED) {
        this.onMessageCallbacks.forEach(callback => callback(value))
      }
    }
}
