# Quick Start

## Install Package

```sh
dotnet add package WebSockets.Otp.Core
```

## Configure Services

```cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddWsEndpoints();

var app = builder.Build();
app.MapEndpoints(
    "/ws",
    (opt) =>
    {
        opt.OnConnected = async (context) =>
        {
            await context.Groups.AddAsync("general-chat", context.Connection.Id);
        };
        opt.OnDisconnected = async (context) =>
        {
            await context.Groups.RemoveAsync("general-chat", context.Connection.Id);
        };
    });
```

## Add Request DTO

```cs
public class ChatMessage
{
    public string Username { get; set; }
    public string Text { get; set; }
}
```

## Add Response DTO

```cs
public class ChatMessageSent
{
    public Guid MessageId { get; set; }
    public DateTimeOffset SentAt { get; set; }
}
```

## Define your endpoint

```cs
[WsEndpoint("chat/message/send")]
public class SendChatMessageEndpoint : WsEndpoint<ChatMessage, ChatMessageSent>
{
    public override async Task<ChatMessageSent> HandleAsync(ChatMessage message, IEndpointContext context)
    {
        var sent = new ChatMessageSent
        {
            MessageId = Guid.NewGuid(),
            SentAt = DateTimeOffset.UtcNow,
        };

        await context.Send
            .Group("general-chat")
            .SendAsync("chat/message/receive", message, default);

        return sent;
    }
}
```

## Install Client

```sh
npm i websockets.otp.js
```

## Configure Client

```js
const client = useWsClient({
    url: "ws://localhost:5096/ws"
})

await client.connect()

type ChatMessage = { username: string, message: string }
type ChatMessageSent = { messageId: string, sentAt: string }

const off = client.receive<ChatMessage>('chat/message/receive', (msg) => {
    console.log(msg.message) // test message
})

const { messageId, sentAt } = await client.send<ChatMessage, ChatMessageSent>(
    'chat/message/send',
    {
        username: "user1",
        message: "test message",
    })

console.log(messageId, sentAt)
```