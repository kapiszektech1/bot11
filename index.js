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

// --- SERWER KEEP-ALIVE ---
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('VAULT REP SYSTEM: ONLINE');
}).listen(port);

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

client.on('ready', async () => {
    console.log(`✅ VAULT REP: Zalogowano jako ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'REP VAULT | 410$ BIO', type: ActivityType.Streaming, url: 'https://www.twitch.tv/discord' }],
        status: 'online',
    });

    for (const [id, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(guildInvites.map(inv => [inv.code, inv.uses])));
        } catch (err) { console.log("Błąd zaproszeń"); }
    }
});

// --- OBSŁUGA INTERAKCJI ---
client.on('interactionCreate', async interaction => {
    // 1. KOMENDY SLASH
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

        const toolCommands = ['ping', 'userinfo', 'serverinfo', 'clear'];
        if (toolCommands.includes(commandName)) return await narzedzia.execute(interaction);
    }

    // 2. PRZYCISKI, MODALE I MENU (NAPRAWIONE)
    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        // Kalkulator
        if (interaction.customId.startsWith('calc_') || interaction.customId.startsWith('modal_ai')) {
            return await kalkulator.handleInteraction(interaction);
        }

        // TICKETY (Wysłanie każdej innej interakcji do ticketów)
        try {
            if (tickets && typeof tickets.handleInteraction === 'function') {
                await tickets.handleInteraction(interaction);
            }
        } catch (err) {
            console.error('Błąd ticketów:', err);
        }
    }
});

// --- RESTA EVENTÓW ---
client.on('guildMemberUpdate', async (old, m) => await pingOsoby.handleRolePing(old, m));
client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) await welcomeChannel.send({ embeds: [createWelcomeEmbed(member)] }).catch(() => {});
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await chatMod.handleChatModeration(message);
    if (message.content === '!powitania-test') await message.channel.send({ embeds: [createWelcomeEmbed(message.member)] });
});

client.login(process.env.TOKEN);
