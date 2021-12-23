const fakeCoords = {
  latitude: 37.388590,
  longitude: -122.061704,
  accuracy: 5.0
};

const fakePosition = {
  timestamp: 1404756850457,
  coords: fakeCoords
};

window.navigator.geolocation = {
  watchPosition: jest.fn((onsuccess, onerror) => {
    onsuccess(fakePosition);
  }),
  clearWatch: jest.fn(),
  getCurrentPosition: jest.fn((onsuccess, onerror) => {
    onsuccess(fakePosition);
  })
}
