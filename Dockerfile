# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:21-alpine3.19 AS build

# Set config
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

# Create and change to the app directory.
WORKDIR /app

# Copy the files to the container image
COPY yarn.lock package*.json ./

# Install packages
RUN yarn install

# Copy local code to the container image.
COPY . ./

# Build the app.
RUN yarn build

# Use the Caddy image
FROM caddy

# Create and change to the app directory.
WORKDIR /app

# Copy Caddyfile to the container image.
COPY Caddyfile ./

# Copy local code to the container image.
RUN caddy fmt Caddyfile --overwrite

# Copy files to the container image.
COPY --from=build /app/dist ./dist

# Use Caddy to run/serve the app
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]