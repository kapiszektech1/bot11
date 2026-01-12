const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('panel-śledzenie')
            .setDescription('Wysyła panel informacyjny o śledzeniu (Admin)')
            .setDMPermission(false),
        new SlashCommandBuilder()
            .setName('śledź-paczkę')
            .setDescription('Sprawdź gdzie jest Twoja paczka')
            .addStringOption(option => 
                option.setName('numer')
                    .setDescription('Wklej numer śledzenia (tracking number)')
                    .setRequired(true))
            .setDMPermission(false)
    ],

    execute: async function(interaction) {
        const { commandName } = interaction;

        // --- 1. KOMENDA: PANEL-ŚLEDZENIE ---
        if (commandName === 'panel-śledzenie') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '> ❌ **Brak uprawnień.**', flags: [MessageFlags.Ephemeral] });
            }

            const embedPanel = new EmbedBuilder()
                .setColor(0x00008B)
                .setTitle('🌍 CENTRUM ŚLEDZENIA PRZESYŁEK')
                .setDescription('Oczekujesz na paczkę? Nie musisz błądzić po internecie. \nUdostępniamy Ci nasze narzędzia do monitorowania dostawy.')
                .setThumbnail('https://cdn-icons-png.flaticon.com/512/2867/2867999.png')
                .addFields(
                    { 
                        name: '🚀 Szybkie Śledzenie', 
                        value: 'Użyj komendy **/śledź-paczkę** `[numer]`, aby otrzymać natychmiastowy link do statusów Twojej przesyłki.' 
                    },
                    { 
                        name: '📦 Zalecane Serwisy', 
                        value: '• **17Track** – Najdokładniejsze śledzenie globalne.\n• **Fujexp** – Najlepsze dla paczek DHL Line wewnątrz Chin.' 
                    }
                )
                .setFooter({ text: 'VAULT REP • Logistics System', iconURL: interaction.guild.iconURL() });

            await interaction.channel.send({ embeds: [embedPanel] });
            return await interaction.reply({ content: '✅ Panel śledzenia wysłany.', flags: [MessageFlags.Ephemeral] });
        }

        // --- 2. KOMENDA: ŚLEDŹ-PACZKĘ ---
        if (commandName === 'śledź-paczkę') {
            const numerRaw = interaction.options.getString('numer');
            const numer = numerRaw.toUpperCase().replace(/\s/g, ''); // Usuwa spacje i powiększa litery

            // --- INTELIGENTNE ROZPOZNAWANIE ---
            let serviceName = 'Przesyłka Międzynarodowa';
            let icon = '📦';
            
            // Logika wykrywania
            if (numer.endsWith('DE')) {
                serviceName = 'DHL Germany / Deutsche Post';
                icon = '🇩🇪';
            } else if (numer.endsWith('PL')) {
                serviceName = 'Poczta Polska / Pocztex';
                icon = '🇵🇱';
            } else if (numer.endsWith('NL')) {
                serviceName = 'PostNL';
                icon = '🇳🇱';
            } else if (numer.endsWith('CN')) {
                serviceName = 'China Post';
                icon = '🇨🇳';
            } else if (/^\d{10,}$/.test(numer) || numer.startsWith('JD')) { // Np. 00340434... lub JD...
                serviceName = 'DHL Express / eCommerce';
                icon = '✈️';
            } else if (numer.startsWith('LF') || numer.startsWith('LP')) {
                serviceName = 'Cainiao / AliExpress';
                icon = '🚢';
            } else if (numer.startsWith('1Z')) {
                serviceName = 'UPS';
                icon = '🚚';
            }

            // Generowanie linków
            const link17Track = `https://t.17track.net/pl#nums=${numer}`;
            const linkFujexp = `http://www.fujexp.com:8082/trackIndex.htm?mailNo=${numer}`;
            const linkDhl = `https://www.dhl.com/pl-pl/home/tracking/tracking-express.html?submit=1&tracking-id=${numer}`;

            const embedTracking = new EmbedBuilder()
                .setColor(0x00008B)
                .setTitle(`${icon} KARTA PRZESYŁKI`)
                .setDescription(`Numer: **${numer}**`)
                .addFields(
                    { name: '📍 Status Przesyłki', value: 'Kliknij przycisk poniżej, aby zobaczyć pełną historię statusów.', inline: false },
                    { name: '🔎 Wykryty przewoźnik', value: serviceName, inline: true }
                )
                .setFooter({ text: `Szukano przez: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Przyciski
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Sprawdź na 17Track')
                        .setStyle(ButtonStyle.Link)
                        .setURL(link17Track)
                        .setEmoji('🌐')
                );

            // Jeśli to DHL/DE, dodajemy opcję DHL
            if (numer.endsWith('DE') || serviceName.includes('DHL')) {
                buttons.addComponents(
                    new ButtonBuilder()
                        .setLabel('Oficjalne DHL')
                        .setStyle(ButtonStyle.Link)
                        .setURL(linkDhl)
                        .setEmoji('🟨')
                );
            } else {
                // Dla innych dodajemy Fujexp jako backup
                buttons.addComponents(
                    new ButtonBuilder()
                        .setLabel('Backup (Fujexp)')
                        .setStyle(ButtonStyle.Link)
                        .setURL(linkFujexp)
                        .setEmoji('🐼')
                );
            }

            await interaction.reply({ embeds: [embedTracking], components: [buttons] });
        }
    }
};
