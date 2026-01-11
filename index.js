const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
const { createLuxuryInviteEmbed } = require('./zaproszenia.js');
const panelKupony = require('./panel-kupony.js');
const tickets = require('./tickets.js'); 
const linkCommand = require('./link.js');
const elitePanel = require('./elitepanel.js'); 
const tiktok = require('./tiktokpowiadomienia.js');
const pingOsoby = require('./pingosoby.js');
const chatMod = require('./ograniczaniachat.js');
const moderacja = require('./moderacja.js');
const narzedzia = require('./narzedzia.js');
const regulaminPanel = require('./regulaminpanel.js');
const panelZarobek = require('./panel-zarobek.js'); 
const kalkulator = require('./kalkulator.js');
const http = require('http');
require('dotenv').config();

// --- SERWER HTTP (Uptime) ---
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('VAULT REP SYSTEM: ONLINE');
    res.end();
}).listen(port);

// --- KLIENT ---
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
const invites = new Collection();

// --- READY ---
client.on('ready', async () => {
    console.log(`✅ VAULT REP: Zalogowano jako ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'REP VAULT | 410$ BIO', type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' }],
        status: 'online',
    });
});

// --- INTERAKCJE ---
client.on('interactionCreate', async interaction => {
    try {
        // 1. SLASH COMMANDS
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            
            if (commandName === 'panel-kupony') return await panelKupony.execute(interaction);
            if (commandName === 'panel-ticket') return await tickets.execute(interaction);
            if (commandName === 'link') return await linkCommand.execute(interaction);
            if (commandName === 'elite-panel') return await elitePanel.execute(interaction);
            if (commandName === 'regulamin-panel') return await regulaminPanel.execute(interaction);
            if (commandName === 'panel-zarobek') return await panelZarobek.execute(interaction);
            if (commandName === 'obliczwage') return await kalkulator.execute(interaction);
            
            const modCommands = ['ban', 'kick', 'mute', 'warn'];
            if (modCommands.includes(commandName)) return await moderacja.execute(interaction);
        }

        // 2. BUTTONS & MODALS
        if (interaction.isButton() || interaction.isModalSubmit()) {
            const customId = interaction.customId;

            // Kalkulator
            if (customId.startsWith('calc_')) {
                return await kalkulator.handleInteraction(interaction);
            }

            // Tickety (usuwamy return, by błąd w ticketach nie blokował reszty)
            await tickets.handleInteraction(interaction).catch(err => console.error("Błąd Ticketów:", err));

            // Jeśli panel-zarobek lub kupony mają własne handleInteraction, dodaj je tutaj:
            if (typeof panelZarobek.handleInteraction === 'function') {
                await panelZarobek.handleInteraction(interaction).catch(() => {});
            }
        }

    } catch (err) {
        console.error("❌ KRYTYCZNY BŁĄD INTERAKCJI:", err);
    }
});

// --- WIADOMOŚCI ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!obliczwage') {
        try {
            await kalkulator.execute(message);
        } catch (err) {
            console.error("❌ BŁĄD KALKULATORA:", err);
        }
    }

    if (message.content === '!powitania-test') {
        try {
            const embed = createWelcomeEmbed(message.member);
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error("❌ BŁĄD TESTU POWITANIA:", err);
        }
    }
});

// --- POWITANIA ---
client.on('guildMemberAdd', async (member) => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (welcomeChannel) {
            await welcomeChannel.send({ embeds: [createWelcomeEmbed(member)] });
        }
    } catch (err) {
        console.log("Błąd powitania:", err);
    }
});

client.login(process.env.TOKEN);
