const fs = require('fs');
const axios = require('axios');

class ProxyManager {
  constructor() {
    this.proxies = [];
    this.workingProxies = [];
    this.blacklistedProxies = [];
  }

  loadProxies(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      this.proxies = data.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const [host, port, username, password] = line.split(':');
          return { host, port, username, password };
        });
      return this.proxies.length;
    } catch (error) {
      console.error('Proxy load error:', error);
      return 0;
    }
  }

  async checkProxy(proxy) {
    try {
      const start = Date.now();
      const response = await axios.get('http://httpbin.org/ip', {
        proxy: {
          host: proxy.host,
          port: proxy.port,
          auth: {
            username: proxy.username,
            password: proxy.password
          }
        },
        timeout: 10000
      });
      
      const latency = Date.now() - start;
      return {
        ...proxy,
        latency,
        working: true,
        ip: response.data.origin
      };
    } catch (error) {
      return {
        ...proxy,
        working: false,
        error: error.message
      };
    }
  }

  async validateAllProxies() {
    const results = await Promise.all(
      this.proxies.map(proxy => this.checkProxy(proxy))
    );
    
    this.workingProxies = results.filter(p => p.working);
    this.blacklistedProxies = results.filter(p => !p.working);
    
    return {
      total: this.proxies.length,
      working: this.workingProxies.length,
      blacklisted: this.blacklistedProxies.length
    };
  }

  getRandomWorkingProxy() {
    if (this.workingProxies.length === 0) return null;
    return this.workingProxies[Math.floor(Math.random() * this.workingProxies.length)];
  }
}