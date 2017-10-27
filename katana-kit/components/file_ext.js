(function() {
    "use strict";

    let fs = require("fs");

    // FileExt
    // =======
    // Functionality to extend the inbuilt Node functions
    //
    // @todo : Fix the naming and remove the class wrapper
    class FileExt {

        // file_exist
        // ----------
        // returns the fs.stat of a file, or if that file doesnt exist and empty fs.stat
        // for whats returned by fs.stat see <https://nodejs.org/api/fs.html#fs_class_fs_stats>
        //
        // @todo: for the sake off standards add the other fstat methods not related to file/folder
        //
        // ### Usage
        // ```
        // FileExt.file_exist("foo");  //=> {isDirectory: function , isFile: function}
        // ```
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

        // file_exists
        // -----------
        // like [file_exist](#section-5) but simple returns a boolean `true` it exists, or `false` it does not
        //
        // ### Usage
        // ```
        // FileExt.file_exists("foo"); //=> false
        // ```
        static file_exists(filename) {
            let res = FileExt.file_exist(filename);
            return (res.isDirectory() || res.isFile());
        }
    }

    module.exports = FileExt;

})();
// Copyright (c) 2016 DotMH
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.