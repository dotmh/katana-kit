(function(){
    "use strict";

    let Helpers = require("../helpers");
    let expect = require("chai").expect;
    let path = require("path");

    let FileExt = require(`${Helpers.COMPONENTS()}/file_ext`);

    const PATH = `${Helpers.MOCK()}/file_ext`;
    const FILE = "somefile.txt";

    describe('FileExt' , () => {

        describe('#file_exit()' , () => {

            it("should return a fs.stats on success" , () => {
                let fullPath = path.join(PATH,FILE);
                let res = FileExt.file_exist(fullPath);

                expect(res.isFile()).to.be.true;
                expect(res.isDirectory()).to.be.false;
            });

            it("should return a mock fs.stats on failure" , () => {
                let fullPath = "foo/bar/foobar.txt";
                let res = FileExt.file_exist(fullPath);

                expect(res.isFile()).to.be.false;
                expect(res.isDirectory()).to.be.false;
            });

            it("should throw an error when no filename is passed" , () => {

                let fn = () => {
                   FileExt.file_exist();
                };

                expect(fn).to.throw("Filename is required");

            });

        });

        describe('#file_exists()' , () => {

            it("should return true on success" , () => {
                let fullPath = path.join(PATH, FILE);

                expect(FileExt.file_exists(fullPath)).to.be.true;
            });

            it("should return false on failure" , () => {
                let fullPath = "foo/bar/foobar.txt";

                expect(FileExt.file_exists(fullPath)).to.be.false;
            });

        });

    });

})();


