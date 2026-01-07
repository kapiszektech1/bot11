const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
const { createLuxuryInviteEmbed } = require('./zaproszenia.js');
const panelKupony = require('./panel-kupony.js'); // Import nowego pliku
const http = require('http');
require('dotenv').config();

// --- SYSTEM ANTI-SLEEP DLA KOYEB ---
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('VAULT REP SYSTEM: ONLINE');
    res.end();
}).listen(port, () => {
    console.log(`--- Serwer Keep-Alive aktywny na porcie ${port} ---`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites
    ]
});

// KONFIGURACJA KANAŁÓW VAULT REP
const WELCOME_CHANNEL_ID = '1457675865524801568'; 
const INVITE_LOG_CHANNEL_ID = '1457675879219200033'; 

const invites = new Collection();

client.once('ready', async () => {
    console.log(`--- VAULT REP Bot Online ---`);
    
    for (const [id, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(guildInvites.map(inv => [inv.code, inv.uses])));
        } catch (err) {
            console.log(`Błąd pobierania zaproszeń dla: ${guild.name}`);
        }
    }
});

// --- OBSŁUGA KOMEND SLASH ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Wywołanie panelu kuponów z osobnego pliku
    if (interaction.commandName === panelKupony.name) {
        await panelKupony.execute(interaction);
    }
});

client.on('guildMemberAdd', async (member) => {
    // 1. POWITANIE
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
        const welcomeEmbed = createWelcomeEmbed(member);
        await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }

    // 2. LOGI ZAPROSZEŃ
    const logChannel = member.guild.channels.cache.get(INVITE_LOG_CHANNEL_ID);
    if (logChannel) {
        const newInvites = await member.guild.invites.fetch().catch(() => new Collection());
        const oldInvites = invites.get(member.guild.id);
        const invite = newInvites.find(i => i.uses > (oldInvites?.get(i.code) || 0));
        const inviter = invite ? invite.inviter : null;

        invites.set(member.guild.id, new Collection(newInvites.map(inv => [inv.code, inv.uses])));

        const inviteEmbed = createLuxuryInviteEmbed(member, inviter);
        await logChannel.send({ embeds: [inviteEmbed] }).catch(console.error);
    }
});

client.on('messageCreate', async (message) => {
    if (message.content === '!powitania-test' && !message.author.bot) {
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: `🚀 **VAULT REP: Test systemu powitań**`, embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
