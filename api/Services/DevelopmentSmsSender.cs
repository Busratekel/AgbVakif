namespace AgbVakif.Api.Services;

public interface ISmsSender
{
    Task SendAsync(string phone, string message, CancellationToken cancellationToken = default);
}

/// <summary>
/// Gerçek SMS sağlayıcısı bağlanana kadar Development'ta log'a yazar.
/// İleride Netgsm / kurumsal SMS ile değiştirilir.
/// </summary>
public sealed class DevelopmentSmsSender(ILogger<DevelopmentSmsSender> logger) : ISmsSender
{
    public Task SendAsync(string phone, string message, CancellationToken cancellationToken = default)
    {
        logger.LogWarning("SMS [{Phone}]: {Message}", phone, message);
        return Task.CompletedTask;
    }
}
