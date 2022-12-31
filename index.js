require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
let isLogged = false;
let api;
app.use(bodyParser.urlencoded({limit: '80mb', extended: true})); 
app.use(bodyParser.json({limit: '80mb'})); 
app.use(bodyParser.raw({type: 'application/octet-stream'}))

const initChatgpt = async() => {
  try {
    const { ChatGPTAPIBrowser, getOpenAIAuth } = await import('chatgpt');
    api = new ChatGPTAPIBrowser({ 
      email: process.env.OPENAI_EMAIL,
      password: process.env.OPENAI_PASSWORD,
      isGoogleLogin: process.env.isGoogleLogin,
      debug: false,
      minimize: true
    });
    
    await api.initSession();
    isLogged = true;
    console.log('GPTChat init');
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
}

const sendMessage = async(msg) => {
  // send a message and wait for the response
  const response = await api.sendMessage(msg);
  // response is a markdown-formatted string
  return response;
}

initChatgpt();

app.post('/chat', async (req, res) => {
  try {
    const { msg } = req.body;
    if (!msg) return res.send('Message is necessary!');
    const response = await sendMessage(msg);
    return res.send({
      status: 'success',
      data: response
    });
  } catch (err) {
    res.send({
      status: 'error',
      error: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});