# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nodejs npm mongodb git chromium-browser

# Install PM2 globally
sudo npm install -g pm2

# Clone repository (replace with your repo)
git clone https://github.com/your-repo/advanced-miner.git
cd advanced-miner

# Install npm packages
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your configuration

# Build frontend (if applicable)
npm run build

# Start the system
pm2 start ecosystem.config.js
pm2 save
pm2 startup