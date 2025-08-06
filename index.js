const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const TEAMS_WEBHOOK_URL = 'https://aragoconsulting2.webhook.office.com/webhookb2/69df23cf-1a00-46ea-afaf-100865c005d7@b76fac04-4e12-4eb5-b25f-2cca0df5ecd8/IncomingWebhook/5beb3fe2ce5c4ff8846abe9977c7c73b/ce410543-969b-4963-831b-863fe9ade61a/V2vaW2o-OQff7rNNLeF5CwZo7jwTWVkqNNi6ZYA6V_IoU1';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('Eso esta más melo que 10');
});

const userMentions = {
  'AlejandroGonzalez0': {
    id: '8:orgid:213cd637-c450-4050-a0c4-23121bf9d5ca',
    name: 'Alejandro Gonzales'
  },
  'cwongArago':{
    id: '8:orgid:4e406981-0cd4-4b5c-855a-c6c5f9d91147',
    name: 'Cristian Wong'
  },
  'user738068789':{
    id: '8:orgid:2f55e909-1a40-4d4a-bff6-4aa1f2d19ed0',
    name: 'Lucas Bohorquez'
  },
  'JoseDanielCruz' :{
    id: '8:orgid:36b8ff02-46f0-4fc1-adc8-27363ec2ed2c',
    name: 'Jose Cruz'
  },
  'joordonezoArago':{
    id: '8:orgid:9274d032-8f2f-4885-baf3-4e54bbf2c778',
    name: 'Jorge Ordoñez' 
  },
  'paola-sq':{
    id: '8:orgid:350e8f3e-4e93-4ee9-a115-1383197455ff',
    name: 'Paola Sanchez'
  },
  'AGarzonArago':{
    id: '8:orgid:f76f9084-40b6-4281-8f36-5b9ffd910ff7',
    name: 'Andres Garzon'
  },
  'JohnPosada-arago':{
    id: '8:orgid:c3f558e6-2fbe-4242-9a56-15f9294a127f',
    name: 'John Posada'
  },
  'MarcoContreras2323':{
    id: '8:orgid:ce410543-969b-4963-831b-863fe9ade61a',
    name: 'Marco Contreras'
  }

};

app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'];
  const action = req.body.action;

  if (event === 'pull_request' && action === 'review_requested') {
    const pr = req.body.pull_request;
    const reviewer = req.body.requested_reviewer?.login || 'alguien';
    const sender = req.body.sender.login;
    const mentionData = userMentions[reviewer];

    const message = {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.4",
          "body": [
            {
              "type": "TextBlock",
              "text": mentionData
                ? `🔔 <at>${mentionData.name}</at> fue asignado como revisor.`
                : `🔔 ${reviewer} fue asignado como revisor.`,
              "wrap": true
            },
            {
              "type": "TextBlock",
              "text": `[${pr.title}](${pr.html_url}) por ${sender}`,
              "wrap": true
            }
          ],
          "msteams": {
            "entities": mentionData
              ? [{
                  type: "mention",
                  text: `<at>${mentionData.name}</at>`,
                  mentioned: {
                    id: mentionData.id,
                    name: mentionData.name
                  }
                }]
              : []
          }
        }
      }]
    };

    try {
      await axios.post(TEAMS_WEBHOOK_URL, message);
      res.status(200).send('Notificación enviada a Teams');
    } catch (error) {
      console.error('Error al enviar a Teams:', error.message);
      res.status(500).send('Error al enviar a Teams');
    }
  } else {
    res.status(200).send('Evento no relevante');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
