const { Client, GatewayIntentBits } = require('discord.js');
const WebSocket = require('ws');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const wss = new WebSocket.Server({ port: 8080 });

let connections = [];

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const messageData = {
    username: message.author.username,
    content: message.content,
    timestamp: message.createdTimestamp,
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

client.login('MTI2MTcxMzg3Nzk1NjAzODY2OA.GtDjN-.qJs3kJ4OkrRghJHVmSRLqcE_lGbHymTMFxVV_Y');
