const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const TEAMS_WEBHOOK_URL = 'https://aragoconsulting2.webhook.office.com/webhookb2/69df23cf-1a00-46ea-afaf-100865c005d7@b76fac04-4e12-4eb5-b25f-2cca0df5ecd8/IncomingWebhook/5beb3fe2ce5c4ff8846abe9977c7c73b/ce410543-969b-4963-831b-863fe9ade61a/V2vaW2o-OQff7rNNLeF5CwZo7jwTWVkqNNi6ZYA6V_IoU1';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('Eso esta más melo que 10');
});

app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'];
  const action = req.body.action;

  if (event === 'pull_request' && action === 'review_requested') {
    const pr = req.body.pull_request;
    const reviewer = req.body.requested_reviewer?.login || 'alguien';
    const sender = req.body.sender.login;

    const message = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "summary": `Nueva solicitud de revisión`,
      "themeColor": "0076D7",
      "sections": [{
        "activityTitle": `🔍 ${reviewer} fue asignado como **revisor**`,
        "activitySubtitle": `en el PR: [${pr.title}](${pr.html_url})`,
        "facts": [
          { "name": "Autor:", "value": pr.user.login },
          { "name": "Asignado por:", "value": sender }
        ],
        "markdown": true
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
