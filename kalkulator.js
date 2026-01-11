const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Funkcja szacująca wagę (Zawsze musi być jako backup)
function getBackupWeight(name) {
    const n = name.toLowerCase();
    if (n.includes("jordan") || n.includes("dunk") || n.includes("af1") || n.includes("buty") || n.includes("shoe")) return 1400;
    if (n.includes("hoodie") || n.includes("bluza") || n.includes("trapstar") || n.includes("corteiz")) return 900;
    if (n.includes("tee") || n.includes("shirt") || n.includes("koszulka")) return 250;
    if (n.includes("jacket") || n.includes("kurtka") || n.includes("puff")) return 1100;
    return 800;
}

// Darmowe AI od DuckDuckGo (nie wymaga klucza!)
async function getWeightFromAI(itemName, size) {
    try {
        const response = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
            method: 'GET',
            headers: { 'x-vqd-accept': '1' }
        });
        const vqd = response.headers.get('x-vqd-4');

        const chatResponse = await fetch('https://duckduckgo.com/duckchat/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-vqd-4': vqd,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: `Podaj tylko liczbę gramów dla: ${itemName} ${size || ''}. Samą liczbę, nic więcej.` }]
            })
        });

        const data = await chatResponse.json();
        const weight = parseInt(data.message.replace(/\D/g, ''));
        return isNaN(weight) ? getBackupWeight(itemName) : weight;
    } catch (e) {
        // Jeśli darmowe AI ma laga, bot natychmiast używa bazy danych
        return getBackupWeight(itemName);
    }
}

function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = global.vaultCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(`Witaj **${interaction.user.username}**!\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> **${n+1}.** ${i.name} — \`${i.weight}g\``).join('\n') || "_Koszyk jest pusty..._"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``)
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT AI • Darmowy Silnik Wyceny' });

    const row = new ActionRowBuilder().addComponents(
        { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
        { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
        { type: 2, style: 3, label: '📊 PODSUMUJ', custom_id: 'calc_summary' }
    );

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        if (!global.vaultCarts) global.vaultCarts = new Map();
        global.vaultCarts.set(interaction.user.id, []);
        await interaction.reply(createMainPanel(interaction)).catch(() => {});
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.vaultCarts) global.vaultCarts = new Map();
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

        if (interaction.isModalSubmit() || interaction.isButton()) {
            if (!interaction.deferred) await interaction.deferUpdate().catch(() => {});

            if (interaction.customId === 'modal_ai') {
                const name = interaction.fields.getTextInputValue('name');
                const size = interaction.fields.getTextInputValue('size');
                const manual = interaction.fields.getTextInputValue('weight_manual');
                
                const weight = (manual && !isNaN(manual)) ? parseInt(manual) : await getWeightFromAI(name, size);
                
                cart.push({ name: size ? `${name} [${size}]` : name, weight });
                global.vaultCarts.set(userId, cart);
                await interaction.editReply(createMainPanel(interaction)).catch(() => {});
            }

            if (interaction.customId === 'calc_remove') {
                cart.pop();
                global.vaultCarts.set(userId, cart);
                await interaction.editReply(createMainPanel(interaction)).catch(() => {});
            }

            if (interaction.customId === 'calc_summary') {
                if (cart.length === 0) return await interaction.followUp({ content: '❌ Koszyk jest pusty!', ephemeral: true });

                const totalWeight = cart.reduce((a, b) => a + b.weight, 0);
                const units = Math.ceil(totalWeight / 500);
                const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

                const summaryEmbed = new EmbedBuilder()
                    .setTitle('📊 FINALNA WYCENA VAULT AI')
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '⚖️ Waga całkowita:', value: `> **${totalWeight}g**`, inline: true },
                        { name: '💰 Cena (ETL):', value: `> **${totalCost} PLN**`, inline: true },
                        { name: '🚀 KUPON:', value: 'Kod **lucky8** (56 PLN taniej): [ZAREJESTRUJ SIĘ](https://ikako.vip/r/xhm44)' }
                    )
                    .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');

                await interaction.followUp({ embeds: [summaryEmbed] }).catch(() => {});
                await interaction.followUp({ content: "# ✨ WITAMY!\nJEŚLI CHCESZ PONOWNIE OBLICZYĆ WAGĘ, WPISZ KOMENDĘ: `/obliczwage` 📦" }).catch(() => {});
            }
        }
    }
};
