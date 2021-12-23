/* eslint-disable no-undef, global-require */
describe('helper js <contact_photo_helper> test', () => {
  const contactAllFields = require('../../mock/contact_all_fields_mock');
  const { MockContactAllFields } = contactAllFields;

  beforeAll(done => {
    require('../../../js/helper/contact/contact_photo_helper');
    done();
  });

  // ContactPhotoHelper test
  test('ContactPhotoHelper should be object', done => {
    expect(typeof window.ContactPhotoHelper).toBe('object');
    done();
  });

  // GetThumbnail test
  test('getThumbnail should be function', done => {
    expect(typeof window.ContactPhotoHelper.getThumbnail).toBe('function');
    done();
  });

  // GetThumbnail return value1 test
  test('getThumbnail should return photo object', done => {
    const photo = window.ContactPhotoHelper.getThumbnail({});
    expect(typeof photo).toBe('object');
    done();
  });

  // GetThumbnail return value2 test
  test('1 getThumbnail should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    const photo = window.ContactPhotoHelper.getThumbnail(contact);
    expect(photo instanceof Blob).toBe(true);
    done();
  });

  // GetThumbnail return value3 test
  test('2 getThumbnail should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    contact.photo.push(contact.photo[0]);
    const photo = window.ContactPhotoHelper.getThumbnail(contact);
    expect(photo instanceof Blob).toBe(true);
    done();
  });

  // GetThumbnail return value4 test
  test('3 getThumbnail should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    contact.photo.push(contact.photo[0]);
    contact.category.push('fb_linked');
    const photo = window.ContactPhotoHelper.getThumbnail(contact);
    expect(photo instanceof Blob).toBe(true);
    done();
  });

  // GetThumbnail return value5 test
  test('4 getThumbnail should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.category.push('fb_linked');
    const photo = window.ContactPhotoHelper.getThumbnail(contact);
    expect(photo instanceof Blob).toBe(true);
    done();
  });

  // GetThumbnail return value6 test
  test('5 getThumbnail should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    contact.photo.push('data:image/png;base64,aGVsbG8gd29ybGQ=');
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
    );
    const photo = window.ContactPhotoHelper.getThumbnail(contact);
    expect(typeof photo).toBe('string');
    done();
  });

  // GetFullResolution test
  test('getFullResolution should be function', done => {
    expect(typeof window.ContactPhotoHelper.getFullResolution).toBe('function');
    done();
  });

  // GetFullResolution return value1 test
  test('1 getFullResolution should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.photo.push(contact.photo[0]);
    contact.category.push('fb_linked');
    const photo = window.ContactPhotoHelper.getFullResolution(contact);
    expect(photo instanceof Blob).toBe(true);
    done();
  });

  // GetFullResolution return value2 test
  test('2 getFullResolution should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    contact.photo.push(contact.photo[0]);
    const photo = window.ContactPhotoHelper.getFullResolution(contact);
    expect(photo instanceof Blob).toBe(true);
    done();
  });

  // GetPhotoHeader test
  test('getPhotoHeader should be function', done => {
    expect(typeof window.ContactPhotoHelper.getPhotoHeader).toBe('function');
    done();
  });

  // GetFullResolution return value1 test
  test('1 getPhotoHeader should return photo object', done => {
    // eslint-disable-next-line no-empty-function
    const spy = jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    const photoview = window.ContactPhotoHelper.getPhotoHeader(
      contact,
      contact.name
    );
    expect(spy.mock.calls.length).toBe(1);
    expect(typeof photoview).toBe('object');
    spy.mockRestore();
    done();
  });

  // GetFullResolution return value2 test
  test('2 getPhotoHeader should return photo object', done => {
    // eslint-disable-next-line new-cap
    const contact = MockContactAllFields(false);
    window.URL.createObjectURL = jest.fn(() => {
      return '../test.png';
    });
    const photoview = window.ContactPhotoHelper.getPhotoHeader(
      contact,
      contact.name
    );
    expect(photoview.hasAttribute('style')).toBeTruthy();
    window.URL.createObjectURL.mockReset();
    done();
  });

  // GetFullResolution return value3 test
  test('getPhotoHeader should return default photo object', done => {
    const photoview = window.ContactPhotoHelper.getPhotoHeader({}, '');
    expect(photoview.tagName).toBe('SPAN');
    expect(photoview.classList.contains('defaultPicture')).toBeTruthy();
    expect(photoview.classList.contains('contactHeaderImage')).toBeTruthy();
    expect(photoview.hasAttribute('style')).toBeTruthy();
    expect(photoview.dataset.group).not.toBeUndefined();
    expect(photoview.dataset.group).not.toBeNull();
    expect(
      photoview.getAttribute('style').includes('background-position')
    ).toBeTruthy();
    done();
  });
});
