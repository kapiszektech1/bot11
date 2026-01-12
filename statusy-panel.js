const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statusy-panel')
        .setDescription('Objaśnienie statusów AMS -> Niemcy -> Polska')
        .setDMPermission(false),

    execute: async function(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '> ❌ **Brak uprawnień.**', flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setColor(0x00008B) // VAULT BLUE
            .setTitle('📦 PRZEWODNIK PO STATUSACH KAKOBUY')
            .setThumbnail('https://www.epaka.pl/img/blog-kurierski/0c1a246c2a3b2831ac3d86c2fbe328a2.webp') // TWOJA MINIATURKA
            .setDescription('Twoja paczka jedzie trasą Tax-Free (AMS-DE-PL). Poniżej znajdziesz objaśnienie najważniejszych etapów.\n\n📖 Szczegółową instrukcję jak śledzić paczkę znajdziesz na kanale <#1457675994595856414>.')
            .addFields(
                { 
                    name: '🇨🇳 1. ETAP: CHINY', 
                    value: '• **Arrived/Left operating center**\nPaczka w sortowni (ShenZhen).\n• **Customs clearance completed (China)**\nOdprawa wyjazdowa zakończona.' 
                },
                { 
                    name: '✈️ 2. ETAP: LOT I AMSTERDAM (AMS)', 
                    value: '• **In transit, flight pending**\nOczekiwanie na lot.\n• **The package is currently undergoing customs clearance (AMS)**\n**Najważniejszy moment:** Paczka jest w Amsterdamie i przechodzi przez etap logistyczny.\n> **Trwa:** 1-3 dni.' 
                },
                { 
                    name: '🇩🇪 3. ETAP: NIEMCY (TRANSIT)', 
                    value: '• **Customs clearance completed**\nPrzetwarzanie w AMS przebiegło pomyślne! Paczka jedzie ciężarówką do Niemiec.\n• **Arrived at the export center / Parcel center (Germany)**\nPaczka jest w sortowni DHL/Hermes w Niemczech.\n> **Trwa:** 1-2 dni.' 
                },
                { 
                    name: '🇵🇱 4. ETAP: POLSKA', 
                    value: '• **Inbound / Shipment in destination center**\nPaczka przekroczyła granicę Polski i jest w drodze do Twojego miasta.\n• **Out for delivery**\nKurier jedzie do Ciebie!\n> **Trwa:** 1 dzień.' 
                }
            )
            .setFooter({ text: 'VAULT REP • Logistyka AMS-DE-PL 2026', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });

        return await interaction.reply({ 
            content: '> ✅ **Panel statusów z odnośnikiem do kanału został wysłany.**', 
            flags: [MessageFlags.Ephemeral] 
        });
    }
};
