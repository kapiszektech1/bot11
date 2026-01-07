const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
const { createLuxuryInviteEmbed } = require('./zaproszenia.js');
const panelKupony = require('./panel-kupony.js');
const tickets = require('./tickets.js'); 
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

const WELCOME_CHANNEL_ID = '1457675865524801568'; 
const INVITE_LOG_CHANNEL_ID = '1457675879219200033'; 

const invites = new Collection();

client.once('ready', async () => {
    console.log(`--- VAULT REP Bot Online ---`);
    
    // Inicjalizacja zaproszeń
    for (const [id, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(guildInvites.map(inv => [inv.code, inv.uses])));
        } catch (err) {
            console.log(`Błąd zaproszeń dla: ${guild.name}`);
        }
    }
    // STATUS: Automatyczne wysyłanie panelu zostało USUNIĘTE.
});

// --- OBSŁUGA INTERAKCJI (KOMENDY, PRZYCISKI, MENU, MODALE) ---
client.on('interactionCreate', async interaction => {
    // 1. Obsługa komend Slash
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        // Panel Kuponów
        if (commandName === 'panel-kupony') {
            return await panelKupony.execute(interaction);
        }

        // Panel Ticketów (Wywołanie funkcji execute z tickets.js)
        if (commandName === 'panel-ticket') {
            return await tickets.execute(interaction);
        }
        return;
    }

    // 2. Obsługa Menu, Przycisków i Modali (System Ticketów)
    try {
        await tickets.handleInteraction(interaction);
    } catch (err) {
        console.error('Błąd podczas obsługi interakcji ticketów:', err);
    }
});

// --- POWITANIA I LOGI ZAPROSZEŃ ---
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
        const welcomeEmbed = createWelcomeEmbed(member);
        await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }

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

// --- TEST POWITAŃ ---
client.on('messageCreate', async (message) => {
    if (message.content === '!powitania-test' && !message.author.bot) {
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: `🚀 **VAULT REP: Test systemu powitań**`, embeds: [embed] });
    }
});

client.login(process.env.TOKEN)
