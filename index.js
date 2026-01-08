const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
const { createLuxuryInviteEmbed } = require('./zaproszenia.js');
const panelKupony = require('./panel-kupony.js');
const tickets = require('./tickets.js'); 
const linkCommand = require('./link.js');
const elitePanel = require('./elitepanel.js'); 
const tiktok = require('./tiktokpowiadomienia.js');
const pingOsoby = require('./pingosoby.js'); // DODANO: Import systemu pingowania po weryfikacji
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
    
    // --- STATUS STREAMOWANIA ---
    client.user.setPresence({
        activities: [{ 
            name: 'REP VAULT | 410$ BIO', 
            type: ActivityType.Streaming,
            url: 'https://www.twitch.tv/discord' 
        }],
        status: 'online',
    });

    // --- AUTOMATYCZNE SPRAWDZANIE TIKTOKA (Co 1 minuta) ---
    setInterval(() => {
        tiktok.checkTikTok(client);
    }, 60000); 
    
    // Inicjalizacja zaproszeń
    for (const [id, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(guildInvites.map(inv => [inv.code, inv.uses])));
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
        return;
    }

    try {
        await tickets.handleInteraction(interaction);
    } catch (err) {
        console.error('Błąd podczas obsługi interakcji ticketów:', err);
    }
});

// --- SYSTEM PINGOWANIA PO WERYFIKACJI ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    await pingOsoby.handleRolePing(oldMember, newMember);
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

// --- KOMENDY TEKSTOWE ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!powitania-test') {
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: `🚀 **VAULT REP: Test systemu powitań**`, embeds: [embed] });
    }

    if (message.content === '!powiadomienia-test') {
        const allowedRoles = ['1457675858537091221', '1457675858553864274'];
        if (message.member.roles.cache.some(r => allowedRoles.includes(r.id))) {
            await tiktok.sendTest(client, message.channel);
        }
    }
});

client.login(process.env.TOKEN);
