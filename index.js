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

// --- SERWER HTTP (DLA PODTRZYMANIA HOSTINGU) ---
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('VAULT REP SYSTEM: ONLINE');
    res.end();
}).listen(port);

// --- KONFIGURACJA KLIENTA ---
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

// --- EVENT: READY ---
client.on('ready', async () => {
    console.log(`✅ VAULT REP: Zalogowano jako ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'REP VAULT | 410$ BIO', type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' }],
        status: 'online',
    });
});

// --- EVENT: INTERACTION CREATE (SLASH / PRZYCISKI / MODALE) ---
client.on('interactionCreate', async interaction => {
    try {
        // 1. OBSŁUGA KOMEND SLASH (/)
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            
            if (commandName === 'panel-kupony') return await panelKupony.execute(interaction);
            if (commandName === 'panel-ticket') return await tickets.execute(interaction);
            if (commandName === 'link') return await linkCommand.execute(interaction);
            if (commandName === 'elite-panel') return await elitePanel.execute(interaction);
            if (commandName === 'regulamin-panel') return await regulaminPanel.execute(interaction);
            if (commandName === 'panel-zarobek') return await panelZarobek.execute(interaction);
            if (commandName === 'obliczwage') return await kalkulator.execute(interaction);
            
            // Komendy moderacyjne
            const modCommands = ['ban', 'kick', 'mute', 'warn'];
            if (modCommands.includes(commandName)) return await moderacja.execute(interaction);
        }

        // 2. OBSŁUGA PRZYCISKÓW I FORMULARZY (MODALI)
        if (interaction.isButton() || interaction.isModalSubmit()) {
            
            // Priorytet dla Kalkulatora (wszystkie ID zaczynające się od calc_)
            if (interaction.customId.startsWith('calc_')) {
                return await kalkulator.handleInteraction(interaction);
            }

            // Obsługa Ticketów i pozostałych interakcji
            // Używamy .catch, aby błąd w jednym module nie kraszował całego bota
            await tickets.handleInteraction(interaction).catch(err => console.error("Błąd Ticketów:", err));
        }

    } catch (err) {
        console.error("❌ OGÓLNY BŁĄD INTERAKCJI:", err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Wystąpił błąd podczas wykonywania tej akcji.', ephemeral: true }).catch(() => {});
        }
    }
});

// --- EVENT: MESSAGE CREATE (KOMENDY TEKSTOWE !) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Logowanie wiadomości (Debug)
    // console.log(`[DEBUG] ${message.author.username}: ${message.content}`);

    // Komenda !obliczwage
    if (message.content === '!obliczwage') {
        console.log(`[SYSTEM] Uruchamiam kalkulator dla ${message.author.username}`);
        try {
            return await kalkulator.execute(message);
        } catch (err) {
            console.error("❌ BŁĄD KALKULATORA:", err);
        }
    }

    // Komenda testowa powitań
    if (message.content === '!powitania-test') {
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ embeds: [embed] });
    }
});

// --- EVENT: GUILD MEMBER ADD (POWITANIA) ---
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
        await welcomeChannel.send({ embeds: [createWelcomeEmbed(member)] }).catch(e => console.log("Błąd powitania:", e));
    }
});

// --- LOGOWANIE BOTA ---
client.login(process.env.TOKEN);
