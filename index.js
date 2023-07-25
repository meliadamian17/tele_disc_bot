const express = require('express');
const expressApp = express();
const path = require('path');
expressApp.use(express.static('static'));
expressApp.use(express.json());
require('dotenv').config();


const ticket_bot_prefix = '!open';

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

expressApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

bot.launch();

bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'Welcome To MakeYourTicket Bot!', {
    })
})

//initialize a discord bot
const { Client, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.DISCORD_TOKEN;

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

discordClient.once(Events.ClientReady, c => {
    console.log('Discord bot ready' + c.user.tag);
})

discordClient.login(token);



const userProgress = {};

bot.command('order', ctx => {
    const userID = ctx.from.id
    userProgress[userID] = {};

    bot.telegram.sendMessage(ctx.chat.id, 'What is your name?')

    bot.on('message', ctx => {

        const userID = ctx.from.id;

        const progress = userProgress[userID];

        if (!progress.name) {
            progress.name = ctx.message.text;
            bot.telegram.sendMessage(ctx.chat.id, 'What is your address?')
        } else if (!progress.address) {
            progress.address = ctx.message.text;
            bot.telegram.sendMessage(ctx.chat.id, 'What are your order instructions?')
        }
        else if (!progress.instructions) {
            progress.instructions = ctx.message.text;
            bot.telegram.sendMessage(ctx.chat.id, 'What is your food order?')
        }
        else if (!progress.foodOrder) {
            progress.foodOrder = ctx.message.text;

            let message = buildMessage(progress.name, progress.address, progress.instructions, progress.foodOrder);
            openTicket(message);

            userProgress[userID] = {};

            bot.telegram.sendMessage(ctx.chat.id, 'Your order has been placed. Thank you for using MakeYourTicket Bot!')
        }

    })
    
});


function buildMessage(name, address, instructions, foodOrder) {
    let message = name + ' ' + address + ' ' + instructions + ' ' + foodOrder
    return message
}

function openTicket(message){
    const channel = discordClient.channels.cache.get('1133167471151567031');
    channel.send('/new ' + message);
}





