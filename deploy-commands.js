const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// Definicja wszystkich komend bota
const commands = [
    // Komenda Panelu Kuponów
    new SlashCommandBuilder()
        .setName('panel-kupony')
        .setDescription('Wysyła ciemnoniebieski panel KakoBuy (Tylko dla Zarządu)'),

    // [NOWA] Komenda Panelu Ticketów
    new SlashCommandBuilder()
        .setName('panel-ticket')
        .setDescription('Wysyła estetyczny panel ticketów VAULT REP')
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
                '1458124283707523275', // ID BOTA
                '1457675858163793984'  // ID SERWERA
            ),
            { body: commands },
        );

        console.log('✅ VAULT REP: Pomyślnie zarejestrowano komendy: /panel-kupony oraz /panel-ticket');
    } catch (error) {
        console.error('❌ Błąd rejestracji:', error);
    }
})();
