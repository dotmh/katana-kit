(function(){
    "use strict";

    let fs = require("fs");
    let readFileWithPromise = require('bluebird').promisify(fs.readFile);

    let Logger = require(`./logger`);
    let FileExt = require("./file_ext");
    let Collection = require("./collection");
    let Schema = require("./schema");

    const ENCODING = "utf8";

    // JsonFile
    // ========
    // is a wrapper for JSON files, it allows you to open a JSON file, and validate it against a [schema](schema.html)
    // the contents is then wrapped in a [collection](collection.html) giving you all the collection functionality like
    // been able to observe the file contents. You can add handlers for the events used in [schema](schema.html) by
    // simply binding them to the `JsonFile` class as they are [bonded](eventify.html#section-23) together
    //
    // # Usage
    // -------
    // ```
    // let file = new JsonFile("path/to/file");
    //
    // // OR
    //
    // let file = new JsonFile(
    //      "path/to/file",
    //      "path/to/schema.json"
    // );
    // ```
    //
    // ----
    class JsonFile extends Collection {

        constructor(filename, schemaFile) {
            super();
            this._filename = filename || null;
            this._schemaFile = schemaFile || null;
            this._schema = this._schemaFile !== null ? new Schema(this._schemaFile) : null;
            this._loaded = false;

            if(this._schema !== null) {
                this.bond(this._schema);
            }
        }

        // filename
        // --------
        // Ether gets or sets then gets the filename of the JSON file that you wish the class to manage.
        //
        // ### Usage
        // ```
        // jsonfile.filename(); //=> "path/to/file"
        // jsonfile.filename(
        //  "new/path/to/file"
        // ); //=> "new/path/to/file"
        // ```
        // ----
        filename (filename) {
            if ( filename||false ) {
                this._filename = filename;
            }

            return this._filename;
        }

        // load
        // ----
        // Loads a JSON file and wraps it in a [collection](collection.html). This method follows the standard
        // node idiology of doing such operations async. It therefore returns a promise that will resolve with the
        // instance of this Class loaded with the contents of the JSON file.
        //
        // ### Usage
        // ```
        // jsonfile.load().then((jsonfile) => {
        // // ... Do Something
        // });
        // ```
        // ----
        load() {
			Logger.info(`json_file / load - ${this.filename()}`);
            this.exists_or_die();
                return readFileWithPromise(this.filename(), ENCODING)
                .then((data) => {
                    let json = JSON.parse(data);
                    Logger.info(`json_file / loaded - ${JSON.stringify(json)}`);
                    this.data(json);
                    this._loaded = true;
                    return this;
                })
                .catch((error) => {
                    Logger.error("Error reading file", error);
                    throw new Error(`Can not read ${ this.filename() }, not valid JSON`);
                });

        }

        // loadSync
        // --------
        // Similar to other node js modules, including those built in this is a sync version of [JsonFile.load](#section-9). As doing sync
        // operations kinda defeats the purpose of using node this is not the default way of loading. Its provided
        // if you need it. It will load the JsonFile and then return an instance of the class loaded with the data.
        //
        // ### Usage
        // ```
        // let a = jsonfile.loadSync();
        // ```
        // ----
        loadSync() {
			Logger.info(`json_file / loadSync - ${this.filename()}`);			
            this.exists_or_die();
            let data = fs.readFileSync(this.filename() , ENCODING);
            let json = null;
            try {
                json = JSON.parse(data);
                this.data(json);
                this._loaded = true;
            } catch (error) {
                throw new Error(`Can not read ${ this.filename() }, not valid JSON`);
            }

            return this;
        }

        // valid
        // -----
        // Checks the data from the JSON against a [Schema](schema.html).
        // If the JSON hasn't been loaded yet, then it will load the file using [JsonFile.loadSync](#section-12),
        // it will return boolean `true` if it is valid and `false` if it is not.
        //
        // ### Usage
        // ```
        // jsonfile.valid() // => true or false
        // ```
        // ----
        valid() {
            this._hasSchema();
            if ( !this._loaded ) {
                this.loadSync();
            }
            return this._schema.valid(this.data());
        }

        // invalid
        // -------
        // The convince method which is the opposite of [jsonfile.valid()](#section-15).
        // It therefore returns boolean [true] if the JSON is not valid against the schema , and false if it is valid
        // it is the same as doing `!jsonfile.valid()`.
        //
        // ### Usage
        // ```
        // jsonfile.invalid() // => true or false
        // ```
        // ----
        invalid() {
            return !this.valid(this.data());
        }

        /**
         * Exists Checks to see if the json file specified at initialization or using JsonFile::filename() exists
         *
         * @returns {boolean} True the file exists , false the file doesn't
         *
         * @author Martin Haynes
         */

        // exists
        // ------
        // Allows you to check if the file exists before attempting to load it. will return boolean `true` if the file
        // exists and `false` if not.
        //
        // ### Usage
        // ```
        // jsonfile.exists() // => true or false
        // ```
        // ---
        exists() {
            return FileExt.file_exists(this.filename());
        }

        /**
         * Checks to see if the JSON file specified exists , if not throws and exception this is used to guard
         * JsonFile::load and JsonFile::loadSync
         *
         * @throw Error if the file doesn't exist or no file is specified
         *
         * @private
         *
         * @author Martin Haynes
         */
        exists_or_die() {

            if (!this.filename() || false) {
                throw new Error("No filename has been set");
            }

            if (!this.exists()) {
                throw new Error(`The file ${ this.filename() } doesn't exist!`);
            }
        }

        /**
         * Checks whether or not the class instance has been given a schema
         *
         * @throw Error if there isn't a schema
         *
         * @private
         *
         * @author Martin Haynes
         */
        _hasSchema() {
            if ( this._schema === null ) {
                throw new Error('No validation schema has been defined');
            }
        }

    }

    module.exports = JsonFile;

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