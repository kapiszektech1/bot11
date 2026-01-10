const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-zarobek')
        .setDescription('Wysyła panel współpracy zarobkowej (Zarząd)')
        .setDMPermission(false),

    async execute(interaction) {
        // Natychmiastowa informacja dla Discorda, że bot myśli (zapobiega błędowi 10062)
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply({ content: '❌ Brak uprawnień.' });
        }

        const zarobekEmbed = new EmbedBuilder()
            .setColor(0x00008B)
            .setTitle('💰 ZARABIAJ Z VAULT REP – PROGRAM PARTNERSKI')
            .setDescription('Szukamy promotorów! Promuj nasz kod i zarabiaj realne pieniądze.')
            .addFields(
                { 
                    name: '🔗 TWÓJ LINK', 
                    value: 'https://ikako.vip/r/xhm44' 
                },
                { 
                    name: '💵 STAWKA I WARUNKI', 
                    value: '• **50 PLN (LTC/PP) lub BLIK 15% PROWIZJI** za każde 100 osób.\n• **RESTRYKCJA:** Minimum 5 osób z Twojej setki musi dokonać zakupu.\n• Bez aktywnych kupujących wypłata nie zostanie zrealizowana (ochrona przed fake-kontami).' 
                },
                { 
                    name: '📸 DOWODY', 
                    value: 'Musisz posiadać **100 screenów** z profilu zarejestrowanych osób z widocznym naszym kodem.' 
                },
                { 
                    name: '📩 JAK DOŁĄCZYĆ?', 
                    value: 'Otwórz Ticket w kategorii **"COLLAB"**.' 
                }
            )
            .setImage('TU_WSTAW_LINK_DO_ZDJECIA') // Pamiętaj o wstawieniu linku!
            .setFooter({ text: 'VAULT REP • Weryfikacja: 100 osób + 5 zakupów' })
            .setTimestamp();

        try {
            await interaction.channel.send({ embeds: [zarobekEmbed] });
            await interaction.editReply({ content: '✅ Panel współpracy został wysłany pomyślnie.' });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Wystąpił błąd podczas wysyłania panelu.' });
        }
    }
};
