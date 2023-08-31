
const {Bot, session} = require("grammy");
const dotenv = require("dotenv");

const fs = require("fs");
const outputFile = "output.txt"

dotenv.config();
const { BOT_TOKEN,ADMIN_ID } = process.env;
// Create a new bot instance
const bot = new Bot(BOT_TOKEN);

const CHANNEL_ID = "@doniverse";


async function checkMembership(ctx){
    const chat = await ctx.api.getChatMember(CHANNEL_ID,ctx.chat.id)
    return chat.status !== "left";
}

// Register a command handler
bot.command("start", async (ctx) => {
    await ctx.reply("Hello! Register for @DoniVerse 100 Subs Giveaway /register \n*Make sure you have a username");
});

bot.command("prizes", async ctx=>{
    const images = [
        { type: 'photo', media: 'https://www.mediafire.com/view/wx9dvltuldzshgf/beanie.jpg', caption: "1. Beanie\n2. Stickers"   },
        { type: 'photo', media: 'https://www.mediafire.com/view/lnvy5sfu1psuo93/stickers.jpg'  },
    ];

    try {
        await ctx.replyWithMediaGroup(images, );
    } catch (error) {
        console.error('Error sending media group:', error);
    }

});

bot.command("register", async (ctx) => {
    const userName = ctx.chat.username;
    const userId = ctx.chat.id;
    const isMember = await checkMembership(ctx)

    if(!isMember){
        await ctx.reply("Registered!");
        return;
    }

    // Read the file content
    fs.readFile(outputFile, "utf8", async (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
        } else {
            const lines = data.split("\n");
            const userIdExists = lines.some((line) => line.startsWith(userId + "-"));

            if (userIdExists) {
                console.log("User ID exists.");
                await ctx.reply("Already registered!")
            } else {
                console.log("User ID does not exist.");

                fs.appendFile(outputFile, `${userId}-${userName}\n`, async err => {
                    if(err)
                        console.log("Error appending to file: ", err);
                    else
                        console.log("Successfully updated");
                    await ctx.reply("Registered");
                });

            }
        }
    });


});

bot.command("draw", async (ctx) => {
    let filteredUsers;
    let winnerIndex;
    const numberOfWinners = 2;
    let winnersList = [];
    if(ctx.chat.id.toString() === ADMIN_ID){
        // Read the file content
        await fs.readFile(outputFile, "utf8", async (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
            } else {
                const lines = data.split("\n");
                const usersList = lines.map(ele=>{
                    const parts = ele.split('-');
                    return parts[1];
                })
                filteredUsers = usersList.filter(item => {
                    return item !== undefined && item !== "";
                });


                for(let i = 0; i < numberOfWinners; i++){
                    winnerIndex = Math.floor(Math.random()*filteredUsers.length);
                    winnersList.push(filteredUsers[winnerIndex]);
                    filteredUsers.splice(winnerIndex,1);
                }

                let winnerAnnouncement = `🥇 @${winnersList.shift()}\n🥈 @${winnersList.shift()}`;
                await ctx.reply(winnerAnnouncement)
            }
        });

    }
});


bot.command("count", async (ctx) => {
    // Read the file content
    fs.readFile(outputFile, "utf8", async (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
        } else {
            const lines = data.split("\n");
            await ctx.reply(`${lines.length} people registered!`)

        }
    });
});


// Register a text message handler
bot.on("message:text", async (ctx) => {
    const message = ctx.message.text;
    await ctx.reply(`You said: ${message}`);
});

// Start the bot
bot.start();

// Use session middleware to manage user sessions
bot.use(session());

// Log errors
bot.catch((err) => {
    console.error("Error:", err);
});


