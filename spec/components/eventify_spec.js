(function(){
    "use strict";

    let Helper = require("../helpers");
    let expect = require("chai").expect;
    let Eventify = require(`${Helper.COMPONENTS()}/eventify`);

    describe('Eventify' , () => {

        describe('#constructor()' , () => {

            it('should create a queue as _queue' , () => {

                let subject = new Eventify();
                expect(subject._queue).to.be.a("Object");

            });

            it('should create a queue as _once' , () => {
                let subject = new Eventify();
                expect(subject._once).to.be.a("Object");
            });

        });

        describe('#isEventify()' , () => {

            it("should return true" , () => {

                let subject = new Eventify();
                expect(subject.isEventify()).to.be.true;

            });

        });

        describe("#on()" , () => {

            it('should add an event to the queue' , () => {

                let eventName = "some.event";
                let eventHandler = "some.handler";
                let subject = new Eventify();

                subject.on(eventName , function(){
                    return eventHandler;
                });

                expect(subject._queue).to.have.property(eventName);
                expect(subject._queue[eventName]).to.be.a("Array");
                expect(subject._queue[eventName]).to.have.length(1);
                expect(subject._queue[eventName][0]()).to.equal(eventHandler);

            });

            it('should throw an Exception when no handler is passed' , () => {


                let fn = function() {
                    let subject = new Eventify();
                    subject.on("some.event");
                };

                expect(fn).to.throw("Handler is required");

            });

            it('should throw an Exception when no event is passed' ,() => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.on();
                };

                expect(fn).to.throw("Event is required");

            });

        });

        describe("#once()" , () => {

            it('should add an event to the once queue' , () => {

                let eventName = "some.event.once";
                let eventHandler = "some.handler.once";
                let subject = new Eventify();

                subject.once(eventName, function() {
                    return eventHandler;
                });

                expect(subject._once).to.have.property(eventName);
                expect(subject._once[eventName]).to.be.a("Array");
                expect(subject._once[eventName]).to.have.length(1);
                expect(subject._once[eventName][0]()).to.equal(eventHandler);

            });

            it('should throw an Exception when no handler is passed' , () => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.once("some.event");
                };

                expect(fn).to.throw("Handler is required");

            });

            it('should throw an Exception when no event is passed' , () => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.once();
                };

                expect(fn).to.throw("Event is required");

            });

        });

        describe("#all()", () => {

            it("should add a valid all event to the all queue" , () => {

                let eventName = "all.on";
                let eventHandler = "all.on.handler";
                let subject = new Eventify();

                subject.all(eventName , function() {
                    return eventHandler;
                });

                expect(subject._all).to.have.property(eventName);
                expect(subject._all[eventName]).to.be.a("Array");
                expect(subject._all[eventName]).to.have.length(1);
                expect(subject._all[eventName][0]()).to.equal(eventHandler);

            });

            it('should throw an Exception when no handler is passed' , () => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.all("all.on");
                };

                expect(fn).to.throw("Handler is required");

            });

            it('should throw an Exception when no event is passed' , () => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.all();
                };

                expect(fn).to.throw("Event is required");

            });

            it('should throw an Exception when a invalid all event is passed' , () => {

                let eventName = "all.dance";

                let fn = function() {
                    let subject = new Eventify();
                    subject.all(eventName , function() {
                        return false;
                    });
                };

                expect(fn).to.throw(`${ eventName } isn't a valid all event`);

            });
        });

        describe('#off()', () => {

            it('should remove an event from the queue', () => {

               let eventName = "some.event";
               let subject = new Eventify();

               subject.on(eventName , function() {
                   return "some.handler";
               });

               expect(subject._queue).to.have.property(eventName);

               subject.off(eventName);

               expect(subject._queue).to.not.have.property(eventName);

            });

            it("should remove an event from the once queue" , () => {

                let eventName = "some.event.once";
                let subject = new Eventify();

                subject.once(eventName , function() {
                    return "some.handler.once";
                });

                expect(subject._once).to.have.property(eventName);

                subject.off(eventName);

                expect(subject._queue).to.not.have.property(eventName);
            });

            it("should remove an event from the all queue" , () => {

                let eventName = "all.on";
                let subject = new Eventify();

                subject.all(eventName , function() {
                    return "some.handler.all";
                });

                expect(subject._all).to.have.property(eventName);

                subject.off(eventName);

                expect(subject._all).to.not.have.property(eventName);
            });

            it("should throw an exception when no event is specified" , () => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.off();
                };

                expect(fn).to.throw("Event is required");

            });

        });

        describe('#trigger()' , () => {

            it('should trigger all the handlers on the event queue' , () => {

               let eventName = "some.event";
               let payload = "";
               let subject = new Eventify();

               subject.on(eventName , function() {
                  payload = eventName + " run";
               });


               expect(subject._queue).to.have.property(eventName);

               subject.trigger(eventName);

               expect(payload).to.equal((eventName + " run"));

            });


            it('should trigger all the handlers on the event once queue' , () => {

                let eventName = "some.event";
                let payload = "";
                let subject = new Eventify();

                subject.once(eventName , function() {
                    payload = eventName + " run";
                });


                expect(subject._once).to.have.property(eventName);

                subject.trigger(eventName);

                expect(payload).to.equal((eventName + " run"));

                expect(subject._once).to.not.have.property(eventName);

            });

            it('should trigger all the handlers on the event all queue' , () => {

                let eventName = "all.on";
                let payload = "";
                let subject = new Eventify();

                subject.all(eventName , function() {
                    payload = eventName + " run";
                });


                expect(subject._all).to.have.property(eventName);

                subject.trigger(eventName);

                expect(payload).to.equal((eventName + " run"));

            });


            it("should pass the parameters through to the handler" , () => {

                let eventName = "some.event";
                let param = "some.param";
                let payload = "";
                let subject = new Eventify();

                subject.on(eventName , function(local) {
                    payload = local;
                });


                expect(subject._queue).to.have.property(eventName);

                subject.trigger(eventName , [param]);

                expect(payload).to.equal(param);

            });

            it('should throw an exception when no event name is passed', () => {

                let fn = function() {
                    let subject = new Eventify();
                    subject.trigger();
                };

                expect(fn).to.throw("Event is required");
            });

        });

        describe("#describe()" , () => {

            it('should return an empty describe object on initialization' , () => {

                let subject = new Eventify();
                let expected = {
                    "queue" : {},
                    "once" : {},
                    "all"  : {}
                };

                expect(subject.describe()).to.deep.equal(expected);

            });

            it('should return the populated event queues' , () => {

                let eventify = new Eventify();
                let onEvent = "test.foo";
                let onceEvent = "test.bar";
                let allEvent = "all.on";

                eventify.on(onEvent , function() {});
                eventify.once(onceEvent , function() {});
                eventify.all(allEvent , function() {});

                let subject = eventify.describe();

                expect(subject).to.have.property("queue");
                expect(subject.queue).to.have.property(onEvent);
                expect(subject.queue[onEvent]).to.be.an("array");
                expect(subject.queue[onEvent]).to.have.length(1);

                expect(subject).to.have.property("once");
                expect(subject.once).to.have.property(onceEvent);
                expect(subject.once[onceEvent]).to.be.an("array");
                expect(subject.once[onceEvent]).to.have.length(1);

                expect(subject).to.have.property("all");
                expect(subject.all).to.have.property(allEvent);
                expect(subject.all[allEvent]).to.be.an("array");
                expect(subject.all[allEvent]).to.have.length(1);

            });

        });

        describe("#bond()" , () => {

            it('should throw an exception when you try and bond a non eventify class', () => {

                class Mock {}

                let mock = new Mock();
                let subject = new Eventify();

                let fn = () => {
                    subject.bond(mock);
                };

                expect(fn).to.throw("A Bond can only be established between two Eventified objects");

            });

            it('should bond to eventified class together' , () => {

                let parent = new Eventify();
                let child  = new Eventify();
                let eventName = "some.event";
                let payload = "";

                parent.bond(child);

                parent.on(eventName , () => payload = `${ eventName }.fired`);

                child.trigger(eventName);

                expect(payload).to.equal(`${ eventName }.fired`);

            });

        });

    });

})();