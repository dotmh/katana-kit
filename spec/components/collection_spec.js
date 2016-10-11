(function(){
    "use strict";

    let Helper = require("../helpers");
    let expect = require("chai").expect;
    let _ = require("lodash");
    let Collection = require(`${Helper.COMPONENTS()}/collection`);

    describe('Collection', () => {

        describe('#constructor()' , () => {

            it("should set up the basics" , () => {

                let subject = new Collection();

                expect(subject._data).to.be.a("object");
                expect(subject._length).to.equal(0);
                expect(subject._fields).to.be.a("array");
                expect(subject._fields).to.have.length(0);

            });

        });

        describe('#isCollection()' , () => {

            it("should return true for a collection" , () => {

                let subject = new Collection();
                expect(subject.isCollection()).to.be.true;

            });

        });

        describe('#data()' , () => {

            it("should return an empty object on initalization" , () => {

                let subject = new Collection();
                expect(subject.data()).to.be.empty;

            });

            it("should return the data after it has been set" , () => {

                let subject = new Collection();
                let payload = {
                    "foo" : "bar",
                    "a" : "b",
                    "c" : true
                };

                expect(subject.data()).to.be.empty;
                subject.data(payload);
                expect(subject.data()).to.deep.equal(payload);

            });

            it("should return the data when initialized with Data" , () => {

                let payload = {
                    "foo" : "bar",
                    "a" : "b",
                    "c" : true
                };

                let subject = new Collection(payload);
                expect(subject.data()).to.deep.equal(payload);

            });

            it("should extend the data with new data" , () => {
                let payloadA = {
                    "foo" : "bar",
                    "a"   : "b",
                    "c"   : "c"
                };

                let payloadB = {
                    "bar" : "foo",
                    "c" : "c",
                    "b" : "a"
                };

                let subject = new Collection(payloadA);
                expect(subject.data()).to.deep.equal(payloadA);

                subject.data(payloadB);

                expect(subject.data()).to.deep.equal(_.extend(payloadA,payloadB));

            });

        });

        describe("#toObject()" , () => {

            it("should return the data object from the collection" , () => {

                let payload = {
                    "foo" : "bar",
                    "a" : "b",
                    "c" : true
                };

                let subject = new Collection(payload);
                expect(subject.toObject()).to.deep.equal(payload);

            });
        });

        describe("#toString()" , () => {

            it("should convert the internal Data object to a Json encoded string" , () => {

                let payload = {
                    "foo" : "bar",
                    "a" : "b",
                    "c" : true
                };

                let subject = new Collection(payload);
                expect(subject.toString()).to.equal(JSON.stringify(payload));

            });

            it("should implicitly convert the internal Data object to a JSON string" , () => {

                let payload = {
                    "foo" : "bar",
                    "a" : "b",
                    "c" : true
                };

                let subject = new Collection(payload);
                expect(""+subject).to.equal(JSON.stringify(payload));

            });

        });

        describe("#has()" , () => {

            it("should return false if the field doesn't exist" , () => {

                let subject = new Collection();
                expect(subject.has("foo")).to.be.false;

            });

            it("should return true if the field does exist" , () => {

                let payload = {
                    "foo" : "bar",
                };
                let subject = new Collection(payload);

                expect(subject.has("foo")).to.be.true;

            });

            it("should throw an error if no key is set" , () => {

                let fn = () => {
                    let subject = new Collection();
                    subject.has();
                };

                expect(fn).to.throw("Key is required");
            });

        });

        describe("#field()" , () => {

            it("should register a new field" , () => {

                let subject = new Collection();
                let fieldname = "foobar";

                subject.field(fieldname);

                expect(subject.has(fieldname)).to.be.true;

            });

            it("should throw an Error if no name is provided" ,  () => {

                let subject = new Collection();

                let fn = () => {
                    subject.field();
                };

                expect(fn).to.throw("Fieldname is required");

            });

            it("should throw an Error if the field already exists" , () => {

                let subject = new Collection();
                let payload = {};
                let fieldname = "foobar";

                payload[fieldname] = false;

                subject.data(payload);

                expect(subject.has(fieldname)).to.be.true;

                let fn = () => {
                    subject.field(fieldname);
                };

                expect(fn).to.throw("Key is already registered and can't be registered again");

            });

        });

        describe("#fields()" , () => {

            it("should return a list of field names" , () => {

                let fields = ["foo" , "bar" , "a" , "b"];
                let payload = {};

                fields.forEach((field) => {
                   payload[field] = false;
                });

                let subject = new Collection(payload);

                expect(subject.fields()).to.be.an("array");
                expect(subject.fields()).to.not.be.empty;
                expect(subject.fields()).to.deep.equal(fields);
            });

        });

        describe("#length()" , () => {

            it("should return the length" , () => {
                let payload = {
                    "foo" : "bar",
                    "a" : "b",
                    "c" : true
                };

                let subject = new Collection(payload);

                expect(subject.length()).to.equal(3);
            });

        });

        describe("#find()" , () => {

            it("should return a value stored at the path" , () => {

                let payload = {
                    "a" : {
                        "b" : "c"
                    }
                };

                let subject = new Collection(payload);

                expect(subject.find("a.b")).to.equal(payload.a.b);

            });

            it("should return null on no path" , () => {

                let subject = new Collection();
                expect(subject.find()).to.equal(null);

            });

            it("should return false if the path doesn't exist" , () => {

                let payload = {
                    "a" : "b"
                };

                let subject = new Collection(payload);
                expect(subject.find("a.b")).to.equal(false);

            });

            it("should return false if a path part doesn't exist" , () => {

                let payload = {
                    "a" : "b"
                };

                let subject = new Collection(payload);
                expect(subject.find("a.b.c")).to.equal(false);

            });

        });

        describe("#extend()" , () => {

            it("should extend one collection with another" , () => {

                let c1 = new Collection({
                    "a" : "b",
                    "c" : "d",
                    "e" : 1,
                    "f" : true
                });

                let c2 = new Collection({
                    "g" : "h",
                    "i" : "j",
                    "k": 2
                });

                c1.extend(c2);

                expect(c1.has("a")).to.be.true;
                expect(c1.has("g")).to.be.true;

            });

            it("should replace the value of duplicated entrys with the latest" , () => {

                let p1 = {
                    "a" : "b",
                    "c" : "d"
                };

                let p2 = {
                    "c" : "foo"
                };

                let c1 = new Collection(p1);
                let c2 = new Collection(p2);

                c1.extend(c2);

                expect(c1.c).to.equal(p2.c);
                expect(c1.a).to.equal(p1.a);

            });

            it("should throw an error when extending no collections" , () => {

                let fn = () => {
                    let subject = new Collection();
                    subject.extend("foo");
                };

                expect(fn).to.throw("Collections can only be extended with other collections");

            });

        });


        describe("Getters" , () => {

            it("should get data from the collection" , () => {

                let payload = {
                    "foo" : "bar"
                };

                let subject = new Collection(payload);

                expect(subject.foo).to.equal("bar");

            });

            it("should trigger a get event" , () => {

                let payload = {
                    "foo" : "bar"
                };

                let event2_triggered = false;

                let subject = new Collection(payload);

                subject.on("get" , function(key) {
                    expect(key).to.equal("foo");
                });

                subject.on("get.foo" , () => {
                   event2_triggered = true;
                   expect(event2_triggered).to.be.true;
                });

            });

        });

        describe("Setters" , () => {

            it("should set data in the collection" , () => {
                let subject = new Collection();
                let field = "foo";
                let value = "bar";

                subject.field(field);
                expect(subject.has(field)).to.be.true;

                subject[field] = value;
                expect(subject[field]).to.equal(value);
            });

        });

        describe("Private Methods throw Errors" , () => {

            it("should throw an error calling register" , () => {
               let fn = () => {
                   let subject = new Collection();
                   subject.register();
               };

               expect(fn).to.throw("Key is required");
            });

            it("should throw an error calling __set" , () => {
                let fn = () => {
                    let subject = new Collection();
                    subject._set();
                };

                expect(fn).to.throw("Key is required");
            });

            it("should throw an error calling _get", () => {
                let fn = () => {
                   let subject = new Collection();
                   subject._get();
                };

                expect(fn).to.throw("Key is required");
            });

        });

    });

})();