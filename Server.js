const express = require('express');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3001; // Use process.env.PORT for Vercel

app.use(bodyParser.json());
app.use(cors());

const YOUR_DISCORD_BOT_TOKEN = process.env.YOUR_DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const userId = process.env.USER_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(YOUR_DISCORD_BOT_TOKEN);

let connections = [];
const wss = new WebSocket.Server({ server: app }); // Use the express app as WebSocket server

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const messageData = {
    username: message.author.username,
    content: message.content,
    timestamp: message.createdTimestamp,
    channelId: message.channel.id,
  };

  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
    }
  });
});

wss.on('connection', (ws) => {
  connections.push(ws);
  ws.on('close', () => {
    connections = connections.filter((conn) => conn !== ws);
  });
});

app.get('/channels', async (req, res) => {
  try {
      const guild = await client.guilds.fetch(GUILD_ID);
      const channels = await guild.channels.fetch();
      const textChannels = channels.filter(channel => channel.type === ChannelType.GuildText);
      res.json(textChannels.map(channel => ({ id: channel.id, name: channel.name })));
  } catch (error) {
      console.error('Error fetching channels:', error);
      res.status(500).send('Server error');
  }
});

app.post('/send-message-user', async (req, res) => {
  const { channelId, messageContent } = req.body;

  try {
      const user = await client.users.fetch(userId);
      const channel = await client.channels.fetch(channelId);
      await channel.send(`${user.username}: ${messageContent}`);

      res.status(200).send('Message sent successfully');
  } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).send('Error sending message');
  }
});

app.post('/create-channel', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.create({
      name: sessionId,
      type: ChannelType.GuildText, 
    });
    console.log(channel);
    res.status(200).json({ channelId: channel.id });
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

app.post('/send-message', async (req, res) => {
  const { channelId, messageContent } = req.body;

  try {
    const channel = await client.channels.fetch(channelId);
    await channel.send(messageContent);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
