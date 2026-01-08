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

module.exports = {
    handleRolePing: async (oldMember, newMember) => {
        const hadRole = oldMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);
        const hasRole = newMember.roles.cache.has(CONFIG.VERIFIED_ROLE_ID);

        // Reaguj tylko gdy ranga została DODANA
        if (!hadRole && hasRole) {
            console.log(`[VAULT REP] Wykryto nadanie rangi dla ${newMember.user.tag}. Pinguję...`);

            for (const channelId of CONFIG.TARGET_CHANNELS) {
                try {
                    const channel = await newMember.guild.channels.fetch(channelId);
                    if (!channel) continue;

                    // Wysyłamy ping
                    const pingMessage = await channel.send(`${newMember}`);
                    
                    // Wymuszone usuwanie z obsługą błędów
                    setTimeout(() => {
                        pingMessage.delete()
                            .then(() => console.log(`[VAULT REP] Usunięto ping na kanale ${channelId}`))
                            .catch(err => console.error(`[VAULT REP] Nie udało się usunąć wiadomości: ${err.message}`));
                    }, CONFIG.DELETE_AFTER_MS);

                } catch (error) {
                    console.error(`[VAULT REP] Błąd na kanale ${channelId}:`, error);
                }
            }
        }
    }
};
