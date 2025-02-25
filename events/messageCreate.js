const { Events } = require('discord.js');
const memberdata = require('../memberdata.json');
const fs = require('node:fs');
const canvafy = require("canvafy");
const { ownerID } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || message.guild.id !== '1124566634456174605') return;
        if (!memberdata.find(m => m.id === message.member.id)) memberdata.push({ id: message.member.id, level: { xp: 0, lvl: 1 } });
        const mmember = memberdata.find(m => m.id === message.member.id);
        mmember.messages ? mmember.messages += 1 : mmember.messages = 1;

        const { lvlcooldowns } = message.client;
        if (!lvlcooldowns.has(message.member.id)) {
            const gainedxp = getRandomXp(5, 15);
            mmember.level.xp ? mmember.level.xp += gainedxp : mmember.level.xp = gainedxp;
            if (mmember.level.xp >= mmember.level.lvl * 150) {
                mmember.level.xp -= mmember.level.lvl * 150;
                mmember.level.lvl ? mmember.level.lvl += 1 : mmember.level.lvl = 1;
                const lvlupcard = await new canvafy.LevelUp()
                    .setAvatar(message.member.user.displayAvatarURL())
                    .setBackground('image', 'https://img.freepik.com/free-vector/paper-style-gradient-blue-wavy-background_23-2149121741.jpg')
                    .setUsername(message.member.user.username)
                    .setBorder('#000000')
                    .setAvatarBorder('#ffffff')
                    .setOverlayOpacity(0.7)
                    .setLevels(mmember.level.lvl - 1, mmember.level.lvl)
                    .build();
                message.client.channels.cache.get('1124566636020633662').send({ content: `<a:peepoJAMMER:1133830488788840478> ${message.member} **LEVEL UP!!** <a:peepoJAMMER:1133830488788840478>`, files: [lvlupcard] });
            }

            const now = Date.now();
            lvlcooldowns.set(message.member.id, now);
            setTimeout(() => lvlcooldowns.delete(message.member.id), 60000);
        }
        fs.writeFileSync(`./memberdata.json`, JSON.stringify(memberdata));

        if (message.channelId === '1126081259546886174') {
            message.react('⬆️');
            message.react('⬇️');
        }

        if (message.author.id === ownerID) {
            if (message.content.startsWith('.eval')) {
                const args = message.content.split(" ").slice(1);

                try {
                    const evaled = eval(args.join(' '));
                    const cleaned = await clean(message.client, evaled);
                    message.reply(`\`\`\`js\n${cleaned}\n\`\`\``);
                } catch (err) {
                    message.reply(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
                }
            }
        }
    }
}

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const clean = async (client, text) => {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    text = text.replaceAll(client.token, "[REDACTED]");
    return text;
}