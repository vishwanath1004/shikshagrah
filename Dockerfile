# Use an official Node.js image as the base
FROM node:20

# Set the working directory
WORKDIR /workspace

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the entire NX workspace
COPY . .

# Build applications
#RUN npx nx run-many --target=build --projects=shikshagraha-app,registration,content,players
RUN npx nx run-many --target=build --projects=shikshagraha-app,registration,content,players
# Install PM2 to manage multiple apps
RUN npm install -g pm2

# Expose the ports for all apps
EXPOSE 3000 4300 4301 4108

# Command to run all apps using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
