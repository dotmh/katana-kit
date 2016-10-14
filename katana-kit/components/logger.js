(function(){
    "use strict";

    // Logger
    // ======
    // is a simple (really simple) helper library for logging in Node. It makes use of the console, but wraps it with some
    // boilerplate code to make it a bit more useful.


    let _ = require("lodash");
    let chalk = require("chalk");

    // Template to control the logging format
    // see : <http://underscorejs.org/#template>
    //
    // - app : Is the name of the App
    // - env : The current environment from NODE_ENV
    // - level : The level that you logging at
    // - date : The date that the message was logged
    // - message: The message to log
    const LOGFORMAT = "<%= app %> <%= env %> [<%= level %>] : <%= date %> - <%= message %>";

    // Defines the color to use for each level, for colors see: <https://github.com/chalk/chalk#colors>
    const COLOR = {
        "error" : "red",
        "warn" : "yellow",
        "info" : "green",
        "todo" : "cyan",
        "debug" : "blue"
    };

    // Maps different words that mean the same level to a level i.e. warn and warning are both warning
    const MAP = {
        "error" : "error",
        "err" : "err",
        "warn" : "warn",
        "warning" : "warning",
        "info" : "info",
        "debug" : "debug",
        "todo" : "todo"
    };

    // Sets the default value to log at if now value is specified
    const DEFAULT_LEVEL = "info";

    // Sets the default Env if no environment is set
    const DEFAULT_ENV = "dev";

    // Sets the app name TODO Calculate this from the actual package.json name
    const APP = chalk.red.bold("Katana");


    class Logger {
        // instance
        // --------
        // Since this is a wrapper round the console and there is only one console, then we use the singleton pattern
        // in order to make sure we only ever use one logger instance.
        //
        // __Ideally you should be using the helper methods instead__
        //
        // ### Usage
        // ```
        // Logger.instance()._log("warning", "some message");
        // ```
        static instance() {
            Logger._instance = Logger._instance || null;

            if ( Logger._instance === null ) {
                Logger._instance = new Logger();
            }

            return Logger._instance;
        }

        constructor () {
            this._template = _.template(LOGFORMAT);
            this._messages = [];
        }

        // _log
        // ----
        // Logs a message to the console using the template and rules specified in the constants.
        //
        // __Ideally you should be using the helper methods instead__
        //
        // ### Usage
        // ```
        // logger._log("warning", "some message");
        // ```
        _log(levelOrMessage, message) {
            let level = (message||false) ? levelOrMessage : DEFAULT_LEVEL;
            let msg = (message||false) ? message : levelOrMessage;
            let now = ""+new Date();
            let env = process.env.NODE_ENV || DEFAULT_ENV;
            let out = this._template({
                "app" : APP,
                "env" : env,
                "date" : now,
                "level" : chalk.bold(level.toUpperCase()),
                "message" : (typeof(msg) === "object" ? JSON.stringify(msg) : msg)
            });
            this._messages.push(chalk.stripColor(out));
            console.log(chalk[this._color(level)](out));
        }

        /**
         * Converts a logging level to a color
         *
         * @param forLevel {string} The logging level to covert
         * @returns {string} The calculate color once convert
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        _color(forLevel) {
            let rLevel = MAP[forLevel] || DEFAULT_LEVEL;
            return COLOR[rLevel];
        }


        // Log
        // ---
        // Logs a message to the console wrapping it in the template specified in the constants
        // see [Logger._log]()
        //
        // _It will serialised non-string messages to JSON before displaying it_
        //
        // ### Usage
        // ```
        // Logger.log('info' , 'some message')
        // ```
        // will output the message
        //
        // `$> Katana dev [info] : Fri Oct 14 2016 14:52:13 GMT+0100 (BST) - some message`
        static log(level, message) {
            Logger.instance()._log(level, message);
        }

        // error
        // -----
        // Helper method to log a message at level Error
        // see [Logger.log]()
        //
        // ### Usage
        // ```
        // Logger.error("It has all gone wrong!");
        // ```
        static error(message) {
            Logger.log("error" , message );
        }

        // warning
        // -------
        // Helper method to log a message at level Warning
        // see [Logger.log]()
        //
        // ### Usage
        // ```
        // Logger.warning("You are about to burn out");
        // ```
        static warning(message) {
            Logger.log("warn" , message);
        }

        // warn
        // ----
        // Helper method to log a message at level Warning
        // see [Logger.log]()
        //
        // ### Usage
        // ```
        // Logger.warn("You are about to burn out");
        // ```
        static warn(message) {
            Logger.log("warn" , message);
        }

        // info
        // ----
        // Helper method to log a message at level Info
        // see [Logger.log]()
        //
        // ### Usage
        // ```
        // Logger.info("Connection Established");
        // ```
        static info(message) {
            Logger.log("info" , message);
        }

        // debug
        // -----
        // Helper method to log a message at level debug
        // see [Logger.log]()
        //
        // ### Usage
        // ```
        // Logger.debug("I am about to do something");
        // ```
        static debug(message) {
            Logger.log("debug" , message);
        }

        // todo
        // ----
        // Helper method to log a message at level Todo
        // see [Logger.log]()
        //
        // ### Usage
        // ```
        // Logger.todo("Something you wanna do");
        // ```
        static todo(message) {
            Logger.log("todo" , message);
        }

    }

    module.exports = Logger;

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