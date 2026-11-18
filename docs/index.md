---
layout: home

hero:
  name: "WebSockets.Otp"
  tagline: "A REPR-style alternative to SignalR and raw WebSockets"
  actions:
    - theme: brand
      text: Get Started
      link: /docs/quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/VladUl287/WebSockets.Otp
---
```cs
[WsEndpoint("calculator/add")]
public class AddEndpoint : WsEndpoint<AddRequest, AddResponse>
{
    public override Task<AddResponse> HandleAsync(AddRequest request, IEndpointContext context)
    {
        var response = new AddResponse { Result = request.A + request.B };
        return Task.FromResult(response);
    }
}
```