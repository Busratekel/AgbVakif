namespace AgbVakif.Api.Services;

public interface IEmailSender
{
    Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        string textBody,
        string? replyTo,
        CancellationToken cancellationToken = default);
}
