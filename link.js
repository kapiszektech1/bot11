const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'link',
    // POPRAWKA: Dodano dwukropek dla poprawnego eksportu metody
    execute: async function(interaction) {
        // ID ról: Zarząd / Administracja
        const allowedRoles = ['1457675858553864274', '1457675858537091221'];

        try {
            // 1. Sprawdzanie uprawnień
            const hasPermission = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));

            if (!hasPermission) {
                return await interaction.reply({ 
                    content: '❌ Nie masz uprawnień do używania tej komendy (Tylko Administracja).', 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // 2. Pobieranie linku z opcji komendy
            const itemLink = interaction.options.getString('url');

            // 3. Budowanie estetycznego Embedu VAULT
            const embed = new EmbedBuilder()
                .setColor(0x00008B) // Klasyczny Vault Blue
                .setAuthor({ name: 'VAULT REP | ITEM LINK', iconURL: interaction.guild.iconURL() })
                .setDescription(
                    `### 📦 LINK DO PRZEDMIOTU\n` +
                    `> ${itemLink}\n\n` +
                    `**💡 Wskazówka dla oszczędnych:**\n` +
                    `Rejestrując się z linku [ikako.vip/r/xhm44](https://ikako.vip/r/xhm44) otrzymujesz pakiet kuponów o wartości **~2000 PLN**.\n\n` +
                    `Użyj kodu: \`lucky8\` przy wysyłce, aby odliczyć dodatkowe **-56 PLN**!`
                )
                .setFooter({ text: 'VAULT REP • Wyznaczamy nowe standardy', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            // 4. Wysłanie odpowiedzi
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ BŁĄD W MODULE LINK:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Wystąpił błąd podczas generowania linku.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};
