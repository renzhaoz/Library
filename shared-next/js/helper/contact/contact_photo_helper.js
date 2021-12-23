/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* Vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
(function contactPhotoHelper(exports) {
  function getThumbnail(contact) {
    return getOnePhoto(contact, 'begin');
  }

  function getFullResolution(contact) {
    return getOnePhoto(contact, 'end');
  }

  function getOnePhoto(contact, position) {
    if (!contact || !contact.photo || !contact.photo.length) {
      return null;
    }

    if (contact.photo.length === 1) {
      return contact.photo[0];
    }

    /*
     * For FB Linked contacts we need to give preference to the local photo
     * [0] is the full resolution photo and [1] is the thumbnail
     */
    let photos = contact.photo;
    const { category } = contact;
    if (Array.isArray(category) && category.indexOf('fb_linked') !== -1) {
      // Check whether we have a new linked contact or a legacy contact
      if (photos.length >= 4) {
        return photos[position === 'begin' ? 1 : 0];
      }

      /*
       * In the case of a legacy contact we always return full resolution
       * in order to ensure we are always giving preference to local photo
       */
      return photos[0];
    }

    photos = photosBySize(contact);
    const index = position === 'begin' ? 0 : photos.length - 1;
    return photos[index];
  }

  function photosBySize(contact) {
    const photos = contact.photo.slice(0);
    photos.sort((p1, p2) => {
      if (size(p1) < size(p2)) {
        return -1;
      }
      if (size(p1) > size(p2)) {
        return 1;
      }
      return 0;
    });

    return photos;
  }

  // For legacy purpose we support data URLs and blobs
  function size(photo) {
    if (typeof photo === 'string') {
      return photo.length; // Length of the data URL
    }

    return photo.size; // Size of the blob in bytes
  }

  function getPhotoHeader(contact, contactName) {
    if (contact && contact.photo && contact.photo.length) {
      const contactImage = getThumbnail(contact);
      return getPhotoHeaderByImg(contactImage);
    }
    return getDefaultImage(contact, contactName);
  }

  // eslint-disable-next-line no-unused-vars
  function getFirstLetter(contact, contactName) {
    // Temporarily return an empty
    return '';
  }

  function getDefaultImage(contact, contactName) {
    const pictureContainer = document.createElement('span');
    pictureContainer.classList.add('defaultPicture');
    pictureContainer.classList.add('contactHeaderImage');
    pictureContainer.setAttribute('style', '');
    const posVertical = ['top', 'center', 'bottom'];
    const posHorizontal = ['left', 'center', 'right'];
    const position = `${
      posHorizontal[Math.floor(Math.random() * posHorizontal.length)]
    } ${posVertical[Math.floor(Math.random() * posVertical.length)]}`;
    pictureContainer.dataset.group = getFirstLetter(contact, contactName);
    pictureContainer.style.backgroundPosition = position;
    return pictureContainer;
  }

  function getPhotoHeaderByImg(contactImage) {
    const photoView = document.createElement('span');
    photoView.classList.add('contactHeaderImage');
    try {
      photoView.dataset.src = window.URL.createObjectURL(contactImage);
      photoView.setAttribute(
        'style',
        `background-image:url(${photoView.dataset.src})`
      );
      return photoView;
    } catch (err) {
      console.warn(
        `Failed to create contact picture : ${contactImage}, error: ${err}`
      );
    }
    return null;
  }

  exports.ContactPhotoHelper = {
    getThumbnail,
    getFullResolution,
    getPhotoHeader
  };
})(window);
