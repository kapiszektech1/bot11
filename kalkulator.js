const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const MY_ID = '1419055461776228523';

// GIGANTYCZNA BAZA – 02,03, TU JEST ABSOLUTNIE WSZYSTKO
const wagiBaza = {
    // --- KOSZULKI PIŁKARSKIE & SPORT ---
    'koszulka piłkarska': 250, 'koszulka pilkarska': 250, 'jersey': 250, 'strój piłkarski': 450,
    'real madryt': 260, 'barcelona': 260, 'manchester': 260, 'bayern': 260, 'reprezentacja': 260,
    'arsenal': 260, 'chelsea': 260, 'psg': 260, 'juventus': 260, 'milan': 260, 'inter': 260,
    'getry': 120, 'spodenki piłkarskie': 220, 'retro jersey': 300, 'NBA jersey': 350,

    // --- BUTY: NIKE & JORDAN ---
    'jordan 4': 1450, 'j4': 1450, 'jordan 1': 1200, 'j1': 1200, 'jordan 11': 1550, 'j11': 1550, 'jordan 3': 1400, 'j3': 1400,
    'nike tn': 1100, 'tn': 1100, 'plusy': 1100, 'tuned': 1100, 'air max 95': 1200, '95tki': 1200, 'air max 98': 1100, 'air max 97': 1100,
    'dunki': 1050, 'dunk': 1050, 'sb dunk': 1100, 'force': 1300, 'af1': 1300, 'air force': 1300, 'shox': 1150, 'shoxy': 1150,
    'vapormax': 900, 'presto': 800, 'huarache': 900, 'cortez': 800, 'nike tech': 1100, 'zoom': 1000, 'kobe': 1100, 'kd': 1100, 'lebron': 1300,

    // --- BUTY: ADIDAS, NB, YEEZY & INNE ---
    'samba': 850, 'gazelle': 800, 'campus': 1050, 'yeezy 350': 900, 'yeezy 500': 1100, 'yeezy 700': 1200, 'slide': 650, 'klapki': 600,
    'foam runner': 550, 'nb 9060': 1350, 'nb 530': 850, 'nb 2002r': 1100, 'nb 550': 1150, 'nb 1906': 1150, 'bapesta': 1250, 'bape buty': 1250,
    'rick owens': 1800, 'ramones': 1600, 'jumbo': 2000, 'balenciaga track': 2200, 'triple s': 2500, 'defender': 2200, 'lanvin': 1600,
    'timberland': 1900, 'ugg': 900, 'doc martens': 1800, 'converse': 800, 'vans': 800, 'alexander mcqueen': 1200,

    // --- SPODNIE & SPODENKI ---
    'jeansy': 950, 'dzinsy': 950, 'dżinsy': 950, 'baggy': 1100, 'big boy': 1100, 'polar big boy': 1100, 'janki': 1000, 'jaded': 1000,
    'bojówki': 950, 'cargo': 950, 'minus two': 1050, 'm2': 1050, 'dresy': 750, 'spodnie dresowe': 750, 'joggery': 700, 'legginsy': 300,
    'dzwony': 850, 'flare': 850, 'ee': 280, 'eric emanuel': 280, 'spodenki': 400, 'szorty': 350, 'kąpielówki': 250, 'mesh': 280,
    'corteiz shorts': 450, 'trapstar shorts': 450, 'spodenki dresowe': 450, 'gacie': 150, 'bokserki': 150, 'majtki': 100,

    // --- SKARPETKI & BIELIZNA ---
    'skarpetki': 60, 'skarpety': 60, 'stopki': 40, 'skarpetki nike': 70, 'skarpetki wysokie': 80, 'podkolanówki': 100, 'skarpetki bape': 70,
    'skarpety piłkarskie': 120, 'skarpety antypoślizgowe': 100,

    // --- GÓRA & KURTKI ---
    'bluza': 900, 'hoodie': 950, 'zip': 1000, 'bluza rozpinana': 1000, 'kurtka': 1300, 'puchówka': 1400, 'puchowka': 1400, 'nuptse': 1100,
    'tnf': 1100, 'moncler': 1250, 'maya': 1250, 'canada goose': 2100, 'kamizelka': 800, 'bezrękawnik': 800, 'wiatrówka': 500, 'arc teryx': 700,
    'koszulka': 280, 'teciak': 280, 't-shirt': 280, 'polo': 300, 'longsleeve': 400, 'tank top': 200, 'sweter': 700, 'koszula': 400,

    // --- AKCESORIA & GADŻETY ---
    'okulary': 150, 'gały': 150, 'biżuteria': 100, 'łańcuch': 250, 'zegarek': 400, 'pasek': 350, 'czapka': 180, 'kominiarka': 150,
    'plecak': 1100, 'torba': 800, 'nerka': 400, 'portfel': 200, 'perfumy': 400, 'słuchawki': 300, 'airpods': 150, 'lego': 1000, 'naklejki': 20
};

if (!global.vaultCarts) { global.vaultCarts = new Map(); }

function createMainPanel(target, cart) {
    // NAPRAWA: Pobieranie nazwy użytkownika niezależnie od typu (Interaction/Message)
    const user = target.author || target.user;
    const userName = user ? user.username : 'Użytkowniku';

    const totalW = cart.reduce((s, i) => s + i.weight, 0);
    const embed = new EmbedBuilder()
        .setTitle('📦 VAULT REP • KALKULATOR WAGI')
        .setDescription(`Witaj **${userName}**!\n\nAby uruchomić kalkulator, użyj komendy: \`!obliczwage\`\n\n**🛒 TWOJA LISTA:**\n${cart.map((i, n) => `> **${n+1}.** ${i.name} — \`${i.weight}g\``).join('\n') || "_Koszyk jest pusty..._"}\n\n**⚖️ ŁĄCZNA WAGA:** \`${totalW}g\``)
        .setColor(0x00008B)
        .setThumbnail('https://cdn.discordapp.com/attachments/1458122275973890222/1459848674631749825/wymiary-paczki.png')
        .setFooter({ text: 'VAULT REP • BAZA INFINITE • 2026' });

    const row = new ActionRowBuilder().addComponents(
        { type: 2, style: 1, label: '➕ DODAJ', custom_id: 'calc_add' },
        { type: 2, style: 4, label: '🗑️ USUŃ', custom_id: 'calc_remove' },
        { type: 2, style: 3, label: '📊 PODSUMUJ', custom_id: 'calc_summary' }
    );
    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (target) => {
        const user = target.author || target.user;
        global.vaultCarts.set(user.id, []);
        
        const panel = createMainPanel(target, []);
        if (target.reply) {
            await target.reply(panel).catch(() => {});
        } else {
            await target.channel.send(panel).catch(() => {});
        }
    },

    handleInteraction: async (interaction) => {
        const userId = interaction.user.id;
        if (!global.vaultCarts.has(userId)) global.vaultCarts.set(userId, []);
        let cart = global.vaultCarts.get(userId);

        if (interaction.customId === 'calc_add') {
            const modal = new ModalBuilder().setCustomId('calc_modal_ai').setTitle('DODAJ PRODUKT');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("CO DODAJESZ?").setPlaceholder("np. Koszulka Real Madryt, Nike TN").setStyle(1).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("ROZMIAR").setStyle(1).setRequired(false)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("WAGA RĘCZNIE (OPCJONALNIE)").setStyle(1).setRequired(false))
            );
            return await interaction.showModal(modal).catch(() => {});
        }

        // Deferujemy odpowiedź dla przycisków i modali, żeby nie było błędu "Interaction has already been acknowledged"
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate().catch(() => {});

        if (interaction.customId === 'calc_modal_ai') {
            const nameIn = interaction.fields.getTextInputValue('name');
            const sizeIn = interaction.fields.getTextInputValue('size');
            const manualIn = interaction.fields.getTextInputValue('weight_manual');
            
            let weight = null;
            if (manualIn && !isNaN(manualIn)) {
                weight = parseInt(manualIn);
            } else {
                const n = nameIn.toLowerCase();
                let bestMatch = null;
                for (const key in wagiBaza) {
                    if (n.includes(key)) {
                        if (!bestMatch || key.length > bestMatch.length) {
                            bestMatch = key;
                            weight = wagiBaza[key];
                        }
                    }
                }
            }

            if (weight === null) {
                weight = 800; 
                try {
                    const boss = await interaction.client.users.fetch(MY_ID);
                    await boss.send(`🚨 **02,03, DOPISZ:** \`${nameIn}\``);
                } catch (e) {}
            }
            
            cart.push({ name: sizeIn ? `${nameIn} [${sizeIn}]` : nameIn, weight });
            global.vaultCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction, cart)).catch(() => {});
        }

        if (interaction.customId === 'calc_remove') {
            cart.pop();
            global.vaultCarts.set(userId, cart);
            await interaction.editReply(createMainPanel(interaction, cart)).catch(() => {});
        }

        if (interaction.customId === 'calc_summary') {
            if (cart.length === 0) return;
            const tW = cart.reduce((a, b) => a + b.weight, 0);
            const cena = (31.91 + (Math.ceil(tW / 500) - 1) * 30.96 + 37.63).toFixed(2);

            const embedS = new EmbedBuilder()
                .setTitle('📊 FINALNA WYCENA VAULT REP')
                .setColor(0x00FF00)
                .addFields(
                    { name: '⚖️ ŁĄCZNA WAGA', value: `> **${tW}g**`, inline: true },
                    { name: '💰 WYSYŁKA ETL', value: `> **${cena} PLN**`, inline: true },
                    { name: '🚀 KUPON', value: 'Kod **lucky8** (-56 PLN)' }
                );

            await interaction.followUp({ embeds: [embedS] }).catch(() => {});
        }
    }
};
