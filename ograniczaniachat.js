// --- PLIK: ograniczeniachat.js (WERSJA BEZ MUTÓW) ---
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const CONFIG = {
    LOG_CHANNEL_ID: '1459249443512520889',
    BAD_WORDS: [
        /jeb/i, /pierdol/i, /skurwysyn/i, /pizd/i, /chuj/i, /cwel/i, /pedal/i,
        /porn/i, /hentai/i, /cycki/i, /sex/i, /nudes/i, /ruchanko/i,
        /sprzedam/i, /kupie/i, /buy/i, /sell/i, /trade/i, /wymiana/i, /paypal/i, /psc/i, /blik/i
    ]
};

module.exports = {
    handleChatModeration: async (message) => {
        if (message.author.bot || !message.guild || !message.member) return;
        if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const containsBadWord = CONFIG.BAD_WORDS.some(pattern => pattern.test(message.content));

        if (containsBadWord) {
            try {
                // 1. USUŃ WIADOMOŚĆ
                await message.delete().catch(() => {});

                // 2. OSTRZEŻENIE DM
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('⚠️ OSTRZEŻENIE – VAULT REP')
                    .setDescription(`Twoja wiadomość została usunięta ze względu na niedozwolone treści (wulgaryzmy lub próba handlu).`)
                    .addFields({ name: 'Treść wiadomości:', value: `\`\`\`${message.content}\`\`\`` });

                await message.author.send({ embeds: [dmEmbed] }).catch(() => {});

                // 3. LOGI DLA 02,03
                const logChannel = message.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setAuthor({ name: 'MODERACJA', iconURL: message.author.displayAvatarURL() })
                        .setTitle('🗑️ USUNIĘTO WIADOMOŚĆ')
                        .addFields(
                            { name: 'Użytkownik:', value: `${message.author} (${message.author.tag})`, inline: true },
                            { name: 'Kanał:', value: `${message.channel}`, inline: true },
                            { name: 'Treść:', value: `\`\`\`${message.content}\`\`\`` }
                        )
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            } catch (error) {
                console.error('[VAULT REP] Błąd moderacji:', error);
            }
        }
    }
};
