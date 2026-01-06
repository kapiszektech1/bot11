const { Client, GatewayIntentBits } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
const http = require('http');
require('dotenv').config();

// Serwer HTTP dla Koyeb
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.write('Bot is online!');
  res.end();
}).listen(port);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const WELCOME_CHANNEL_ID = '1457675865524801568';

client.once('ready', () => {
    console.log(`--- REP VAULT Bot Online ---`);
});

// Poprawiona funkcja na dołączenie
client.on('guildMemberAdd', async (member) => {
    // Wymuszamy pobranie pełnych danych o serwerze
    const guild = await member.guild.fetch();
    const channel = guild.channels.cache.get(WELCOME_CHANNEL_ID);
    
    if (channel) {
        const embed = createWelcomeEmbed(member);
        await channel.send({ embeds: [embed] });
    }
});

// Poprawiona komenda testowa
client.on('messageCreate', async (message) => {
    if (message.content === '!powitania-test') {
        // Wymuszamy odświeżenie danych serwera przed testem
        const guild = await message.guild.fetch();
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: `🚀 **Test dla serwera: ${guild.name}**`, embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
