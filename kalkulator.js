const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const userCarts = new Map();

async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Podaj TYLKO liczbę (gramy) dla: "${itemName}" ${size ? `rozmiar ${size}` : ''}. Buty 1400, Hoodie 900, Koszulka 250. Sama liczba.`;
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const weight = parseInt(response.text().replace(/\D/g, ''));
        return isNaN(weight) ? 500 : weight;
    } catch (e) { return 500; }
}

function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = userCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 KALKULATOR WYSYŁKI VAULT AI')
        .setDescription(`Witaj **${interaction.user.username}**!\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `**${n+1}.** ${i.name} (\`${i.weight}g\`)`).join('\n') || "_Koszyk jest pusty_"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``)
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT REP • Wszystkie dane zczytuje AI' });

    // METODA RAW JSON - Omija błąd "is not a function"
    const row = {
        type: 1, // ActionRow
        components: [
            { type: 2, style: 1, label: '➕ DODAJ PRZEDMIOT', custom_id: 'calc_add' },
            { type: 2, style: 4, label: '🗑️ USUŃ OSTATNI', custom_id: 'calc_remove' },
            { type: 2, style: 3, label: '📊 PODSUMUJ PACZKĘ', custom_id: 'calc_summary' }
        ]
    };

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        userCarts.set(interaction.user.id, []);
        await interaction.reply({ ...createMainPanel(interaction), ephemeral: true });
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        let cart = userCarts.get(userId) || [];

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot');
            const r1 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Model produktu").setStyle(1).setRequired(true));
            const r2 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("Rozmiar").setStyle(1).setRequired(false));
            const r3 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("Waga ręcznie (g)").setStyle(1).setRequired(false));
            modal.addComponents(r1, r2, r3);
            return await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'modal_ai') {
            await interaction.deferUpdate();
            const name = interaction.fields.getTextInputValue('name');
            const size = interaction.fields.getTextInputValue('size');
            const manual = interaction.fields.getTextInputValue('weight_manual');
            const weight = (manual && !isNaN(manual)) ? parseInt(manual) : await getWeightFromAI(name, size);
            cart.push({ name: size ? `${name} [${size}]` : name, weight });
            userCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_remove') {
            cart.pop();
            userCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_summary') {
            if (cart.length === 0) return await interaction.reply({ content: 'Koszyk pusty!', ephemeral: true });
            const totalWeight = cart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summary = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT REP')
                .setColor(0x00FF00)
                .addFields(
                    { name: '⚖️ Waga:', value: `**${totalWeight}g**`, inline: true },
                    { name: '💰 Cena ETL:', value: `**${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON:', value: 'Wpisz **lucky8** i załóż konto: [KLIKNIJ TUTAJ](https://ikako.vip/r/xhm44)' }
                );
            await interaction.followUp({ embeds: [summary], ephemeral: true });
            await interaction.followUp({ content: "# ✨ WITAMY!\nUżyj `/obliczwage` ponownie, aby obliczyć inną paczkę.", ephemeral: true });
        }
    }
};
