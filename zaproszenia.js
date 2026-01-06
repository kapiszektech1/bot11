const { EmbedBuilder } = require('discord.js');

module.exports = {
    createLuxuryInviteEmbed: (member, inviter) => {
        const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24));
        
        return new EmbedBuilder()
            .setTitle('🔵 VAULT REP x NOWE ZAPROSZENIE')
            .setDescription('>> **Nowy członek!**')
            .setColor(0x00008B) // Kolor: Ciemny Niebieski (Dark Blue)
            // Miniaturka: Zdjęcie profilowe nowego członka
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Użytkownik:', value: `\`${member.user.username}\``, inline: false },
                { name: '🛡️ Info o Koncie:', value: `✅ Zweryfikowany\n(Wiek: ${accountAgeDays} dni)`, inline: false },
                { name: '📩 Zaproszony przez:', value: inviter ? `\`${inviter.tag}\`` : '`Nieznane / Link Stały`', inline: false },
                { name: '💸 Kupony:', value: '[Kliknij!](https://ikako.vip/r/xhm44)', inline: false }
            )
            // Twój baner na dole
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1458144502576451715/Gemini_Generated_Image_j5fbutj5fbutj5fb.png?ex=695e9264&is=695d40e4&hm=dae5185ec882d79d951664ba5e09a22b82389e912bcdcdf6a6dd2862a8945cd1') 
            .setFooter({ text: `VAULT REP • #${member.guild.memberCount} osoba` })
            .setTimestamp();
    }
};
