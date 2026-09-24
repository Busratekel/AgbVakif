using AgbVakif.Api.Options;
using Azure.Identity;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;

namespace AgbVakif.Api.Services;

public sealed class GraphEmailSender(
    IOptions<EmailOptions> options,
    GraphCredentialProvider credentials) : IEmailSender
{
    private readonly EmailOptions _options = options.Value;

    public async Task SendAsync(
        string to,
        string subject,
        string htmlBody,
        string textBody,
        string? replyTo,
        CancellationToken cancellationToken = default)
    {
        var senderUserId = _options.Graph.SenderUserId;
        if (string.IsNullOrWhiteSpace(senderUserId))
        {
            throw new InvalidOperationException(
                "Email:Graph:SenderUserId boş. Gönderen M365 kullanıcı UPN’ini yazın.");
        }

        var graph = await credentials.GetAsync(cancellationToken);

        var credential = new ClientSecretCredential(
            graph.TenantId,
            graph.ClientId,
            graph.ClientSecret);

        var client = new GraphServiceClient(
            credential,
            ["https://graph.microsoft.com/.default"]);

        var message = new Message
        {
            Subject = subject,
            Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content = htmlBody,
            },
            ToRecipients =
            [
                new Recipient
                {
                    EmailAddress = new EmailAddress { Address = to },
                },
            ],
        };

        if (!string.IsNullOrWhiteSpace(replyTo))
        {
            message.ReplyTo =
            [
                new Recipient
                {
                    EmailAddress = new EmailAddress { Address = replyTo },
                },
            ];
        }

        var body = new SendMailPostRequestBody
        {
            Message = message,
            SaveToSentItems = true,
        };

        await client.Users[senderUserId]
            .SendMail
            .PostAsync(body, cancellationToken: cancellationToken);
    }
}
