const schedule = require('node-schedule');

class AutoClaimer {
  constructor(botManager) {
    this.botManager = botManager;
    this.claimJobs = new Map();
  }

  scheduleClaim(botId, intervalMinutes) {
    const job = schedule.scheduleJob(`*/${intervalMinutes} * * * *`, async () => {
      const bot = this.botManager.bots.get(botId);
      if (bot) {
        await this.claimRewards(bot);
      }
    });
    
    this.claimJobs.set(botId, job);
    return job;
  }

  async claimRewards(bot) {
    try {
      await bot.page.goto('https://claim-site.com/rewards');
      
      // Check if claim is available
      const canClaim = await bot.page.evaluate(() => {
        return document.querySelector('.claim-button') !== null;
      });
      
      if (canClaim) {
        await bot.page.click('.claim-button');
        await bot.page.waitForTimeout(5000); // Wait for claim processing
        
        // Verify claim
        const claimed = await bot.page.evaluate(() => {
          return document.querySelector('.success-message') !== null;
        });
        
        return claimed;
      }
      return false;
    } catch (error) {
      console.error(`Claim error for bot ${bot.id}:`, error);
      return false;
    }
  }
}