const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Twoja baza wag
const wagiBaza = {
    jordan: 1450, dunk: 1300, af1: 1400, buty: 1400,
    hoodie: 950, bluza: 900, trapstar: 850, corteiz: 800,
    tee: 250, shirt: 250, koszulka: 250,
    jacket: 1200, puffer: 1500, spodnie: 750
};

if (!global.vaultCarts) { global.vaultCarts = new Map(); }

function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = global.vaultCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(`Witaj **${interaction.user.username}**!\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> **${n+1}.** ${i.name} — \`${i.weight}g\``).join('\n') || "_Koszyk jest pusty..._"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``)
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT REP • Kalkulator v2' });

    const row = new ActionRowBuilder().addComponents(
        { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
        { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
        { type: 2, style: 3, label: '📊 PODSUMUJ', custom_id: 'calc_summary' }
    );

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        global.vaultCarts.set(interaction.user.id, []);
        await interaction.reply(createMainPanel(interaction)).catch(() => {});
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.vaultCarts.has(userId)) global.vaultCarts.set(userId, []);
        let cart = global.vaultCarts.get(userId);

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Co chcesz dodać?").setStyle(1).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("Rozmiar").setStyle(1).setRequired(false)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("Waga ręcznie (g)").setStyle(1).setRequired(false))
            );
            return await interaction.showModal(modal).catch(() => {});
        }

        // Akcje po wysłaniu modala lub kliknięciu przycisku
        if (interaction.isModalSubmit() || interaction.isButton()) {
            // Natychmiastowe uciszenie Discorda
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate().catch(() => {});
            }

            if (interaction.customId === 'modal_ai') {
                const nameIn = interaction.fields.getTextInputValue('name');
                const sizeIn = interaction.fields.getTextInputValue('size');
                const manualIn = interaction.fields.getTextInputValue('weight_manual');
                
                let waga = 800;
                if (manualIn && !isNaN(manualIn)) {
                    waga = parseInt(manualIn);
                } else {
                    const n = nameIn.toLowerCase();
                    for (let klucz in wagiBaza) {
                        if (n.includes(klucz)) { waga = wagiBaza[klucz]; break; }
                    }
                }
                
                cart.push({ name: sizeIn ? `${nameIn} [${sizeIn}]` : nameIn, weight: waga });
                global.vaultCarts.set(userId, cart);
                await interaction.editReply(createMainPanel(interaction)).catch(() => {});
            }

            if (interaction.customId === 'calc_remove') {
                cart.pop();
                global.vaultCarts.set(userId, cart);
                await interaction.editReply(createMainPanel(interaction)).catch(() => {});
            }

            if (interaction.customId === 'calc_summary') {
                if (cart.length === 0) return;

                const tW = cart.reduce((a, b) => a + b.weight, 0);
                const cena = (31.91 + (Math.ceil(tW / 500) - 1) * 30.96 + 37.63).toFixed(2);

                const embedS = new EmbedBuilder()
                    .setTitle('📊 FINALNA WYCENA VAULT REP')
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '⚖️ Waga całkowita:', value: `> **${tW}g**`, inline: true },
                        { name: '💰 Cena (ETL):', value: `> **${cena} PLN**`, inline: true }
                    )
                    .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');

                await interaction.followUp({ embeds: [embedS] }).catch(() => {});
                await interaction.followUp({ content: "# ✨ WITAMY!\nWPISZ `/obliczwage`, ABY ZACZĄĆ OD NOWA 📦" }).catch(() => {});
            }
        }
    }
};
