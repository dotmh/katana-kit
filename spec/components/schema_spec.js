(function(){
    "use strict";

    let expect = require("chai").expect;
    let path = require("path");

    let Helpers = require("../helpers");
    let Schema = require(`${Helpers.COMPONENTS()}/schema`);

    const MOCK_PATH = path.join(Helpers.MOCK() , "schema");
    const VALID_SCHEMA = "valid_schema.json";
    const VALID_FILE = "valid_file.json";
    const INVALID_JSON_SCHEMA = "invalid_json_schema.json";

    describe('Schema' , () => {

        describe('#constructor()' , () => {

            it("should throw an error when now schema is passed" , () => {
                let fn = () => {
                    new Schema();
                };

                expect(fn).to.throw("A Json Schema is required");
            });

            it("should initialize an empty class" , () => {

                let schema = "schema.json";
                let subject = new Schema(schema);

                expect(subject.schemaFile).to.equal(schema);
                expect(subject.schema).to.be.equal(null);
                expect(subject._parsed).to.be.false;
                expect(subject.types).to.deep.equal({});
                expect(subject.required).to.be.an("array");
                expect(subject.optional).to.be.an("array");

            });
        });

        describe("#loadSchema()" , () => {

            it("should load a valid json file" , () => {

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let mock = Helpers.loadJson(mock_valid);

                let subject = new Schema(mock_valid);

                expect(subject.loadSchema()).to.deep.equal(mock);

            });

            it("should throw an error if the schema doesn't exist", () => {
                let fakeit = "foobar.json";

                let fn = () => {
                    let subject = new Schema(fakeit);
                    subject.loadSchema();
                };

                expect(fn).to.throw(`The schema ${ fakeit } doesn't exist`);
            });

            it("shold throw an error if the schema is not a valid json file" , () => {

                let mock_invalid_json = path.join(MOCK_PATH , INVALID_JSON_SCHEMA);

                let fn = () => {
                    let subject = new Schema(mock_invalid_json);
                    subject.loadSchema();
                };

                expect(fn).to.throw(`Can not load the schema file ${ mock_invalid_json }`);

            });

            it("should act as a getter when the schema is already loaded i.e. cached" , () => {

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let mock = Helpers.loadJson(mock_valid);

                let subject = new Schema(mock_valid);

                subject.loadSchema();
                expect(subject.loadSchema()).to.deep.equal(mock);

            });

        });

        describe("#parseSchema()" , () => {

            it("should pass a schema in to an internal processing format" , () => {

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);

                let subject = new Schema(mock_valid);

                subject.loadSchema();
                subject.parseSchema();

                expect(subject._parsed).to.be.true;
                expect(subject.required).to.have.length.above(0);
                expect(subject.optional).to.have.length.above(0);
                expect(subject.types).to.include.keys("name");

            });

        });

        describe("#analyse()" , () => {

            it("should analyse an object" , () => {

                let mock_object = {
                    "a" : "string",
                    "b" : 1,
                    "c" : true,
                    "d" : {
                        "aa" : "string"
                    }
                };

                let mock_valid = path.join(MOCK_PATH , VALID_SCHEMA);
                let subject = new Schema(mock_valid);

                let report = subject.analyse(mock_object);

                expect(report.found).to.have.length.above(0);
                expect(report.found).to.include("c");
                expect(report.foundTypes).to.include.keys("a");
                expect(report.foundTypes.a).to.equal("string");
                expect(report.foundTypes.b).to.equal("number");
                expect(report.foundTypes.c).to.equal("boolean");

            });

            it("should throw an error on non objects" , () => {

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let subject = new Schema(mock_valid);
                let fn = () => {
                    subject.analyse("some string");
                };

                expect(fn).to.throw("Schema can only validate Objects");

            });

        });

        describe("#valid()" , () => {

            it("should return true for a valid object", () => {

                let mock_valid_object = {
                    "name": "hello",
                    "a": true,
                    "b": 4,
                    "d": "string",
                    "e": {
                        "aa": false
                    }
                };

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let subject = new Schema(mock_valid);

                expect(subject.valid(mock_valid_object)).to.be.true;

            });

            it("should return false for an invalid object", () => {

                let mock_invalid_object = {
                    "name": true,
                    "A": true,
                    "b": 4,
                    "d": "string",
                    e: [false]
                };

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let subject = new Schema(mock_valid);

                expect(subject.valid(mock_invalid_object)).to.be.false;

            });

            it("should fire an schema.invalid event for an invalid object", (done) => {

                let mock_invalid_object = {
                    "name": true,
                    "A": true,
                    "b": 4,
                    "d": "string",
                    e: [false]
                };

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let subject = new Schema(mock_valid);

                subject.on("schema.invalid" , (report) => {
                    expect(report.valid).to.be.false;
                    expect(report).to.have.property("fields");
                    expect(report).to.have.property("required");
                    expect(report).to.have.property("types");
                    done();
                });

                expect(subject.valid(mock_invalid_object)).to.be.false;

            });

        });

        describe("#invalid()" , () => {

            it("should return false for a valid object", () => {

                let mock_valid_object = {
                    "name": "hello",
                    "a": true,
                    "b": 4,
                    "d": "string",
                    "e": {
                        "aa": false
                    }
                };

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let subject = new Schema(mock_valid);

                expect(subject.invalid(mock_valid_object)).to.be.false;

            });

            it("should return true for an invalid object", () => {

                let mock_invalid_object = {
                    "name": true,
                    "A": true,
                    "b": 4,
                    "d": "string",
                    e: [false]
                };

                let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                let subject = new Schema(mock_valid);

                expect(subject.invalid(mock_invalid_object)).to.be.true;

            });

        });

        describe("validators" , () => {

            describe("#_validateRequires()" , () => {

                it("should return true is all the required fields are present" , () => {

                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found = ["name", "d"];

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateRequires(mock_found).valid).to.be.true;


                });

                it("should return false if one required field is missing" , () => {

                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found = ["name"];

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateRequires(mock_found).valid).to.be.false;

                });

                it("should return false if no required fields are present" , () => {

                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found = [];

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateRequires(mock_found)).to.be.false;

                });

            });

            describe("#_validateTypes()" , () => {

                it("should return true is all the field types are correct" , () => {
                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found_types = {
                        "name" : "string",
                        "a" : "boolean",
                        "b" : "number",
                        "d" : "*",
                        "e" : "object",
                        "aa" : "*"
                    };

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateTypes(mock_found_types).valid).to.be.true;

                });

                it("should return false is any of the field types are incorrect" , () => {
                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found_types = {
                        "name" : "string",
                        "a" : "number",
                        "b" : "number",
                        "d" : "*",
                        "e" : "object",
                        "aa" : "*"
                    };

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateTypes(mock_found_types).valid).to.be.false;
                });

            });

            describe("#_validateFields()" , () => {

                it("should return true if only schema fields are present", () => {
                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found = ["name", "a", "b", "d", "e" , "aa"];

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateFields(mock_found).valid).to.be.true;
                });

                it("should return false if other fields outside the schema are present", () => {
                    let mock_valid = path.join(MOCK_PATH, VALID_SCHEMA);
                    let subject = new Schema(mock_valid);
                    let mock_found = ["name", "a", "b", "d", "e" , "aa", "x"];

                    subject.loadSchema();
                    subject.parseSchema();

                    expect(subject._validateFields(mock_found).valid).to.be.false;
                });

            });

        });

    });

})();