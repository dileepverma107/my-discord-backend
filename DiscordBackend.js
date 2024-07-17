const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const cors = require('cors');

const app = express();
const port = 3001;

// CORS middleware setup
app.use(cors());

// Define the intents your bot will use
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,         // Required to receive information about guilds (servers)
    GatewayIntentBits.GuildMessages   // Required to receive message events in text channels
  ]
});
client.login('MTI2MTcxMzg3Nzk1NjAzODY2OA.GtDjN-.qJs3kJ4OkrRghJHVmSRLqcE_lGbHymTMFxVV_Y');

const sessionChannels = {}; // Store session ID to Discord channel mapping

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Endpoint to handle sending messages
app.use(express.json()); // Parse JSON bodies
app.post('/send-message', async (req, res) => {
  const { sessionId, messageContent } = req.body;

  try {
    let channel;

    // Check if a channel already exists for this session
    if (sessionChannels[sessionId]) {
      channel = sessionChannels[sessionId];
    } else {
      // Example: Create a new text channel
      const guildId = '1260253348641378355'; // Replace with your Discord server's ID
      const guild = client.guilds.cache.get(guildId);
      
      // Ensure to provide a 'name' parameter when creating the channel
      const newChannel = await guild.channels.create(`session-${sessionId}`, {
        type: 'text',
        topic: `Session ${sessionId} channel created dynamically`,
        name: '`session-${sessionId}`' // Name of the channel
      });

      sessionChannels[sessionId] = newChannel;
      channel = newChannel;
    }

    // Example: Send message to the channel
    await channel.send(messageContent);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
