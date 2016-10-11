(function() {
    "use strict";

    let fs = require("fs");

    /**
     * Functions that extend nodes build in FS module
     *
     * @class FileExt
     * @module Common
     *
     * @author Martin Haynes <oss@dotmh.com>
     */
    class FileExt {

        /**
         * Checks to see if a file exists returning the FS.Stats
         *
         * @param filename {String} The full path to the file that you are looking for
         *
         * @returns {{isDirectory: Function, isFile: Function}} FS.Stats or a mock on failure
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static file_exist(filename) {

            filename = filename || false;

            if (!filename) {
                throw new Error("Filename is required");
            }

            try {
                return fs.statSync(filename);
            } catch(err) {
                return {
                    isDirectory: function() { return false; },
                    isFile: function() { return false; }
                };
            }
        }

        /**
         * Checks to see just if a file exists
         *
         * @param filename {String} The full path to the file that you are looking for
         *
         * @returns {boolean} True the file exists , False the file doesn't
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static file_exists(filename) {
            let res = FileExt.file_exist(filename);
            return (res.isDirectory() || res.isFile());
        }
    }

    module.exports = FileExt;

})();