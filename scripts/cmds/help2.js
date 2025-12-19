module.exports = {
	config: {
		name: "help2",
		version: "5.0",
		author: "lonely",
		role: 0,
		category: "system",
		guide: {
			en: "help2"
		}
	},

	onStart: async function ({ message, api }) {
		const commands = global.GoatBot.commands;
		if (!commands)
			return message.reply("❌ Command system not ready.");

		// Send loading message
		const loading = await message.reply("⏳ Loading commands...");

		// Group commands by category
		const categories = {};
		for (const cmd of commands.values()) {
			let cat = (cmd.config.category || "Other").toUpperCase().trim();
			if (!categories[cat]) categories[cat] = [];
			categories[cat].push(cmd.config.name);
		}

		// Bot uptime
		const up = process.uptime();
		const uptime =
			`${Math.floor(up / 86400)}d ` +
			`${Math.floor(up / 3600) % 24}h ` +
			`${Math.floor(up / 60) % 60}m ` +
			`${Math.floor(up % 60)}s`;

		// Build final message
		let text = "✨ AVAILABLE COMMANDS ✨\n\n";
		for (const cat of Object.keys(categories).sort()) {
			const list = categories[cat].sort();
			text += `🔹 ${cat} (${list.length})\n`;
			text += `└ ${list.join(" • ")}\n\n`;
		}

		text +=
			"━━━━━━━━━━━━━━━━━━\n" +
			"🤖 BOT STATUS\n" +
			`⏱ Uptime: ${uptime}`;

		// REAL edit (as requested)
		await api.editMessage(text, loading.messageID);
	}
};