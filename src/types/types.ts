export interface SyncStorage {
    setItem(key: string, value: string): void;
    getItem(key: string): string;
    removeItem(key: string): void;
}

export interface AsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string>;
    removeItem(key: string): Promise<void>;
}

export interface SerializedResponse {
    url: string;
    status: number;
    statusText: string;
    ok: boolean;
    type: ResponseType;
    redirected: boolean;
    body: string;
    headers: Record<string, string>;

}

export interface CacheOptions {
    fetch: GlobalFetch['fetch'];
    allowOffline: boolean;
    cacheStorage: SyncStorage;
}

export enum CacheStatus {
    SYNCED = 'synced',
    OUTDATED = 'outdated',
}

export type cachedFetchType = (resource: RequestInfo, init: RequestInit, cacheOptions: CacheOptions) => Promise<Response>;

export interface SharedWorkerEvent extends MessageEvent {
    readonly data: SharedWorkerMessage;
}

export interface SharedWorkerMessage {
    type: string;
    value: any;
}

export interface SWSubscriptionEvent extends SharedWorkerMessage {
    value: {
        wsUrl: string;
        url: string;
    };
}

export interface SWUpdateMessage extends SharedWorkerMessage {
    value: string;
}

export enum SWEventTypes {
    SUBSCRIBE = 'subscribe',
    SUBSCRIPTION_SUCCESSFUL = 'subscribed',
    ITEM_UPDATED = 'update'
}

export interface SolidWebSocketInterface {
    subscribe(wsUrl: string, url: string): Promise<void>;
    onItemUpdate(callback: (url: string) => void): void;
}
