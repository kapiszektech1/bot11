const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

const MY_ID = '1419055461776228523';

const wagiBaza = {
    'koszulka piłkarska': 250, 'koszulka pilkarska': 250, 'jersey': 250, 'strój piłkarski': 450,
    'real madryt': 260, 'barcelona': 260, 'manchester': 260, 'bayern': 260, 'reprezentacja': 260,
    'arsenal': 260, 'chelsea': 260, 'psg': 260, 'juventus': 260, 'milan': 260, 'inter': 260,
    'getry': 120, 'spodenki piłkarskie': 220, 'retro jersey': 300, 'NBA jersey': 350,
    'jordan 4': 1450, 'j4': 1450, 'jordan 1': 1200, 'j1': 1200, 'jordan 11': 1550, 'j11': 1550, 'jordan 3': 1400, 'j3': 1400,
    'nike tn': 1100, 'tn': 1100, 'plusy': 1100, 'tuned': 1100, 'air max 95': 1200, '95tki': 1200, 'air max 98': 1100, 'air max 97': 1100,
    'dunki': 1050, 'dunk': 1050, 'sb dunk': 1100, 'force': 1300, 'af1': 1300, 'air force': 1300, 'shox': 1150, 'shoxy': 1150,
    'vapormax': 900, 'presto': 800, 'huarache': 900, 'cortez': 800, 'nike tech': 1100, 'zoom': 1000, 'kobe': 1100, 'kd': 1100, 'lebron': 1300,
    'samba': 850, 'gazelle': 800, 'campus': 1050, 'yeezy 350': 900, 'yeezy 500': 1100, 'yeezy 700': 1200, 'slide': 650, 'klapki': 600,
    'foam runner': 550, 'nb 9060': 1350, 'nb 530': 850, 'nb 2002r': 1100, 'nb 550': 1150, 'nb 1906': 1150, 'bapesta': 1250, 'bape buty': 1250,
    'rick owens': 1800, 'ramones': 1600, 'jumbo': 2000, 'balenciaga track': 2200, 'triple s': 2500, 'defender': 2200, 'lanvin': 1600,
    'timberland': 1900, 'ugg': 900, 'doc martens': 1800, 'converse': 800, 'vans': 800, 'alexander mcqueen': 1200,
    'jeansy': 950, 'dzinsy': 950, 'dżinsy': 950, 'baggy': 1100, 'big boy': 1100, 'polar big boy': 1100, 'janki': 1000, 'jaded': 1000,
    'bojówki': 950, 'cargo': 950, 'minus two': 1050, 'm2': 1050, 'dresy': 750, 'spodnie dresowe': 750, 'joggery': 700, 'legginsy': 300,
    'dzwony': 850, 'flare': 850, 'ee': 280, 'eric emanuel': 280, 'spodenki': 400, 'szorty': 350, 'kąpielówki': 250, 'mesh': 280,
    'corteiz shorts': 450, 'trapstar shorts': 450, 'spodenki dresowe': 450, 'gacie': 150, 'bokserki': 150, 'majtki': 100,
    'skarpetki': 60, 'skarpety': 60, 'stopki': 40, 'skarpetki nike': 70, 'skarpetki wysokie': 80, 'podkolanówki': 100, 'skarpetki bape': 70,
    'skarpety piłkarskie': 120, 'skarpety antypoślizgowe': 100,
    'bluza': 900, 'hoodie': 950, 'zip': 1000, 'bluza rozpinana': 1000, 'kurtka': 1300, 'puchówka': 1400, 'puchowka': 1400, 'nuptse': 1100,
    'tnf': 1100, 'moncler': 1250, 'maya': 1250, 'canada goose': 2100, 'kamizelka': 800, 'bezrękawnik': 800, 'wiatrówka': 500, 'arc teryx': 700,
    'koszulka': 280, 'teciak': 280, 't-shirt': 280, 'polo': 300, 'longsleeve': 400, 'tank top': 200, 'sweter': 700, 'koszula': 400,
    'okulary': 150, 'gały': 150, 'biżuteria': 100, 'łańcuch': 250, 'zegarek': 400, 'pasek': 350, 'czapka': 180, 'kominiarka': 150,
    'plecak': 1100, 'torba': 800, 'nerka': 400, 'portfel': 200, 'perfumy': 400, 'słuchawki': 300, 'airpods': 150, 'lego': 1000, 'naklejki': 20
};

if (!global.vaultCarts) { global.vaultCarts = new Map(); }

function createProgressBar(currentWeight) {
    const max = 5000;
    const percentage = Math.min((currentWeight / max) * 100, 100);
    const progress = Math.round(percentage / 10);
    const bar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);
    return `${bar} **${Math.round(percentage)}%** (Limitu 5kg)`;
}

function createMainPanel(target, cart) {
    const user = target.author || target.user;
    const userName = user ? user.username : 'Użytkownik';
    const avatar = user ? user.displayAvatarURL() : null;
    const totalW = cart.reduce((s, i) => s + i.weight, 0);
    const itemCount = cart.length;

    let cartList = "_Twój koszyk jest pusty. Dodaj coś!_";
    if (cart.length > 0) {
        cartList = cart.map((i, n) => {
            const icon = i.weight > 1000 ? '🧥' : (i.weight > 500 ? '👟' : '👕');
            return `\`${n + 1}.\` ${icon} **${i.name}**\nㅤ└ \`${i.weight}g\``;
        }).join('\n');
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'VAULT REP • SHIPPING CALCULATOR', iconURL: 'https://cdn.discordapp.com/emojis/1324508499257626707.webp?size=96&quality=lossless' })
        .setTitle(`🛒 KOSZYK UŻYTKOWNIKA ${userName.toUpperCase()}`)
        .setDescription(cartList)
        .addFields(
            { name: '📦 STATYSTYKI PACZKI', value: `Waga: \`${totalW}g\`\nIlość: \`${itemCount} szt.\``, inline: true },
            { name: '📊 STATUS ZAPEŁNIENIA', value: createProgressBar(totalW), inline: false }
        )
        .setColor(0x2B2D31)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/679/679720.png')
        .setFooter({ text: 'Powered by VAULT REP AI • 2026', iconURL: avatar });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('calc_add').setLabel('Dodaj Produkt').setEmoji('➕').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('calc_remove').setLabel('Usuń Ostatni').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('calc_summary').setLabel('Wyceń Wysyłkę').setEmoji('💸').setStyle(ButtonStyle.Primary)
    );

    return { embeds: [embed], components: [row] };
}

module.exports = {
    execute: async (target) => {
        const user = target.author || target.user;
        global.vaultCarts.set(user.id, []);
        const panel = createMainPanel(target, []);
        
        if (target.reply) {
            await target.reply(panel).catch(e => console.log(e));
        } else {
            await target.channel.send(panel).catch(e => console.log(e));
        }
    },

    handleInteraction: async (interaction) => {
        try {
            const userId = interaction.user.id;
            if (!global.vaultCarts.has(userId)) global.vaultCarts.set(userId, []);
            let cart = global.vaultCarts.get(userId);

            // --- OTWARCIE MODALA ---
            if (interaction.customId === 'calc_add') {
                const modal = new ModalBuilder().setCustomId('calc_modal_ai').setTitle('➕ DODAJ DO PACZKI');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel("NAZWA PRODUKTU").setPlaceholder("np. Jordan 4...").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('size').setLabel("ROZMIAR").setPlaceholder("np. 44").setStyle(TextInputStyle.Short).setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('weight_manual').setLabel("WAGA RĘCZNA").setPlaceholder("W gramach").setStyle(TextInputStyle.Short).setRequired(false))
                );
                return await interaction.showModal(modal);
            }

            // --- OBSŁUGA FORMULARZA DODAWANIA ---
            if (interaction.customId === 'calc_modal_ai') {
                await interaction.deferUpdate(); // Kluczowe dla szybkości odpowiedzi
                const nameIn = interaction.fields.getTextInputValue('name');
                const sizeIn = interaction.fields.getTextInputValue('size');
                const manualIn = interaction.fields.getTextInputValue('weight_manual');

                let weight = (manualIn && !isNaN(manualIn)) ? parseInt(manualIn) : null;
                if (weight === null) {
                    const n = nameIn.toLowerCase();
                    for (const key in wagiBaza) { if (n.includes(key)) { weight = wagiBaza[key]; break; } }
                }
                if (weight === null) weight = 800;

                let displayName = nameIn.charAt(0).toUpperCase() + nameIn.slice(1);
                if (sizeIn) displayName += ` [${sizeIn.toUpperCase()}]`;

                cart.push({ name: displayName, weight });
                global.vaultCarts.set(userId, cart); // Zapisujemy zmiany
                await interaction.editReply(createMainPanel(interaction, cart));
            }

            // --- USUWANIE OSTATNIEGO ---
            if (interaction.customId === 'calc_remove') {
                await interaction.deferUpdate();
                cart.pop();
                global.vaultCarts.set(userId, cart); // Zapisujemy zmiany
                await interaction.editReply(createMainPanel(interaction, cart));
            }

            // --- WYCENA ---
            if (interaction.customId === 'calc_summary') {
                if (cart.length === 0) {
                    return await interaction.reply({ content: '❌ Koszyk jest pusty!', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: false });
                const tW = cart.reduce((a, b) => a + b.weight, 0);
                const cena = (31.91 + (Math.ceil(tW / 500) - 1) * 30.96 + 37.63).toFixed(2);

                const embedS = new EmbedBuilder()
                    .setTitle('💸 WYCENA WYSYŁKI')
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`Szacowany koszt dla paczki użytkownika <@${userId}> o wadze **${tW}g**.`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '⚖️ Waga', value: `\`${tW}g\``, inline: true },
                        { name: '💰 Koszt', value: `**${cena} PLN**`, inline: true },
                        { name: '🎟️ Kod Rabatowy', value: 'Użyj kodu: `lucky8` (-56 PLN)', inline: false }
                    )
                    .setFooter({ text: 'Ceny są szacunkowe' });

                await interaction.editReply({ embeds: [embedS] });

                const tutorial = `# 📦 WITAMY W KALKULATORZE!\n> **Chcesz obliczyć wagę i cenę swojej paczki? To proste!**\n\nWpisz komendę: \`!obliczwage\` aby bot przygotował Twój osobisty panel zarządzania przedmiotami.`;
                await interaction.followUp({ content: tutorial, ephemeral: false });
            }
        } catch (err) { 
            console.error("Błąd w kalkulator.js:", err); 
        }
    }
};
