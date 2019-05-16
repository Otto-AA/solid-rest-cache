import { SyncStorage, AsyncStorage, SerializedResponse } from './types/types'
const STORAGE_NAMESPACE = 'SOLID_CACHE'

export const cacheToStorage = async (resource: RequestInfo, init: RequestInit, response: Response, storage: SyncStorage | AsyncStorage | Cache) => {
  if (storage instanceof Cache)
    return storage.put(resource, response)
  else {
    const key = getStorageKey(resource, init)
    const data = await serializeResponse(response)
    return storage.setItem(key, data)
  }
}

export const getCachedFromStorage = async (resource: RequestInfo, init: RequestInit, storage: SyncStorage | AsyncStorage | Cache) => {
  if (storage instanceof Cache)
    return storage.match(resource)
  else {
    const key = getStorageKey(resource, init)
    const data = await storage.getItem(key)
    const response = await deserializeResponse(data)
    return response
  }
}

const serializeResponse = (response: Response) => JSON.stringify(responseToObject(response))

const deserializeResponse = (str: string): Response => objectToResponse(JSON.parse(str) as SerializedResponse)

const responseToObject = async (response: Response) => {
  const url = response.url
  const status = response.status
  const statusText = response.statusText
  // const ok = response.ok
  // const type = response.type
  // const redirected = response.redirected
  const body = await response.text()
  const headers: Record<string, string> = {}
  response.headers.forEach((key, val) => headers[key] = val)

  return {
    ...response,
    url,
    body,
    headers,
    status,
    statusText
    // type,
    // redirected
  }
}

const objectToResponse = (obj: SerializedResponse) => {
  const response = new Response(obj.body, {
    headers: obj.headers,
    status: obj.status,
    statusText: obj.statusText
  })
  return response
}

const getStorageKey = (resource: RequestInfo, init: RequestInit) => `${STORAGE_NAMESPACE}_${init.method}_${resource.toString()}`
