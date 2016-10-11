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
    let chalk = require("chalk");

    const LOGFORMAT = "<%= app %> <%= env %> [<%= level %>] : <%= date %> - <%= message %>";
    const COLOR = {
        "error" : "red",
        "warn" : "yellow",
        "info" : "green",
        "todo" : "cyan",
        "debug" : "blue"
    };
    const MAP = {
        "error" : "error",
        "err" : "err",
        "warn" : "warn",
        "warning" : "warning",
        "info" : "info",
        "debug" : "debug",
        "todo" : "todo"
    };

    const DEFAULT_LEVEL = "info";
    const DEFAULT_ENV = "dev";
    const APP = chalk.red.bold("Titan");

    class Logger {
        /**
         * Singleton
         *
         * @returns {Logger} return a single instance of Logger
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static instance() {
            Logger._instance = Logger._instance || null;

            if ( Logger._instance === null ) {
                Logger._instance = new Logger();
            }

            return Logger._instance;
        }

        /**
         * Initializes the class ready for use
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        constructor () {
            this._template = _.template(LOGFORMAT);
            this._messages = [];
        }

        /**
         * Logs a message
         *
         * @param levelOrMessage {string|*} Can ether be a mesasge or the level you wish to log at
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @private
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
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

        /**
         * A static version of _log that logs a message
         *
         * @see Logging::_log
         *
         * @param level {string|*} Can ether be a message or the level you wish to log at
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static log(level, message) {
            Logger.instance()._log(level, message);
        }

        /**
         * Log a message at level error
         *
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static error(message) {
            Logger.log("error" , message );
        }

        /**
         * Log a message at level warning
         *
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static warning(message) {
            Logger.log("warn" , message);
        }

        /**
         * Log a message at level warn
         *
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static warn(message) {
            Logger.log("warn" , message);
        }

        /**
         * Log a message at level info
         *
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static info(message) {
            Logger.log("info" , message);
        }

        /**
         * Log a message at level debug
         *
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static debug(message) {
            Logger.log("debug" , message);
        }

        /**
         * Logs a Todo message
         *
         * @param message {*} The message to log if its an object it will serialized to JSON before been displayed
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static todo(message) {
            Logger.log("todo" , message);
        }

    }

    module.exports = Logger;

})();