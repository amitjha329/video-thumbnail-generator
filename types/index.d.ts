/**
 * @class ThumbnailGenerator
 */
export default class ThumbnailGenerator {
    /**
     * @constructor
     *
     * @param {String} [opts.sourcePath] - 'full path to video file'
     * @param {String} [opts.thumbnailPath] - 'path to where thumbnail(s) should be saved'
     * @param {Number} [opts.percent]
     * @param {String} [opts.size]
     * @param {Logger} [opts.logger]
     */
    constructor(opts: any);
    sourcePath: any;
    thumbnailPath: any;
    percent: string;
    logger: any;
    size: any;
    fileNameFormat: string;
    tmpDir: any;
    FfmpegCommand: any;
    del: any;
    /**
     * @method getFfmpegInstance
     *
     * @return {FfmpegCommand}
     *
     * @private
     */
    private getFfmpegInstance;
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
    public generateOneByPercent(percent: number, opts: any): Promise<any>;
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
    public generateOneByPercentCb(percent: number, cb: Function, opts?: any): void;
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
    public generate(opts: any): Promise<any>;
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
    public generateCb(opts: any, cb: Function): void;
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
    public generatePalette(opts: any): Promise<any>;
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
    public generatePaletteCb(opts: any, cb: Function): Promise<any>;
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
    public generateGif(opts: any): Promise<any>;
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
    public generateGifCb(opts: any, cb: Function): void;
}
