# Serialization

The library ships with a pluggable serializer abstraction. Two serializers are provided out of the box: **JSON** (the default) and **MessagePack**. Each can be configured independently through its options object.

## JSON

JSON is used when no other serializer is configured. To customize it, register AddJsonSerializer and configure the JsonSerializerOptions:

```cs
builder.Services.AddJsonSerializer((c) =>
{
    c.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    c.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});
```

## MessagePack

MessagePack is a compact binary format, useful when bandwidth or throughput matters. To enable it on the server:

1. Install the server package:

```bash
dotnet add package WebSockets.Otp.MessagePack
```

2. Register the serializer with **AddMessagePackSerializer**:

```cs
builder.Services.AddMessagePackSerializer((c) =>
{
    c = c.WithCompression(MessagePackCompression.Lz4BlockArray);
});
```

## Client setup

The client must use a matching serializer. Install the client package:

```bash
npm i @fefruess/websockets.otp.msgpack
```

Then pass ```msgPackSerializer()``` when creating the client:

```js
import { msgPackSerializer } from "@fefruess/websockets.otp.msgpack"
import { useWsClient } from "websockets.otp.js/client"

const client = useWsClient({
    url: "ws://localhost:5096/ws",
    serializer: msgPackSerializer()
})
```