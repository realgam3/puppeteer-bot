#!/usr/bin/env node

const bot = require("./bot");
const amqplib = require("amqplib");
const config = require(process.env.CONFIG_PATH || "./config.js");

const RABITMQ_HOST = process.env.RABITMQ_HOST || config.queue.host;
const RABITMQ_PORT = parseInt(process.env.RABITMQ_PORT || config.queue.port);
const RABITMQ_USERNAME = process.env.RABITMQ_USERNAME || config.queue.password;
const RABITMQ_PASSWORD = process.env.RABITMQ_PASSWORD || config.queue.username;
const QUEUE_NAME = process.env.QUEUE_NAME || config.queue.name;

function sleep(time = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, time);
    });
}

(async () => {
    let connection = null;
    while (!connection) {
        try {
            connection = await amqplib.connect({
                maxLength: 1,
                protocol: "amqp",
                port: RABITMQ_PORT,
                hostname: RABITMQ_HOST,
                username: RABITMQ_USERNAME,
                password: RABITMQ_PASSWORD,
            });
        } catch (error) {
            console.error(error);
            await sleep();
        }
    }

    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, {
        durable: false
    });
    await channel.prefetch(1);
    await channel.consume(QUEUE_NAME, async function (msg) {
        console.debug("\n[x] Received: %s", msg.content.toString());
        try {
            const data = JSON.parse(msg.content.toString());
            await bot.run(data);
        } catch (error) {
            console.error(error);
        }
        return channel.ackAll();
    });
})();
