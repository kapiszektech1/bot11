const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'link',
    async execute(interaction) {
        // ID ról, które mogą używać komendy
        const allowedRoles = ['1457675858553864274', '1457675858537091221'];

        // Sprawdzanie, czy użytkownik ma jedną z tych ról
        const hasPermission = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));

        if (!hasPermission) {
            return interaction.reply({ 
                content: '❌ Nie masz uprawnień do używania tej komendy.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        const itemLink = interaction.options.getString('url');

        const embed = new EmbedBuilder()
            .setColor(0x00008B) // Ciemnoniebieski
            .setDescription(
                `**Link do tych itemów:**\n${itemLink}\n\n` +
                `*Ciekawostka!*\n` +
                `Rejestrując się z tego linku: https://ikako.vip/r/xhm44 dostajesz pakiet kuponów na ok. 2000zl i możliwość użycia kuponu: **lucky8** *(-56zl na dostawę)* co bardzo mocno obniża cenę za dostawę!`
            );

        await interaction.reply({ embeds: [embed] });
    }
};
