import { cachedFetchType, CacheOptions } from './types/types'
import { getCachedFromStorage, cacheToStorage } from './cache'
import { isSynced, isOutdated } from './syncItems/syncItems';

/**
 * cachedFetch
 * Resolve with an up-to-date cached response or forward to the provided fetch function
 */
export const cachedFetch: cachedFetchType = async (resource, init, cacheOptions) => {
  const url = resource.toString()

  if (isSynced(url)) {
    return fetchSynced(resource, init, cacheOptions)
  }
  else if (isOutdated(url)) {
    return fetchOutdated(resource, init, cacheOptions)
  }
  else {
    return fetchUncached(resource, init, cacheOptions)
  }
}


const fetchSynced: cachedFetchType = (resource, init, cacheOptions) => {
  if (cacheOptions.cacheStorage) {
    return getCachedFromStorage(resource, init, cacheOptions.cacheStorage)
  } else {
    const newInit: RequestInit = {
      ...init,
      cache: 'force-cache'
    }
    return cacheOptions.fetch(resource, newInit)
  }
}

const fetchOutdated: cachedFetchType = (resource, init, cacheOptions) => {
  // TODO: Store and retrieve Etag for better performance with a custom cache storage
  return fetchUncached(resource, init, cacheOptions)
    .then(storeResponseTo(resource, init, cacheOptions))
}

const fetchUncached: cachedFetchType = (resource, init, cacheOptions) => {
  const newInit: RequestInit = {
    ...init,
    cache: 'no-cache'
  }
  return cacheOptions.fetch(resource, newInit)
    .then(storeResponseTo(resource, init, cacheOptions))
}

// Return a function which asynchronously stores the response to the cache and returns the response
const storeResponseTo = (resource: RequestInfo, init: RequestInit, cacheOptions: CacheOptions): (response: Response) => Response => {
  return (response) => {
    if (cacheOptions.cacheStorage) { cacheToStorage(resource, init, response, cacheOptions.cacheStorage) }
    return response
  }
}
