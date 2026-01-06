const { Client, GatewayIntentBits } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
require('dotenv').config();

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

client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (channel) {
        const embed = createWelcomeEmbed(member);
        await channel.send({ embeds: [embed] });
    }
});

client.on('messageCreate', async (message) => {
    if (message.content === '!powitania-test') {
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: '🚀 **Test:**', embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
