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

client.on('ready', async () => {
    console.log(`✅ VAULT REP: Zalogowano jako ${client.user.tag}`);
    
    client.user.setPresence({
        activities: [{ 
            name: 'REP VAULT | 410$ BIO', 
            type: ActivityType.Streaming,
            url: 'https://www.twitch.tv/discord' 
        }],
        status: 'online',
    });

    setInterval(() => {
        tiktok.checkTikTok(client);
    }, 300000); 
    
    // Pobieranie zaproszeń przy starcie
    for (const [id, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(guildInvites.map(inv => [inv.code, inv.uses])));
            console.log(`Pobrano zaproszenia dla: ${guild.name}`);
        } catch (err) {
            console.log(`Błąd zaproszeń dla: ${guild.name}`);
        }
    }
});

// --- OBSŁUGA INTERAKCJI ---
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        if (commandName === 'panel-kupony') return await panelKupony.execute(interaction);
        if (commandName === 'panel-ticket') return await tickets.execute(interaction);
        if (commandName === 'link') return await linkCommand.execute(interaction);
        if (commandName === 'elite-panel') return await elitePanel.execute(interaction);
        if (commandName === 'regulamin-panel') return await regulaminPanel.execute(interaction);
        if (commandName === 'panel-zarobek') return await panelZarobek.execute(interaction);

        const modCommands = ['ban', 'kick', 'mute', 'warn'];
        if (modCommands.includes(commandName)) return await moderacja.execute(interaction);

        const toolCommands = ['ping', 'userinfo', 'serverinfo', 'clear'];
        if (toolCommands.includes(commandName)) return await narzedzia.execute(interaction);
    }
    try {
        await tickets.handleInteraction(interaction);
    } catch (err) {
        console.error('Błąd ticketów:', err);
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    await pingOsoby.handleRolePing(oldMember, newMember);
});

// --- POPRAWIONA SEKCJA ZAPROSZEŃ DLA 02,03 ---
client.on('guildMemberAdd', async (member) => {
    // 1. Powitanie
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
        const welcomeEmbed = createWelcomeEmbed(member);
        await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }

    // 2. Logika Zaproszeń
    const logChannel = member.guild.channels.cache.get(INVITE_LOG_CHANNEL_ID);
    if (logChannel) {
        try {
            const newInvites = await member.guild.invites.fetch();
            const oldInvites = invites.get(member.guild.id);
            
            // Szukamy użytego kodu
            const invite = newInvites.find(i => i.uses > (oldInvites?.get(i.code) || 0));
            const inviter = invite ? invite.inviter : null;

            // Aktualizacja pamięci
            invites.set(member.guild.id, new Collection(newInvites.map(inv => [inv.code, inv.uses])));

            // Wysyłanie embeda z zaproszenia.js
            const inviteEmbed = createLuxuryInviteEmbed(member, inviter);
            await logChannel.send({ embeds: [inviteEmbed] });
        } catch (e) {
            console.error("Błąd śledzenia zaproszeń:", e);
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await chatMod.handleChatModeration(message);

    if (message.content === '!powitania-test') {
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: `🚀 **VAULT REP: Test powitań**`, embeds: [embed] });
    }
    if (message.content === '!powiadomienia-test') {
        const allowedRoles = ['1457675858537091221', '1457675858553864274'];
        if (message.member.roles.cache.some(r => allowedRoles.includes(r.id))) {
            await tiktok.sendTest(client, message.channel);
        }
    }
});

console.log("--- Próba nawiązania połączenia z Discordem... ---");
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ BŁĄD LOGOWANIA:", err);
});
client.on('error', console.error);
