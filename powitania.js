const { EmbedBuilder } = require('discord.js');

module.exports = {
    createWelcomeEmbed: (member) => {
        // Dodajemy zabezpieczenie: jeśli nie uda się pobrać liczby osób, pokaże "wielu"
        const memberCount = member.guild?.memberCount || "wielu";
        const currentDate = new Date().toLocaleDateString('pl-PL');

        return new EmbedBuilder()
            .setTitle('REP VAULT x NOWA OSOBA!')
            .setDescription(`Witaj <@${member.id}>! Miło nam że dołączyłeś.`)
            .setColor(0x0000FF)
            .addFields(
                { name: '🎟️ Zgarnij zestaw kuponów', value: '👉 [Kupony na 410$](https://ikako.vip/r/xhm44)', inline: false },
                { name: '🤖 ID użytkownika', value: `\`${member.id}\``, inline: true },
                { name: '🗓️ Data dołączenia', value: `\`${currentDate}\``, inline: true },
                { name: '🔢 Jest już nas', value: `${memberCount}`, inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            // TUTAJ WKLEJ LINK DO SWOJEGO OBRAZKA (np. z Imgur)
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1458151540077629604/image.png?ex=695e98f2&is=695d4772&hm=ad1421323883a444f1e341ea0c129b2c1f7bb9bcd4a5774fa759772084a90fc6') 
            .setFooter({ text: 'REP VAULT' });
    }
};
