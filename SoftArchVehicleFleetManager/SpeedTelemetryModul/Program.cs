using HiveMQtt.Client;
using HiveMQtt.Client.Options;
using HiveMQtt.MQTT5.ReasonCodes;
using HiveMQtt.MQTT5.Types;
using System.Security;
using System.Text.Json;

class Program
{
    static SecureString CreateSecureString(string value)
    {
        if (value == null)
            throw new ArgumentNullException(nameof(value));

        SecureString secure = new SecureString();

        foreach (char c in value)
            secure.AppendChar(c);

        secure.MakeReadOnly();
        return secure;
    }

    static void Main(string[] args)
    {
        var options = new HiveMQClientOptions
        {
            Host = "61c51e819d6b4c39a8461d79c104c9e7.s1.eu.hivemq.cloud",
            Port = 8883,
            UseTLS = true,
            UserName = "simulationUser",
            Password = CreateSecureString("MatiszNagypapa67")
        };

        var client = new HiveMQClient(options);

        try
        {
            HiveMQtt.Client.Results.ConnectResult connectionResult = client.ConnectAsync().GetAwaiter().GetResult();
            if (connectionResult.ReasonCode == ConnAckReasonCode.Success)
            {
                Console.WriteLine($"Connection to MQTT broker successful!");
            }
            else
            {
                Console.WriteLine($"Connection to MQTT broker failed: {connectionResult}");
            }
        }
        catch (Exception exception)
        {
            Console.WriteLine($"Error connecting to MQTT broker: {exception.Message}");
            return;
        }
    }
}