# 1️⃣ Base image
FROM node:20-alpine

# 2️⃣ Radni folder unutar containera
WORKDIR /app

# 3️⃣ Kopiramo package fajlove
COPY package*.json ./

# 4️⃣ Instaliramo dependencies
RUN npm ci

# 5️⃣ Kopiramo ostatak projekta
COPY . .

# 6️⃣ Build aplikacije
RUN npm run build

# 7️⃣ Otvaramo port
EXPOSE 3000

# 8️⃣ Startujemo aplikaciju
CMD ["npm", "start"]

