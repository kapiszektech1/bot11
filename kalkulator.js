const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicjalizacja AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Globalna pamięć, aby dane nie znikały między przyciskami
if (!global.userCarts) { global.userCarts = new Map(); }

// --- FUNKCJA AI (Z NAPRAWIONYM AWAIT) ---
async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Podaj TYLKO liczbę (gramy) dla: "${itemName}" ${size ? `rozmiar ${size}` : ''}. Buty 1400, Hoodie 900, T-shirt 250, Kurtka 1200. Podaj samą liczbę.`;
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const weight = parseInt(text.replace(/\D/g, ''));
        return isNaN(weight) || weight < 10 ? 501 : weight; 
    } catch (e) {
        return 502; // Błąd klucza lub połączenia
    }
}

// --- ESTETYCZNY PANEL GŁÓWNY ---
function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = global.userCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WYSYŁKI')
        .setDescription(
            `Witaj **${interaction.user.username}**! Dodaj przedmioty, a ja oszacuję wagę i koszt dostawy.\n\n` +
            `**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> \`${n+1}.\` **${i.name}** — \`${i.weight}g\``).join('\n') || "*Twój koszyk jest obecnie pusty...*"}\n\n` +
            `**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``
        )
        .setColor(0x00008B) // Ciemny granat
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT AI • Dane szacunkowe', iconURL: interaction.user.displayAvatarURL() });

    const row = {
        type: 1,
        components: [
            { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
            { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
            { type: 2, style: 3, label: '📊 PODSUMUJ', custom_id: 'calc_summary' }
        ]
    };

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        global.userCarts.set(interaction.user.id, []);
        await interaction.reply(createMainPanel(interaction));
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.userCarts.has(userId)) global.userCarts.set(userId, []);
        let cart = global.userCarts.get(userId);

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot do paczki');
            const r1 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Co chcesz dodać?").setPlaceholder("np. Jordan 4 Military Black").setStyle(1).setRequired(true));
            const r2 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("Rozmiar (opcjonalnie)").setPlaceholder("np. 44 / XL").setStyle(1).setRequired(false));
            const r3 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("Waga ręczna (opcjonalnie)").setPlaceholder("W gramach").setStyle(1).setRequired(false));
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
            global.userCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_remove') {
            cart.pop();
            global.userCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction));
        }

        if (interaction.customId === 'calc_summary') {
            const finalCart = global.userCarts.get(userId) || [];
            if (finalCart.length === 0) return await interaction.reply({ content: '❌ Koszyk jest pusty!', ephemeral: true });

            const totalWeight = finalCart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summaryEmbed = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT AI')
                .setColor(0x00FF00) // Zielony
                .setDescription(`Szacunkowe koszty dla paczki o wadze **${totalWeight}g**:`)
                .addFields(
                    { name: '📦 Twoja paczka:', value: finalCart.map((i, n) => `\`${n+1}.\` ${i.name} (${i.weight}g)`).join('\n') },
                    { name: '💰 Cena dostawy (ETL):', value: `> **${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON:', value: 'Kod **lucky8** (56 PLN taniej): [ZAREJESTRUJ SIĘ](https://ikako.vip/r/xhm44)' }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');

            await interaction.reply({ embeds: [summaryEmbed] });
            await interaction.followUp({ content: "# ✨ WITAMY!\nJEŚLI CHCESZ PONOWNIE OBLICZYĆ WAGĘ, WPISZ: `/obliczwage` 📦" });
        }
    }
};
