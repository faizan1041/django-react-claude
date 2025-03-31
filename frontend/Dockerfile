FROM node:22-alpine

WORKDIR /app

# Add a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodeuser && \
    chown -R nodeuser:nodejs /app

# Copy package files
COPY package.json ./

# Use npm install instead of npm ci since package-lock.json might not exist
RUN npm install && \
    mkdir -p node_modules/.cache && \
    chmod -R 777 node_modules/.cache

# Copy application code
COPY . .

# Switch to non-root user
USER nodeuser

EXPOSE 3000

CMD ["npm", "start"]