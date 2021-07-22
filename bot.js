const puppeteer = require("puppeteer");
const config = require("./config");

module.exports.run = async function run(data, configuration = config) {
    // Bot Context
    const config = configuration;
    const browser = await puppeteer.launch(config.browser.options);
    const context = {
        browser: browser,
        page: await browser.newPage(),
        // save the result for the next function (if needed)
        result: null,
        // Add custom functions (like getFlag)
        extend: config.extend,
    };
    global.context = context;

    // Hard Timeout - To Protect The Bot
    let timedOut = false;
    const timeout = setTimeout(async function () {
        try {
            await context.browser.close();
        } catch (error) {
            console.error(error);
        }
        timedOut = true;
        console.error(`the data ${JSON.stringify(data)} timed out`);
    }, data.timeout || config.timeout);

    // Setup Events
    for (let [event_name, event] of Object.entries(config.page.events)) {
        context.page.on(event_name, event);
    }

    // Hook JavaScript Functions
    await context.page.evaluateOnNewDocument(`(${config.page.evaluate.document_start.toString()})();`);

    // Run Action Batch
    try {
        for (let {action, args = []} of data.actions || []) {
            if (timedOut) {
                return;
            }
            if (config.allowed_actions && !config.allowed_actions.includes(action)) {
                console.warn(`the action ${action} was not allowed`);
                continue;
            }
            console.log(`${action}(${JSON.stringify(args).replace(/(^\[|]$)/g, '')})`);
            const [objectName, funcName] = action.split('.');
            const object = context[objectName];
            const func = object[funcName];
            context.result = await func.apply(object, args);
        }
    } catch (error) {
        console.error(error);
    }

    clearTimeout(timeout);
    try {
        await context.browser.close();
    } catch (error) {
        console.error(error);
    }
};
