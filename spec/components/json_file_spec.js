(function(){
    "use strict";

    let expect = require("chai").expect;
    let path   = require("path");
    let fs     = require("fs");

    let Helpers = require("../helpers");
    let JsonFile = require(`${Helpers.COMPONENTS()}/json_file`);

    const MOCK_FOLDER = `${Helpers.MOCK()}/json_file/`;
    const MOCK_VALID_JSON = "valid.json";
    const MOCK_INVALID_JSON = "invalid.json";
    const MOCK_VALID_SCHEMA = "valid_schema.json";
    const MOCK_VALID_DATA = "valid_data.json";

    let loadMockJson = () => {
        return Helpers.loadJson(path.join(MOCK_FOLDER , MOCK_VALID_JSON));
    };

    describe('JsonFile' , () => {

        describe('#constructor()' , () => {

            it("should set the filename to null if no file name is passed" , () => {
                let subject = new JsonFile();
                expect(subject._filename).to.equal(null);
            });

            it("should set the filename if a file name is passed" , () => {
                let jsonfile = "foobar.json";
                let subject = new JsonFile(jsonfile);
                expect(subject._filename).to.equal(jsonfile);
            });

            it("should allow you to set a valid Schema" , () => {
                let schema = path.join(MOCK_FOLDER, MOCK_VALID_SCHEMA);
                let subject = new JsonFile(null, schema);
                expect(subject._schema).to.not.equal(null);
            });

        });

        describe('#filename()' , () => {

            it("should set the filename if passed" , () => {
                let jsonfile = "foobar.json";
                let subject = new JsonFile();

                subject.filename(jsonfile);
                expect(subject._filename).to.equal(jsonfile);
            });

            it("should return a previously set filename" , () => {
                let jsonfile = "foobar.json";
                let subject = new JsonFile(jsonfile);

                expect(subject.filename()).to.equal(jsonfile);
            });

            it("should return the filename after it sets it" , () => {
                let jsonfile = "foobar.json";
                let subject = new JsonFile();

                expect(subject.filename(jsonfile)).to.equal(jsonfile);
            });

        });

        describe("#exists()" , () => {

            it("should return true if the file exists" , () => {
                let validPath = path.join(MOCK_FOLDER , MOCK_VALID_JSON);
                let subject = new JsonFile(validPath);

                expect(subject.exists()).to.be.true;
            });

            it("should return false if the file doesn't exist" , () => {
                let invalidPath = path.join(MOCK_FOLDER , "foobar.json");
                let subject = new JsonFile(invalidPath);

                expect(subject.exists()).to.be.false;

            });

        });

        describe("#_function_or_die()", () => {

            it("should throw an error on a non function", () => {

                let subject = new JsonFile();

                let fn = () => subject._function_or_die("foo", "foo");

                expect(fn).to.throw("foo must be a function!");
            });

        });

        describe("#loadSync()" , () => {

            it("should load a valid JSON file and return a populated collection" , () => {
                let validPath = path.join(MOCK_FOLDER , MOCK_VALID_JSON);
                let mockdata = loadMockJson();
                let subject = new JsonFile(validPath);
                let res = subject.loadSync();

                expect(res.isCollection()).to.be.true;
                expect(res.length()).to.be.above(0);
                expect(res.data()).to.deep.equal(mockdata);

            });

            it("should throw an exception on an invalid file" , () => {
                let invalidPath = path.join(MOCK_FOLDER, MOCK_INVALID_JSON);
                let subject = new JsonFile(invalidPath);

                let fn = () => {
                   subject.loadSync();
                };

                expect(fn).to.throw(`Can not read ${ invalidPath }, not valid JSON`);

            });

            it("should throw an exception on no file name present" , () => {

                let fn = () => {
                    let subject = new JsonFile();
                    subject.loadSync();
                };

                expect(fn).to.throw("No filename has been set");

            });

            it("should throw an exception on a non existing file" , () => {

                let filename = "foobar.json";

                let fn = () => {
                    let subject = new JsonFile(filename);
                    subject.loadSync();
                };

                expect(fn).to.throw(`The file ${ filename } doesn't exist!`);

            });

        });

        describe("#load()" , () => {

            it("should load a valid JSON file and resolve to a populated collection" , (done) => {
                let validPath = path.join(MOCK_FOLDER, MOCK_VALID_JSON);
                let mockdata = loadMockJson();
                let subject = new JsonFile(validPath);

                subject.load().then((res) => {
                    expect(res.isCollection()).to.be.true;
                    expect(res.length()).to.be.above(0);
                    expect(res.data()).to.deep.equal(mockdata);
                    done();
                });

            });

            it("should reject on an invalid file" , () => {
                let invalidPath = path.join(MOCK_FOLDER, MOCK_INVALID_JSON);
                let subject = new JsonFile(invalidPath);

                subject.load().catch((err) => {
                    console.log("In load test that is expected to fail");
                    expect(err).to.be.equal(`Can not read ${ invalidPath }, not valid JSON`);
                });
            });

        });

        describe("#saveSync()", () => {

            it("should save data to a Valid Json file" , () => {
                let tmpPath = path.join(Helpers.TMP(), MOCK_VALID_JSON);
                let mockdata = loadMockJson();
                let subject = new JsonFile(tmpPath);

                subject.data(mockdata);
                subject.saveSync();

                let savedFile = Helpers.loadJson(tmpPath);

                expect(savedFile).to.deep.equal(mockdata);

            });

        });

        describe('#save', () => {

            it("should save data to valid JSON File" , (done) => {
                let tmpPath = path.join(Helpers.TMP(), MOCK_VALID_JSON);
                let mockdata = loadMockJson();
                let subject = new JsonFile(tmpPath);

                subject.data(mockdata);
                subject.save().then(() => {
                    let savedFile = Helpers.loadJson(tmpPath);
                    expect(savedFile).to.deep.equal(mockdata);
                    done();
                });
            });

        });

        describe("Serialization", () => {

            describe("#registerSerializer", () => {

                it("should set a custom serializer", () => {

                    let cust = (d) => d;

                    let subject = new JsonFile();
                    subject.registerSerializer(cust);

                    expect(subject._serializer.serialize.toString()).to.equal(cust.toString());

                });
            });

            describe("#registerSerializer", () => {

                it("should set a custom deserializer", () => {

                    let cust = (d) => d;

                    let subject = new JsonFile();
                    subject.registerDeserializer(cust);

                    expect(subject._serializer.deserialize.toString()).to.equal(cust.toString());

                });

            });

            describe("#canSerialize", () => {

                it("should return true with no custom Serializer set" , () => {
                   let subject = new JsonFile();
                   expect(subject.canSerialize()).to.be.true;
                });

                it("should returnn true with both custom Serializers set", () => {
                   let cust = (d) => d;
                   let subject = new JsonFile();

                   subject.registerSerializer(cust);
                   subject.registerDeserializer(cust);

                    expect(subject.canSerialize()).to.be.true;
                });

                it("Should return false when only one custom Serializer is set", () => {
                   let cust = (d) => d;
                   let subject = new JsonFile();

                   subject.registerSerializer(cust);

                   expect(subject.canSerialize()).to.be.false;
                });

            });

            describe("#serialize", () => {

                it("should use the custom serializer if set", () => {
                    let cust = (d) => JSON.stringify(d);
                    let custD = (d) => JSON.parse(d);
                    let subject = new JsonFile();
                    let mockdata = loadMockJson();

                    subject.registerSerializer(cust);
                    subject.registerDeserializer(custD);
                    subject.data(mockdata);

                    expect(subject.serialize()).to.equal(JSON.stringify(mockdata));

                });

                it("should use the generic JSON serializer if no custom is set", () => {
                    let subject = new JsonFile();
                    let mockdata = loadMockJson();
                    subject.data(mockdata);

                    expect(subject.serialize()).to.equal(JSON.stringify(mockdata));
                });

                it("should throw an error if the custom serializer is set but a deserializer isn't", () => {
                    let subject = new JsonFile();
                    let cust = (d) => d;

                    subject.registerSerializer(cust);

                    let fn = () => subject.serialize();

                    expect(fn).to.throw("Can not serialize data missing ether serializer or deserializer");
                });

            });

            describe("#deserialize", () => {

                it("should use the custom deserializer if set", () => {
                    let cust = (d) => JSON.stringify(d);
                    let custD = (d) => JSON.parse(d);
                    let subject = new JsonFile();
                    let mockdata = loadMockJson();

                    subject.registerSerializer(cust);
                    subject.registerDeserializer(custD);

                    expect(subject.deserialize(JSON.stringify(mockdata))).to.deep.equal(mockdata);
                });

                it("should use the generic JSON deserializer if no custom is set", () => {
                    let subject = new JsonFile();
                    let mockdata = loadMockJson();
                    subject.data(mockdata);

                    expect(subject.deserialize(JSON.stringify(mockdata))).to.deep.equal(mockdata);
                });

                it("should throw an error if the custom deserializer is set but a serializer isn't", () => {
                    let subject = new JsonFile();
                    let cust = (d) => d;

                    subject.registerDeserializer(cust);

                    let fn = () => subject.deserialize("");

                    expect(fn).to.throw("Can not serialize data missing ether serializer or deserializer");
                });

            });

            describe("#toString", () => {

                it("should auto serialize and return the serialised data string", () => {
                   let subject = new JsonFile();
                   let mockdata = loadMockJson();

                   subject.data(mockdata);

                   expect(subject.toString()).to.equal(JSON.stringify(mockdata));
                });

            });

        });

        describe("Validation" , () => {

            describe("#valid()" , () => {

                it("should return true when ran against a valid object" , () => {
                    let schema = path.join(MOCK_FOLDER, MOCK_VALID_SCHEMA);
                    let data = path.join(MOCK_FOLDER, MOCK_VALID_DATA);
                    let subject = new JsonFile(data,schema);

                    expect(subject.valid()).to.be.true;
                });

                it("should return false when ran against an invalid object" , () => {
                    let schema = path.join(MOCK_FOLDER, MOCK_VALID_SCHEMA);
                    let data = path.join(MOCK_FOLDER, MOCK_VALID_JSON);
                    let subject = new JsonFile(data,schema);

                    expect(subject.valid()).to.be.false;
                });

                it("should throw an error when no schema is present" , () => {
                    let fn = () => {
                        let data = path.join(MOCK_FOLDER, MOCK_VALID_JSON);
                        let subject = new JsonFile(data);
                        subject.valid();
                    };

                    expect(fn).to.throw('No validation schema has been defined');
                });

            });

            describe("#invalid()" , () => {

                it("should return false when ran against a valid object" , () => {
                    let schema = path.join(MOCK_FOLDER, MOCK_VALID_SCHEMA);
                    let data = path.join(MOCK_FOLDER, MOCK_VALID_DATA);
                    let subject = new JsonFile(data,schema);

                    expect(subject.invalid()).to.be.false;
                });

                it("should return true when ran against an invalid object" , () => {
                    let schema = path.join(MOCK_FOLDER, MOCK_VALID_SCHEMA);
                    let data = path.join(MOCK_FOLDER, MOCK_VALID_JSON);
                    let subject = new JsonFile(data,schema);

                    expect(subject.invalid()).to.be.true;
                });

                it("should throw an error when no schema is present" , () => {
                    let fn = () => {
                        let data = path.join(MOCK_FOLDER, MOCK_VALID_JSON);
                        let subject = new JsonFile(data);
                        subject.invalid();
                    };

                    expect(fn).to.throw('No validation schema has been defined');
                });

            });

        });

    });

})();