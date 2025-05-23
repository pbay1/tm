const recaptcha = require('puppeteer-recaptcha-solver');
const TwoCaptcha = require('2captcha');

class CaptchaSolver {
  constructor(apiKey) {
    this.twoCaptcha = new TwoCaptcha(apiKey);
    this.fallbackEnabled = true;
  }

  async solve(page) {
    try {
      // First try with free solver
      await recaptcha(page);
      
      // Check if still present
      const captchaPresent = await page.evaluate(() => {
        return document.querySelector('.g-recaptcha') !== null;
      });
      
      if (captchaPresent && this.fallbackEnabled) {
        console.log('Using 2Captcha fallback');
        await this.solveWith2Captcha(page);
      }
    } catch (error) {
      console.error('Captcha solve error:', error);
      if (this.fallbackEnabled) {
        await this.solveWith2Captcha(page);
      }
    }
  }

  async solveWith2Captcha(page) {
    const sitekey = await page.evaluate(() => {
      return document.querySelector('.g-recaptcha').getAttribute('data-sitekey');
    });
    
    const { url } = page;
    const { data: solution } = await this.twoCaptcha.solveRecaptchaV2({
      pageurl: url,
      googlekey: sitekey
    });
    
    await page.evaluate((solution) => {
      document.getElementById('g-recaptcha-response').innerHTML = solution;
      document.getElementById('g-recaptcha-response').style.display = 'block';
    }, solution);
  }
}