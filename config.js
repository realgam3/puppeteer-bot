const config = {
    "queue": {
        "port": 5672,
        "host": "queue",
        "name": "browser",
        "username": "guest",
        "password": "guest",
    },
    "timeout": 240000,
    "extend": {
        // Add close pages function
        closePages: async function () {
            for (let page of await context.browser.pages()) {
                await page.close();
            }

            context.page = await context.browser.newPage();
            for (let [evenName, event] of Object.entries(config.page.events)) {
                context.page.on(evenName, event);
            }
            await context.page.evaluateOnNewDocument(`(${config.page.evaluate.document_start.toString()})();`);
        },
        slowType: async function (selector, text, delay = 500) {
            for (let chr of text) {
                await context.page.type(selector, chr);
                await context.page.waitForTimeout(delay);
            }
        },
        setCookies: async function (cookies) {
            await context.page.setCookie(...cookies);
        },
    },
    "allowed_actions": [
        "page.type",
        "page.goto",
        "page.click",
        "page.setCookie",
        "page.setCookies",
        "extend.slowType",
        "extend.closePages",
        "page.waitForTimeout",
        "page.waitForSelector",
    ],
    "browser": {
        "options": {
            "headless": true,
            "ignoreHTTPSErrors": true,
            "args": [
                "--no-sandbox",
                "--disable-gpu",
                "--ignore-certificate-errors",
                "--disable-dev-shm-usage",
            ]
        }
    },
    "page": {
        "events": {
            // "console": message => console.debug(`[${message.type().toUpperCase()}] ${message.text()}`),
            "error": message => console.error(message),
            "pageerror": message => console.error(message),
        },
        "evaluate": {
            "document_start": function () {
                window.open = () => {
                    console.warn('window.open');
                };
                window.prompt = () => {
                    console.warn('window.prompt');
                };
                window.confirm = () => {
                    console.warn('window.confirm');
                };
                window.alert = () => {
                    console.warn('window.alert');
                };
            }
        }
    }
}

module.exports = config;
