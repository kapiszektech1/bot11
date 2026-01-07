const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

// --- KONFIGURACJA DLA 02,03 ---
const TIKTOK_RSS_URL = 'https://rss.app/feeds/mjKROzz3jctsnMOp.xml'; 
const CHANNEL_ID = '1457675907543334973';
let lastVideo = ""; 

module.exports = {
    // Automatyczne sprawdzanie (wywoływane co 1 minutę przez index.js)
    checkTikTok: async (client) => {
        try {
            const feed = await parser.parseURL(TIKTOK_RSS_URL);
            if (!feed.items.length) return;
            const latestItem = feed.items[0];

            // Sprawdzamy, czy link jest inny niż ostatnio zapamiętany
            if (latestItem.link !== lastVideo) {
                // Warunek lastVideo !== "" zapobiega wysyłaniu powiadomienia o starym filmie przy restarcie bota
                if (lastVideo !== "") { 
                    const channel = await client.channels.fetch(CHANNEL_ID);
                    if (!channel) return;

                    const embed = new EmbedBuilder()
                        .setColor(0xFF0050)
                        .setAuthor({ 
                            name: 'NOWY FILM NA TIKTOKU!', 
                            iconURL: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458455764984397972/image.png?ex=695fb447&is=695e62c7&hm=87300e39506eead953542c93702a6bb61c48b5aa48b05ac5538dc5bc922148b0' 
                        })
                        .setTitle(latestItem.title || '🚀 Nowy film od 4xhm!')
                        .setURL(latestItem.link)
                        .setDescription(`**Wleciał nowy film! Kliknij w link powyżej, aby go obejrzeć.**\n\n${latestItem.link}`)
                        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png')
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }
                // Aktualizujemy ostatni film w pamięci bota
                lastVideo = latestItem.link;
            }
        } catch (error) {
            console.error('Błąd sprawdzania TikToka:', error);
        }
    },

    // Komenda testowa !powiadomienia-test
    sendTest: async (client, channel) => {
        try {
            const feed = await parser.parseURL(TIKTOK_RSS_URL);
            if (!feed.items.length) return channel.send("❌ Nie znaleziono filmów w RSS.");
            const latestItem = feed.items[0];

            const embed = new EmbedBuilder()
                .setColor(0xFF0050)
                .setAuthor({ 
                    name: 'TEST POWIADOMIENIA', 
                    iconURL: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458455764984397972/image.png' 
                })
                .setTitle(`[TEST] Ostatni film: ${latestItem.title || 'Kliknij tutaj'}`)
                .setURL(latestItem.link)
                .setDescription(`Tak będzie wyglądać powiadomienie po wrzuceniu nowego filmu:\n\n${latestItem.link}`)
                .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1458464723531202622/image.png')
                .setFooter({ text: 'VAULT REP Social Alerts' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            channel.send("❌ Błąd testu. Sprawdź czy link RSS jest poprawny.");
            console.error(error);
        }
    }
};
