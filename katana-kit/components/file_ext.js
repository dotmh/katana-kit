/***
 * Copyright (c) 2016 DotMH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function() {
    "use strict";

    let fs = require("fs");

    /**
     * Functions that extend nodes build in FS module
     *
     * @class FileExt
     * @module katana-kit
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