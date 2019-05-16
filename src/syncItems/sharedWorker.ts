import { SharedWorkerEvent, SWEventTypes, SWSubscriptionEvent, SWUpdateMessage } from '../types/types'
import { } from './syncItems'
import SolidWebSocket from './SolidWebSocket'

declare var self: SharedWorker.SharedWorkerGlobalScope

self.onconnect = () => {
  const socket = new SolidWebSocket()

  // Handle incoming messages from scripts
  this.onmessage = async (event: SharedWorkerEvent) => {
    const { type, value } = event.data

    if (type === SWEventTypes.SUBSCRIBE) {
      await socket.subscribe(value.wsUrl, value.url)

      const message: SWSubscriptionEvent = {
        type: SWEventTypes.SUBSCRIPTION_SUCCESSFUL,
        value: event.data.value
      }
      postMessage(message)
    }
  }

  // Notify scripts of subscribed item updates
  socket.onItemUpdate((url: string) => {
    const message: SWUpdateMessage = {
      type: SWEventTypes.ITEM_UPDATED,
      value: url
    }
    postMessage(message)
  })
}
