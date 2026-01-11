const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicjalizacja AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const userCarts = new Map();

// --- FUNKCJA AI Z POPRAWIONYM WYWOŁANIEM ---
async function getWeightFromAI(itemName, size) {
    try {
        const prompt = `Jesteś ekspertem logistyki. Podaj TYLKO liczbę (gramy) dla przedmiotu: "${itemName}" ${size ? `rozmiar ${size}` : ''}. Zasady: Buty z boxem 1400, Hoodie 900, T-shirt 250, Kurtka 1200. Zwróć samą liczbę.`;
        
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const weight = parseInt(text.replace(/\D/g, ''));
        
        console.log(`🤖 VAULT AI: Przedmiot "${itemName}" = ${weight}g`);
        return isNaN(weight) ? 500 : weight;
    } catch (e) {
        console.error("❌ BŁĄD AI:", e.message);
        return 500;
    }
}

// --- PANEL GŁÓWNY (WIDOCZNY DLA WSZYSTKICH) ---
function createMainPanel(interaction) {
    const userId = interaction.user.id;
    const cart = userCarts.get(userId) || [];
    const totalWeight = cart.reduce((sum, item) => sum + item.weight, 0);

    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(
            `Witaj **${interaction.user.username}**! Dodaj przedmioty, aby oszacować koszt paczki.\n\n` +
            `**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> \`${n+1}.\` **${i.name}** — \`${i.weight}g\``).join('\n') || "*Koszyk jest pusty...*"}\n\n` +
            `**⚖️ ŁĄCZNA WAGA:** \`${totalWeight}g\``
        )
        .setColor(0x5865F2)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT REP • Wszystkie dane zczytuje AI', iconURL: interaction.user.displayAvatarURL() });

    const row = {
        type: 1,
        components: [
            { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
            { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
            { type: 2, style: 3, label: '📊 PODSUMUJ PACZKĘ', custom_id: 'calc_summary' }
        ]
    };

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (interaction) => {
        userCarts.set(interaction.user.id, []);
        // USUNIĘTO ephemeral: true -> Teraz wszyscy widzą
        await interaction.reply(createMainPanel(interaction));
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        let cart = userCarts.get(userId) || [];

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('modal_ai').setTitle('Dodaj przedmiot do koszyka');
            
            const r1 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("Co to za przedmiot?").setPlaceholder("np. Jordan 4 Military Black").setStyle(1).setRequired(true));
            const r2 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("Rozmiar").setPlaceholder("np. 44 / XL").setStyle(1).setRequired(false));
            const r3 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("Waga ręczna (opcjonalnie)").setPlaceholder("Wpisz w gramach").setStyle(1).setRequired(false));
            
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
            if (cart.length === 0) return await interaction.reply({ content: '❌ Twój koszyk jest pusty!', ephemeral: true });
            
            const totalWeight = cart.reduce((a, b) => a + b.weight, 0);
            const units = Math.ceil(totalWeight / 500);
            const totalCost = (31.91 + (units - 1) * 30.96 + 37.63).toFixed(2);

            const summary = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT REP')
                .setColor(0x2ECC71)
                .setDescription(`Oto szacunkowe koszty wysyłki najtańszą linią **ETL**:`)
                .addFields(
                    { name: '⚖️ Łączna waga:', value: `> **${totalWeight}g**`, inline: true },
                    { name: '💰 Cena dostawy:', value: `> **${totalCost} PLN**`, inline: true },
                    { name: '🚀 KUPON NA START:', value: 'Użyj kodu **lucky8** (56 PLN taniej) i załóż konto: [ZAREJESTRUJ SIĘ TUTAJ](https://ikako.vip/r/xhm44)' }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848869591519414/2eHEXQxjAULa95rfIgEmY8lbP85-mobile.jpg');

            await interaction.followUp({ embeds: [summary] });
            await interaction.followUp({ content: "📦 **WPISZ `/obliczwage`, ABY STWORZYĆ WŁASNĄ WYCENĘ!**" });
        }
    }
};
