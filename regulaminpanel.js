const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

const CONFIG = {
    VAULT_BLUE: 0x00008B,
    // TUTAJ WKLEJ LINK DO DUŻEGO ZDJĘCIA/BANERU
    BANNER_URL: 'https://cdn.discordapp.com/attachments/1458122275973890222/1459496335551234286/obraz.png?ex=69637d62&is=69622be2&hm=45c9b184cc92403a1590f53edb83ab3949a59b71dd7cb8c7c12f429b4e034741' 
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('regulamin-panel')
        .setDescription('Wysyła oficjalny regulamin')
        .setDMPermission(false),

    async execute(interaction) {
        const { member, channel, guild } = interaction;

        // Sprawdzenie uprawnień Administratora
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '> ❌ Brak uprawnień: Ta komenda jest dla Administratorów.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        const mainEmbed = new EmbedBuilder()
            .setColor(CONFIG.VAULT_BLUE)
            .setTitle('🛡️ REGULAMIN SPOŁECZNOŚCI VAULT REP')
            // STATUS: Miniaturka usunięta dla lepszej przejrzystości
            .setDescription('Dołączenie do serwera jest jednoznaczne z akceptacją poniższego regulaminu. Dokument ten ma na celu zapewnienie bezpieczeństwa każdemu użytkownikowi.')
            .addFields(
                { 
                    name: '⚖️ §1. WŁADZA I ADMINISTRACJA', 
                    value: '> • Administracja ma zawsze rację.\n> • Decyzje Zarządu są ostateczne i nieodwołalne.\n> • Utrudnianie pracy administracji skutkuje banem.' 
                },
                { 
                    name: '🚫 §2. ZAKAZ SCAMU I HANDLU REPLIKAMI', 
                    value: '```diff\n- CAŁKOWITY ZAKAZ sprzedaży replik jako przedmioty oryginalne na Vinted, OLX, Allegro.\n```\n• Próba oszustwa innego użytkownika = **Permanentny Ban**.\n• VAULT REP nie odpowiada za transakcje prywatne.' 
                },
                { 
                    name: '📦 §3. PRZEDMIOTY ZAKAZANE', 
                    value: '• Surowy zakaz handlu: e-papierosy, pody, jednorazówki i używki.\n• Zakaz handlu kradzionymi kontami i oprogramowaniem.' 
                },
                { 
                    name: '📵 §4. ZACHOWANIE I TREŚCI NSFW', 
                    value: '• Zakaz udostępniania treści **18+ (NSFW)** oraz drastycznych.\n• Spam, trolling i prowokacje są karane wyciszeniem.\n• Szanujemy się nawzajem – toksyczność = wykluczenie.' 
                },
                { 
                    name: '🔗 §5. REKLAMA I SPAM', 
                    value: '• Zakaz reklamy innych serwerów Discord (również na DM).\n• Wysyłanie niechcianych ofert do użytkowników skutkuje banem.' 
                }
            )
            // STATUS: Duże zdjęcie na dole
            .setImage(CONFIG.BANNER_URL) 
            .setFooter({ text: 'VAULT REP • Oficjalne zasady serwera', iconURL: guild.iconURL() })
            .setTimestamp();

        // Wysyłamy czysty embed na kanał
        await channel.send({ embeds: [mainEmbed] });

        // Potwierdzenie widoczne tylko dla Ciebie
        return interaction.reply({ 
            content: '✅ Regulamin z banerem został opublikowany.', 
            flags: [MessageFlags.Ephemeral] 
        });
    }
};
