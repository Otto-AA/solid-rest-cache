import { SyncStorage, CacheStatus, SolidWebSocketInterface } from '../types/types'
import { MemoryStorage } from '../utils/memStorage'
import SharedWorkerWebSocket, { sharedWorkerAvailable } from './SharedWorkerWebSocket'
import SolidWebSocket, { webSocketAvailabile as webSocketAvailable, SolidWebSocketDummy } from './SolidWebSocket'
declare var localStorage: SyncStorage | undefined

const UPDATES_VIA_HEADER = 'Updates-Via'
const STORAGE_KEY = 'SOLID_REST_CACHE_SYNCED_ITEMS'
const syncStorage = localStorage || new MemoryStorage<string>()
const socket = getDefaultWebSocketHandler()

// Mark items which are updated as outdated so they are fetched again
socket.onItemUpdate(markAsOutdated)

export const canBeSynced = (response: Response) => response.headers.has(UPDATES_VIA_HEADER)

export const sync = (response: Response) => {
  const wsUrl = response.headers.get(UPDATES_VIA_HEADER)
  const url = response.url
  socket.subscribe(wsUrl, url)
    .then(() => markAsSynced(url))
    .catch(() => {})
}

function markAsOutdated (url: string) {
  setStatus(url, CacheStatus.OUTDATED)
}

const markAsSynced = (url: string) => {
  setStatus(url, CacheStatus.SYNCED)
}

const setStatus = (url: string, status: CacheStatus) => {
  const syncedItems = getSyncedItems()
  syncedItems[url] = status
  setSyncedItems(syncedItems)
}

export const isSynced = (url: string) => getStatus(url) === CacheStatus.SYNCED
export const isOutdated = (url: string) => getStatus(url) === CacheStatus.OUTDATED
export const isCached = (url: string) => url in getSyncedItems

const getStatus = (url: string) => getSyncedItems()[url]

const getSyncedItems = (): Record<string, CacheStatus> => JSON.parse(syncStorage.getItem(STORAGE_KEY))
const setSyncedItems = (syncedItems: Record<string, CacheStatus>) => syncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedItems))

function getDefaultWebSocketHandler (): SolidWebSocketInterface {
  if (sharedWorkerAvailable()) { return new SharedWorkerWebSocket() }
  if (webSocketAvailable()) { return new SolidWebSocket() }

  // Return a dummy in case it is not supported which rejects subscriptions
  return new SolidWebSocketDummy()
}
