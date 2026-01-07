const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Definicja komend
const commands = [
    new SlashCommandBuilder()
        .setName('panel-kupony')
        .setDescription('Wysyła ciemnoniebieski panel KakoBuy (Tylko dla Zarządu)'),
].map(command => command.toJSON());

// Inicjalizacja REST
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Funkcja rejestracji
(async () => {
    try {
        console.log('--- VAULT REP: Rozpoczynam odświeżanie komend Slash ---');

        // Rejestracja dla konkretnego serwera (działa natychmiastowo)
        await rest.put(
            Routes.applicationGuildCommands(
                '1458124283707523275',    // <--- WPISZ TU ID SWOJEGO BOTA
                '1457675858163793984' // <--- TWOJE ID SERWERA (pobrano z kontekstu)
            ),
            { body: commands },
        );

        console.log('✅ VAULT REP: Komenda /panel-kupony została zarejestrowana!');
    } catch (error) {
        console.error('❌ Błąd rejestracji:', error);
    }
})();
