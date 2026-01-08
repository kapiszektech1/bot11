const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

// --- KONFIGURACJA DLA 02,03 ---
const TIKTOK_RSS_URL = 'https://rss.app/feeds/mjKROzz3jctsnMOp.xml'; 
const CHANNEL_ID = '1457675907543334973';
const LUXURY_BLUE = 0x00008B; 
const NEW_LOGO = 'https://cdn.discordapp.com/attachments/1458122275973890222/1458455764984397972/image.png';

let lastVideo = "wymuszenie_wysylki"; 

module.exports = {
    checkTikTok: async (client) => {
        try {
            // Pobieramy RSS z wymuszeniem braku cache (dodajemy timestamp)
            const feed = await parser.parseURL(`${TIKTOK_RSS_URL}?t=${Date.now()}`);
            if (!feed || !feed.items.length) return;
            
            // Pobieramy absolutnie najnowszy element z samej góry
            const latestItem = feed.items[0];

            if (latestItem.link !== lastVideo) {
                const channel = await client.channels.fetch(CHANNEL_ID);
                if (!channel) return;

                // Próba wyciągnięcia miniatury filmu
                const thumbnail = latestItem.content?.match(/src="([^"]+)"/)?.[1] || "";

                const embed = new EmbedBuilder()
                    .setColor(LUXURY_BLUE)
                    .setAuthor({ 
                        name: 'VAULT REP | SOCIAL ALERTS', 
                        iconURL: NEW_LOGO 
                    })
                    .setTitle(`🎬 NOWY FILM: ${latestItem.title || 'Kliknij by zobaczyć'}`)
                    .setURL(latestItem.link)
                    .setDescription(
                        `🚀 **Właśnie wleciał nowy materiał!**\n\n` +
                        `Bądź na bieżąco z najnowszymi dropami i informacjami ze świata VAULT REP.\n\n` +
                        `🔗 **Link do filmu:** [Kliknij tutaj](${latestItem.link})`
                    )
                    .setImage(thumbnail) 
                    .setThumbnail(NEW_LOGO)
                    .setFooter({ text: 'VAULT REP Security • System automatyczny' })
                    .setTimestamp();

                await channel.send({ content: '🔔 **Nowa aktywność na TikToku!**', embeds: [embed] });
                
                lastVideo = latestItem.link;
                console.log(`[TikTok] Wysłano powiadomienie dla: ${lastVideo}`);
            }
        } catch (error) {
            console.error('Błąd sprawdzania TikToka:', error);
        }
    },

    sendTest: async (client, channel) => {
        try {
            const feed = await parser.parseURL(TIKTOK_RSS_URL);
            if (!feed || !feed.items.length) return channel.send("❌ Nie znaleziono filmów.");
            const latestItem = feed.items[0];
            const thumbnail = latestItem.content?.match(/src="([^"]+)"/)?.[1] || "";

            const embed = new EmbedBuilder()
                .setColor(LUXURY_BLUE)
                .setAuthor({ 
                    name: 'VAULT REP | TEST POWIADOMIENIA', 
                    iconURL: NEW_LOGO 
                })
                .setTitle(`💎 [PREVIEW] Ostatni film: ${latestItem.title || 'TikTok'}`)
                .setURL(latestItem.link)
                .setDescription(
                    `Tak prezentuje się estetyczny panel powiadomień:\n\n` +
                    `📺 **Status:** Online\n` +
                    `✨ **Styl:** Luxury Dark Blue\n\n` +
                    `🔗 **URL:** ${latestItem.link}`
                )
                .setImage(thumbnail)
                .setThumbnail(NEW_LOGO)
                .setFooter({ text: 'Podgląd systemowy VAULT REP' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            channel.send("❌ Błąd testu.");
            console.error(error);
        }
    }
};
