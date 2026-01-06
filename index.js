const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { createWelcomeEmbed } = require('./powitania.js');
const { createLuxuryInviteEmbed } = require('./zaproszenia.js'); // Import nowego pliku
const http = require('http');
require('dotenv').config();

// Serwer HTTP dla Koyeb
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.write('VAULT REP Bot is online!');
  res.end();
}).listen(port);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites // Potrzebne do śledzenia zaproszeń
    ]
});

// KONFIGURACJA KANAŁÓW
const WELCOME_CHANNEL_ID = '1457675865524801568'; // Kanał powitalny
const INVITE_LOG_CHANNEL_ID = '1457675879219200033'; // Kanał dla ciemnoniebieskiego panelu

const invites = new Collection();

client.once('ready', async () => {
    console.log(`--- VAULT REP Bot Online ---`);
    
    // Pobieramy zaproszenia na start, żeby bot wiedział kto kogo zaprasza
    for (const [id, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(guildInvites.map(inv => [inv.code, inv.uses])));
        } catch (err) {
            console.log(`Nie udało się pobrać zaproszeń dla: ${guild.name}`);
        }
    }
});

client.on('guildMemberAdd', async (member) => {
    // 1. OBSŁUGA POWITANIA (Zwykłe)
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (welcomeChannel) {
        const welcomeEmbed = createWelcomeEmbed(member);
        await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
    }

    // 2. OBSŁUGA LOGÓW ZAPROSZEŃ (Ciemnoniebieski panel Luxury)
    const logChannel = member.guild.channels.cache.get(INVITE_LOG_CHANNEL_ID);
    if (logChannel) {
        // Logika szukania zapraszającego
        const newInvites = await member.guild.invites.fetch().catch(() => new Collection());
        const oldInvites = invites.get(member.guild.id);
        const invite = newInvites.find(i => i.uses > (oldInvites?.get(i.code) || 0));
        const inviter = invite ? invite.inviter : null;

        // Aktualizacja pamięci zaproszeń
        invites.set(member.guild.id, new Collection(newInvites.map(inv => [inv.code, inv.uses])));

        const inviteEmbed = createLuxuryInviteEmbed(member, inviter);
        await logChannel.send({ embeds: [inviteEmbed] }).catch(console.error);
    }
});

// Komenda testowa
client.on('messageCreate', async (message) => {
    if (message.content === '!powitania-test') {
        const guild = await message.guild.fetch();
        const embed = createWelcomeEmbed(message.member);
        await message.channel.send({ content: `🚀 **Test powitania dla: ${guild.name}**`, embeds: [embed] });
    }
});

client.login(process.env.TOKEN);
