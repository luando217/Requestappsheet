require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ERROR_CHANNEL_ID = "<CHANNEL_ID_BAO_LOI>"; // 👉 Thay bằng channel ID báo lỗi của bạn

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);
});

client.login(DISCORD_BOT_TOKEN);

// ✅ Route webhook – chỉ gửi `content` đến `discord_id`
app.post("/webhook", async (req, res) => {
  const { discord_id, content } = req.body;

  // Kiểm tra đầu vào
  if (!discord_id || !content) {
    console.warn("⚠️ Thiếu discord_id hoặc content trong webhook.");
    // Vẫn trả về 200 để không kẹt
    return res.status(200).send("Thiếu discord_id hoặc content, đã bỏ qua.");
  }

  try {
    console.log(`🔎 Đang fetch user với ID: ${discord_id}`);
    const user = await client.users.fetch(discord_id, { force: true });
    await user.send(content);
    console.log(`✅ Đã gửi DM tới ${discord_id}`);
    return res.status(200).send("Đã gửi tin nhắn thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi gửi DM:", error.message);

    // Thử gửi lỗi vào channel báo lỗi
    try {
      if (ERROR_CHANNEL_ID) {
        const channel = await client.channels.fetch(ERROR_CHANNEL_ID);
        await channel.send(
          `⚠️ **Lỗi gửi DM** tới <@${discord_id}>\nChi tiết: \`${error.message}\`\nNội dung: ${content}`
        );
        console.log(`✅ Đã báo lỗi vào channel ${ERROR_CHANNEL_ID}`);
      } else {
        console.warn("⚠️ Không cấu hình ERROR_CHANNEL_ID, bỏ qua báo lỗi.");
      }
    } catch (chanErr) {
      console.error("❌ Lỗi khi gửi báo lỗi vào channel:", chanErr.message);
    }

    // Dù lỗi gì cũng trả về 200 để không treo AppSheet
    return res.status(200).send("Gửi DM thất bại, đã báo lỗi (nếu có).");
  }
});

// ✅ Route GET để kiểm tra bot
app.get("/", (req, res) => {
  res.send("🤖 Bot Discord đang chạy ngon lành!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
