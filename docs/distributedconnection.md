# Distributed Connections

By default, the connection registry lives in memory and is local to a single server instance. To scale across multiple instances, back the registry with a shared store ```Redis``` so connections, group memberships, and sends are coordinated across the whole cluster.

Requires a Redis instance.

## Install

```bash
dotnet add package WebSockets.Otp.Redis
```

## Setup

Register a Redis multiplexer, then enable the Redis-backed connection manager:

```cs
builder.Services.AddSingleton<IConnectionMultiplexer>(
    _ => ConnectionMultiplexer.Connect("localhost:6379"));
builder.Services.AddRedisManager();
```

```AddRedisManager()``` replaces the default in-memory ```IWsConnectionManager``` with a Redis-backed implementation. The rest of the API (```TryAdd```, ```TryRemove```, group methods, and all ```Send``` overloads) is unchanged, endpoints and services keep injecting ```IWsConnectionManager``` as before.

## How it works

- Connection registry - active connections are tracked in Redis, so every instance sees the full set of connections across the cluster
- Groups - group membership is stored in Redis, making groups manipulation work cluster-wide
- Sends - sending fan out across instances via Redis pub/sub. A message addressed to a connection or group is delivered regardless of which instance holds the target connection