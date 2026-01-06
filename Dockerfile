# Wybieramy obraz z Node.js
FROM node:20

# Tworzymy folder bota
WORKDIR /usr/src/app

# Kopiujemy plik z listą bibliotek
COPY package*.json ./

# Instalujemy biblioteki (tym razem zwykłym install, który wybacza brak locka)
RUN npm install

# Kopiujemy resztę plików (index.js, powitania.js)
COPY . .

# Uruchamiamy bota
CMD [ "node", "index.js" ]
