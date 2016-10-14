(function(){
    "use strict";

    let _ = require("lodash");
    let Eventify = require("./eventify");

    const PATH_SEPERATOR = ".";
    
    // Collection
    // ==========
    // Collections are clever objects, they store data that your app needs much like an object literal. The difference is
    // that a collection can be observed. This is done by binding an event to the collection.
    //
    // A collection uses [field](#section-14) to register new fields. Due to the way ES5 works, this is essential to allow it to
    // be observed.
    //
    // All examples assume that the class has been created using
    // ```
    // let collection = new Collection({foo: "bar"});
    // ```
    //
    // Events
    // ------
    // The main purpose of the collection is to allow data contained within it to be observed.
    // for this you need to use Events (as collection extends [Eventify](eventify.html) ).
    // There are 6 events created by default you can observe
    //
    // ### Register
    // `register`
    // is triggered whenever any field is registered on the collection
    // the event object will contain the key of the field been registered.
    //
    // ```
    // collection.on("register" , (field) => console.log(field));
    // collection.field("samurai"); // $: samurai
    // ```
    //
    // ### Register.{KEY}
    // `register.{KEY}`
    // is triggered whenever the specified field is registered on the collection
    //
    // ```
    // collection.on("register.samurai" , () => console.log('Japanese warriors'));
    // collection.field("samurai"); // $: Japanese warriors
    // ```
    //
    // ### Get
    // `get`
    // is triggered whenever any field is retrieved (got) on the collection
    // the event object will contain the key of the field been retrieved.
    //
    // ```
    // collection.on("get" , (field) => console.log(field));
    // collection.samurai; // $: samurai
    // ```
    //
    // ### Get.{KEY}
    // `get.{KEY}`
    // is triggered whenever the field specified by {KEY} is retrieved (got) on the collection
    //
    // ```
    // collection.on("get.samurai" , () => console.log('Japanese warriors'));
    // collection.samurai; // $: Japanese warriors
    // ```
    //
    // ### Set
    // `set`
    // is triggered whenever any field is set on the collection
    // the event object will contain the key of the field been set and the value its set to.
    //
    // ```
    // collection.on("set" , (field, value) => console.log(`${field} is now ${value}`));
    // collection.samurai = "Japanese Warriors"; // $: samurai is now Japanese Warriors
    // ```
    //
    // ### Set.{KEY}
    // `set.{KEY}`
    // is triggered whenever the field specified by {KEY} is set on the collection
    // the event object will contain the value the key was set too
    //
    // ```
    // collection.on("set.samurai" , (value) => console.log(value));
    // collection.samurai = "Japanese Warriors"; // $: Japanese warriors
    // ```

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

        // isCollection
        // ------------
        // Identifies the class as a collection, this is used by other bits of code to check that a class is a collection
        // or it extends collection
        //
        // ### Usage
        // ```
        // collection.isCollection // => true
        // ```
        isCollection() {
            return true;
        }

        // toObject
        // --------
        // Outputs the collection data as an object literal, alias of calling `collection.data()`
        //
        // ### Usage
        // ```
        // collection.toObject(); // => {foo: bar}
        // ```
        toObject() {
            return this.data();
        }

        // toString
        // --------
        // Coverts the collection data to a string, using JSON encoding.
        //
        // ### Usage
        // ```
        // collection.toString() // => '{"foo" : "bar"}'
        // ```
        toString() {
            return JSON.stringify(this.data());
        }

        // data
        // ----
        // Returns all the data been stored in the collection as an object literal. The collection uses an object
        // internally to store the data so this simple returns that. When a parameter is passed function is also used
        // to add data to a collection. The data been added __MUST__ be an object. This allows the collection's data to
        // be added to or extended at a later time.
        //
        // ### Usage
        // ```
        // collection.data({foo: 'bar'}); // => {foo: bar}
        // collection.data(); // => {foo.bar}
        // ```
        data(data) {
            data = data || false;
            if (data && typeof(data) === "object") {
                this._data = _.extend(this._data , data);
                this.scan();
            }

            return this._data;
        }

        // has
        // ---
        // Checks to see if the collection has a field registered against it.
        // It will return `false` if it can't be found and `true` if it can.
        //
        // ### Usage
        //
        // ```
        // <CLASS>.has("foo");
        // ```
        has(key) {
            if (!(key || false)) {
                throw new Error("Key is required");
            }
            return this._fields.lastIndexOf(key) > -1;
        }

        // field
        // -----
        //
        // Initialize a field within the collection this has to happen to benefit from the additional collection methods
        // Simply using `[collection].a = "b"` wont work.
        //
        // ### Usage
        //
        // ```
        // <CLASS>.field("foo");
        // ```
        //
        // then you can do
        //
        // ```
        // <CLASS>.foo = "bar";
        // <CLASS>.foo; // => "bar"
        // ```
        // as you normally would.
        field(name) {
            if (!(name || false)) {
                throw new Error("Fieldname is required");
            }
            this.add(name);
        }

        // fields
        // ------
        //
        // Returns an Array of all the fields that are active on a collection at the time it is called.
        // This will only return fields that have been registered with [field](#section-14)
        //
        // ### Usage
        //
        // ```
        // <CLASS>.fields();
        // ```
        fields() {
            return this._fields;
        }

        // length
        // ------
        // Returns the size of the collection, i.e. how many fields have been registered, similar to Javascripts
        // Array.length method.
        //
        // ### Usage
        // ```
        // <CLASS>.length
        // ```
        length() {
            return this._length;
        }

        // find
        // ----
        // Find allows you to get at the internal data of the collection using a string query, it checks at every
        // stage whether the key exists of not, thus making it safe to run at any point.
        // if the query finds a value then that value will be returned, if not `false` will be returned
        //
        // ### Usage
        // ```
        // collection.find("foo"); // => "bar"
        // collection.find("a.b.c"); // => false
        // ```
        find(query) {
            if ( !(query ||  false)) {
                return null;
            }

            let base = this.data();
            let parts = query.split(PATH_SEPERATOR);

            parts.forEach((part) => base = base[ part ] || false);

            return base;
        }

        // extend
        // ------
        // Allows one collection to be extended with another. Unlike `collection.data` both sides must be a collection
        //
        // ### Usage
        // ```
        // collection.extend(new Collection({"ninja" : "sword"}); // => {foo: "bar", ninja: "Sword"}
        // ```
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