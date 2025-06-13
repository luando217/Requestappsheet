require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);
});

client.login(DISCORD_BOT_TOKEN);

// ✅ Route webhook tối giản – chỉ gửi `content` đến `discord_id`
app.post("/webhook", async (req, res) => {
  const { discord_id, content } = req.body;

  if (!discord_id || !content) {
    return res.status(400).send("Thiếu discord_id hoặc content.");
  }

  try {
    const user = await client.users.fetch(discord_id);
    await user.send(content);
    console.log(`✅ Đã gửi DM tới ${discord_id}`);
    res.status(200).send("Đã gửi tin nhắn thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi gửi DM:", error);
    res.status(500).send("Không thể gửi tin nhắn.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
