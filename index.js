const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const http = require('http');
require('dotenv').config();

// --- IMPORTY MODUŁÓW Z WERYFIKACJĄ ---
const { createWelcomeEmbed } = require('./powitania.js');
const panelKupony = require('./panel-kupony.js');
const tickets = require('./tickets.js'); 
const linkCommand = require('./link.js');
const elitePanel = require('./elitepanel.js'); 
const regulaminPanel = require('./regulaminpanel.js');
const panelZarobek = require('./panel-zarobek.js'); 
const kalkulator = require('./kalkulator.js');
const moderacja = require('./moderacja.js');
// Pozostałe importy (jeśli używane wewnątrz powyższych plików, nie muszą być tutaj)

// --- SERWER HTTP (Uptime dla hostingu) ---
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

// --- EVENT: READY ---
client.on('ready', async () => {
    console.log(`✅ [SYSTEM] Zalogowano jako: ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'REP VAULT | 410$ BIO', type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' }],
        status: 'online',
    });
});

// --- GŁÓWNA OBSŁUGA INTERAKCJI ---
client.on('interactionCreate', async interaction => {
    // 1. OBSŁUGA KOMEND SLASH
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        console.log(`[LOG] Wywołano komendę: /${commandName} przez ${interaction.user.tag}`);

        try {
            // Mapa komend dla przejrzystości i łatwej diagnostyki
            const commandMap = {
                'panel-kupony': panelKupony,
                'panel-ticket': tickets,
                'link': linkCommand,
                'elite-panel': elitePanel,
                'regulamin-panel': regulaminPanel,
                'panel-zarobek': panelZarobek,
                'obliczwage': kalkulator
            };

            // Sprawdzenie moderacji
            const modCommands = ['ban', 'kick', 'mute', 'warn'];
            if (modCommands.includes(commandName)) {
                if (moderacja && typeof moderacja.execute === 'function') {
                    return await moderacja.execute(interaction);
                }
            }

            // Dynamiczne wywołanie modułu z mapy
            const module = commandMap[commandName];
            if (module) {
                if (typeof module.execute === 'function') {
                    return await module.execute(interaction);
                } else {
                    throw new Error(`Moduł "${commandName}" nie posiada funkcji "execute".`);
                }
            }
        } catch (err) {
            console.error(`❌ [BŁĄD KOMENDY /${interaction.commandName}]:`, err.message);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: `⚠️ Wystąpił błąd podczas wykonywania komendy: \`${err.message}\``, 
                    ephemeral: true 
                }).catch(() => {});
            }
        }
    }

    // 2. OBSŁUGA PRZYCISKÓW I FORMULARZY (MODALI)
    if (interaction.isButton() || interaction.isModalSubmit()) {
        try {
            const customId = interaction.customId;

            // Priorytet: Kalkulator (wszystkie ID calc_*)
            if (customId.startsWith('calc_')) {
                return await kalkulator.handleInteraction(interaction);
            }

            // Obsługa Ticketów
            if (tickets && typeof tickets.handleInteraction === 'function') {
                await tickets.handleInteraction(interaction).catch(e => console.error("Błąd Ticketów:", e));
            }

            // Obsługa Zarobku (jeśli posiada interakcje)
            if (panelZarobek && typeof panelZarobek.handleInteraction === 'function') {
                await panelZarobek.handleInteraction(interaction).catch(e => console.error("Błąd Zarobku:", e));
            }

        } catch (err) {
            console.error("❌ [BŁĄD PRZYCISKU/MODALA]:", err);
        }
    }
});

// --- OBSŁUGA KOMEND TEKSTOWYCH (!) ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // Komenda !obliczwage
    if (message.content === '!obliczwage') {
        try {
            await kalkulator.execute(message);
        } catch (err) {
            console.error("❌ [BŁĄD !obliczwage]:", err);
        }
    }

    // Komenda !powitania-test
    if (message.content === '!powitania-test') {
        try {
            const embed = createWelcomeEmbed(message.member);
            await message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error("❌ [BŁĄD !powitania-test]:", err);
            message.reply("Nie udało się wysłać testowego powitania. Sprawdź konsolę.");
        }
    }
});

// --- SYSTEM POWITAŃ ---
client.on('guildMemberAdd', async (member) => {
    try {
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (welcomeChannel) {
            const embed = createWelcomeEmbed(member);
            await welcomeChannel.send({ embeds: [embed] });
        } else {
            console.warn(`⚠️ Nie znaleziono kanału powitań o ID: ${WELCOME_CHANNEL_ID}`);
        }
    } catch (err) {
        console.error("❌ [BŁĄD guildMemberAdd]:", err);
    }
});

// --- LOGOWANIE BOTA ---
client.login(process.env.TOKEN);
