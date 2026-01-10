const { EmbedBuilder } = require('discord.js');

module.exports = {
    createLuxuryInviteEmbed: (member, inviter) => {
        // Obliczanie wieku konta
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
        
        // Link do banera (Upewnij się, że link jest stały!)
        const BANNER_URL = 'https://cdn.discordapp.com/attachments/1458122275973890222/1458152143050641601/image.png';

        return new EmbedBuilder()
            .setTitle('🔵 VAULT REP x NOWE ZAPROSZENIE')
            .setDescription('**Właśnie dołączył nowy członek społeczności!**')
            .setColor(0x00008B) // Luxury Dark Blue
            .setThumbnail(member.user.displayAvatarURL({ forceStatic: false, size: 256 }))
            .addFields(
                { name: '👤 Użytkownik:', value: `${member.user}`, inline: true },
                { name: '📅 Wiek konta:', value: `\`${accountAgeDays} dni\``, inline: true },
                { name: '📩 Zaproszony przez:', value: inviter ? `**${inviter.tag}**` : '`Link Stały / Nieznane`', inline: false },
                { name: '🎟️ Specjalne Kupony:', value: '[Odbierz zniżki tutaj!](https://ikako.vip/r/xhm44)', inline: false }
            )
            // UŻYWAMY IMAGE DLA BANERA
            .setImage(BANNER_URL)
            .setFooter({ 
                text: `VAULT REP • Jesteśmy w składzie ${member.guild.memberCount} osób!`,
                iconURL: member.guild.iconURL() 
            })
            .setTimestamp();
    }
};
