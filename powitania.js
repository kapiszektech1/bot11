const { EmbedBuilder } = require('discord.js');

module.exports = {
    createWelcomeEmbed: (member) => {
        // Dodajemy zabezpieczenie: jeśli nie uda się pobrać liczby osób, pokaże "wielu"
        const memberCount = member.guild?.memberCount || "wielu";
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
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            // TUTAJ WKLEJ LINK DO SWOJEGO OBRAZKA (np. z Imgur)
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1458146242608632034/Gemini_Generated_Image_uq8kmeuq8kmeuq8k.png?ex=695e9403&is=695d4283&hm=f009e95d74398d893cef686a462c77e5ed5dd50b781e611662886e456fc0dfc5') 
            .setFooter({ text: 'REP VAULT' });
    }
};
