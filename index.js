
const express = require('express');
const bodyParser = require('body-parser');
const Imap = require('node-imap');
const simpleParser = require('mailparser').simpleParser;
const cors = require("cors")
const app = express();
const port = 5000;
const dotenv = require('dotenv')

dotenv.config()
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
// IMAP configuration
const imapConfig = {
  user: process.env.EMAIL,
  password:process.env.PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
};

// Route for retrieving emails
app.get('/emails', (req, res) => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) {
        return res.status(500).json({ error: 'Error opening mailbox' });
      }

      const emails = [];

      imap.search(['ALL'], (searchErr, results) => {
        if (searchErr) {
          return res.status(500).json({ error: 'Error searching for emails' });
        }

        const fetch = imap.fetch(results, { bodies: '' });

        fetch.on('message', (msg, seqno) => {
          const email = { id: seqno };

          msg.on('body', (stream, info) => {
            simpleParser(stream, (parseErr, parsed) => {
              if (parseErr) {
                return res.status(500).json({ error: 'Error parsing email' });
              }

              email.from = parsed.from.text;
              email.to = parsed.to.text;
              email.subject = parsed.subject;
              email.date = parsed.date;
              email.text = parsed.text;

              emails.push(email);
            });
          });

          msg.once('end', () => {
            // Handle any additional processing after fetching an email
          });
        });

        fetch.once('error', (err) => {
          res.status(500).json({ error: 'Error fetching emails' });
        });

        fetch.once('end', () => {
          imap.end();
          res.json(emails);
        });
      });
    });
  });

  imap.once('error', (err) => {
    res.status(500).json({ error: 'Error connecting to IMAP server' });
  });

  imap.connect();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});