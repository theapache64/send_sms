import * as fs from 'fs';
import { default as fetch } from 'node-fetch';
import * as readline from 'readline';

import { Contact } from './models/Contact';
import { FormData } from './utils/FormData';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const contacts: Contact[] = JSON.parse(fs.readFileSync(`${__dirname}/../contacts.json`, 'utf-8'));

rl.question('To : ', (nameOrMobile: any) => {

  // If it's name , check contacts and get number
  if (isNaN(nameOrMobile)) {
    // It's a name so check contacts
    const searchResult = contacts.filter((contact) => {
      return contact.name.indexOf(nameOrMobile) !== -1;
    });

    if (searchResult.length > 0) {
      if (searchResult.length > 1) {
        //  Has multiple suggestion
        askSug(searchResult, 0);
      } else {
        console.log(`To : ${searchResult[0].name} (${searchResult[0].mobile}}`);
        sendTo(searchResult[0].mobile);
      }
    } else {
      endWith('Unknown contact ' + nameOrMobile);
    }
  } else {

    sendTo(nameOrMobile);

  }

});

function sendTo(mobile: string) {

  if (mobile.toString().length === 10) {

    const recipients = [mobile];

    rl.question('Message : ', (message: string) => {

      const formData = new FormData({
        message,
        recipients: JSON.stringify(recipients)
      }).getFormBody();

      fetch('http://theapache64.com/sg/v1/send_sms', {
        method: 'POST',
        headers: {
          Authorization: 'testApiKey',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }).then(resp => resp.json())
        .then((json) => {
          endWith(json.message);
        }).catch((error) => {
          endWith('ERROR: ' + error);
        });
    });
  } else {
    endWith('It was an invalid Indian mobile number');
  }
}

function askSug(searchResult: Contact[], index: number) {
  const contact = searchResult[index];
  rl.question(`Do you mean ${contact.name} (${contact.mobile}) ? y / n :`, (answer) => {

    if (answer.toLowerCase().indexOf('y') === 0 || answer.length === 0) {
      // Yes
      sendTo(contact.mobile);
    } else {
      // No
      if (index < (searchResult.length - 1)) {
        askSug(searchResult, index + 1);
      } else {
        endWith('No match found');
      }
    }
  });
}

function endWith(msg: string) {
  console.log(msg);
  rl.close();
}
