/* global getImageSize, Downsample, DeviceCapabilityManager,
  SettingsObserver, LazyLoader, getStorageIfAvailable
*/

(function (exports) { // eslint-disable-line
  const WallpaperProcessor = {
    LOW_MEMORY_VALUE: 256,
    MAX_IMAGE_PIXEL_SIZE: 5 * 1024 * 1024,
    LOW_MAX_IMAGE_PIXEL_SIZE: 5 * 1024 * 1024,
    LOW_MAX_IMAGE_PIXEL_SIZE_NO_JPEG: 1431136,
    MAX_UNKNOWN_IMAGE_SIZE: 0.5 * 1024 * 1024,
    MIN_UNKNOWN_IMAGE_SIZE: 32,
    WALLPAPER_IMAGE_PATCH: '/sdcard/.wallpaper/custom_wallpaper.jpg',
    WALLPAPER_SETTINGS_KEY: 'wallpaper.image',
    HARDWARE_MEMORY_KEY: 'hardware.memory',
    SCREEN_WIDTH: window.innerWidth * window.devicePixelRatio,
    SCREEN_HEIGHT: window.innerHeight * window.devicePixelRatio,

    lowMemory: null,
    storageType: {
      external: 'sdcard1',
      internal: 'sdcard'
    },
    errorMessages: {
      corruptImage: 'image-invalid',
      tooLargeImage: 'image-too-big',
      notEnoughStorage: 'not-enough-storage'
    },
    offscreenImage: null,
    offscreenImageURL: null,

    getDeviceStorageByFileName(fileName) {
      const filePathArr = fileName.split('/');
      const [, storageName] = filePathArr;
      const storages = navigator.b2g.getDeviceStorages(
        this.storageType.internal
      );
      for (let i = 0; i < storages.length; i++) {
        if (storages[i].storageName === storageName) {
          return storages[i];
        }
      }
      return null;
    },

    getFileBlob(fileName) {
      return new Promise((resolve, reject) => {
        const storage = this.getDeviceStorageByFileName(fileName);
        if (!storage) {
          reject(this.errorMessages.corruptImage);
        }
        const getRequest = storage.get(fileName);
        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };
        getRequest.onerror = () => {
          reject(this.errorMessages.corruptImage);
        };
      });
    },

    saveBlob(blob) {
      return new Promise((resolve, reject) => {
        const storage = navigator.b2g.getDeviceStorage(
          this.storageType.internal
        );
        const deleteReq = storage.delete(this.WALLPAPER_IMAGE_PATCH);
        const save = () => {
          getStorageIfAvailable(
            this.storageType.internal,
            blob.size,
            () => {
              const saveRequest = storage.addNamed(
                blob,
                this.WALLPAPER_IMAGE_PATCH
              );
              saveRequest.onsuccess = () => {
                resolve(saveRequest.result.name);
              };
              saveRequest.onerror = () => {
                reject(this.errorMessages.corruptImage);
              };
            },
            () => reject(this.errorMessages.notEnoughStorage)
          );
        };
        deleteReq.onsuccess = save;
        deleteReq.onerror = save;
      });
    },

    cropBlob(blob, sampleSize) {
      return new Promise((resolve, reject) => {
        this.offscreenImageURL = URL.createObjectURL(blob);
        this.offscreenImage = new Image();
        this.offscreenImage.onerror = () => {
          this.cleanupImage();
          reject(this.errorMessages.corruptImage);
        };
        this.offscreenImage.onload = () => {
          const actualWidth = this.offscreenImage.width;
          const actualHeight = this.offscreenImage.height;
          const widthScale = this.SCREEN_WIDTH / actualWidth;
          const heightScale = this.SCREEN_HEIGHT / actualHeight;
          const imageScale = Math.max(widthScale, heightScale);
          const cropWidth = Math.round(this.SCREEN_WIDTH / imageScale);
          const cropHeight = Math.round(this.SCREEN_HEIGHT / imageScale);
          const cropLeft = Math.floor((actualWidth - cropWidth) / 2);
          const cropTop = Math.floor((actualHeight - cropHeight) / 2);
          const cvs = document.createElement('canvas');
          cvs.width = this.SCREEN_WIDTH;
          cvs.height = this.SCREEN_HEIGHT;
          const context = cvs.getContext('2d');
          context.drawImage(
            this.offscreenImage,
            cropLeft,
            cropTop,
            cropWidth,
            cropHeight,
            0,
            0,
            this.SCREEN_WIDTH,
            this.SCREEN_HEIGHT
          );
          cvs.toBlob(newBlob => {
            this.cleanupImage();
            resolve(newBlob);
          }, 'image/jpeg');
        };
        this.offscreenImage.src = sampleSize
          ? this.offscreenImageURL + sampleSize
          : this.offscreenImageURL;
      });
    },

    getDownResolutionBlob(blob) {
      return new Promise((resolve, reject) => {
        getImageSize(
          blob,
          metadata => {
            const imageSize = metadata.width * metadata.height;
            let maxImageSize = this.lowMemory
              ? this.LOW_MAX_IMAGE_PIXEL_SIZE
              : this.MAX_IMAGE_PIXEL_SIZE;
            if (metadata.type !== 'jpeg' && this.lowMemory) {
              maxImageSize = this.LOW_MAX_IMAGE_PIXEL_SIZE_NO_JPEG;
            }
            if (imageSize > maxImageSize || blob.size > 2 * maxImageSize) {
              reject(this.errorMessages.tooLargeImage);
            } else {
              const sampleSize = Downsample.areaNoMoreThan(
                (this.SCREEN_WIDTH * this.SCREEN_HEIGHT) / imageSize
              );
              this.cropBlob(blob, sampleSize)
                .then(newBlob => resolve(newBlob))
                .catch(e => reject(e));
            }
          },
          errorMessage => {
            console.warn(
              `wallpaper_processor: getImageSize error: ${errorMessage}.`
            );
            if (
              blob.size > this.MAX_UNKNOWN_IMAGE_SIZE ||
              blob.size < this.MIN_UNKNOWN_IMAGE_SIZE
            ) {
              reject(this.errorMessages.corruptImage);
            } else {
              blob
                .arrayBuffer()
                .then(buffer =>
                  this.cropBlob(new Blob([new Uint8Array(buffer)]))
                )
                .then(newBlob => resolve(newBlob))
                .catch(e => reject(e));
            }
          }
        );
      });
    },

    getWallpaperBlob(fileName, getSuccess, getError) {
      this.init()
        .then(() => this.getFileBlob(fileName))
        .then(blob => this.getDownResolutionBlob(blob))
        .then(newBlob => getSuccess(newBlob))
        .catch(errorMessage => getError(errorMessage));
    },

    getWallpaperBlobByBlob(blob, getSuccess, getError) {
      this.init()
        .then(() => this.getDownResolutionBlob(blob))
        .then(newBlob => getSuccess(newBlob))
        .catch(errorMessage => getError(errorMessage));
    },

    setWallpaper(fileName, setSuccess, setError) {
      this.init()
        .then(() => this.getFileBlob(fileName))
        .then(blob => this.getDownResolutionBlob(blob))
        .then(newBlob => this.saveBlob(newBlob))
        .then(() => {
          return SettingsObserver.setValue([
            {
              name: this.WALLPAPER_SETTINGS_KEY,
              value: this.WALLPAPER_IMAGE_PATCH
            }
          ]);
        })
        .then(setSuccess)
        .catch(errorMessage => setError(errorMessage));
    },

    setWallpaperByBlob(blob, setSuccess, setError) {
      this.init()
        .then(() => this.getDownResolutionBlob(blob))
        .then(newBlob => this.saveBlob(newBlob))
        .then(() => {
          return SettingsObserver.setValue([
            {
              name: this.WALLPAPER_SETTINGS_KEY,
              value: this.WALLPAPER_IMAGE_PATCH
            }
          ]);
        })
        .then(setSuccess)
        .catch(errorMessage => setError(errorMessage));
    },

    init() {
      return new Promise(resolve => {
        const downResolutionFiles = [];
        if (!window.getStorageIfAvailable) {
          downResolutionFiles.push(
            '%SHARED_APP_ORIGIN%/js/utils/device_storage/get_storage_if_available.js'
          );
        }
        if (!window.getImageSize) {
          downResolutionFiles.push(
            '%SHARED_APP_ORIGIN%/js/utils/media/image_size.js'
          );
        }
        if (!window.parseJPEGMetadata) {
          downResolutionFiles.push(
            '%SHARED_APP_ORIGIN%/js/utils/media/jpeg_metadata_parser.js'
          );
        }
        if (!window.Downsample) {
          downResolutionFiles.push(
            '%SHARED_APP_ORIGIN%/js/utils/media/downsample.js'
          );
        }
        if (!window.BlobView) {
          downResolutionFiles.push(
            '%SHARED_APP_ORIGIN%/js/utils/blob/blobview.js'
          );
        }
        if (downResolutionFiles.length) {
          LazyLoader.load(downResolutionFiles, () => {
            if (null === this.lowMemory) {
              this.checkIsLowMemory().then(() => resolve());
            } else {
              resolve();
            }
          });
        } else if (null === this.lowMemory) {
          this.checkIsLowMemory().then(() => resolve());
        } else {
          resolve();
        }
      });
    },

    checkIsLowMemory() {
      return new Promise(resolve => {
        DeviceCapabilityManager.get(this.HARDWARE_MEMORY_KEY).then(value => {
          this.lowMemory = value === this.LOW_MEMORY_VALUE;
          resolve();
        });
      });
    },

    cleanupImage() {
      this.offscreenImage.onerror = '';
      this.offscreenImage.onload = '';
      this.offscreenImage.src = '';
      URL.revokeObjectURL(this.offscreenImageURL);
      this.offscreenImageURL = null;
      this.offscreenImage = null;
    }
  };
  exports.WallpaperProcessor = WallpaperProcessor;
})(window);
