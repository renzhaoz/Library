describe('utils js <media_frame> test', () => {
  class VideoPlayer {
    constructor(container, autoHideProgressBar) {
      this.container = container;
      this.autoHideProgressBar = autoHideProgressBar;
    }

    hide() {
      this.container.style.opacity = 0;
    }

    setPlayerSize() {}

    load() {}

    show() {}
  }
  window.VideoPlayer = VideoPlayer;

  beforeEach(done => {
    require('../../mock/l10n_mock');
    require('../../mock/device_capability_manager_mock');
    require('../../../js/utils/media/downsample');
    require('../../../js/utils/media/media_frame');
    done();
  });

  // Test MediaFrame
  test('MediaFrame should be function', done => {
    expect(typeof MediaFrame).toBe('function');
    done();
  });

  // Test MediaFrame run ->includeVideo === false
  test('MediaFrame function', done => {
    const maxImageSize = 5 * 1024 * 1024;
    document.body.innerHTML = '<section id="frame" class="frame"></section>';
    const frame = document.getElementById('frame');
    const mediaFrame = new MediaFrame(frame, false, maxImageSize);
    expect(frame.classList.contains('media-frame-container')).toBe(true);
    done();
  });

  // Test MediaFrame run ->includeVideo === true
  test('MediaFrame function', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const img = document.getElementsByTagName('img')[0];

    mediaFrame.image.onload();
    expect(img.style.opacity).toBe('1');
    done();
  });

  // Test computeMaxImageDecodeSize
  test('test computeMaxImageDecodeSize', done => {
    const value1 = MediaFrame.computeMaxImageDecodeSize();
    const value2 = MediaFrame.computeMaxImageDecodeSize(29);
    const value3 = MediaFrame.computeMaxImageDecodeSize(270);
    const value4 = MediaFrame.computeMaxImageDecodeSize(986);
    const value5 = MediaFrame.computeMaxImageDecodeSize(2048);
    expect(value1).toBe(0);
    expect(value2).toBe(2 * 1024 * 1024);
    expect(value3).toBe(3 * 1024 * 1024);
    expect(value4).toBe(5 * 1024 * 1024);
    expect(value5).toBe(2 * 8 * 1024 * 1024);
    done();
  });

  // Test usePreview, setMinimumPreviewSize
  test('test usePreview, setMinimumPreviewSize', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const value1 = mediaFrame.usePreview();
    const value2 = mediaFrame.usePreview({});
    const value3 = mediaFrame.usePreview({ width: 10 });
    const value4 = mediaFrame.usePreview({ width: 10, height: 10 });
    const value5 = mediaFrame.usePreview({ width: 10, height: 10, start: 2 });
    const value6 = mediaFrame.usePreview(
      { width: 10, height: 10, start: 2, filename: 'test.jpg' },
      20,
      5
    );

    mediaFrame.setMinimumPreviewSize(2, 2);
    const value7 = mediaFrame.usePreview(
      { width: 10, height: 10, start: 2, filename: 'test.jpg' },
      5,
      5
    );
    expect(value1).toBe(false);
    expect(value2).toBe(false);
    expect(value3).toBe(false);
    expect(value4).toBe(false);
    expect(value5).toBe(true);
    expect(value6).toBe(false);
    expect(value7).toBe(true);
    done();
  });

  // Test gotPreview
  test('test gotPreview', done => {
    window.URL.createObjectURL = jest.fn(() => {
      return '../test.jpg';
    });

    const data = new Uint8Array([9, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
    const previewblob = new Blob(data, { type: 'image/jpg' });
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    mediaFrame.gotPreview(previewblob, 8, 8);

    expect(window.URL.createObjectURL).toBeCalledTimes(1);
    window.URL.createObjectURL.mockRestore();
    done();
  });

  // Test noPreview, computePreviewSampleSize
  test('test noPreview, computePreviewSampleSize', done => {
    const data = new Uint8Array([6, 2, 10, 0, 0, 0, 13]);
    const previewblob1 = new Blob(data, { type: 'image/gif' });
    const previewblob2 = new Blob(data, { type: 'image/jpeg' });
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    mediaFrame.noPreview(previewblob1, 2, 3);
    mediaFrame.noPreview(previewblob2, 392, 0.3);

    expect(mediaFrame.previewImageURL).toBe(null);
    expect(mediaFrame.displayingPreview).toBe(false);
    done();
  });

  // Test computeFullSampleSize, MediaFrame.maxImageDecodeSize === null
  test('test computeFullSampleSize', done => {
    const data = new Uint8Array([6, 2, 10, 0, 0, 0, 13]);
    const previewblob1 = new Blob(data, { type: 'image/gif' });
    const previewblob2 = new Blob(data, { type: 'image/jpeg' });
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true, 1000);
    const value1 = mediaFrame.computeFullSampleSize(previewblob1, 2, 2);
    const value2 = mediaFrame.computeFullSampleSize(previewblob2, 6, 8);

    expect(value1.areaScale).toBe(1);
    expect(value2.dimensionScale).toBe(1);
    done();
  });

  // Test computeFullSampleSize,MediaFrame.maxImageDecodeSize !== null
  test('test computeFullSampleSize', done => {
    MediaFrame.maxImageDecodeSize = 24;
    const data = new Uint8Array([6, 2, 10, 0, 0, 0, 13]);
    const previewblob = new Blob(data, { type: 'image/jpeg' });
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const value = mediaFrame.computeFullSampleSize(previewblob, 10, 10);

    expect(value.areaScale).toBe(0.14);
    done();
  });

  // Test _displayImage
  test('test _displayImage', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    mediaFrame.rotation = 180;
    mediaFrame._displayImage('blob:null/603d8-bccc-45b4', 10, 10, 'star.gif');
    const img = document.getElementsByTagName('img')[0];

    expect(img.classList.contains('displayframe')).toBe(true);
    done();
  });

  // Test localize
  test('test localize', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    // 1,this.displayingImage === false
    mediaFrame.displayingImage = false;
    mediaFrame.localize();

    // 2,this.displayingImage === true
    mediaFrame.displayingImage = true;
    mediaFrame.fullsizeWidth = 320;
    mediaFrame.fullsizeHeight = 568;
    mediaFrame.rotation = 270;
    // 2-1,timestamp !== undefined
    mediaFrame.imageblob = { lastModifiedDate: 1604391998 };
    mediaFrame.localize();
    const img = document.getElementsByTagName('img')[0];
    // 2-1,timestamp === undefined
    mediaFrame.imageblob = { lastModifiedDate: undefined };
    mediaFrame.localize();

    expect(img.hasAttribute('aria-label')).toBe(true);
    done();
  });

  // Test _switchToFullSizeImage
  test('test _switchToFullSizeImage', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    // 1,this.displayingImage === false , this.displayingPreview === true
    mediaFrame.displayingImage = false;
    mediaFrame._switchToFullSizeImage();
    expect(mediaFrame.displayingPreview).toBe(false);

    // 2,this.displayingImage === true , this.displayingPreview === true
    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = true;
    mediaFrame._switchToFullSizeImage();
    expect(mediaFrame.displayingPreview).toBe(false);
    done();
  });

  // Test _switchToPreviewImage
  test('test _switchToPreviewImage', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    // 1,this.displayingImage === true , this.displayingPreview === false,  this.previewImageURL=== null
    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = false;
    mediaFrame.previewImageURL = null;
    mediaFrame._switchToPreviewImage();
    expect(mediaFrame.displayingPreview).toBe(false);

    // 2,this.displayingImage === true, this.displayingPreview === false,  this.previewImageURL!== ''
    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = false;
    mediaFrame.previewImageURL = 'test.jpg';
    mediaFrame._switchToPreviewImage();
    expect(mediaFrame.displayingPreview).toBe(true);
    done();
  });

  // Test clear
  test('test clear', done => {
    window.URL.revokeObjectURL = jest.fn(() => {
      return '';
    });
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    mediaFrame.imageurl = 'test1.png';
    mediaFrame.previewurl = 'test2.png';
    mediaFrame.videourl = 'test.mp4';
    mediaFrame.posterurl = 'test.jpg';
    mediaFrame.video = {
      reset: jest.fn(),
      hide: jest.fn()
    };
    mediaFrame.clear();
    expect(window.URL.revokeObjectURL).toBeCalledTimes(4);

    mediaFrame.videourl = '';
    mediaFrame.posterurl = '';
    mediaFrame.clear();
    window.URL.revokeObjectURL.mockRestore();
    done();
  });

  // Test pan
  test('test pan', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    // 1,this.displayingImage === false
    mediaFrame.displayingImage = false;
    const value1 = mediaFrame.pan(0, 6);
    expect(value1).toBe(0);

    // 2,this.displayingImage === true
    mediaFrame.displayingImage = true;
    mediaFrame.viewportHeight = 568;
    mediaFrame.viewportWidth = 360;
    mediaFrame.fit = {
      height: 600,
      top: 20,
      width: 360
    };
    const value2 = mediaFrame.pan(2, 8);
    expect(value2).toBe(2);

    mediaFrame.viewportHeight = 560;
    mediaFrame.viewportWidth = 320;
    mediaFrame.fit = {
      height: 520,
      top: 20,
      width: 360,
      left: 0
    };
    const value3 = mediaFrame.pan(2, 8);
    expect(value3).toBe(2);

    mediaFrame.viewportHeight = 560;
    mediaFrame.viewportWidth = 320;
    mediaFrame.fit = {
      height: 520,
      top: 20,
      width: 360,
      left: -50
    };
    const value4 = mediaFrame.pan(2, 6);
    expect(value4).toBe(-8);
    done();
  });

  // Test zoom
  test('test zoom', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    // 1,this.displayingImage === false
    mediaFrame.displayingImage = false;
    mediaFrame.zoom();

    // 2,this.displayingImage === true, this.displayingPreview ===  false
    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = false;

    // 2-1,this.fit.width <= this.viewportWidth,this.fit.height <= this.viewportHeight
    mediaFrame.fit = {
      scale: 1,
      left: 10,
      top: 10,
      width: 180,
      height: 180
    };
    mediaFrame.viewportHeight = 200;
    mediaFrame.viewportWidth = 200;
    mediaFrame.itemWidth = 20;
    mediaFrame.itemHeight = 20;
    mediaFrame.zoom(2, 8, 8, 30);
    const img = document.querySelector('img');

    img.dispatchEvent(new CustomEvent('transitionend'));
    expect(img.style.transition).toBe('');

    // 2-2,this.fit.width >this.viewportWidth,this.fit.height > this.viewportHeight
    mediaFrame.fit = {
      scale: 0.5,
      baseScale: 1,
      left: 5,
      top: 5
    };
    mediaFrame.viewportHeight = 22;
    mediaFrame.viewportWidth = 22;
    mediaFrame.itemWidth = 36;
    mediaFrame.itemHeight = 36;
    mediaFrame.zoom(1, 5, 5);
    expect(mediaFrame.fit.left).toBe(0);
    expect(mediaFrame.fit.top).toBe(0);
    done();
  });

  // Test reset
  test('test reset', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const spy1 = jest
      .spyOn(mediaFrame, '_switchToPreviewImage')
      .mockImplementation(() => {});
    const spy2 = jest
      .spyOn(mediaFrame, 'computeFit')
      .mockImplementation(() => {});
    const spy3 = jest
      .spyOn(mediaFrame, 'setPosition')
      .mockImplementation(() => {});

    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = false;
    mediaFrame.previewImageURL = true;
    mediaFrame.reset();
    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(0);
    expect(spy3).toBeCalledTimes(0);

    mediaFrame.displayingImage = false;
    mediaFrame.displayingVideo = false;
    mediaFrame.reset();
    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledTimes(1);

    mediaFrame.displayingVideo = true;
    mediaFrame.reset();
    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(2);
    expect(spy3).toBeCalledTimes(2);
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    done();
  });

  // Test resize
  test('test resize', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const spy1 = jest
      .spyOn(mediaFrame, 'computeFit')
      .mockImplementation(() => {});
    const spy2 = jest.spyOn(mediaFrame, 'reset').mockImplementation(() => {});
    const spy3 = jest
      .spyOn(mediaFrame, 'setPosition')
      .mockImplementation(() => {});
    mediaFrame.resize();
    expect(spy1).toBeCalledTimes(0);
    expect(spy2).toBeCalledTimes(0);
    expect(spy3).toBeCalledTimes(0);

    mediaFrame.fit = {
      scale: 0.9,
      baseScale: 1
    };
    mediaFrame.resize();
    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledTimes(0);

    mediaFrame.fit = {
      scale: 1.2,
      baseScale: 1
    };
    mediaFrame.resize();
    expect(spy1).toBeCalledTimes(2);
    expect(spy2).toBeCalledTimes(1);
    expect(spy3).toBeCalledTimes(1);
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    done();
  });

  // Test zoomFrame
  test('test zoomFrame', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    // 1,this.displayingImage === false
    mediaFrame.displayingImage = false;
    mediaFrame.zoomFrame();

    // 2,this.displayingImage === true, this.displayingPreview ===  true
    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = true;
    mediaFrame.zoomFrame();

    // 3,this.displayingImage === true, this.displayingPreview ===  false
    mediaFrame.displayingImage = true;
    mediaFrame.displayingPreview = false;

    // 3-1,this.fit.width <= this.viewportWidth,this.fit.height <= this.viewportHeight
    mediaFrame.fit = {
      scale: 1,
      left: 10,
      top: 10,
      width: 180,
      height: 180
    };
    mediaFrame.viewportHeight = 200;
    mediaFrame.viewportWidth = 200;
    mediaFrame.itemWidth = 20;
    mediaFrame.itemHeight = 20;
    mediaFrame.zoomFrame(2, 8, 8, 30);
    const img = document.querySelector('img');

    img.dispatchEvent(new CustomEvent('transitionend'));
    expect(img.style.transition).toBe('');

    // 3-2,this.fit.width >this.viewportWidth,this.fit.height > this.viewportHeight
    mediaFrame.fit = {
      scale: 0.5,
      baseScale: 1,
      left: 5,
      top: 5
    };
    mediaFrame.viewportHeight = 22;
    mediaFrame.viewportWidth = 22;
    mediaFrame.itemWidth = 36;
    mediaFrame.itemHeight = 36;
    mediaFrame.zoomFrame(1, 5, 5);
    expect(mediaFrame.fit.left).toBe(-7);
    expect(mediaFrame.fit.top).toBe(-7);
    done();
  });

  // Test setPosition
  test('test setPosition', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    mediaFrame.fit = {
      scale: 1,
      left: 5,
      top: 5,
      width: 10,
      height: 10
    };
    mediaFrame.itemWidth = 20;
    mediaFrame.itemHeight = 20;
    mediaFrame.displayingImage = true;
    mediaFrame.mirrored = true;
    mediaFrame.rotation = 0;
    mediaFrame.setPosition();
    mediaFrame.rotation = 180;
    mediaFrame.setPosition();
    mediaFrame.rotation = 90;
    mediaFrame.setPosition();
    mediaFrame.rotation = 270;
    mediaFrame.setPosition();

    const img = document.querySelector('img');
    expect(img.hasAttribute('data-origin-scale')).toBe(true);
    expect(img.hasAttribute('data-scale-delta')).toBe(true);
    expect(img.hasAttribute('data-zoom-in')).toBe(true);
    expect(img.hasAttribute('data-zoom-out')).toBe(true);
    done();
  });

  // Test displayVideo
  test('test displayVideo', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const spy = jest.spyOn(mediaFrame, 'clear').mockImplementation(() => {});
    mediaFrame.displayVideo('videoblob', 'posterblob', 6, 6);
    mediaFrame.videoblob = { lastModifiedDate: 1604391998 };
    expect(spy).toBeCalledTimes(1);
    spy.mockRestore();
    done();
  });

  // Test displayImage
  test('test displayImage', done => {
    document.body.innerHTML = '<section id="frame"></section>';
    const mediaFrame = new MediaFrame('frame', true);
    const spy1 = jest.spyOn(mediaFrame, 'clear').mockImplementation(() => {});
    const spy2 = jest
      .spyOn(mediaFrame, 'localize')
      .mockImplementation(() => {});

    window.api.l10n.readyState = 'complete';
    mediaFrame.displayImage('blob', 10, 10);

    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);
    spy1.mockRestore();
    spy2.mockRestore();
    done();
  });
});
