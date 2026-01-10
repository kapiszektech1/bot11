const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const CONFIG = {
    VAULT_BLUE: 0x00008B, // Ciemnoniebieski Vault Blue
    FOOTER_TEXT: 'VAULT REP • SYSTEM NARZĘDZI',
};

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Sprawdza aktualne opóźnienie bota'),
        new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Wyświetla szczegółowe informacje o użytkowniku')
            .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik, którego dane chcesz sprawdzić')),
        new SlashCommandBuilder()
            .setName('serverinfo')
            .setDescription('Wyświetla profesjonalne statystyki serwera'),
        new SlashCommandBuilder()
            .setName('clear')
            .setDescription('Masowe usuwanie wiadomości z kanału')
            .addIntegerOption(opt => opt.setName('ilosc').setDescription('Liczba wiadomości do usunięcia (1-100)').setRequired(true))
    ],

    async execute(interaction) {
        const { commandName, options, guild, client, member } = interaction;

        // Baza dla każdego embeda
        const createEmbed = () => new EmbedBuilder()
            .setColor(CONFIG.VAULT_BLUE)
            .setFooter({ text: CONFIG.FOOTER_TEXT, iconURL: guild.iconURL() })
            .setTimestamp();

        // --- KOMENDA PING ---
        if (commandName === 'ping') {
            const sent = await interaction.reply({ content: '📡 *Łączenie z serwerem...*', fetchReply: true, ephemeral: true });
            const time = sent.createdTimestamp - interaction.createdTimestamp;
            
            const embed = createEmbed()
                .setTitle('📶 STATUS POŁĄCZENIA')
                .addFields(
                    { name: '🚀 Opóźnienie Bota', value: `\`${time}ms\``, inline: true },
                    { name: '🌐 API Discorda', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true }
                );
            return interaction.editReply({ content: '', embeds: [embed] });
        }

        // --- KOMENDA USERINFO ---
        if (commandName === 'userinfo') {
            const target = options.getMember('osoba') || member;
            const embed = createEmbed()
                .setTitle(`👤 PROFIL: ${target.user.username.toUpperCase()}`)
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { name: '🆔 ID Użytkownika', value: `\`${target.id}\``, inline: false },
                    { name: '📅 Konto założono', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:D> (<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>)`, inline: false },
                    { name: '📥 Dołączył na serwer', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:D> (<t:${Math.floor(target.joinedTimestamp / 1000)}:R>)`, inline: false },
                    { name: '🛡️ Najwyższa ranga', value: `${target.roles.highest}`, inline: true },
                    { name: '💎 Boostuje', value: target.premiumSince ? 'Tak' : 'Nie', inline: true }
                );
            return interaction.reply({ embeds: [embed] });
        }

        // --- KOMENDA SERVERINFO ---
        if (commandName === 'serverinfo') {
            const embed = createEmbed()
                .setTitle(`🏰 STATYSTYKI: ${guild.name.toUpperCase()}`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
                .addFields(
                    { name: '👑 Właściciel', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '👥 Członkowie', value: `\`${guild.memberCount}\``, inline: true },
                    { name: '🆔 ID Serwera', value: `\`${guild.id}\``, inline: true },
                    { name: '🌟 Poziom Boost', value: `\`Poziom ${guild.premiumTier}\` (${guild.premiumSubscriptionCount} boostów)`, inline: false },
                    { name: '🗓️ Data powstania', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                    { name: '🌍 Region', value: `\`Europe\``, inline: true }
                );
            return interaction.reply({ embeds: [embed] });
        }

        // --- KOMENDA CLEAR ---
        if (commandName === 'clear') {
            if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: '❌ Brak uprawnień: `Zarządzanie Wiadomościami`', ephemeral: true });
            }
            const amount = options.getInteger('ilosc');
            if (amount < 1 || amount > 100) return interaction.reply({ content: '❌ Zakres usuwania to 1-100 wiadomości.', ephemeral: true });

            await interaction.channel.bulkDelete(amount, true);
            const embed = createEmbed()
                .setDescription(`✅ Pomyślnie oczyszczono kanał z **${amount}** wiadomości.`);
            
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
