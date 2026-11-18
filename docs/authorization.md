# Authorization

Authorization can be applied at three levels: globally (per connection), per endpoint, or both combined. When both are configured, endpoint-level attributes are evaluated in addition to global settings, a connection must satisfy both to reach the endpoint.

## Per connection

Global authorization is applied to every endpoint mapped under the same base path. Use it for connection-wide concerns such as the authentication scheme.

```cs
app.MapEndpoints(
    "/ws",
    (opt) =>
    {
        opt.AuthorizationData =
        [
            new AuthorizeAttribute
            {
                AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme
            }
        ];
    });
```

## Per endpoint

Per-endpoint authorization applies only to the decorated endpoint. Use it for fine-grained policies specific to a single endpoint.

```cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ws.chat.access", policy => policy.RequireClaim("scope", "ws.chat"));
});

[Authorize(Policy = "ws.chat.access")]
[WsEndpoint("chat/message/send")]
public class ChatEndpoint : WsEndpoint<ChatMessage>
{
    // ...
}
```

## Combined

Global and endpoint-level authorization are additive a connection must satisfy both to reach the endpoint. 
Use global rules for connection-wide concerns (e.g. authentication scheme) and per-endpoint attributes for fine-grained policies.