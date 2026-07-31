FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 is required so the dev server accepts connections
# from outside the container (i.e. from your browser on Windows)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]