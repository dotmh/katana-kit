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
(function(){
    "use strict";

    let fs = require("fs");
    let readFileWithPromise = require('bluebird').promisify(fs.readFile);

    let Logger = require(`./logger`);
    let FileExt = require("./file_ext");
    let Collection = require("./collection");
    let Schema = require("./schema");

    const ENCODING = "utf8";

    /**
     * Loads JSON files and turns them into a collection
     *
     * @class JsonFile
     * @module Common
     *
     * @param filename = Null {String|Null} The JSON file to open
     * @param schema = Null {String|Null} The JSON schema file to use for validation
     *
     * @author Martin Haynes
     */
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

        /**
         * Gets , or Sets and Gets the JSON Filename
         *
         * @param filename = false {String|Boolean} The Json file name
         * @returns {String|null} The filename
         *
         * @author Martin Haynes
         */
        filename (filename) {
            if ( filename||false ) {
                this._filename = filename;
            }

            return this._filename;
        }

        /**
         * Loads a JSON file up Async and populates the collection with the data
         *
         * @returns {Promise} The Promise for when the file is loaded.
         *
         * @author Martin Haynes
         */
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

        /**
         * Loads a JSON file up Sync and populates the Collection
         *
         * @returns {JsonFile} This instance of JsonFile with the data prepopulated
         *
         * @author Martin Haynes
         */
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

        /**
         * Checks that the data from the JSON file matches the schema
         *
         * @returns {Boolean} Standard True = valid , False = invalid
         *
         * @author Martin Haynes
         */
        valid() {
            this._hasSchema();
            if ( !this._loaded ) {
                this.loadSync();
            }
            return this._schema.valid(this.data());
        }

        /**
         * checks that the data
         *
         * @returns {boolean} inverse standard True = invalid , False = valid
         *
         * @author Martin Haynes
         */
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