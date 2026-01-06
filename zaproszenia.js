const { EmbedBuilder } = require('discord.js');

module.exports = {
    createLuxuryInviteEmbed: (member, inviter) => {
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
        
        return new EmbedBuilder()
            .setTitle('🔵 VAULT REP x NOWE ZAPROSZENIE')
            .setDescription('>> **Nowa osoba!**')
            .setColor(0x00008B) // Kolor: Ciemny Niebieski (Dark Blue)
            // Miniaturka: Zdjęcie profilowe nowego członka
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Użytkownik:', value: `\`${member.user.username}\``, inline: false },
                { name: 'ℹ️ Info o Koncie:', value: `\n(Wiek: ${accountAgeDays} dni)`, inline: false },
                { name: '📩 Zaproszony przez:', value: inviter ? `\`${inviter.tag}\`` : '`Nieznane / Link Stały`', inline: false },
                { name: '🎟️ Kupony:', value: '[Kliknij!](https://ikako.vip/r/xhm44)', inline: false }
            )
            // Twój baner na dole
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1458152143050641601/image.png?ex=695e9982&is=695d4802&hm=66fd9f8bb29a49c4c45aefad2112b62dcc716f093106ff9a4d25db02f14649b3') 
            .setFooter({ text: `VAULT REP • #${member.guild.memberCount} osoba` })
            .setTimestamp();
    }
};
