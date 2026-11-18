# Client

```useWsClient``` creates a typed WebSocket client that handles the handshake, request/response correlation, event subscriptions, queuing, and optional reconnection. It is the client-side counterpart to the server endpoints.

```ts
import { useWsClient } from "websockets.otp.js/client"
```

## Creating a client

```ts
const client = useWsClient({
    url: "ws://localhost:5096/ws",
    serializer: jsonSerializer()
})
```

```useWsClient``` returns a ```WsClient``` object. It does not open the connection on its own call ```connect()``` to establish it.

## Options

```ts
export type WsClientOptions = {
    readonly url: string | (() => string),
    readonly defaultSerializer?: MessageSerializer,
    readonly serializer?: MessageSerializer,
    readonly socketFactory?: typeof defaultFactory,
    readonly scheduleFactory?: ReturnType<typeof buildSchedule>,
    readonly pendingFactory?: () => PendingRegistry<number>,
    readonly handshakeTimeoutMs?: number,
}
```

| Option | Default | Purpose |
| ----------- | ----------- | ----------- |
| ```url``` | - (required) | Socket URL, or a function returning it (re-evaluated on each connect) |
| defaultSerializer | jsonSerializer() | Serializer used for the handshake
| serializer | defaultSerializer |	Serializer used for all other messages
| socketFactory | global WebSocket | Factory for creating the underlying socket
| scheduleFactory |	- |	Reconnection schedule (see Reconnection)
| pendingFactory | usePendingRegistry | Registry for in-flight requests keyed by correlation ID
| handshakeTimeoutMs | 15000 | Max time to wait for the handshake response

```defaultSerializer``` and ```serializer``` are split so the handshake can always use a well-known format (JSON) even when the payload serializer is binary (e.g. MessagePack). Only set ```defaultSerializer``` if your server negotiates over something other than JSON.

## API

```ts
export type WsClient = {
    readonly state: () => ConnectionState
    readonly connect: () => Promise<void>
    readonly close: (code?: number, reason?: string) => void
    readonly send: <TRequest, TResponse>(key: string, payload: TRequest) => Promise<TResponse>
    readonly notify: <TRequest>(key: string, payload: TRequest) => void
    readonly receive: <TValue>(key: string, callback: Handler<TValue>) => (() => void)
}
```

### state()

Returns the current ```ConnectionState```: ```"disconnected"```, ```"connecting"```, or ```"connected"```.

```ts
if (client.state() === "connected") { /* ... */ }
```

### connect()

Opens the connection and completes the handshake. Returns a promise that resolves once the client is connected (handshake acknowledged) and rejects on failure or timeout.

- Calling it while already ```connected``` or ```connecting``` resolves immediately (no-op).
- If a reconnection schedule is configured, connection errors are retried instead of rejecting immediately.

```ts
await client.connect()
```

### close(code?, reason?)

Closes the connection. Throws if the client is not connected.
- ```code``` defaults to ```1000```.
- Marks the close as manual, so reconnection is not attempted.
- Rejects all pending requests and queued items.

```ts
client.close(1000, "user signed out")
```

### send(key, payload)

Sends a request and returns a promise resolving to the response, correlated by an internal ID. Rejects if the server responds with an error.

- If the client is not connected, the request is queued and flushed automatically once the connection is established.
- Each request gets a fresh correlation ID

```ts
const result = await client.send<AuthRequest, AuthResponse>("auth/validate", { token })
```

### notify(key, payload)

Fire-and-forget request. Sends immediately with correlation ID ```0``` and returns ```void```. Throws if the client is not connected (unlike ```send```, it is not queued).

```ts
client.notify("chat/message/send", { text: "hello" })
```

### receive(key, callback)

Subscribes to server-pushed events for a given key. Returns an unsubscribe function. Multiple handlers per key are supported.

```ts
const off = client.receive<ChatMessage>("chat/message", (message) => {
    console.log(message.text)
})

// later
off()
```