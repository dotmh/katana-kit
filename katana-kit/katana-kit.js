(function(){
    "use strict";

    const FOLDER = './components';

    // KATANA KIT
    // ==========
    // [![CircleCI](https://circleci.com/gh/dotmh/katana-kit.svg?style=svg)](https://circleci.com/gh/dotmh/katana-kit)
    // [![Coverage Status](https://coveralls.io/repos/github/dotmh/katana-kit/badge.svg?branch=master)](https://coveralls.io/github/dotmh/katana-kit?branch=master)
    // [![Known Vulnerabilities](https://snyk.io/test/github/dotmh/katana-kit/badge.svg)](https://snyk.io/test/github/dotmh/katana-kit)
    // [![bitHound Overall Score](https://www.bithound.io/github/dotmh/katana-kit/badges/score.svg)](https://www.bithound.io/github/dotmh/katana-kit)
    // [![bitHound Dependencies](https://www.bithound.io/github/dotmh/katana-kit/badges/dependencies.svg)](https://www.bithound.io/github/dotmh/katana-kit/master/dependencies/npm)
    // [![Dependency Status](https://gemnasium.com/badges/github.com/dotmh/katana-kit.svg)](https://gemnasium.com/github.com/dotmh/katana-kit)
    //
    // A Kit for building Javascript apps, using Common JS. Aimed at Node though some classes will work in both node
    // and the browser.
    //
    // Installation
    // ------------
    // Recommend that you use [Yarn](https://yarnpkg.com/) rather than NPM.
    //
    // ### Yarn
    // `yarn add katana-kit`
    //
    // ### NPM
    // `npm install --save katana-kit`
    //
    // Usage
    // -----
    // You can include the entire library in your code with
    // `const katana = require('katana-kit')`
    // or see below to require the indivisual components.
    module.exports = {
        // Collection
        // ----------
        // A collection is a specialist object that can be observed
        //
        // ### Usage
        // ```
        // let Collection = require('katana-kit').Collection;
        // ```
        // [Documentation](collection.html)
        Collection: require(FOLDER+'/collection'),

        // Eventify
        // --------
        // Turn any class into an event emitter/handler
        //
        // ### Usage
        // ```
        // let Eventify = require('katana-kit').Eventify;
        //
        // class MyClass extends Eventify
        // {
        // // ...
        // }
        // ```
        // [Documentation](eventify.html)
        Eventify: require(FOLDER+'/eventify'),

        // FileExt
        // ----------
        // __! NODE ONLY__
        //
        // A collection of functions that extend build in node `fs`
        //
        // ### Usage
        // ```
        // let FileExt = require('katana-kit').FileExt;
        // ```
        // [Documentation](file_ext.html)
        FileExt: require(FOLDER+'/file_ext'),

        // JsonFile
        // --------
        // __! NODE ONLY__
        //
        // Wrap a Json file in a collection and validate it with schemas. Adding a powerful and standard API to access
        // JSON files in your app.
        //
        // ### Usage
        // ```
        // let JsonFile = require('katana-kit').JsonFile;
        // ```
        // [Documentation](json_file.html)
        JsonFile: require(FOLDER+'/json_file'),

        // Logger
        // ------
        // A wrapper round `console.log` to help standardise log messages, making them easier to read and parse.
        //
        // ### Usage
        // ```
        // let Logger = require('katana-kit').Logger;
        // ```
        // [Documentation](logger.html)
        Logger: require(FOLDER+'/logger'),

        // Schema
        // ------
        // Validate Javascript objects against a defined Schema (in JSON)
        //
        // ### Usage
        // ```
        // let Schema = require('katana-kit').Schema;
        // ```
        // [Documentation](schema.html)
        Schema: require(FOLDER+'/schema')
    };

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