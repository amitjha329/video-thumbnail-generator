'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fluentFfmpeg = require('fluent-ffmpeg');

var _fluentFfmpeg2 = _interopRequireDefault(_fluentFfmpeg);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class ThumbnailGenerator
 */
var ThumbnailGenerator = function () {
  /**
   * @constructor
   *
   * @param {String} [opts.sourcePath] - 'full path to video file'
   * @param {String} [opts.thumbnailPath] - 'path to where thumbnail(s) should be saved'
   * @param {Number} [opts.percent]
   * @param {String} [opts.size]
   * @param {Logger} [opts.logger]
   */
  function ThumbnailGenerator(opts) {
    _classCallCheck(this, ThumbnailGenerator);

    this.sourcePath = opts.sourcePath;
    this.thumbnailPath = opts.thumbnailPath;
    this.percent = opts.percent + '%' || '90%';
    this.logger = opts.logger || null;
    this.size = opts.size || '320x240';
    this.fileNameFormat = '%b-thumbnail-%r-%000i';
    this.tmpDir = opts.tmpDir || '/tmp';

    // by include deps here, it is easier to mock them out
    this.FfmpegCommand = _fluentFfmpeg2.default;
    this.del = _del2.default;
  }

  /**
   * @method getFfmpegInstance
   *
   * @return {FfmpegCommand}
   *
   * @private
   */


  _createClass(ThumbnailGenerator, [{
    key: 'getFfmpegInstance',
    value: function getFfmpegInstance() {
      return new this.FfmpegCommand({
        source: this.sourcePath,
        logger: this.logger
      });
    }

    /**
     * Method to generate one thumbnail by being given a percentage value.
     *
     * @method generateOneByPercent
     *
     * @param {Number} percent
     * @param {String} [opts.folder]
     * @param {String} [opts.size] - 'i.e. 320x320'
     * @param {String} [opts.filename]
     *
     * @return {Promise}
     *
     * @public
     *
     * @async
     */

  }, {
    key: 'generateOneByPercent',
    value: function generateOneByPercent(percent, opts) {
      if (percent < 0 || percent > 100) {
        return Promise.reject(new Error('Percent must be a value from 0-100'));
      }

      return this.generate(_lodash2.default.assignIn(opts, {
        count: 1,
        timestamps: [percent + '%']
      })).then(function (result) {
        return result.pop();
      });
    }

    /**
     * Method to generate one thumbnail by being given a percentage value.
     *
     * @method generateOneByPercentCb
     *
     * @param {Number} percent
     * @param {Object} [opts]
     * @param {Function} cb (err, string)
     *
     * @return {Void}
     *
     * @public
     *
     * @async
     */

  }, {
    key: 'generateOneByPercentCb',
    value: function generateOneByPercentCb(percent, cb, opts) {
      var callback = cb || opts;

      this.generateOneByPercent(percent, opts).then(function (result) {
        return callback(null, result);
      }).catch(callback);
    }

    /**
     * Method to generate thumbnails
     *
     * @method generate
     *
     * @param {String} [opts.folder]
     * @param {Number} [opts.count]
     * @param {String} [opts.size] - 'i.e. 320x320'
     * @param {String} [opts.filename]
     *
     * @return {Promise}
     *
     * @public
     *
     * @async
     */

  }, {
    key: 'generate',
    value: function generate(opts) {
      var defaultSettings = {
        folder: this.thumbnailPath,
        count: 10,
        size: this.size,
        filename: this.fileNameFormat,
        logger: this.logger
      };

      var ffmpeg = this.getFfmpegInstance();
      var settings = _lodash2.default.assignIn(defaultSettings, opts);
      var filenameArray = [];

      return new Promise(function (resolve, reject) {
        function complete() {
          resolve(filenameArray);
        }

        function filenames(fns) {
          filenameArray = fns;
        }

        ffmpeg.on('filenames', filenames).on('end', complete).on('error', reject).screenshots(settings);
      });
    }

    /**
     * Method to generate thumbnails
     *
     * @method generateCb
     *
     * @param {String} [opts.folder]
     * @param {Number} [opts.count]
     * @param {String} [opts.size] - 'i.e. 320x320'
     * @param {String} [opts.filename]
     * @param {Function} cb - (err, array)
     *
     * @return {Void}
     *
     * @public
     *
     * @async
     */

  }, {
    key: 'generateCb',
    value: function generateCb(opts, cb) {
      var callback = cb || opts;

      this.generate(opts).then(function (result) {
        return callback(null, result);
      }).catch(callback);
    }

    /**
     * Method to generate the palette from a video (required for creating gifs)
     *
     * @method generatePalette
     *
     * @param {string} [opts.videoFilters]
     * @param {string} [opts.offset]
     * @param {string} [opts.duration]
     * @param {string} [opts.videoFilters]
     *
     * @return {Promise}
     *
     * @public
     */

  }, {
    key: 'generatePalette',
    value: function generatePalette(opts) {
      var ffmpeg = this.getFfmpegInstance();
      var defaultOpts = {
        videoFilters: 'fps=10,scale=320:-1:flags=lanczos,palettegen'
      };
      var conf = _lodash2.default.assignIn(defaultOpts, opts);
      var inputOptions = ['-y'];
      var outputOptions = ['-vf ' + conf.videoFilters];
      var output = this.tmpDir + '/palette-' + Date.now() + '.png';

      return new Promise(function (resolve, reject) {
        function complete() {
          resolve(output);
        }

        if (conf.offset) {
          inputOptions.push('-ss ' + conf.offset);
        }

        if (conf.duration) {
          inputOptions.push('-t ' + conf.duration);
        }

        ffmpeg.inputOptions(inputOptions).outputOptions(outputOptions).on('end', complete).on('error', reject).output(output).run();
      });
    }

    /**
     * Method to generate the palette from a video (required for creating gifs)
     *
     * @method generatePaletteCb
     *
     * @param {string} [opts.videoFilters]
     * @param {string} [opts.offset]
     * @param {string} [opts.duration]
     * @param {string} [opts.videoFilters]
     * @param {Function} cb - (err, array)
     *
     * @return {Promise}
     *
     * @public
     */

  }, {
    key: 'generatePaletteCb',
    value: function generatePaletteCb(opts, cb) {
      var callback = cb || opts;

      this.generatePalette(opts).then(function (result) {
        return callback(null, result);
      }).catch(callback);
    }

    /**
     * Method to create a short gif thumbnail from an mp4 video
     *
     * @method generateGif
     *
     * @param {Number} opts.fps
     * @param {Number} opts.scale
     * @param {Number} opts.speedMultiple
     * @param {Boolean} opts.deletePalette
     *
     * @return {Promise}
     *
     * @public
     */

  }, {
    key: 'generateGif',
    value: function generateGif(opts) {
      var ffmpeg = this.getFfmpegInstance();
      var defaultOpts = {
        fps: 0.75,
        scale: 180,
        speedMultiplier: 4,
        deletePalette: true
      };
      var conf = _lodash2.default.assignIn(defaultOpts, opts);
      var inputOptions = [];
      var outputOptions = ['-filter_complex fps=' + conf.fps + ',setpts=(1/' + conf.speedMultiplier + ')*PTS,scale=' + conf.scale + ':-1:flags=lanczos[x];[x][1:v]paletteuse'];
      var outputFileName = conf.fileName || 'video-' + Date.now() + '.gif';
      var output = this.thumbnailPath + '/' + outputFileName;
      var d = this.del;

      function createGif(paletteFilePath) {
        if (conf.offset) {
          inputOptions.push('-ss ' + conf.offset);
        }

        if (conf.duration) {
          inputOptions.push('-t ' + conf.duration);
        }

        return new Promise(function (resolve, reject) {
          outputOptions.unshift('-i ' + paletteFilePath);

          function complete() {
            if (conf.deletePalette === true) {
              d.sync([paletteFilePath], {
                force: true
              });
            }
            resolve(output);
          }

          ffmpeg.inputOptions(inputOptions).outputOptions(outputOptions).on('end', complete).on('error', reject).output(output).run();
        });
      }

      return this.generatePalette().then(createGif);
    }

    /**
     * Method to create a short gif thumbnail from an mp4 video
     *
     * @method generateGifCb
     *
     * @param {Number} opts.fps
     * @param {Number} opts.scale
     * @param {Number} opts.speedMultiple
     * @param {Boolean} opts.deletePalette
     * @param {Function} cb - (err, array)
     *
     * @public
     */

  }, {
    key: 'generateGifCb',
    value: function generateGifCb(opts, cb) {
      var callback = cb || opts;

      this.generateGif(opts).then(function (result) {
        return callback(null, result);
      }).catch(callback);
    }
  }]);

  return ThumbnailGenerator;
}();

exports.default = ThumbnailGenerator;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlRodW1ibmFpbEdlbmVyYXRvciIsIm9wdHMiLCJzb3VyY2VQYXRoIiwidGh1bWJuYWlsUGF0aCIsInBlcmNlbnQiLCJsb2dnZXIiLCJzaXplIiwiZmlsZU5hbWVGb3JtYXQiLCJ0bXBEaXIiLCJGZm1wZWdDb21tYW5kIiwiZGVsIiwic291cmNlIiwiUHJvbWlzZSIsInJlamVjdCIsIkVycm9yIiwiZ2VuZXJhdGUiLCJfIiwiYXNzaWduSW4iLCJjb3VudCIsInRpbWVzdGFtcHMiLCJ0aGVuIiwicmVzdWx0IiwicG9wIiwiY2IiLCJjYWxsYmFjayIsImdlbmVyYXRlT25lQnlQZXJjZW50IiwiY2F0Y2giLCJkZWZhdWx0U2V0dGluZ3MiLCJmb2xkZXIiLCJmaWxlbmFtZSIsImZmbXBlZyIsImdldEZmbXBlZ0luc3RhbmNlIiwic2V0dGluZ3MiLCJmaWxlbmFtZUFycmF5IiwicmVzb2x2ZSIsImNvbXBsZXRlIiwiZmlsZW5hbWVzIiwiZm5zIiwib24iLCJzY3JlZW5zaG90cyIsImRlZmF1bHRPcHRzIiwidmlkZW9GaWx0ZXJzIiwiY29uZiIsImlucHV0T3B0aW9ucyIsIm91dHB1dE9wdGlvbnMiLCJvdXRwdXQiLCJEYXRlIiwibm93Iiwib2Zmc2V0IiwicHVzaCIsImR1cmF0aW9uIiwicnVuIiwiZ2VuZXJhdGVQYWxldHRlIiwiZnBzIiwic2NhbGUiLCJzcGVlZE11bHRpcGxpZXIiLCJkZWxldGVQYWxldHRlIiwib3V0cHV0RmlsZU5hbWUiLCJmaWxlTmFtZSIsImQiLCJjcmVhdGVHaWYiLCJwYWxldHRlRmlsZVBhdGgiLCJ1bnNoaWZ0Iiwic3luYyIsImZvcmNlIiwiZ2VuZXJhdGVHaWYiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBOzs7SUFHcUJBLGtCO0FBQ25COzs7Ozs7Ozs7QUFTQSw4QkFBWUMsSUFBWixFQUFrQjtBQUFBOztBQUNoQixTQUFLQyxVQUFMLEdBQWtC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LEtBQXVCLElBQTNCLEVBQWlDO0FBQy9CRyxnQkFBRUksSUFBRixDQUFPLENBQUNGLGVBQUQsQ0FBUCxFQUEwQjtBQUN4QkcsdUJBQU87QUFEaUIsZUFBMUI7QUFHRDtBQUNEOUIsb0JBQVFXLE1BQVI7QUFDRDs7QUFFRGYsaUJBQ0dhLFlBREgsQ0FDZ0JBLFlBRGhCLEVBRUdDLGFBRkgsQ0FFaUJBLGFBRmpCLEVBR0dOLEVBSEgsQ0FHTSxLQUhOLEVBR2FILFFBSGIsRUFJR0csRUFKSCxDQUlNLE9BSk4sRUFJZXpCLE1BSmYsRUFLR2dDLE1BTEgsQ0FLVUEsTUFMVixFQU1HTSxHQU5IO0FBT0QsU0FuQk0sQ0FBUDtBQW9CRDs7QUFFRCxhQUFPLEtBQUtDLGVBQUwsR0FDSmhDLElBREksQ0FDQ3dDLFNBREQsQ0FBUDtBQUVEOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O2tDQWFjM0QsSSxFQUFNc0IsRSxFQUFJO0FBQ3RCLFVBQU1DLFdBQVdELE1BQU10QixJQUF2Qjs7QUFFQSxXQUFLZ0UsV0FBTCxDQUFpQmhFLElBQWpCLEVBQ0dtQixJQURILENBQ1EsVUFBQ0MsTUFBRDtBQUFBLGVBQVlHLFNBQVMsSUFBVCxFQUFlSCxNQUFmLENBQVo7QUFBQSxPQURSLEVBRUdLLEtBRkgsQ0FFU0YsUUFGVDtBQUdEOzs7Ozs7a0JBN1RrQnhCLGtCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEZmbXBlZ0NvbW1hbmQgZnJvbSAnZmx1ZW50LWZmbXBlZyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGRlbCBmcm9tICdkZWwnO1xuXG4vKipcbiAqIEBjbGFzcyBUaHVtYm5haWxHZW5lcmF0b3JcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGh1bWJuYWlsR2VuZXJhdG9yIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMuc291cmNlUGF0aF0gLSAnZnVsbCBwYXRoIHRvIHZpZGVvIGZpbGUnXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0cy50aHVtYm5haWxQYXRoXSAtICdwYXRoIHRvIHdoZXJlIHRodW1ibmFpbChzKSBzaG91bGQgYmUgc2F2ZWQnXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0cy5wZXJjZW50XVxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMuc2l6ZV1cbiAgICogQHBhcmFtIHtMb2dnZXJ9IFtvcHRzLmxvZ2dlcl1cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICB0aGlzLnNvdXJjZVBhdGggPSBvcHRzLnNvdXJjZVBhdGg7XG4gICAgdGhpcy50aHVtYm5haWxQYXRoID0gb3B0cy50aHVtYm5haWxQYXRoO1xuICAgIHRoaXMucGVyY2VudCA9IGAke29wdHMucGVyY2VudH0lYCB8fCAnOTAlJztcbiAgICB0aGlzLmxvZ2dlciA9IG9wdHMubG9nZ2VyIHx8IG51bGw7XG4gICAgdGhpcy5zaXplID0gb3B0cy5zaXplIHx8ICczMjB4MjQwJztcbiAgICB0aGlzLmZpbGVOYW1lRm9ybWF0ID0gJyViLXRodW1ibmFpbC0lci0lMDAwaSc7XG4gICAgdGhpcy50bXBEaXIgPSBvcHRzLnRtcERpciB8fCAnL3RtcCc7XG5cbiAgICAvLyBieSBpbmNsdWRlIGRlcHMgaGVyZSwgaXQgaXMgZWFzaWVyIHRvIG1vY2sgdGhlbSBvdXRcbiAgICB0aGlzLkZmbXBlZ0NvbW1hbmQgPSBGZm1wZWdDb21tYW5kO1xuICAgIHRoaXMuZGVsID0gZGVsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBtZXRob2QgZ2V0RmZtcGVnSW5zdGFuY2VcbiAgICpcbiAgICogQHJldHVybiB7RmZtcGVnQ29tbWFuZH1cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldEZmbXBlZ0luc3RhbmNlKCkge1xuICAgIHJldHVybiBuZXcgdGhpcy5GZm1wZWdDb21tYW5kKHtcbiAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VQYXRoLFxuICAgICAgbG9nZ2VyOiB0aGlzLmxvZ2dlcixcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gZ2VuZXJhdGUgb25lIHRodW1ibmFpbCBieSBiZWluZyBnaXZlbiBhIHBlcmNlbnRhZ2UgdmFsdWUuXG4gICAqXG4gICAqIEBtZXRob2QgZ2VuZXJhdGVPbmVCeVBlcmNlbnRcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBlcmNlbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLmZvbGRlcl1cbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLnNpemVdIC0gJ2kuZS4gMzIweDMyMCdcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLmZpbGVuYW1lXVxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBhc3luY1xuICAgKi9cbiAgZ2VuZXJhdGVPbmVCeVBlcmNlbnQocGVyY2VudCwgb3B0cykge1xuICAgIGlmIChwZXJjZW50IDwgMCB8fCBwZXJjZW50ID4gMTAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdQZXJjZW50IG11c3QgYmUgYSB2YWx1ZSBmcm9tIDAtMTAwJykpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlKF8uYXNzaWduSW4ob3B0cywge1xuICAgICAgY291bnQ6IDEsXG4gICAgICB0aW1lc3RhbXBzOiBbYCR7cGVyY2VudH0lYF0sXG4gICAgfSkpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiByZXN1bHQucG9wKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byBnZW5lcmF0ZSBvbmUgdGh1bWJuYWlsIGJ5IGJlaW5nIGdpdmVuIGEgcGVyY2VudGFnZSB2YWx1ZS5cbiAgICpcbiAgICogQG1ldGhvZCBnZW5lcmF0ZU9uZUJ5UGVyY2VudENiXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwZXJjZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0c11cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgKGVyciwgc3RyaW5nKVxuICAgKlxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBhc3luY1xuICAgKi9cbiAgZ2VuZXJhdGVPbmVCeVBlcmNlbnRDYihwZXJjZW50LCBjYiwgb3B0cykge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gY2IgfHwgb3B0cztcblxuICAgIHRoaXMuZ2VuZXJhdGVPbmVCeVBlcmNlbnQocGVyY2VudCwgb3B0cylcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IGNhbGxiYWNrKG51bGwsIHJlc3VsdCkpXG4gICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0byBnZW5lcmF0ZSB0aHVtYm5haWxzXG4gICAqXG4gICAqIEBtZXRob2QgZ2VuZXJhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLmZvbGRlcl1cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRzLmNvdW50XVxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMuc2l6ZV0gLSAnaS5lLiAzMjB4MzIwJ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMuZmlsZW5hbWVdXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQGFzeW5jXG4gICAqL1xuICBnZW5lcmF0ZShvcHRzKSB7XG4gICAgY29uc3QgZGVmYXVsdFNldHRpbmdzID0ge1xuICAgICAgZm9sZGVyOiB0aGlzLnRodW1ibmFpbFBhdGgsXG4gICAgICBjb3VudDogMTAsXG4gICAgICBzaXplOiB0aGlzLnNpemUsXG4gICAgICBmaWxlbmFtZTogdGhpcy5maWxlTmFtZUZvcm1hdCxcbiAgICAgIGxvZ2dlcjogdGhpcy5sb2dnZXIsXG4gICAgfTtcblxuICAgIGNvbnN0IGZmbXBlZyA9IHRoaXMuZ2V0RmZtcGVnSW5zdGFuY2UoKTtcbiAgICBjb25zdCBzZXR0aW5ncyA9IF8uYXNzaWduSW4oZGVmYXVsdFNldHRpbmdzLCBvcHRzKTtcbiAgICBsZXQgZmlsZW5hbWVBcnJheSA9IFtdO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgICByZXNvbHZlKGZpbGVuYW1lQXJyYXkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmaWxlbmFtZXMoZm5zKSB7XG4gICAgICAgIGZpbGVuYW1lQXJyYXkgPSBmbnM7XG4gICAgICB9XG5cbiAgICAgIGZmbXBlZ1xuICAgICAgICAub24oJ2ZpbGVuYW1lcycsIGZpbGVuYW1lcylcbiAgICAgICAgLm9uKCdlbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgLnNjcmVlbnNob3RzKHNldHRpbmdzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gZ2VuZXJhdGUgdGh1bWJuYWlsc1xuICAgKlxuICAgKiBAbWV0aG9kIGdlbmVyYXRlQ2JcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRzLmZvbGRlcl1cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRzLmNvdW50XVxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMuc2l6ZV0gLSAnaS5lLiAzMjB4MzIwJ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdHMuZmlsZW5hbWVdXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gKGVyciwgYXJyYXkpXG4gICAqXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQGFzeW5jXG4gICAqL1xuICBnZW5lcmF0ZUNiKG9wdHMsIGNiKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSBjYiB8fCBvcHRzO1xuXG4gICAgdGhpcy5nZW5lcmF0ZShvcHRzKVxuICAgICAgLnRoZW4oKHJlc3VsdCkgPT4gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSlcbiAgICAgIC5jYXRjaChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRvIGdlbmVyYXRlIHRoZSBwYWxldHRlIGZyb20gYSB2aWRlbyAocmVxdWlyZWQgZm9yIGNyZWF0aW5nIGdpZnMpXG4gICAqXG4gICAqIEBtZXRob2QgZ2VuZXJhdGVQYWxldHRlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy52aWRlb0ZpbHRlcnNdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5vZmZzZXRdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5kdXJhdGlvbl1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLnZpZGVvRmlsdGVyc11cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2VuZXJhdGVQYWxldHRlKG9wdHMpIHtcbiAgICBjb25zdCBmZm1wZWcgPSB0aGlzLmdldEZmbXBlZ0luc3RhbmNlKCk7XG4gICAgY29uc3QgZGVmYXVsdE9wdHMgPSB7XG4gICAgICB2aWRlb0ZpbHRlcnM6ICdmcHM9MTAsc2NhbGU9MzIwOi0xOmZsYWdzPWxhbmN6b3MscGFsZXR0ZWdlbicsXG4gICAgfTtcbiAgICBjb25zdCBjb25mID0gXy5hc3NpZ25JbihkZWZhdWx0T3B0cywgb3B0cyk7XG4gICAgY29uc3QgaW5wdXRPcHRpb25zID0gW1xuICAgICAgJy15JyxcbiAgICBdO1xuICAgIGNvbnN0IG91dHB1dE9wdGlvbnMgPSBbXG4gICAgICBgLXZmICR7Y29uZi52aWRlb0ZpbHRlcnN9YCxcbiAgICBdO1xuICAgIGNvbnN0IG91dHB1dCA9IGAke3RoaXMudG1wRGlyfS9wYWxldHRlLSR7RGF0ZS5ub3coKX0ucG5nYDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgICAgcmVzb2x2ZShvdXRwdXQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZi5vZmZzZXQpIHtcbiAgICAgICAgaW5wdXRPcHRpb25zLnB1c2goYC1zcyAke2NvbmYub2Zmc2V0fWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZi5kdXJhdGlvbikge1xuICAgICAgICBpbnB1dE9wdGlvbnMucHVzaChgLXQgJHtjb25mLmR1cmF0aW9ufWApO1xuICAgICAgfVxuXG4gICAgICBmZm1wZWdcbiAgICAgICAgLmlucHV0T3B0aW9ucyhpbnB1dE9wdGlvbnMpXG4gICAgICAgIC5vdXRwdXRPcHRpb25zKG91dHB1dE9wdGlvbnMpXG4gICAgICAgIC5vbignZW5kJywgY29tcGxldGUpXG4gICAgICAgIC5vbignZXJyb3InLCByZWplY3QpXG4gICAgICAgIC5vdXRwdXQob3V0cHV0KVxuICAgICAgICAucnVuKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRvIGdlbmVyYXRlIHRoZSBwYWxldHRlIGZyb20gYSB2aWRlbyAocmVxdWlyZWQgZm9yIGNyZWF0aW5nIGdpZnMpXG4gICAqXG4gICAqIEBtZXRob2QgZ2VuZXJhdGVQYWxldHRlQ2JcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLnZpZGVvRmlsdGVyc11cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLm9mZnNldF1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLmR1cmF0aW9uXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdHMudmlkZW9GaWx0ZXJzXVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIChlcnIsIGFycmF5KVxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBnZW5lcmF0ZVBhbGV0dGVDYihvcHRzLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gY2IgfHwgb3B0cztcblxuICAgIHRoaXMuZ2VuZXJhdGVQYWxldHRlKG9wdHMpXG4gICAgICAudGhlbigocmVzdWx0KSA9PiBjYWxsYmFjayhudWxsLCByZXN1bHQpKVxuICAgICAgLmNhdGNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gY3JlYXRlIGEgc2hvcnQgZ2lmIHRodW1ibmFpbCBmcm9tIGFuIG1wNCB2aWRlb1xuICAgKlxuICAgKiBAbWV0aG9kIGdlbmVyYXRlR2lmXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRzLmZwc1xuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0cy5zY2FsZVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0cy5zcGVlZE11bHRpcGxlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0cy5kZWxldGVQYWxldHRlXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGdlbmVyYXRlR2lmKG9wdHMpIHtcbiAgICBjb25zdCBmZm1wZWcgPSB0aGlzLmdldEZmbXBlZ0luc3RhbmNlKCk7XG4gICAgY29uc3QgZGVmYXVsdE9wdHMgPSB7XG4gICAgICBmcHM6IDAuNzUsXG4gICAgICBzY2FsZTogMTgwLFxuICAgICAgc3BlZWRNdWx0aXBsaWVyOiA0LFxuICAgICAgZGVsZXRlUGFsZXR0ZTogdHJ1ZSxcbiAgICB9O1xuICAgIGNvbnN0IGNvbmYgPSBfLmFzc2lnbkluKGRlZmF1bHRPcHRzLCBvcHRzKTtcbiAgICBjb25zdCBpbnB1dE9wdGlvbnMgPSBbXTtcbiAgICBjb25zdCBvdXRwdXRPcHRpb25zID0gW2AtZmlsdGVyX2NvbXBsZXggZnBzPSR7Y29uZi5mcHN9LHNldHB0cz0oMS8ke2NvbmYuc3BlZWRNdWx0aXBsaWVyfSkqUFRTLHNjYWxlPSR7Y29uZi5zY2FsZX06LTE6ZmxhZ3M9bGFuY3pvc1t4XTtbeF1bMTp2XXBhbGV0dGV1c2VgXTtcbiAgICBjb25zdCBvdXRwdXRGaWxlTmFtZSA9IGNvbmYuZmlsZU5hbWUgfHwgYHZpZGVvLSR7RGF0ZS5ub3coKX0uZ2lmYDtcbiAgICBjb25zdCBvdXRwdXQgPSBgJHt0aGlzLnRodW1ibmFpbFBhdGh9LyR7b3V0cHV0RmlsZU5hbWV9YDtcbiAgICBjb25zdCBkID0gdGhpcy5kZWw7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVHaWYocGFsZXR0ZUZpbGVQYXRoKSB7XG4gICAgICBpZiAoY29uZi5vZmZzZXQpIHtcbiAgICAgICAgaW5wdXRPcHRpb25zLnB1c2goYC1zcyAke2NvbmYub2Zmc2V0fWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZi5kdXJhdGlvbikge1xuICAgICAgICBpbnB1dE9wdGlvbnMucHVzaChgLXQgJHtjb25mLmR1cmF0aW9ufWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvdXRwdXRPcHRpb25zLnVuc2hpZnQoYC1pICR7cGFsZXR0ZUZpbGVQYXRofWApO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgICAgIGlmIChjb25mLmRlbGV0ZVBhbGV0dGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGQuc3luYyhbcGFsZXR0ZUZpbGVQYXRoXSwge1xuICAgICAgICAgICAgICBmb3JjZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKG91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBmZm1wZWdcbiAgICAgICAgICAuaW5wdXRPcHRpb25zKGlucHV0T3B0aW9ucylcbiAgICAgICAgICAub3V0cHV0T3B0aW9ucyhvdXRwdXRPcHRpb25zKVxuICAgICAgICAgIC5vbignZW5kJywgY29tcGxldGUpXG4gICAgICAgICAgLm9uKCdlcnJvcicsIHJlamVjdClcbiAgICAgICAgICAub3V0cHV0KG91dHB1dClcbiAgICAgICAgICAucnVuKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVBhbGV0dGUoKVxuICAgICAgLnRoZW4oY3JlYXRlR2lmKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdG8gY3JlYXRlIGEgc2hvcnQgZ2lmIHRodW1ibmFpbCBmcm9tIGFuIG1wNCB2aWRlb1xuICAgKlxuICAgKiBAbWV0aG9kIGdlbmVyYXRlR2lmQ2JcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdHMuZnBzXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRzLnNjYWxlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRzLnNwZWVkTXVsdGlwbGVcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRzLmRlbGV0ZVBhbGV0dGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSAoZXJyLCBhcnJheSlcbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2VuZXJhdGVHaWZDYihvcHRzLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gY2IgfHwgb3B0cztcblxuICAgIHRoaXMuZ2VuZXJhdGVHaWYob3B0cylcbiAgICAgIC50aGVuKChyZXN1bHQpID0+IGNhbGxiYWNrKG51bGwsIHJlc3VsdCkpXG4gICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICB9XG59XG4iXX0=
