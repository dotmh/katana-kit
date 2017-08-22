(function() {
    "use strict";

    let fs = require("fs");
    let path = require("path");
    let mkdirp = require("mkdirp");

    const ENCODING = "utf8";

    /**
     * Helpers used across tests
     *
     * @author Martin Haynes <oss@dotmh.com>
     */
    class Helpers {
        /**
         * Loads the contents of a file and parses it as JSON.
         *
         * @param from {string} The path of the file to load
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static loadJson(from) {
            return JSON.parse(fs.readFileSync(from, ENCODING));
        }

        /**
         * Creates a random Integer between the specified minimum and maximum values
         *
         * @param min {number} The minimum bound to use
         * @param max {number} The maximum bound to use
         *
         * @returns {number} The random number
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static randomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        /**
         * A Path helper to the project root path.
         *
         * @returns {string} The path to the root of the project
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static ROOT() {
            return ""+process.cwd();
        }

        /**
         * A Path helper to the project source code folder (absolute path)
         *
         * @returns {string} The path to the source code folder of the project
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static NODE_NINJA() {
            return path.join(Helpers.ROOT(), "katana-kit");
        }

        /**
         * A Path helper to the project source code components folder (absolute path)
         *
         * @returns {string} The path to the source code components folder of the project
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static COMPONENTS() {
            return path.join(Helpers.NODE_NINJA(), "components");
        }

        /**
         * A Path helper to the project spec (tests) folder (absolute path)
         *
         * @returns {string} The path to the spec folder of the project
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static SPEC() {
            return path.join(Helpers.ROOT(), "spec");
        }

        /**
         * A Path helper to the project source code components folder (absolute path)
         *
         * @returns {string} The path to the test mock data folder of the project
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static MOCK() {
            return path.join(Helpers.SPEC(), "mocks");
        }

        /**
         * A Path helper to a temp "scratch" folder (absolute path)
         *
         * @returns {string} The path to the scratch folder
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        static TMP() {
            let tmpSpace = `${Date.now()}-${Helpers.randomInt(0, 1000)}-${Helpers.randomInt(0, 1000)}`;
            let tmppath = path.join(Helpers.SPEC(), ".tmp", tmpSpace);
            mkdirp.sync(tmppath);
            return tmppath;
        }
    }

    module.exports = Helpers;

})();