const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const CONFIG = {
    LOG_CHANNEL_ID: '1459263173499551784',
    VAULT_BLUE: 0x00008B,
    ROLES: {
        ADMIN_ZARZAD: ['1457675858553864274', '1457675858537091221'],
        MODERACJA: ['1457675858553864274', '1457675858537091221', '1457675858537091220']
    }
};

function parseDuration(durationStr) {
    const match = durationStr.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: [
        new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Trwale banuje użytkownika')
            .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do zbanowania').setRequired(true))
            .addStringOption(opt => opt.setName('powod').setDescription('Powód bana').setRequired(true)),
        
        new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Wyrzuca użytkownika z serwera')
            .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do wyrzucenia').setRequired(true))
            .addStringOption(opt => opt.setName('powod').setDescription('Powód wyrzucenia').setRequired(true)),

        new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Wycisza użytkownika (Timeout)')
            .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do wyciszenia').setRequired(true))
            .addStringOption(opt => opt.setName('czas').setDescription('Np. 15m, 2h, 1d, 7d').setRequired(true))
            .addStringOption(opt => opt.setName('powod').setDescription('Powód wyciszenia').setRequired(true)),

        new SlashCommandBuilder()
            .setName('warn')
            .setDescription('Nadaje ostrzeżenie użytkownikowi')
            .addUserOption(opt => opt.setName('osoba').setDescription('Użytkownik do ostrzeżenia').setRequired(true))
            .addStringOption(opt => opt.setName('powod').setDescription('Powód ostrzeżenia').setRequired(true))
    ],

    async execute(interaction) {
        // --- STATUS: UNKNOWN INTERACTION FIX ---
        // Informujemy Discorda, że przetwarzamy dane, co daje nam 15 minut na odpowiedź.
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => {});

        const { commandName, options, member, guild } = interaction;
        const target = options.getMember('osoba');
        const reason = options.getString('powod');
        const logChannel = guild.channels.cache.get(CONFIG.LOG_CHANNEL_ID);

        const canAdmin = member.roles.cache.some(r => CONFIG.ROLES.ADMIN_ZARZAD.includes(r.id));
        const canMod = member.roles.cache.some(r => CONFIG.ROLES.MODERACJA.includes(r.id));

        if ((['ban', 'kick'].includes(commandName) && !canAdmin) || 
            (['mute', 'warn'].includes(commandName) && !canMod)) {
            return interaction.editReply({ content: '❌ Nie posiadasz wystarczających uprawnień!' });
        }

        if (!target) return interaction.editReply({ content: '❌ Nie znaleziono użytkownika na serwerze.' });

        // --- STATUS: HIERARCHY PROTECTION ---
        // Sprawdza czy bot może technicznie ukarać tę osobę
        if (target.id === guild.ownerId) {
            return interaction.editReply({ content: '❌ Nie możesz ukarać Właściciela serwera!' });
        }
        
        if (target.roles.highest.position >= guild.members.me.roles.highest.position) {
            return interaction.editReply({ content: '❌ Moja ranga jest zbyt niska, aby ukarać tę osobę.' });
        }

        const logEmbed = new EmbedBuilder()
            .setColor(CONFIG.VAULT_BLUE)
            .setTimestamp()
            .setFooter({ text: 'VAULT REP MODERATION', iconURL: guild.iconURL() });

        const dmEmbed = new EmbedBuilder()
            .setColor(CONFIG.VAULT_BLUE)
            .setTimestamp();

        try {
            if (commandName === 'ban') {
                dmEmbed.setTitle(`🔨 Zostałeś zbanowany na ${guild.name}`).addFields({ name: 'Powód', value: reason });
                await target.send({ embeds: [dmEmbed] }).catch(() => {});
                await target.ban({ reason });
                logEmbed.setTitle('🔨 BAN').addFields(
                    { name: 'Użytkownik', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderator', value: `${member.user.tag}`, inline: true },
                    { name: 'Powód', value: reason }
                );
            }

            if (commandName === 'kick') {
                dmEmbed.setTitle(`👢 Zostałeś wyrzucony z ${guild.name}`).addFields({ name: 'Powód', value: reason });
                await target.send({ embeds: [dmEmbed] }).catch(() => {});
                await target.kick(reason);
                logEmbed.setTitle('👢 KICK').addFields(
                    { name: 'Użytkownik', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderator', value: `${member.user.tag}`, inline: true },
                    { name: 'Powód', value: reason }
                );
            }

            if (commandName === 'mute') {
                const timeInput = options.getString('czas');
                const durationMs = parseDuration(timeInput);
                if (!durationMs) return interaction.editReply({ content: '❌ Nieprawidłowy format czasu! (np. 10m, 2h, 1d)' });

                dmEmbed.setTitle(`🔇 Zostałeś wyciszony na ${guild.name}`).addFields(
                    { name: 'Czas', value: timeInput, inline: true },
                    { name: 'Powód', value: reason, inline: true }
                );
                await target.send({ embeds: [dmEmbed] }).catch(() => {});
                await target.timeout(durationMs, reason);

                logEmbed.setTitle('🔇 MUTE (TIMEOUT)').addFields(
                    { name: 'Użytkownik', value: `${target.user.tag}`, inline: true },
                    { name: 'Czas', value: timeInput, inline: true },
                    { name: 'Moderator', value: `${member.user.tag}`, inline: true },
                    { name: 'Powód', value: reason }
                );
            }

            if (commandName === 'warn') {
                dmEmbed.setTitle(`⚠️ Otrzymałeś ostrzeżenie na ${guild.name}`).addFields({ name: 'Powód', value: reason });
                await target.send({ embeds: [dmEmbed] }).catch(() => {});
                logEmbed.setTitle('⚠️ WARN').addFields(
                    { name: 'Użytkownik', value: `${target.user.tag}`, inline: true },
                    { name: 'Moderator', value: `${member.user.tag}`, inline: true },
                    { name: 'Powód', value: reason }
                );
            }

            if (logChannel) await logChannel.send({ embeds: [logEmbed] });
            await interaction.editReply({ content: `✅ Akcja **${commandName}** wykonana pomyślnie.` });

        } catch (err) {
            console.error('[MODERACJA BŁĄD]', err);
            await interaction.editReply({ content: '❌ Wystąpił błąd krytyczny podczas akcji. Sprawdź logi konsoli.' }).catch(() => {});
        }
    }
};
