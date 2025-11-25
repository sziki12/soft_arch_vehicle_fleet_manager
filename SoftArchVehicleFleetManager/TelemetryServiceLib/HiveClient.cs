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
            {
                secure.AppendChar(c);
            }

            secure.MakeReadOnly();
            return secure;
        }

        private HiveMQClient MakeBrokerConnection()
        {
            string? password = Environment.GetEnvironmentVariable("HIVEMQ_PASSWORD");

            if (string.IsNullOrEmpty(password))
            {
                throw new Exception("HIVEMQ_PASSWORD environment variable is not set");
            }

            var options = new HiveMQClientOptions
            {
                Host = "61c51e819d6b4c39a8461d79c104c9e7.s1.eu.hivemq.cloud",
                Port = 8883,
                UseTLS = true,
                UserName = "simulationUser",
                Password = CreateSecureString(password)
            };

            var client = new HiveMQClient(options);

            var connectionResult = client.ConnectAsync().GetAwaiter().GetResult();
            if (connectionResult.ReasonCode == ConnAckReasonCode.Success)
            {
                return client;
            }
            else
            {
                throw new Exception($"MQTT broker connection failed with reason code: {connectionResult.ReasonCode}");
            }
        }

        public HiveClient(string clientName)
        {
            ClientName = clientName;

            try
            {
                ClientInstance = MakeBrokerConnection();
            }
            catch (Exception exception)
            {
                var error = $"Error initializing HiveClient {ClientName}: {exception.Message}";
                throw new Exception(error);
            }
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