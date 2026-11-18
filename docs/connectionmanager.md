# Connection Manager

```IWsConnectionManager``` is the central registry for active connections and group memberships, and the entry point for sending messages out-of-band. It is registered in the DI container, so it can be injected into any endpoint or service.

```cs
public interface IWsConnectionManager
{
    ValueTask<bool> TryAdd(IWsConnection connection, CancellationToken token);
    ValueTask<bool> TryRemove(string connectionId, CancellationToken token);

    ValueTask<bool> AddToGroup(string group, string connectionId, CancellationToken token);
    ValueTask<bool> RemoveFromGroup(string group, string connectionId, CancellationToken token);

    ValueTask Send(WsMessage envelope, CancellationToken token);
    ValueTask Send(string connectionId, WsMessage envelope, CancellationToken token);
    ValueTask Send(IEnumerable<string> connections, WsMessage envelope, CancellationToken token);

    ValueTask SendToGroup(string group, WsMessage envelope, CancellationToken token);
    ValueTask SendToGroup(IEnumerable<string> groups, WsMessage envelope, CancellationToken token);
}
```

## Connections

```TryAdd / TryRemove```

Manage the registry of active connections. Both return true on success and false if the operation could not be performed.

```cs
ValueTask<bool> TryAdd(IWsConnection connection, CancellationToken token);
ValueTask<bool> TryRemove(string connectionId, CancellationToken token);
```

In most cases connection registration is handled automatically by the host. Call these directly only when you manage connection lifecycles yourself.

## Groups

Groups let you address a set of connections by name without tracking individual connection IDs.

```AddToGroup / RemoveFromGroup```

```cs
ValueTask<bool> AddToGroup(string group, string connectionId, CancellationToken token);
ValueTask<bool> RemoveFromGroup(string group, string connectionId, CancellationToken token);
```

Add or remove a connection from a named group. Both return true on success and false if the connection or group could not be found.

```cs
// Add a connection to a room group
await _connectionManager.AddToGroup("room:42", context.ConnectionId, token);

// Remove it when the user leaves
await _connectionManager.RemoveFromGroup("room:42", context.ConnectionId, token);
```

## Sending messages

All ```Send``` overloads take a ```WsMessage``` envelope and a ```CancellationToken```. They differ only in their target.

| Method | Recipients |
| ----------- | ----------- |
| ```Send(envelope, token)``` | All active connections (broadcast) |
| ```Send(connectionId, envelope, token)``` | A single connection |
| ```Send(connections, envelope, token)``` | A set of connections |
| ```SendToGroup(group, envelope, token)``` | All connections in one group |
| ```SendToGroup(groups, envelope, token)``` | All connections in all of the given groups |

```cs
// Broadcast to everyone
await _connectionManager.Send(new WsMessage {}, token);

// To a single connection
await _connectionManager.Send(connectionId, envelope, token);

// To a set of connections
await _connectionManager.Send(connectionIds, envelope, token);

// To a single group
await _connectionManager.SendToGroup("room:42", envelope, token);

// To multiple groups
await _connectionManager.SendToGroup(["room:42", "room:43"], envelope, token);
```

## Wire Messages

Every frame exchanged over the socket is a ```WsMessage```. The base type is abstract and discriminates between three concrete kinds via a ```MessageType``` tag.

```cs
public readonly record struct MessageType(byte Value)
{
    public static readonly MessageType Response = new(1);
    public static readonly MessageType Error = new(2);
    public static readonly MessageType Event = new(3);
}

public abstract record WsMessage
{
    public abstract MessageType Type { get; }
}

public sealed record ResponseMessage(uint Id, object Value) : WsMessage
{
    public override MessageType Type => MessageType.Response;
}

public sealed record ErrorMessage(uint Id, string Error) : WsMessage
{
    public override MessageType Type => MessageType.Error;
}

public sealed record EventMessage(string Key, object Value) : WsMessage
{
    public override MessageType Type => MessageType.Event;
}
```

## Usage example

Inject the manager into a service to push messages to connections outside of an active ```HandleAsync``` call:

```cs
public class NotificationService
{
    private readonly IWsConnectionManager _connectionManager;

    public NotificationService(IWsConnectionManager connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public async Task NotifyRoomAsync(int roomId, string message, CancellationToken token)
    {
        var envelope = new EventMessage("user/notify", message);
        
        await _connectionManager.SendToGroup($"room:{roomId}", envelope, token);
    }
}
```