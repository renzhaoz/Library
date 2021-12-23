describe('utils js <lazyloader> test', () => {
  const oldXMLHttpRequest = window.XMLHttpRequest;
  let mockXHR = null;
  const file = './../../resources/languages.json';
  beforeEach(done => {
    const { createMockXHR } = require('../../mock/xhr_mock');
    mockXHR = createMockXHR();
    window.XMLHttpRequest = jest.fn(() => mockXHR);
    require('../../../js/utils/common/lazy_loader');
    done();
  });

// LazyLoader test
  test('LazyLoader test', done => {
    expect(typeof LazyLoader.load).toBe('function');
    expect(typeof LazyLoader._js).toBe('function');
    expect(typeof LazyLoader._css).toBe('function');
    expect(typeof LazyLoader._html).toBe('function');
    expect(typeof LazyLoader.getJSON).toBe('function');
    done();
  });

// Load return value test
  test('load return value test', done => {
    const callback = () => {
    };
    const ul = document.createElement('ul');
    ul.id = 'list';
    for (let i = 0; i < 3; i++) {
      const li = document.createElement('li');
      li.innerHTML = i;
      ul.appendChild(li);
    }
    const value = LazyLoader.load(
      ['/path/to/file.js', '/path/to/file.css', ul],
      callback
    );
    expect(typeof value).toBe('object');
    done();
  });

// GetJSON return value test -- onload (response !== null)
  test('getJSON return value test', done => {
    const value = LazyLoader.getJSON(file);
    mockXHR.response = file;
    mockXHR.status = 200;
    mockXHR.onreadystatechange();
    mockXHR.onload();
    value.then(res => {
      expect(res).toEqual(file);
      done();
    });
  });

// GetJSON return value test --onload(response == null)
  test('getJSON return value test', done => {
    const value = LazyLoader.getJSON(file);
    mockXHR.response = null;
    mockXHR.status = 200;
    mockXHR.onreadystatechange();
    mockXHR.onload();
    value.catch(res => {
      expect(res.message).toBe('No valid JSON object was found (200 )');
      done();
    });
  });

// GetJSON return value test --onerror
  test('getJSON return value test', done => {
    const value = LazyLoader.getJSON(file);
    mockXHR.response = null;
    mockXHR.status = 200;
    mockXHR.onreadystatechange();
    mockXHR.onerror();
    value.catch(e => {
      expect(e).toBeUndefined();
      done();
    });
  });

  afterEach(() => {
    window.XMLHttpRequest = oldXMLHttpRequest;
  });
});
