const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('freeairpods-panel')
        .setDescription('Wysyła luksusowy panel darmowych AirPods (Admin)')
        .setDMPermission(false),

    execute: async function(interaction) {
        // Sprawdzenie uprawnień (Tylko Admin/Zarząd)
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ 
                content: '> ❌ **Brak dostępu.** Tylko Zarząd może zarządzać panelami nagród.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x00008B) // Ciemnoniebieski VAULT BLUE
            .setTitle('🎁 ODBIERZ SWOJE AIRPODS (AirPods, AirPods pro, AirPods 3, AirPods Pro 2)')
            .setDescription('Dołącz do elitarnego grona **VAULT REP** i odbierz nagrodę za swoje zakupy! Nasz system lojalnościowy pozwala Ci zgarnąć legendarne słuchawki zupełnie za darmo.')
            .addFields(
                { 
                    name: '📋 WARUNKI UCZESTNICTWA', 
                    value: 
                    '• Złóż zamówienie z konta z tego linku: https://ikako.vip/r/xhm44\n' +
                    '• Wartość wysyłki musi wynosić min. **100 PLN**\n' +
                    '• Zatwierdź i wyślij paczkę na swój adres domowy'
                },
                { 
                    name: '🎫 JAK ODEBRAĆ NAGRODĘ?', 
                    value: 'Po sfinalizowaniu wysyłki paczki, otwórz **Ticket** w sekcji pomocy. Nasz zespół zweryfikuje zgłoszenie i prześle Twoje AirPods! *'
                }
            )
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1460321930103095377/f11c3198163e61f48eb9297a5a9e95a1.jpg?ex=69667e47&is=69652cc7&hm=412cc08b0a44806ffe9efd6fe56fdfbb00ca14df62e49efbd0068c3ae81f4cd2')
            .setFooter({ text: 'VAULT REP • Oferta ograniczona czasowo', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // Wysyłanie publiczne na kanał
        await interaction.channel.send({ embeds: [embed] });
        
        // Cicha informacja dla admina
        return await interaction.reply({ 
            content: '✅ Panel nagród został pomyślnie wysłany.', 
            flags: [MessageFlags.Ephemeral] 
        });
    }
};
