process.env["NTBA_FIX_350"] = 1; // node-telegram-bot-api deprecated In the future, content-type of files you send will default to "application/octet-stream". See https://github.com/yagop/node-telegram-bot-api/blob/master/doc/usage.md#sending-files for more information on how sending files has been improved and on how to disable this deprecation message altogether. at index.js:103:21
const TelegramBot = require('node-telegram-bot-api');
const sizeOf = require('image-size');
const fs = require('fs');
const pattern = require('./unit/pattern');
const Message = require('./unit/messages');
const Token = require('./token');
const Download = require('./unit/image_dl');

//ENV
const TOKEN = Token.token;
const PORT = process.env.PORT;
const url = process.env.APP_URL;

// PORT SET
const options = {
    webHook: {
        port: PORT
    }
};

const msg_option = {
    parse_mode: 'html',
}

const bot = new TelegramBot(TOKEN, options);

//WEBHOOK
bot.setWebHook(`${url}/bot${TOKEN}`)
bot.on('webhook_error', (error) => {
    console.log(error.code);
});
console.log('BOT IS START')
console.log(`WEBHOOK: ${url}/bot${TOKEN}`)

//CMD START
bot.onText(/\/start/, async function onStart(msg) {
    const ChatID = msg.from.id;
    console.log(ChatID)
    await bot.sendMessage(
        ChatID,
        Message.start,
        msg_option)
});
// Help Cmd
bot.onText(/\/help/, async function onHelp(msg) {
    const ChatID = msg.from.id;
    bot.sendMessage(
        ChatID,
        Message.help,
        msg_option)
});

// About Cmd
bot.onText(/\/about/, async function onAbout(msg) {
    const ChatID = msg.from.id;
    bot.sendMessage(ChatID,
        Message.about,
        msg_option)
});

//URL FILTER
bot.onText(pattern, async function onURL(msg) {
    let process_msg = bot.sendMessage(
        msg.from.id,
        '<b>Processing your request...</b>',
        msg_option
    );
    const img_url = msg.text.toString();
    let img_path = msg.from.id.toString();
    const path = `${__dirname}/${img_path}.png`;
    const download_path = Download(img_url, path, () => {
        const size = sizeOf(download_path);
        const width = size.width;
        const height = size.height;
        if (width > 1280 || height > 720) {
            try {
                bot.sendDocument(
                    msg.from.id,
                    download_path
                );
            } catch (err) {
                bot.sendMessage(
                    msg.from.id,
                    `<b>ERROR:</b> <code>${err}</code>`
                )
            }
            process_msg.then((result) => {
                bot.deleteMessage(
                    msg.chat.id,
                    result.message_id
                );
            })
        } else {
            try {
                bot.sendPhoto(
                    msg.from.id,
                    download_path,
                    {
                        caption: '😁 @thankappan369'
                    });
            } catch (err) {
                bot.sendMessage(
                    msg.from.id,
                    `<b>ERROR:</b> <code>${err}</code>`
                )
            }
            process_msg.then((result) => {
                bot.deleteMessage(
                    msg.chat.id,
                    result.message_id
                );

            });
        }
        fs.unlink(download_path, function (err) {
            if (err)
                throw err;
            console.log('file deleted')
        });
    })
})

bot.on('message', (msg) => {
    bot.sendMessage(
        msg.from.id,
        '😁'
    );
})

