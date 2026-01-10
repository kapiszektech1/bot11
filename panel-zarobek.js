const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-zarobek')
        .setDescription('Wysyła panel współpracy zarobkowej (Zarząd)')
        .setDMPermission(false),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Brak uprawnień.', flags: [MessageFlags.Ephemeral] });
        }

        const zarobekEmbed = new EmbedBuilder()
            .setColor(0x00008B)
            .setTitle('💰 ZARABIAJ Z VAULT REP – PROGRAM PARTNERSKI')
            .setDescription('Szukamy promotorów, którzy pomogą nam ściągać nowych użytkowników na nasz kod KakoBuy!')
            .addFields(
                { 
                    name: '🔗 TWÓJ LINK DO PROMOCJI', 
                    value: 'Używasz wyłącznie tego linku: https://ikako.vip/r/xhm44' 
                },
                { 
                    name: '💵 STAWKA', 
                    value: '• **40 PLN LITECOIN/PAYPAL lub BLIK 15% PROWIZJI** za każde 100 zarejestrowanych osób z naszego kodu.' 
                },
                { 
                    name: '📅 ZASADY WYPŁAT', 
                    value: '• Rozliczenie następuje **raz w miesiącu**.\n• Minimalny próg: **100 osób w ciągu 30 dni**.\n• Jeśli nie dobijesz do setki, postęp zeruje się wraz z nowym miesiącem.' 
                },
                { 
                    name: '📸 DOWODY (WYMAGANE)', 
                    value: 'Musisz posiadać **100 wyraźnych screenów** z profilu zarejestrowanych osób, na których widać nasz kod polecający. Bez kompletu screenów wypłata nie jest realizowana.' 
                },
                { 
                    name: '📩 JAK DOŁĄCZYĆ?', 
                    value: 'Otwórz Ticket w kategorii **"COLLAB"**, aby zgłosić chęć współpracy i otrzymać status promotora.' 
                }
            )
            // TUTAJ WKLEJ LINK DO SWOJEJ GRAFIKI
            .setImage('https://cdn.discordapp.com/attachments/1458122275973890222/1459512030493933655/obraz.png?ex=69638c00&is=69623a80&hm=978ce977dc1e99ffbc19cbffa45592c4ca1d617715b5e3628ab4af5f6e0a5dea') 
            .setFooter({ text: 'VAULT REP • System miesięczny' })
            .setTimestamp();

        await interaction.channel.send({ embeds: [zarobekEmbed] });
        return interaction.reply({ content: '✅ Panel współpracy ze zdjęciem został wysłany.', flags: [MessageFlags.Ephemeral] });
    }
};
