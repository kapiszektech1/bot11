// --- PLIK: ograniczeniachat.js ---
const { EmbedBuilder } = require('discord.js');

const CONFIG = {
    ALLOWED_CHANNEL_ID: '1457675932482666613',
    LOG_CHANNEL_ID: '1459249443512520889',
    BAD_WORDS: [
        // --- OSTRE WULGARYZMY ---
        /jeb/i, /pierdol/i, /skurwysyn/i, /pizd/i, /chuj/i, /cwel/i, /pedal/i, /szmat/i, /dziwk/i, /kurew/i, /suko/i, /jebie/i, /dojeb/i, /wyjeb/i,

        // --- TREŚCI 18+ / NSFW ---
        /porn/i, /hentai/i, /cycki/i, /sex/i, /nudes/i, /ruchanko/i, /penis/i, /vagina/i, /pornhub/i, /onlyfans/i, /dziwka/i, /odbyt/i,

        // --- HANDEL / SCAM / FINANSE ---
        /sprzedam/i, /kupie/i, /buy/i, /sell/i, /trade/i, /wymiana/i, /paypal/i, /psc/i, /blik/i, /revolut/i, /krypto/i, /btc/i, /crypto/i,
        /konto/i, /account/i, /netflix/i, /spotify/i, /robux/i, /v-bucks/i, /giftcard/i, /tanie/i, /promocja/i, /okazja/i, /cash/i, /pieniadze/i,

        // --- KONKURENCJA / LINKI ZEWNĘTRZNE ---
        /discord.gg/i, /invite/i, /zapraszam na/i, /wejdzcie/i, /sklep/i, /shop/i
    ]
};

module.exports = {
    handleChatModeration: async (message) => {
        if (message.channel.id !== CONFIG.ALLOWED_CHANNEL_ID) return;
        if (message.author.bot || !message.guild || !message.member) return;

        const containsBadWord = CONFIG.BAD_WORDS.some(pattern => pattern.test(message.content));

        if (containsBadWord) {
            try {
                // Zachowujemy treść przed usunięciem do logów
                const censoredContent = message.content;

                // 1. USUŃ WIADOMOŚĆ
                await message.delete().catch(() => {});

                // 2. OSTRZEŻENIE DM
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('⚠️ OSTRZEŻENIE – VAULT REP')
                    .setDescription(`Twoja wiadomość na kanale <#${CONFIG.ALLOWED_CHANNEL_ID}> została usunięta ze względu na niedozwolone słownictwo lub ofertę handlową.`)
                    .addFields({ name: 'Treść wiadomości:', value: `\`\`\`${censoredContent}\`\`\`` });

                await message.author.send({ embeds: [dmEmbed] }).catch(() => {});

                // 3. LOGI DLA 02,03
                const logChannel = message.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setAuthor({ name: 'MODERACJA KANAŁU', iconURL: message.author.displayAvatarURL() })
                        .setTitle('🗑️ USUNIĘTO WIADOMOŚĆ')
                        .addFields(
                            { name: 'Użytkownik:', value: `${message.author} (${message.author.tag})`, inline: true },
                            { name: 'Kanał:', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Wykryty motyw:', value: 'Niedozwolone słowo / Oferta', inline: true },
                            { name: 'Pełna treść:', value: `\`\`\`${censoredContent}\`\`\`` }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
                console.log(`[VAULT REP] Zablokowano wiadomość na kanale 613 od ${message.author.tag}`);
            } catch (error) {
                console.error('[VAULT REP] Błąd moderacji:', error);
            }
        }
    }
};
