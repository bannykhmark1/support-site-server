const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { sequelize, Message } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(bodyParser.json());
app.use(cors());

app.post('/api/message', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const newMessage = await Message.create({ userId, message, sender: 'user' });

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: `User ${userId}: ${message}`,
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.post('/api/reply', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const newMessage = await Message.create({ userId, message, sender: 'support' });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error saving support reply:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.get('/api/messages/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.findAll({ where: { userId } });
    res.status(200).send(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
