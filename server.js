const cron = require('node-cron');
const express = require('express');

const puppeteer = require('puppeteer');

const url = "https://web.whatsapp.com";

const app = express();

async function scrape(url) {
    
    try {
    // TODO re run before init.    
    // MAC: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
    const wsChromeEndpointUrl = 'ws://127.0.0.1:9222/devtools/browser/9f9c737c-e720-45cb-b1d4-f529dc9cb68f';
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsChromeEndpointUrl
    });

    const page = await browser.newPage();
    await page.goto(url);
    const groupName = 'כדורגל בחסות זוהר';
    const sendTo = `span[title='${groupName}']`;
    const scrollable = await page.waitForSelector('#pane-side');

    await page.evaluate((scrollable, groupName) => {
        function _scroll(elem, scrollTop, resolve) { 
                const isNameExists = document.querySelector(`span[title='${groupName}']`);
                if (!isNameExists) {
                    elem.scroll(0, scrollTop);
                    setTimeout(() => _scroll(elem, scrollTop + elem.offsetHeight, resolve), 3000);
                } else {
                    resolve();
                }
        }
        return new Promise((resolve, reject) => {
            return setTimeout(() => _scroll(scrollable, 500, resolve), 3000);
        });
        
    }, scrollable, groupName);
    await page.waitForSelector(sendTo);
    const target = await page.$(sendTo);
    target.click();
    const sel = '#main > footer > div._3SvgF._1mHgA.copyable-area > div.DuUXI > div > div._1awRl.copyable-text.selectable-text';
    await page.waitForSelector(sel);
    const inp = await page.$(sel);
      await inp.type("מזמין");
      await page.keyboard.press("Enter");
    } catch (e) {
        console.error(e);
    }
}

cron.schedule(`43 04 22 11 6`, () => {
    console.log('running a task');
    scrape(url);
}, {
    timezone: "Etc/UTC"
});

app.listen(7777, () => {

    console.log("server is listening to port 7777!");

});
