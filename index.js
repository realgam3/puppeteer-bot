#!/usr/bin/env node

const amqplib = require("amqplib");

const bot = require("./bot");
const utils = require("./utils");

const config = require(process.env.CONFIG_PATH || "./config.js");


(async () => {
    let connection = null;
    while (!connection) {
        try {
            connection = await amqplib.connect({
                maxLength: 1,
                protocol: "amqp",
                port: config.queue.port,
                hostname: config.queue.host,
                username: config.queue.username,
                password: config.queue.password,
            });
        } catch (error) {
            console.error(error);
            await utils.sleep();
        }
    }

    const channel = await connection.createChannel();
    await channel.assertQueue(config.queue.name, {
        durable: false
    });
    await channel.prefetch(1);
    await channel.consume(config.queue.name, async function (msg) {
        console.debug("\n[x] Received: %s", msg.content.toString());
        try {
            const data = JSON.parse(msg.content.toString());
            await bot.run(data);
        } catch (error) {
            console.error(`[!] Error: ${error.message}`);
        }
        return channel.ackAll();
    });
})();
