const express = require('express');
const cors = require("cors");

const authRoute = require('./routes/auth.js');

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const messagingServiceSid = process.env.MESSAGEING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken)

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.post('/', (req, res) => {
    const { message, user: sender, type, members } = req.body;

    if(type === 'message.new') {
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if(!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    })
                        .then(() => console.log('Message sent!'))
                        .catch((err) => console.log(err));
                }
            })

            return res.status(200).send('Message sent!');
    }

    return res.status(200).send('Not a new message request');
});


app.get('/', (req, res) => {
    res.send('Hello, World')
});

app.use('/auth', authRoute);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))