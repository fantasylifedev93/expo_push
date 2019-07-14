var express = require('express');
var cors = require('cors')
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());

var Expo = require('expo-server-sdk');
let expo = new Expo.Expo();

// Create application/x-www-form-urlencoded parser
app.post('/devices', function (req, res) {
  const body = req.body;
  // Create the messages that you want to send to clents
  let messages = [];
  
  const pushToken = body.pushToken;
  console.log('pushToken', pushToken);

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
  }

  // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
  messages.push({
    to: pushToken,
    sound: 'default',
    body: 'This is a test notification',
    data: { withSome: 'data' },
  });

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
  res.end(JSON.stringify({status: 'OK'}));
})


app.listen(process.env.PORT || 8080);