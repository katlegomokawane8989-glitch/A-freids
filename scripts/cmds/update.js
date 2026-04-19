const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;

const dirBootLogTemp = `${__dirname}/tmp/rebootUpdated.txt`;

module.exports = {
  config: {
    name: "update",
    version: "2.0",
    author: "lonely",
    role: 2,
    description: {
      en: "Check bot version and update"
    },
    category: "owner",
    guide: {
      en: "update → show version\nupdate check → check update"
    }
  },

  onLoad: async function ({ api }) {
    if (fs.existsSync(dirBootLogTemp)) {
      const threadID = fs.readFileSync(dirBootLogTemp, "utf-8");
      fs.removeSync(dirBootLogTemp);
      api.sendMessage("🔄 Bot restarted successfully.", threadID);
    }
  },

  onStart: async function ({ message, event }) {
    const currentVersion = require("../../package.json").version;
    const args = event.body.split(" ");

    // 👉 SHOW VERSION ONLY
    if (args.length === 1) {
      return message.reply(`🤖 Bot Version: v${currentVersion}`);
    }

    // 👉 CHECK FOR UPDATE
    if (args[1] === "check") {
      try {
        const { data: { version } } = await axios.get(
          "https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json"
        );

        if (compareVersion(version, currentVersion) <= 0) {
          return message.reply(
            `✅ You are using the latest version.\n🤖 Version: v${currentVersion}`
          );
        }

        return message.reply(
          `⚠️ New version available!\n\n📌 Current: v${currentVersion}\n🚀 Latest: v${version}\n\nReply "yes" to update.`
        ).then(info => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            authorID: event.senderID
          });
        });

      } catch (err) {
        return message.reply("❌ Failed to check update.");
      }
    }
  },

  onReply: async function ({ event, message }) {
    if (event.body.toLowerCase() !== "yes") return;

    try {
      message.reply("🚀 Updating bot...");

      execSync("node update", { stdio: "inherit" });

      fs.writeFileSync(dirBootLogTemp, event.threadID);

      message.reply("✅ Update done. Restarting...");
      process.exit(2);

    } catch (err) {
      message.reply("❌ Update failed.");
    }
  }
};

function compareVersion(v1, v2) {
  const a = v1.split(".");
  const b = v2.split(".");

  for (let i = 0; i < 3; i++) {
    const num1 = parseInt(a[i]) || 0;
    const num2 = parseInt(b[i]) || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}