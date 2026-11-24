# Endpoint Types

The library supports three endpoint patterns:

## Simple Endpoint (No request/response)

```cs
[WsEndpoint("system/status")]
public class SystemStatusEndpoint : WsEndpoint
{
    public override async Task HandleAsync(IEndpointContext context)
    {
        var buffer = context.Payload.Span;
    }
}
```

## Request-only Endpoint

```cs
[WsEndpoint("notifications/subscribe")]
public class SubscribeEndpoint : WsEndpoint<SubscribeRequest>
{
    public override async Task HandleAsync(SubscribeRequest request, IEndpointContext context)
    {
        await context.Groups.AddAsync("notifications", context.ConnectionId);
        await context.Send
            .SendAsync(new
            {
                Data = "notification"
            }, default);
    }
}
```

## Request/Response Endpoint

```cs
[WsEndpoint("calculator/add")]
public class AddEndpoint : WsEndpoint<AddRequest, AddResponse>
{
    public override async Task<AddResponse> HandleAsync(AddRequest request, IEndpointContext context)
    {
        return new AddResponse
        {
            Result = request.A + request.B,
            Operation = "addition"
        };
    }
}
```

## Request/Result Response Endpoint

```cs
[WsEndpoint("calculator/add")]
public class AddEndpoint : WsEndpoint<AddRequest, Result<AddResponse, AddError>>
{
    public override async Task<Result<AddResponse, AddError>> HandleAsync(AddRequest request, IEndpointContext context)
    {
        if(request.A < 0) 
        {
            return new AddError 
            {
                Message = "Below zero parameter"
            };
        }

        return new AddResponse
        {
            Result = request.A + request.B,
            Operation = "addition"
        };
    }
}
```