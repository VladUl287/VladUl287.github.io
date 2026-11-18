# Dependency Injection and lifetime management

## Dependency Injection

Endpoints are resolved through the DI container. Any service registered in the container can be injected, along with framework services.

```cs
[WsEndpoint("auth/validate", ServiceLifetime.Singleton)]
public class AuthEndpoint : WsEndpoint<AuthRequest, AuthResponse>
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthEndpoint> _logger;

    public AuthEndpoint(IAuthService authService, ILogger<AuthEndpoint> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    public override async Task<AuthResponse> HandleAsync(AuthRequest request, EndpointContext context)
    {
        var isValid = await _authService.ValidateAsync(request.Token);
        return new AuthResponse { Success = isValid };
    }
}
```

## Lifetime management

The lifetime of an endpoint is declared per endpoint via the second argument to ```[WsEndpoint]```, using the standard ```ServiceLifetime``` values.

```cs
[WsEndpoint("", ServiceLifetime.Singleton)]
[WsEndpoint("", ServiceLifetime.Scoped)]
[WsEndpoint("", ServiceLifetime.Transient)]
```