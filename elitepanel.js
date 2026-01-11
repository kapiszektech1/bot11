const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    // Dane dla deploy-commands.js
    data: new SlashCommandBuilder()
        .setName('elite-panel')
        .setDescription('Wysyła luksusowy panel informacyjny sekcji Elite')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    // Główna funkcja wykonawcza
    execute: async function(interaction) {
        // --- KONFIGURACJA DLA 02,03 ---
        const ELITE_ROLE_ID = '1457675858553864274';
        const PANEL_IMAGE = 'https://cdn.discordapp.com/attachments/1458122275973890222/1458827828115275982/image.png?ex=69610ec9&is=695fbd49&hm=4f1d266af7fd2509eeb324edd2277436be15d2ccbf0cffe1d26fda8760c96d23';
        const VAULT_BLUE = 0x00008B;

        try {
            // 1. Natychmiastowe odroczenie (ważne: używamy ephemeral, żeby nikt nie widział ładowania)
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            // 2. Sprawdzenie roli (Rola Elite/Zarząd)
            if (!interaction.member.roles.cache.has(ELITE_ROLE_ID)) {
                return await interaction.editReply({ 
                    content: '> ❌ Ta funkcja jest zarezerwowana wyłącznie dla wyższej administracji!' 
                });
            }

            const eliteEmbed = new EmbedBuilder()
                .setColor(VAULT_BLUE)
                .setAuthor({ 
                    name: 'VAULT REP | PRESTIGE PROGRAM', 
                    iconURL: PANEL_IMAGE 
                })
                .setTitle('💎 RANGA ELITE – TWOJA PRZEPUSTKA DO NAJLEPSZYCH OKAZJI')
                .setDescription(
                    'Witamy w najwyższym standardzie naszej społeczności. Program Elite został stworzony dla osób, które cenią sobie korzyści, oszczędność czasu i pełne bezpieczeństwo.'
                )
                .addFields(
                    { 
                        name: '👑 PRZYWILEJE CZŁONKOSTWA', 
                        value: 
                        '• **Dedykowane Zniżki** – Uzyskaj dostęp do ofert niedostępnych dla reszty serwera.\n' +
                        '• **Priorytetowy Kontakt** – Twój problem rozwiązujemy w pierwszej kolejności.\n' +
                        '• **Wiedza Ekspercka** – Pełne wsparcie merytoryczne na każdym etapie.'
                    },
                    {
                        name: '📦 USŁUGA PERSONAL SHOPPER (PROXY)',
                        value:
                        '• **Pełna Obsługa** – My zajmujemy się zakupem towaru i organizacją wysyłki.\n' +
                        '• **Gwarancja Ubezpieczenia** – Każda paczka realizowana przez nas jest objęta pełną ochroną.\n' +
                        '• **Przejrzyste Zasady** – Pokrywasz koszt towaru, wysyłki oraz niewielką prowizję.'
                    },
                    {
                        name: '🛰️ PROCEDURA DOŁĄCZENIA',
                        value:
                        '1. **Konto** – Zarejestruj się z linku: https://ikako.vip/r/xhm44\n' +
                        '2. **Weryfikacja** – Wyślij zrzut rejestracji do: <@1419055461776228523> lub <@1235684208307998774>.\n' +
                        '3. **Finalizacja** – Po sprawdzeniu, Twoja ranga zostanie aktywowana.'
                    }
                )
                .setImage(PANEL_IMAGE)
                .setFooter({ text: 'VAULT REP • Wyznaczamy nowe standardy', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            // Wysyłamy embed bezpośrednio na kanał
            await interaction.channel.send({ embeds: [eliteEmbed] });
            
            // Potwierdzenie widoczne tylko dla wywołującego
            await interaction.editReply({ content: '✅ Panel Elite został wysłany pomyślnie.' });

        } catch (err) {
            console.error('[VAULT REP] Błąd w module elitepanel:', err);
            if (interaction.deferred) {
                await interaction.editReply({ content: '❌ Wystąpił błąd techniczny podczas generowania panelu.' });
            }
        }
    },
};
