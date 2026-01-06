const { EmbedBuilder } = require('discord.js');

module.exports = {
    createWelcomeEmbed: (member) => {
        // Dodajemy zabezpieczenie: jeśli nie uda się pobrać liczby osób, pokaże "wielu"
        const memberCount = member.guild?.member_count || member.guild?.approximateMemberCount || "wielu";
        const currentDate = new Date().toLocaleDateString('pl-PL');

        return new EmbedBuilder()
            .setTitle('Witaj w REP VAULT')
            .setDescription(`Cześć <@${member.id}>! Cieszymy się, że dołączyłeś.`)
            .setColor(0x0000FF)
            .addFields(
                { name: '🚀 Zgarnij Kupony o wartości $410', value: '👉 [Najlepsze Kupony](https://ikako.vip/r/xhm44)', inline: false },
                { name: '👤 ID', value: `\`${member.id}\``, inline: true },
                { name: '📅 Data', value: `\`${currentDate}\``, inline: true },
                { name: '📈 Jesteś', value: `${memberCount} osobą`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: 'REP VAULT' });
    }
};
