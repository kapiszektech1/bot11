const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const http = require('http');
require('dotenv').config();

// --- SERWER UPTIME ---
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('VAULT ONLINE');
}).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites
    ]
});

// --- IMPORTY Z DIAGNOSTYKĄ ---
const load = (path) => {
    try {
        return require(path);
    } catch (e) {
        console.error(`❌ !!! BŁĄD W PLIKU ${path} !!!`);
        console.error(e.message);
        return null;
    }
};

const panelKupony = load('./panel-kupony.js');
const tickets = load('./tickets.js'); 
const linkCommand = load('./link.js');
const elitePanel = load('./elitepanel.js'); 
const regulaminPanel = load('./regulaminpanel.js');
const panelZarobek = load('./panel-zarobek.js'); 
const kalkulator = load('./kalkulator.js');
const moderacja = load('./moderacja.js');

client.on('ready', () => {
    console.log(`✅ VAULT SYSTEM GOTOWY | ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'REP VAULT | 410$ BIO', type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' }],
        status: 'online',
    });
});

client.on('interactionCreate', async (interaction) => {
    const commandMap = {
        'panel-kupony': panelKupony,
        'panel-ticket': tickets,
        'link': linkCommand,
        'elite-panel': elitePanel,
        'regulamin-panel': regulaminPanel,
        'panel-zarobek': panelZarobek,
        'obliczwage': kalkulator
    };

    // OBSŁUGA KOMEND SLASH
    if (interaction.isChatInputCommand()) {
        const modCommands = ['ban', 'kick', 'mute', 'warn'];
        if (modCommands.includes(interaction.commandName)) {
            return await moderacja?.execute(interaction);
        }

        const cmd = commandMap[interaction.commandName];
        if (cmd && (cmd.execute)) {
            return await cmd.execute(interaction);
        } else {
            return await interaction.reply({ content: `❌ Błąd: Komenda /${interaction.commandName} nie jest poprawnie załadowana.`, ephemeral: true });
        }
    }

    // OBSŁUGA PRZYCISKÓW / MENU / MODALI
    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        const cId = interaction.customId;

        if (cId === 'ticket_select' || cId.startsWith('modal_') || cId.startsWith('ticket_')) {
            return await tickets?.handleInteraction(interaction);
        }
        if (cId.startsWith('calc_')) {
            return await kalkulator?.handleInteraction(interaction);
        }
        if (panelZarobek?.handleInteraction) {
            return await panelZarobek.handleInteraction(interaction);
        }
    }
});

client.login(process.env.TOKEN);
