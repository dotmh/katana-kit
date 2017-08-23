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

    let _ = require("lodash");
    let Eventify = require("./eventify");

    const PATH_SEPERATOR = ".";

    /**
     * A basic collection object
     *
     * @class Collection
     * @module katana-kit
     * @extends Eventify
     *
     * @author Martin Haynes <oss@dotmh.com>
     */
    class Collection extends Eventify {
        constructor(data) {
            super();
            this._data = {};
            this._length = 0;
            this._fields = [];

            if ( data|| false ) {
                this.data(data);
            }
        }

        /**
         * Identifies the object as been a collection
         *
         * @returns {boolean} True if it is a collection
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        isCollection() {
            return true;
        }

        /**
         * Out puts the collection internal data as a Object literal (unboxing)
         *
         * @returns {Object} an Object literal containing the internal class data
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        toObject() {
            return this.data();
        }

        /**
         * Converts the internal data into a JSON encoded string
         *
         * @returns {String} The data as a string
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        toString() {
            return JSON.stringify(this.data());
        }

        /**
         * Adds and returns or returns the internal data object allow you to bulk updata the collection after it has
         * been constructed
         *
         * @param data = false {Object|Boolean} The data to bulk load in
         * @returns {Object} The internal data object
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        data(data) {
            data = data || false;
            if (data && typeof(data) === "object") {
                this._data = _.extend(this._data , data);
                this.scan();
                this.trigger("bulkUpdate", [data]);
            }

            return this._data;
        }

        /**
         * Checks to see if the collection has a field
         *
         * @param key {String} The field to check
         * @returns {boolean} False the field doesn't exist , True it does
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        has(key) {
            if (!(key || false)) {
                throw new Error("Key is required");
            }
            return this._fields.lastIndexOf(key) > -1;
        }

        /**
         * Initialize a field within the collection this has to happen to benefit from the additional collection methods
         * Simply using [collection].a = "b" wont work.
         *
         * @param name {String} the field name to be added
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        field(name) {
            if (!(name || false)) {
                throw new Error("Fieldname is required");
            }
            this.add(name);
        }

        /**
         * Returns a list of all the fields that are active on the collection at current
         *
         * @returns {Array} A list of all the field names that have been registered on the collection
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        fields() {
            return this._fields;
        }

        /**
         * Returns the number of fields that are currently on the collection
         *
         * @returns {number} The number of fields on the collection
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        length() {
            return this._length;
        }

        /**
         * Find data based on a query path i.e. a.b.c => c
         *
         * @param query = false {String|Boolean} the path that you wish to retrieve
         * @returns {*} The value of variable located at the path or FALSE
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        find(query) {
            if ( !(query ||  false)) {
                return null;
            }

            let base = this.data();
            let parts = query.split(PATH_SEPERATOR);

            parts.forEach((part) => base = base[ part ] || false);

            return base;
        }

        /**
         * Allows you to extend one collection with another.
         *
         * @param collection {Collection} The collection you wish to extend this collection with.
         * @returns {Collection} the collection after it has been extended
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        extend(collection) {
            if ( typeof(collection.isCollection) === "function" && collection.isCollection() ) {
                let fData = collection.data();
                this.data(fData);
                return this;
            } else {
                throw new Error("Collections can only be extended with other collections");
            }
        }

        /**
         * Scans the data and registers any fields against the collection
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        scan() {
            let _data = this.data();
            for (let key in _data ) {
                if (this._data.hasOwnProperty(key)) {
                    if ( !this.has(key) ) {
                        this.add(key);
                    }
                }
            }
        }

        /**
         * Adds a new field to the collection
         *
         * @param key {String} the name of the field that you wish to add
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        add(key) {
            this._length += 1;
            this.register(key);
        }

        /**
         * Registers a new field against the collection senting up the collections get and set methods
         *
         * @param key {String} The name of the field that you wish to register
         *
         * @event register fired when a new field is registered
         * @event register.<eventname> fired when a new field is registered
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        register(key) {
            if (!(key || false)) {
                throw new Error("Key is required");
            }

            if ( this.has(key) ) {
                throw new Error("Key is already registered and can't be registered again");
            }

            let prop = {};
            prop[key] = {};
            prop[key].set = (value) => {
                this._set(key,value);
            };
            prop[key].get = () => {
                return this._get(key);
            };

            Object.defineProperties(this, prop);

            this.trigger("register", [key]);
            this.trigger(`register.${ key }`, []);

            this._fields.push(key);
        }

        /**
         * Is called when you do collection.a = "b" and actions the setting of the data internal value to the RHS
         *
         * @param key {String} The field name that you want to update
         * @param data {*} The value to update to (i.e RHS off the assignment)
         *
         * @event set fired when the value is set
         * @event set.<key> fired when the valus is set
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _set(key , data) {
            if (!(key || false)) {
                throw new Error("Key is required");
            }

            data = typeof(data) !== "undefined" ? data : null;

            this.trigger("set" , [key,data, (this._data[key] || null)]);
            this.trigger(`set.${ key }`, [data, (this.data[key] || null)]);

            this._data[key] = data;
        }

        /**
         * Is called when you do collection.a and get the value of A
         *
         * @param key {String} the field name to get
         *
         * @returns {*|null} returns the value of the field or null if that field is not present
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _get(key) {
            if (!(key||false)) {
                throw new Error("Key is required");
            }

            this.trigger("get", [key]);
            this.trigger(`get.${ key }` , []);

            return this._data[key] || null;
        }


    }

    module.exports = Collection;

})();