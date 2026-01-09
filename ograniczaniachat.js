// --- PLIK: ograniczeniachat.js ---
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const CONFIG = {
    ALLOWED_CHANNEL_ID: '1457675932482666613',
    LOG_CHANNEL_ID: '1459249443512520889',
    BAD_WORDS: [
        /jeb/i, /pierdol/i, /skurwysyn/i, /pizd/i, /chuj/i, /cwel/i, /pedal/i,
        /porn/i, /hentai/i, /cycki/i, /sex/i, /nudes/i, /ruchanko/i,
        /sprzedam/i, /kupie/i, /buy/i, /sell/i, /trade/i, /wymiana/i, /paypal/i, /psc/i, /blik/i
    ]
};

module.exports = {
    handleChatModeration: async (message) => {
        // 1. Sprawdzenie kanału i czy to nie bot
        if (message.channel.id !== CONFIG.ALLOWED_CHANNEL_ID) return;
        if (message.author.bot || !message.guild || !message.member) return;

        // USUNIĘTO: blokadę dla Administratora - teraz działa na KAŻDEGO

        // 2. Sprawdzenie zakazanych słów
        const containsBadWord = CONFIG.BAD_WORDS.some(pattern => pattern.test(message.content));

        if (containsBadWord) {
            try {
                // 3. USUŃ WIADOMOŚĆ
                await message.delete().catch(() => {});

                // 4. OSTRZEŻENIE DM
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('⚠️ OSTRZEŻENIE – VAULT REP')
                    .setDescription(`Twoja wiadomość na kanale <#${CONFIG.ALLOWED_CHANNEL_ID}> została usunięta.`)
                    .addFields({ name: 'Treść wiadomości:', value: `\`\`\`${message.content}\`\`\`` });

                await message.author.send({ embeds: [dmEmbed] }).catch(() => {
                    console.log(`[VAULT REP] Nie można wysłać DM do ${message.author.tag} (może ma zablokowane DM)`);
                });

                // 5. LOGI DLA 02,03
                const logChannel = message.guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setAuthor({ name: 'MODERACJA KANAŁU', iconURL: message.author.displayAvatarURL() })
                        .setTitle('🗑️ USUNIĘTO WIADOMOŚĆ')
                        .addFields(
                            { name: 'Użytkownik:', value: `${message.author} (${message.author.tag})`, inline: true },
                            { name: 'Kanał:', value: `<#${message.channel.id}>`, inline: true },
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
