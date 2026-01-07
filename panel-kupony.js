const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'panel-kupony',
    async execute(interaction) {
        const REQUIRED_ROLE_ID = '1457675858553864274';

        // Sprawdzanie uprawnień roli
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return await interaction.reply({ 
                content: '> ❌ Brak uprawnień do wysłania tego panelu.', 
                ephemeral: true 
            });
        }

        // Ukryta odpowiedź dla wywołującego
        await interaction.reply({ content: 'Wysyłam panel...', ephemeral: true });

        // Tworzenie embedu
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'NAJLEPSZY AGENT KAKOBUY! ', iconURL: 'https://cdn.discordapp.com/attachments/1458122275973890222/1458455764984397972/image.png?ex=695fb447&is=695e62c7&hm=87300e39506eead953542c93702a6bb61c48b5aa48b05ac5538dc5bc922148b0' }) // Mała ikonka na górze
            .setColor(0x00008B) // Ciemny niebieski pasek (Dark Blue)
            .setDescription(
                '### **Najszybszy, najtańszy i najlepszy agent <a:13:1457676380719419466>**\n' +
                '> • Wszystko szybkie.\n' +
                '> • Najlepszy support.\n' +
                '> • 410$ za darmo.\n' +
                '> • Najtańszy ship.\n' +
                '> • Najtańsze przedmioty.\n\n' +
                '# **<a:51047animatedarrowwhite:1457676386407022766> DODATKI: **\n' +
                '## -56PLN kod `lucky8` \n\n' +
                '## [Link na 410$ w kuponach](https://ikako.vip/r/xhm44)' // Wielki klikalny link w opisie
            )
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1458455122525950086/image.png?ex=695fb3ad&is=695e622d&hm=903af76314be44e3f8a9d6dd35579d247f4f38d3a3c8e7513de23529d341a261'); // Duży obrazek na dole

        // Wysyłka czystej wiadomości i dodanie reakcji
        const message = await interaction.channel.send({ embeds: [embed] });
        await message.react('❤️'); // Dodaje serduszko pod panelem automatycznie
    }
};
