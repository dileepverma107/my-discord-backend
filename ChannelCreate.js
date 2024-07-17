const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Replace 'YOUR_BOT_TOKEN' with your bot's token
const TOKEN = 'MTI2MTcxMzg3Nzk1NjAzODY2OA.GtDjN-.qJs3kJ4OkrRghJHVmSRLqcE_lGbHymTMFxVV_Y';
// Replace 'YOUR_GUILD_ID' with the ID of the guild where you want to create the channel
const GUILD_ID = '1260253348641378355';

client.once('ready', async () => {
    console.log('Bot is ready!');

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        
        // Check if the guild was found
        if (!guild) {
            console.log(`Guild with ID ${GUILD_ID} not found`);
            return;
        }

        // Replace 'new-channel' with your desired channel name
        const channelName = 'new-channel';
        
        // Create a new text channel
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText, // Use ChannelType.GuildText for text channels
        });

        console.log(`Channel created: ${newChannel.name} with ID: ${newChannel.id}`);
    } catch (error) {
        console.error('Error creating channel:', error);
    }
});

client.login(TOKEN);