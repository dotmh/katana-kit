(function(){
    "use strict";

    const fs = require("fs");
    const _ = require("lodash");
    const FileExt = require("./file_ext");
    const Eventify = require("./eventify");
    const Logger = require('./logger');

    // Which coding system to use for the RAW Json file
    const ENCODING = "utf8";

    // The event fired when the Schema is invalid. 
    const EVENT_INVALID = "schema.invalid";

    // Schema
    // ======
    // Schema's allow you to test objects match a certain schama, written in JSON. With Schema it makes it easy to 
    // verify the object is valid. 
    //
    // Schema Files
    // ============
    //
    // A schama file is a simple JSON file that contains an object schema. It is used by the schema class to validate objects against. 
    // It must contain only a single top level schema object, though it can contain as many nested schema objects as required. 
    //
    // Schema Definition Object
    // ------------------------
    // The schema definition object (SDO) is used to define the properties of the schema. It is a Javascript Object litteral with the following keys 
    //
    // ### Type
    // Type defines the Javascript type that the key's value should represent as a string. i.e. `boolean` type would be `"boolean"`. 
    // Sometimes you may want to allow anytype that is represented with a `"*"`. 
    //
    // _Example_
    // ```
    //     {
    //         "type" : "string"
    //     }
    // ```
    //
    // The following types are valid 
    // - Boolean.
    // - Null.
    // - Undefined.
    // - Number.
    // - String.
    // - Object.
    // - Array.
    //
    // ### Required 
    // Whether or not the field is required, it should contain a `boolean`, `true` or `false`. 
    //
    // _Example_
    // ```
    //     {
    //         "required" : true
    //     }
    // ```
    //
    // Keys
    // ----
    // A Schema should contain the same keys as the object been tested. i.e if the object you wish to test was 
    // ```
    //     {
    //         "foo" : "hello world",
    //         "bar" : 1
    //     }
    // ```
    //
    // Then you would need to have the keys `foo` and `bar` in your schema object. 
    //
    // Value
    // -----
    // A Schema key should contain a value of a SDO, or when it's value in the object been tested is a nested object, then it should contain an object litteral. This object littearl should have the same keys as the nested object been tested, and again it should contain a value of ether a SDO or another nested object. 
    //
    // Example
    // -------
    // ```
    //     {
    //     "name" : {"type" : "string" , "required" : true },
    //     "a" : {"type" : "boolean" , "required" : false},
    //     "b" : {"type" : "number" },
    //     "d" : {"required" : true},
    //     "e" : {
    //         "aa" : {"type" : "*" }
    //     }
    //     }
    // ```
    //
    class Schema extends Eventify {
        // Schema
        // ------
        // Creates a new instance of the schema for an object objects can be tested against. 
        //
        // ### Example 
        // ```
        //     let schema = new Schema("path/to/schema.json");
        // ```
        constructor(schemaLocation) {
            if ( !(schemaLocation || false) ) {
                throw new Error("A Json Schema is required");
            }

            super();

            this.schemaFile = schemaLocation;
            this.schema = null;
            this._parsed = false;

            this.types = {};
            this.required = [];
            this.optional = [];

        }

        // Valid
        // -----
        // Checks whether the object passed to `object` is valid.
        // returns `true` for valid , and `false` for not valid. 
        //
        // ### Example 
        // ```
        //  if(schema.valid({...})) {
        //      ... Do Something    
        //  }
        // ```
        valid(object) {

            this.loadSchema();
            this.parseSchema();

            let validate = this._validate(this.analyse(object));

            if (!validate.valid ) {
                this.trigger(EVENT_INVALID, [validate]);
            }

            return validate.valid;
        }

        // Invalid
        // -------
        // Similar to _Valid_ this returns `true` for a invalid object passed as `object`
        // and `false` for a valid object. 
        //
        // ### Example
        // ```
        //  if(schema.invalid({...})) {
        //      ... Do Something    
        //  }
        // ```
        invalid(object) {
            return !this.valid(object);
        }

        // __Private API beyond this point!__

        /**
         * Loads a Schema Json file into the class
         *
         * @returns {Object} the object that represents the Schema
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        loadSchema() {
            if ( this.schema === null ) {
                if (!FileExt.file_exists(this.schemaFile)) {
                    throw new Error(`The schema ${ this.schemaFile } doesn't exist`);
                }

                try {
                    this.schema = JSON.parse(fs.readFileSync(this.schemaFile), ENCODING);
                } catch (err) {
                    throw new Error(`Can not load the schema file ${ this.schemaFile }`);
                }
            }

            return this.schema;
        }

        /**
         * Process the Schema in to testable data
         *
         * @param schema = null {Object} The Schema to object to parse
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        parseSchema(schema) {
            schema = schema || this.schema;
            if ( !this._parsed ) {
                for (let key in schema) {
                    if (schema.hasOwnProperty(key)) {
                        let value = schema[key];
                        if (this._isField(value)) {
                            this._processField(key, value);
                        } else {
                            this.types[key] = "object";
                            this.optional.push(key);
                            this.parseSchema(value);
                        }
                    }
                }
                this._parsed = true;
            }
        }

        /**
         * Analyses the Object that you are testing to be valid and creates a set of tokens for testing later on
         *
         * @param object {Object} The object that you wish to analyse
         *
         * @returns {{found: Array, foundTypes: {}}} an analyses report containing the results of the analyse
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        analyse(object) {
            if( !this._isObject(object)) {
                throw new Error("Schema can only validate Objects");
            }

            let result = {found: [], foundTypes:{}};

            for(let key in object) {
                if ( object.hasOwnProperty(key) ) {
                    let value = object[key];
                    if ( this._smartType(value) === "object") {
                        let analyse = this.analyse(value);
                        let found = analyse.found;
                        let foundTypes = analyse.foundTypes;

                        result.found.concat(found);
                        result.foundTypes = _.extend(result.foundTypes , foundTypes);

                    }

                    result.found.push(key);
                    result.foundTypes[key] = this._smartType(value);

                }
            }

            return result;
        }

        /**
         * Used to validate an Object against the JSON Schema
         *
         * @see analyse
         *
         * @param report {{found: Array, foundTypes: {}}} The report generated by the analyser
         *
         * @returns {Boolean} true is valid agains the schema , false its not.
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _validate(report) {

            let found = report.found;
            let foundTypes = report.foundTypes;

            Logger.info(`VALIDATE REPORT, ${JSON.stringify(report)}`);

            let validateFields      = this._validateFields(found);
            let validateRequires    = this._validateRequires(found);
            let validateTypes       = this._validateTypes(foundTypes);

            return {
                valid: (validateFields.valid && validateRequires.valid && validateTypes.valid),
                fields: validateFields.errors,
                required: validateRequires.errors,
                types: validateTypes.errors
            };

        }

        /**
         * Validates if all the required fields are in the Object
         *
         * @param found {Array} The field list from the analyser report
         *
         * @returns {boolean} true it has all the required fields, false it does not
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _validateRequires(found) {
            let isValid = true;
            let error = [];

            if ( !!this.required.length && !found.length) {
                return false;
            }

            this.required.forEach((required) => {
               if (found.lastIndexOf(required) === -1) {
                   error.push(`REQUIRED field ${ required } is missing`);
                   isValid = false;
               }
            });

            return {valid: isValid , errors: error};
        }

        /**
         * validates the type of the actual object matches the types described in the schema
         *
         * @param foundTypes {{}} The foundType returned by the analyser
         *
         * @returns {boolean} True all the types are valid , false they aren't
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _validateTypes(foundTypes) {
            let isValid = true;
            let error = [];
            let dontTest = ["undefined", "null", undefined, null];

            for(let key in this.types ) {
                if( this.types.hasOwnProperty(key)) {
                    let type = this.types[key];

                    if (type !== "*" && dontTest.lastIndexOf(foundTypes[key]) === -1) {
                        if(foundTypes[key] !== type) {
                            error.push(`${ key } should have been ${ type } but was ${ foundTypes[key] }`);
                            isValid = false;
                        }
                    }
                }
            }

            return {valid: isValid , errors: error};
        }

        /**
         * Checks that every field in the oject is ether required or optional in the schema
         *
         * @param found {Array} The field list from the analyser report
         *
         * @returns {boolean} true they are all accounted for in the schema , false they dont
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _validateFields(found) {
            let isValid = true;
            let error = [];

            found.forEach((field) => {
                if (this.required.lastIndexOf(field) === -1 && this.optional.lastIndexOf(field) === -1) {
                    error.push(`${ field } is not allowed`);
                    isValid = false;
                }
            });

            return {valid: isValid , errors: error};
        }

        /**
         * Parses and process the validation for a set field in the schema
         *
         * @param name {string} The field name
         * @param rules {{type : String , required : Boolean}} The validation rules for that field
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _processField(name, rules) {
            this.types[name] = rules.type || "*";
            if (rules.required || false ) {
                this.required.push(name);
            } else {
                this.optional.push(name);
            }
        }

        /**
         * Checks to see if the object is a field or child object using Duck Typing
         *
         * @param object {{}} The field that you wish to test
         *
         * @returns {boolean} True it is a field , false its a child object
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _isField(object) {
            return (
                (object || false) &&
                this._isObject(object) &&
                (object.type || false) || (object.required || false)
            );
        }

        /**
         * Gets the type of a var , its smart as it can tell the difference between an Object and an Array
         *
         * @param of {*} What you wish to test
         *
         * @returns {string} The type name
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _smartType(of) {



            let dumbType = typeof(of);
            if ( dumbType !== "object") {
                return dumbType;
            } else {
                let smartType = Array.isArray(of) ? "array" : "object";
                return smartType;
            }
        }

        /**
         * Simple function to check if something is an object or not
         *
         * @see _smartType
         *
         * @param againt {*} What you wish to test
         *
         * @returns {boolean} True if it is an object , false it is not
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _isObject(againt) {
            return this._smartType(againt) === "object";
        }
    }

    module.exports = Schema;

})();
/***
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
*/