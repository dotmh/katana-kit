(function() {
    "use strict";

    const EVENT_ALL_ON = "all.on";
    const EVENT_ALL_ONCE = "all.once";
    const EVENT_ALL_OFF = "all.off";
    const EVENT_ALL_TRIGGER = "all.trigger";

    const VALID_ALL = [
        EVENT_ALL_ON,
        EVENT_ALL_ONCE,
        EVENT_ALL_OFF,
        EVENT_ALL_TRIGGER
    ];

    // Eventify
    // ========
    // Turns any class that is extends with Evenitfy in to an Event Emitter / Handler.
    // This is in affect an abstract class, although JS has no concept of that.
    //
    // Redirecting Queues
    // ------------------
    // Be default all the event queues are stored against the instance that instantiated the class, you can redirect
    // this however if needed. Do this by calling super then re-initailising the following
    //
    // - `this._queue` - the queue for all standard events
    // - `this._once` - the queue for all events that should be triggered only once
    //
    // you will notice there is also a `this._all` it is __not recommended__ to redirect this queue, it is used by the
    // event handler to monitor itself.
    //
    // ```
    // class Registery extends Eventify {
    //     constructor() {
    //          super();
    //          this._queue = window.queue
    //          this._once = window.once
    //      }
    // }
    // ```
    // ----
    class Eventify {
        constructor() {
            this._queue = {};
            this._once = {};
            this._all = {};
        }

        // isEventify
        // ------------
        // Identifies the class as an eventified class, this is used by other bits of code to check that a class
        // extends eventify
        //
        // ### Usage
        // ```
        // collection.isCollection // => true
        // ```
        // ----
        isEventify () {
            return true;
        }

        // on
        // --
        // Binds a new event handler to an event on the standard event queue, i.e is triggered everytime
        //
        // ### Usage
        // ```
        // eventify.on("event.name", (e) => {
        //      // Do Something
        // });
        // ```
        // ----
        on (event , handler) {
            this.bind(event, handler, this._queue);
            this.trigger(EVENT_ALL_ON, [event, handler, this._queue]);
        }

        // once
        // ----
        // Similar to on binds a new event handler to an event on the once event queue, i.e is triggered only once
        //
        // ### Usage
        // ```
        // eventify.once("event.name", (e) => {
        //      // Do Something
        // });
        // ```
        // ----
        once (event , handler) {
            this.bind(event, handler, this._once);
            this.trigger(EVENT_ALL_ONCE, [event, handler, this._once]);
        }

        // all
        // ---
        // Similar to `on` and `once` bind events to a queue, this time the all queue.
        // The all queue however can only have certain events, and is used to monitor the event class. This is mostly
        // used by [Eventify.bond](#bond).
        //
        // Unlike the other event handlers only 4 Events can be bond here.
        // - `EVENT_ALL_ON` : called every time the on method is called.
        // - `EVENT_ALL_OMCE` : called every time the once method is called.
        // - `EVENT_ALL_OFF` : called every time an event is unbound
        // - `EVENT_ALL_TRIGGER` : called every tume an event on any queue is triggered.
        //
        // ### Usage
        // ```
        // eventify.all(EVENT_ALL_ON, (e) => {
        //      // Do Something
        // });
        // ```
        // ----
        all (event , handler) {

            if ( !(event||false) ) {
                throw new Error("Event is required");
            }

            if (VALID_ALL.lastIndexOf(event) === -1 ) {
                throw new Error(`${ event } isn't a valid all event`);
            }

            this.bind(event, handler, this._all);
        }

        // off
        // ---
        // is the opposite to `on` , `once` and `all` in that it removes an event from the event queue.
        // it will remove the event from all the queues where that event name is present. If it event doesn't exist
        // on a queue then that queue will be ignored.
        //
        // ### Usage
        // ```
        // eventify.off('event.name');
        // ```
        // ----
        off (event) {
            this.unbind(event, this._once);
            this.unbind(event, this._queue);
            this.unbind(event, this._all);
        }

        // trigger
        // -------
        // is used to trigger an event on all the queues that the event is on, i.e a handler has been added using
        // `on`, `once` or `all`.
        //
        // Passing parameters to the event handler is done by passing an array to the second function parameter.
        //
        // ### Usage
        // ```
        // eventify.trigger("event.name" , [param_1 ... param_n]);
        // ```
        // ----
        trigger (event , params) {

            params = params || [];
            this.triggerQueue(event, params, this._queue);
            this.triggerQueue(event, params, this._once, true);
            this.triggerQueue(event, params, this._all);
        }

        // bond
        // ----
        // Bonds two event handlers so that events triggered on the child , trigger handlers on the parent.
        // both class must be an instance of, or extend Eventify
        //
        // ### Usage
        // ```
        // let a = new Eventify();
        // let b = new Eventify()
        // //...
        // a.bond(b);
        // ```
        // ----
        bond (child) {
            if ( !(typeof(child.isEventify) === "function" && child.isEventify()) ) {
                throw new Error("A Bond can only be established between two Eventified objects");
            }

            child.all(EVENT_ALL_TRIGGER , (e,args) => {
                this.trigger(e,args);
            });
        }

        /**
         * Describes the event queues already present allowing class to attach to them
         * this is mainly meant to be used by the bond
         *
         * @returns {{queue: ({}|*), once: ({}|*)}} The event queues
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        // describe
        // --------
        // Describes the event queues already present allowing class to attach to them
        // this is mainly meant to be used by the bond
        //
        // ### Usage
        // ```
        // eventify.describe(); 
        // /* =>
        // {
        //  queue: {"eventname", [handler, ...]},
        //  once: {"eventname", [handler, ...]},
        //  all: {"eventname", [handler, ...]}
        // };
        // */
        // ```
        // ----
        describe () {
            let _this = this;
            return {
                "queue" : _this._queue,
                "once"  : _this._once,
                "all"   : _this._all
            };
        }

        /**
         * Binds a Trigger to an event in a single queue
         *
         * @private
         *
         * @param event {String} The Event name to bind to
         * @param handler {Function} The handler that you wish to bind
         * @param queue {Object} The Queue that you wish to bind to
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        bind (event, handler, queue) {
            if (!(event||false)) {
                throw new Error("Event is required");
            }

            if (!(handler||false)) {
                throw new Error("Handler is required");
            }
            queue[event] = queue[event] || [];
            queue[event].push(handler);

        }

        /**
         * Unbinds a Trigger from an event in a single queue
         *
         * @private
         *
         * @param event {String} The Event name to unbind from
         * @param queue {Object} The Queue that you wish to remove the event from
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        unbind (event, queue) {
            if (!(event||false)) {
                throw new Error("Event is required");
            }
            delete queue[event];
            this.trigger(EVENT_ALL_OFF, [event, queue]);
        }

        /**
         * Triggers all the handlers for a certain Event on a specified queue optionally unbinds them when complete
         *
         * @private
         *
         * @param event {String} The Event name to trigger
         * @param params {Object} The optional Parameters to parse to the handlers
         * @param queue {Object} The queue to trigger the event handlers on
         * @param clear = false {Boolean} Whether of not to clear the queue when done
         *
         * @author Martin Haynes <oss@dotmh.com>
         */
        triggerQueue (event, params, queue, clear) {

            if (!(event||false)) {
                throw new Error("Event is required");
            }

            clear = clear || false;

            if ( queue.hasOwnProperty(event)) {
                queue[event].forEach((handler) => {
                   handler.apply(null, params);
                });

                if ( clear ) {
                    this.unbind(event,queue);
                }
            }

            /*
                Guard otherwise the event trigger will trigger all.trigger that will trigger event trigger!
                and as fun as it is to try and debug callback loops lets not hay!
            */
            if ( event !== EVENT_ALL_TRIGGER ) {
                this.trigger(EVENT_ALL_TRIGGER, [event, params, queue, clear]);
            }
        }
    }

    module.exports = Eventify;

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