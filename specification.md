# solid-rest-cache [Working Draft]
*A library for keeping an up to date cache for files from solid pods*

## Initialization
*When the library is started, following should be done*

### Synced item list
1. Create empty list if it is not existing yet
2. Mark all items of the list as `outdated`

## Request handling
*When a request is received, following should be done*

### Check if request is cached
1. Check if request is marked as `synced` in the item list

#### If synced
1. Set cache option of the request to `force-cache`
2. Make request and resolve with response

#### If not synced
1. Set cache option of the request to `no-cache`
2. Make request and temporarily response
3. Get `Updates-Via` header of the response
4. If `Updates-Via` exists send subscription event to the Service Worker
5. Resolve with response

## Service Worker
*The service worker handles the connection to the WebSocket, to ensure that only one entity is communicating with the pod.*
*A fallback should be provided in the future, in case Service Workers aren't available.*
1. Install Service Worker
2. Create empty dict for WebSockets
2. In SW: Listen for subscription events
3. In script: Listen for change events

### Subscription event
1. Get websocket-url event
2. Get item-url from event
3. Open new WebSocket connection if no connection to websocket-url has been opened
4. Send subscription message with item-url via the WebSocket
5. Resolve with void

### Websocket Change event
1. Get item-url from the WebSocket change event
2. Send change event with item-url to script
3. In script: Mark item-url as outdated