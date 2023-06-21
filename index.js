#!/usr/bin/env node

const bot = require("./bot");
const amqplib = require("amqplib");
const config = require(process.env.CONFIG_PATH || "./config.js");

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || config.queue.host;
const RABBITMQ_PORT = parseInt(process.env.RABBITMQ_PORT || config.queue.port);
const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME || config.queue.password;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || config.queue.username;
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
                port: RABBITMQ_PORT,
                hostname: RABBITMQ_HOST,
                username: RABBITMQ_USERNAME,
                password: RABBITMQ_PASSWORD,
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
