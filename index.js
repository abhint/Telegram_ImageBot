process.env.NTBA_FIX_319 = 1;
process.env["NTBA_FIX_350"] = 1;

const Telegram = require('node-telegram-bot-api');
const fs = require('fs');
const request = require('request');
const sizeOf = require('image-size');
const { from } = require('form-data');
const Download = require('./image_dl');
const { url } = require('inspector');
const Message = require('./messages')

// Bot Token :-)
const TOKEN  = 'YOUR_TELEGRAM_BOT_TOKEN';

const options = {
    polling: true
}


const bot  = new Telegram(TOKEN, options);

const msg_option = {
    parse_mode: 'html'
} 

// const ChatID = msg.from.id;

// Start Message '/\/start/' Cmd
bot.onText(/\/start/, async function onStart(msg){ 
    const ChatID = msg.from.id;
    bot.sendMessage(ChatID,Message.start, msg_option)
});

// Help Cmd
bot.onText(/\/help/, async function onHelp(msg){
    const ChatID = msg.from.id;
    bot.sendMessage(ChatID, Message.help, msg_option)
});

// About Cmd
bot.onText(/\/about/, async function onAbout(msg){
    const ChatID = msg.from.id;
    bot.sendMessage(ChatID, Message.about, msg_option)
});


//URL Bot//
bot.on('message', (msg) =>{
    
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

    if (!!pattern.test(msg.text.toString())) {

        
        const process_msg =  bot.sendMessage(msg.from.id, '<b>Processing your request...</b>',msg_option);

        const img_url = msg.text.toString();
        const img_path = msg.from.id.toString();
        const path = `${__dirname}/${img_path}.png`;
        Download(img_url, path , () =>{
            process_msg.then((request) =>{
                bot.editMessageText('Downloading...', { chat_id: request.chat.id, message_id: request.message_id});
            });
            const size = sizeOf(path);
            const width = size.width;
            const height = size.height;      
            if(width > 1280 && height > 720){
                
                bot.sendDocument(msg.from.id, path);

                process_msg.then((result)=>{
                    bot.deleteMessage(msg.chat.id, result.message_id);
                    fs.unlink(path, function(err){
                        if (err) throw err;
                    });
                });
               
            }
            else{
                bot.sendPhoto(msg.from.id, path, {caption: '😁 @thankappan369'});
                process_msg.then((result) =>{
                    bot.deleteMessage(msg.chat.id, result.message_id);
                    fs.unlink(path , function (err){
                        if (err) throw err;
                    });
                });
            }

        });

    } 
    else{
        // bot.sendMessage(msg.from.id, '😒');
    }
});
