module.exports.config = {
    name: "approve",
    version: "1.0.5",
    hasPermssion: 2,
    credits: "DungUwU mod by Nam | Fixed by loney",
    description: "Approve group chat",
    commandCategory: "Admin",
    cooldowns: 5
};

const fs = require("fs");
const path = require("path");

// ===== PATHS =====
const cacheDir = path.join(__dirname, "cache");
const approvedPath = path.join(cacheDir, "approvedThreads.json");
const pendingPath = path.join(cacheDir, "pendingThreads.json");

// ================= ON LOAD =================
module.exports.onLoad = () => {
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    if (!fs.existsSync(approvedPath)) {
        fs.writeFileSync(approvedPath, JSON.stringify([]));
    }

    if (!fs.existsSync(pendingPath)) {
        fs.writeFileSync(pendingPath, JSON.stringify([]));
    }
};

// ================= HANDLE REPLY =================
module.exports.handleReply = async ({ api, event, handleReply }) => {
    if (event.senderID !== handleReply.author) return;
    if (event.body !== "A") return;

    const approved = JSON.parse(fs.readFileSync(approvedPath));
    const pending = JSON.parse(fs.readFileSync(pendingPath));

    const idBox = handleReply.threadID;

    if (approved.includes(idBox)) {
        return api.sendMessage("❌ Group already approved.", event.threadID);
    }

    approved.push(idBox);
    fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));

    const index = pending.indexOf(idBox);
    if (index !== -1) {
        pending.splice(index, 1);
        fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
    }

    return api.sendMessage(`✅ Approved successfully:\n${idBox}`, event.threadID);
};

// ================= ON START (REQUIRED) =================
module.exports.onStart = async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    const approved = JSON.parse(fs.readFileSync(approvedPath));
    const pending = JSON.parse(fs.readFileSync(pendingPath));

    const idBox = args[0] || threadID;

    // ===== HELP =====
    if (args[0] === "help" || args[0] === "h") {
        return api.sendMessage(
`=====「 APPROVE 」=====
approve → approve current group
approve <id> → approve by ID
approve l → list approved
approve p → list pending
approve d <id> → remove approval`,
            threadID,
            messageID
        );
    }

    // ===== LIST APPROVED =====
    if (args[0] === "list" || args[0] === "l") {
        let msg = `=====「 APPROVED GROUPS: ${approved.length} 」 =====`;
        let i = 1;

        for (const id of approved) {
            msg += `\n${i++}. ${id}`;
        }
        return api.sendMessage(msg, threadID, messageID);
    }

    // ===== LIST PENDING =====
    if (args[0] === "pending" || args[0] === "p") {
        let msg = `=====「 PENDING GROUPS: ${pending.length} 」 =====`;
        let i = 1;

        for (const id of pending) {
            msg += `\n${i++}. ${id}`;
        }

        return api.sendMessage(msg + `\n\nReply "A" to approve`, threadID, (err, info) => {
            if (!pending[0]) return;
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "pending",
                threadID: pending[0]
            });
        });
    }

    // ===== DELETE =====
    if (args[0] === "del" || args[0] === "d") {
        const delID = args[1];
        if (!approved.includes(delID)) {
            return api.sendMessage("❌ Group is not approved.", threadID);
        }

        approved.splice(approved.indexOf(delID), 1);
        fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));

        return api.sendMessage(`✅ Approval removed:\n${delID}`, threadID);
    }

    // ===== APPROVE =====
    if (approved.includes(idBox)) {
        return api.sendMessage("⚠️ Group already approved.", threadID);
    }

    approved.push(idBox);
    fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));

    return api.sendMessage(`✅ Group approved successfully:\n${idBox}`, threadID);
};

// ================= COMPAT =================
module.exports.run = module.exports.onStart;