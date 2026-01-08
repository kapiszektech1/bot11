// --- PLIK: pingosoby.js ---
const CONFIG = {
    VERIFIED_ROLE_ID: '1457675858486755375',
    TARGET_CHANNELS: [
        '1457675905617887428', 
        '1457675903617335297', 
        '1457675921359372371'
    ],
    DELETE_AFTER_MS: 3000 // 3 sekundy
};

// Funkcja pomocnicza do zasypiania procesu
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    handleRolePing: async (oldMember, newMember) => {
        // Sprawdzamy dokładnie, czy ranga została dodana w tej konkretnej zmianie
        const hadRole = oldMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);
        const hasRole = newMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);

        if (!hadRole && hasRole) {
            console.log(`[VAULT REP] Start sekwencji pingowania dla: ${newMember.user.tag}`);

            for (const channelId of CONFIG.TARGET_CHANNELS) {
                try {
                    const channel = await newMember.guild.channels.fetch(channelId);
                    if (!channel) {
                        console.log(`[VAULT REP] Nie znaleziono kanału: ${channelId}`);
                        continue;
                    }

                    // 1. Wysyłamy wiadomość i czekamy aż Discord potwierdzi jej dostarczenie
                    const pingMessage = await channel.send({ content: `${newMember}` });
                    
                    // 2. Czekamy 3 sekundy (używając stabilnego await)
                    await sleep(CONFIG.DELETE_AFTER_MS);

                    // 3. Usuwamy wiadomość
                    await pingMessage.delete()
                        .then(() => console.log(`[VAULT REP] Usunięto ślad na kanale: ${channelId}`))
                        .catch(e => console.error(`[VAULT REP] Błąd kasowania: ${e.message}`));

                } catch (error) {
                    console.error(`[VAULT REP] Krytyczny błąd obsługi kanału ${channelId}:`, error);
                }
            }
        }
    }
};
