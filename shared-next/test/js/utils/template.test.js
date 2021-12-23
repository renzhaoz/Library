describe('utils js <template> test', () => {
  beforeEach(done => {
    require('../../../js/utils/common/template');
    console.error = jest.fn();
    done();
  });

//  Template test
  test('Template should be function', done => {
    expect(typeof Template).toBe('function');
    done();
  });

// Escape test
  test(' escape should be function', done => {
    expect(typeof Template.escape).toBe('function');
    done();
  });

// Escape return value test
  test(' extract return value test', done => {
    const value1 = Template.escape(1);
    expect(value1).toBe('');
    const value2 = Template.escape('<div>');
    expect(value2).toBe('&lt;div&gt;');
    done();
  });

// Extract & extractNode test
  test('extract & extractNode test', done => {
    const h1 = document.createElement('h1');
    document.body.appendChild(h1);
    h1.id = 'title';
    const titleTemplate = new Template('title');
    const value1 = titleTemplate.toString();
    expect(console.error.mock.calls.length).toBe(1);
    expect(value1).toBe('');
    done();
  });

  test('extract & extractNode test', done => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.innerHTML = 'hello kitty is here!';
    div.appendChild(a);
    div.id = 'link';
    document.body.appendChild(div);
    const divTemplate = new Template(div);
    const value2 = divTemplate.toString();
    expect(value2).toBe('');
    done();
  });

// Prepare test
  test('prepare test', done => {
    const data = {
      class: ' content'
    };
    const ul = document.createElement('ul');
    ul.id = 'list';
    for (let i = 0; i < 3; i++) {
      const li = document.createElement('li');
      li.innerHTML = i;
      ul.appendChild(li);
    }
    document.body.appendChild(ul);
    const listTemplate = new Template('list');
    listTemplate.interpolate(data);
    const value = listTemplate.prepare(data);
    expect(typeof value).toBe('object');
    done();
  });
});
