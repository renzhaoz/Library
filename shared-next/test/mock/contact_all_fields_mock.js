/* exported MockContactAllFields */

// eslint-disable-next-line no-unused-vars
function MockContactAllFields(withoutPhoto) {
  // eslint-disable-next-line init-declarations
  let photo;
  if (!withoutPhoto) {
    photo = getPhotoBlob();
  }
  return {
    id: '1',
    updated: new Date(),
    additionalName: ['Green'],
    adr: [
      {
        type: ['home'],
        pref: true,
        countryName: 'Germany',
        locality: 'Chemnitz',
        region: 'Chemnitz',
        postalCode: '09034',
        streetAddress: 'Gotthardstrasse 22'
      }
    ],
    bday: new Date(0),
    email: [
      {
        type: ['personal'],
        value: 'test@test.com'
      },
      {
        type: ['work'],
        value: 'test@work.com',
        pref: true
      }
    ],
    honorificPrefix: ['Mr.'],
    familyName: ['Grillo'],
    givenName: ['Pepito'],
    nickname: ['PG'],
    jobTitle: ['Sr. Software Architect'],
    name: ['Pepito Grillo'],
    org: ['Test ORG'],
    tel: [
      {
        value: '+346578888888',
        type: ['mobile'],
        carrier: 'TEF',
        pref: true
      },
      {
        value: '+3120777777',
        type: ['Home'],
        carrier: 'KPN'
      }
    ],
    url: [
      {
        type: ['fb_profile_photo'],
        value: 'https://abcd1.jpg'
      }
    ],
    category: ['favorite'],
    note: ['Note 1'],
    photo: [photo]
  };
}

function getPhotoBlob() {
  const b64 =
    'R0lGODlhEAAQAMQfAKxoR8VkLxFw1feVPITSWv+eQv7Qo0Cc6OyIN/v7+3PLTSCZ' +
    'EFy17Wa6XuT1x2bGQ3nNUU6vRXPAa9mLXMTkwJZEHJt7LL5aJ/z8/O2KONx3L/ubP/r6+rtV' +
    'I////////yH5BAEAAB8ALAAAAAAQABAAAAWD4CeOZDlimOitnvlhXefFiyCs3NkZMe9QDMGi' +
    'k3t1BgZDIcZgHCCxHAyxKRQmnYOkoYgaNYMNr3JoEB6dDBGmyWxihwNBgVZz2Js3YB+JWNpr' +
    'HW15YgA2FxkaRB8JgoQxHQEbdiKNg4R5iYuVgpcZmkUjHDEapYqbJRyjkKouoqqhIyEAOw==';

  return b64toBlob(b64, 'image/gif');
}

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 1024;

  function charCodeFromCharacter(c) {
    return c.charCodeAt(0);
  }

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = Array.prototype.map.call(slice, charCodeFromCharacter);
    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

exports.MockContactAllFields = MockContactAllFields;
