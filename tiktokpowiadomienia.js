const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

// --- KONFIGURACJA DLA 02,03 ---
const TIKTOK_RSS_URL = 'https://rss.app/feeds/mjKROzz3jctsnMOp.xml'; 
const CHANNEL_ID = '1457675907543334973';
const LUXURY_BLUE = 0x00008B; // Ciemny niebieski zgodny z Vault Rep
let lastVideo = ""; 

module.exports = {
    checkTikTok: async (client) => {
        try {
            const feed = await parser.parseURL(TIKTOK_RSS_URL);
            if (!feed.items.length) return;
            const latestItem = feed.items[0];

            if (latestItem.link !== lastVideo) {
                if (lastVideo !== "") { 
                    const channel = await client.channels.fetch(CHANNEL_ID);
                    if (!channel) return;

                    // Wyciąganie miniatury z treści RSS (jeśli dostępna)
                    const thumbnail = latestItem.content?.match(/src="([^"]+)"/)?.[1] || "";

                    const embed = new EmbedBuilder()
                        .setColor(LUXURY_BLUE)
                        .setAuthor({ 
                            name: 'VAULT REP | SOCIAL ALERTS', 
                            iconURL: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png' 
                        })
                        .setTitle(`🎬 NOWY FILM: ${latestItem.title || 'Kliknij by zobaczyć'}`)
                        .setURL(latestItem.link)
                        .setDescription(
                            `🚀 **Właśnie wleciał nowy materiał!**\n\n` +
                            `Bądź na bieżąco z najnowszymi dropami i informacjami ze świata VAULT REP.\n\n` +
                            `🔗 **Link do filmu:** [Kliknij tutaj](${latestItem.link})`
                        )
                        .setImage(thumbnail) // Miniaturka filmu jako duży obraz
                        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png') // Logo bota jako mała ikonka
                        .setFooter({ text: 'VAULT REP Security • System automatyczny', iconURL: client.user.displayAvatarURL() })
                        .setTimestamp();

                    await channel.send({ content: '🔔 **Nowa aktywność na TikToku!**', embeds: [embed] });
                }
                lastVideo = latestItem.link;
            }
        } catch (error) {
            console.error('Błąd sprawdzania TikToka:', error);
        }
    },

    sendTest: async (client, channel) => {
        try {
            const feed = await parser.parseURL(TIKTOK_RSS_URL);
            if (!feed.items.length) return channel.send("❌ Nie znaleziono filmów w RSS.");
            const latestItem = feed.items[0];
            const thumbnail = latestItem.content?.match(/src="([^"]+)"/)?.[1] || "";

            const embed = new EmbedBuilder()
                .setColor(LUXURY_BLUE)
                .setAuthor({ 
                    name: 'VAULT REP | TEST POWIADOMIENIA', 
                    iconURL: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png' 
                })
                .setTitle(`💎 [PREVIEW] Ostatni film: ${latestItem.title || 'TikTok'}`)
                .setURL(latestItem.link)
                .setDescription(
                    `Tak prezentuje się estetyczny panel powiadomień:\n\n` +
                    `📺 **Status:** Online\n` +
                    `✨ **Styl:** Dark Blue\n\n` +
                    `🔗 **URL:** ${latestItem.link}`
                )
                .setImage(thumbnail)
                .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png')
                .setFooter({ text: 'Podgląd systemowy VAULT REP' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            channel.send("❌ Błąd testu.");
            console.error(error);
        }
    }
};
