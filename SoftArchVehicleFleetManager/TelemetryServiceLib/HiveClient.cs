using HiveMQtt.Client;
using HiveMQtt.Client.Options;
using HiveMQtt.MQTT5.ReasonCodes;
using HiveMQtt.MQTT5.Types;
using System.Security;

namespace TelemetryServiceLib
{
    public class HiveClient
    {
        public string ClientName { get; set; }

        public HiveMQClient ClientInstance { get; set; }

        private QualityOfService defaultQos = QualityOfService.AtLeastOnceDelivery;

        private SecureString CreateSecureString(string value)
        {
            if (value == null)
                throw new ArgumentNullException(nameof(value));

            SecureString secure = new SecureString();

            foreach (char c in value)
                secure.AppendChar(c);

            secure.MakeReadOnly();
            return secure;
        }

        private HiveMQClient? MakeBrokerConnection()
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
                var connectionResult = client.ConnectAsync().GetAwaiter().GetResult();
                if (connectionResult.ReasonCode == ConnAckReasonCode.Success)
                {
                    return client;
                }
                else
                {
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }

        public HiveClient(string clientName)
        {
            ClientName = clientName;

            ClientInstance = MakeBrokerConnection() ??
                throw new ArgumentNullException($"MQTT broker connection failed for {clientName}");
        }

        public void SubscribeToTopic(string topic)
        {
            var subscribeResult = ClientInstance.SubscribeAsync(topic).GetAwaiter().GetResult();
        }

        public void PublishToTopic(string topic, string message)
        {
            var publishResult = ClientInstance.PublishAsync(topic, message, defaultQos).GetAwaiter().GetResult();
        }
    }
}