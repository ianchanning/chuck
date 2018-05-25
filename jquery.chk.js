(function($) {
    "use strict";
    /**
     * A general object for ticking a set of values up or down
     *
     * Each tick is done on a unit (e.g. hour / minute / second)
     * And compared against all the fractions of the unit
     * e.g. seconds are fractions of a minute
     * Short for chained tick I think of it as 'chuck' rather than 'check'
     * Also see: @link https://en.wikipedia.org/wiki/!!!
     *
     * This code was based off https://github.com/kellishaver/stopwatch
     * all that is left of that are the zeroPad and hand functions
     * they've both been modifed as well, but conceptually the same
     */
    $.fn.chk = function() {
        /**
         * The checkSum to see if the current unit should tick up or down
         *
         * This is the magic to allow all the chaining
         * It means that a larger unit will only tick
         * when all smaller factions have just 'ticked'
         *
         * Going up we know that all the values have ticked
         * if they are zero
         * Going down we know that all the values have ticked
         * if they are one less than the limit e.g. 59 seconds
         *
         * The default of null means always tick
         * @type {Number}
         */
        this._checkSum = null;

        /**
         * Stopwatch style tick up
         * @param  {Object}   unitElement jQuery element
         * @param  {Number}   limit       The count at which to overflow and cycle back
         * @param  {Function} func        Callback function for each tick of this object
         * @return {Object}               this, allow for chaining
         */
        this.up = function(unitElement, limit, func) {
            return this._controller(
                unitElement,
                limit,
                func,
                this._upOverflow,
                this._countUp,
                this._wrapUp
            );
        };

        /**
         * What to set the value to when it overflows the limit
         * @param  {Number} limit The count at which to overflow and cycle back
         * @return {Number} zero, ignoring the limit
         */
        this._upOverflow = function (limit) {
            return 0;
        };

        /**
         * Tick up
         * @param  {Number}  unit   The current value
         * @param  {Boolean} check  Whether to tick this value up by one
         * @return {Number}         The ticked unit - this will be the same as unit unless check is true
         */
        this._countUp = function(unit, check) {
            if (check) {
                return unit + 1;
            }
            return unit;
        };

        /**
         * Wrap around
         * @param  {Number} unit     The current value
         * @param  {Number} limit    The count of how many units e.g. (gone in) 60 seconds
         * @param  {Number} overflow Where to go when you're over the limit (avoiding jail)
         * @return {Number}          The wrapped unit - this will be the same as unit unless we've gone over the limit
         */
        this._wrapUp = function(unit, limit, overflow) {
            if (unit >= limit) {
                return overflow;
            }
            return unit;
        };

        /**
         * Timer style tick down
         *
         * @param  {Object} unitElement jQuery element
         * @param  {Number} limit       The count at which to overflow and cycle back, cannot be less than zero
         * @return {Object}             this, allow for chaining
         */
        this.down = function(unitElement, limit, func) {
            return this._controller(
                unitElement,
                limit,
                func,
                this._downOverflow,
                this._countDown,
                this._wrapDown
            );
        };

        /**
         * Get the unit, update it, print it and store chained state
         * This is now the central function
         * It allows passing in overflowFunc, countFunc and wrapFunc
         * to be independent of counting up / down
         *
         * @param  {Object}   unitElement  jQuery element for getting, setting
         * @param  {Number}   limit        The count at which to overflow and cycle back, cannot be less than zero
         * @param  {Function} func         Callback function
         * @param  {Function} overflowFunc get the overflow value beyond the limit
         * @param  {Function} countFunc    the tick function
         * @param  {Function} wrapFunc     the wrap around function
         * @return {Object}                this (with updated _checkSum property)
         */
        this._controller = function(unitElement, limit, func, overflowFunc, countFunc, wrapFunc) {
            var overflow = overflowFunc(limit);
            var oldHand = this._hand(unitElement);
            var newHand = wrapFunc(
                countFunc(oldHand, this._check()),
                limit,
                overflow
            );
            this._callback(func, newHand, oldHand);
            this._print(unitElement, this.zeroPadLimit(limit)(newHand));
            this._setCheckSum(newHand, overflow);
            return this;
        };

        /**
         * What to set the value to when it overflows the limit
         *
         * @param  {Number}   limit        The count at which to overflow and cycle back, cannot be less than zero
         * @return {Number}
         */
        this._downOverflow = function(limit) {
            // allow people to set the limit to zero as that makes more sense
            // but then we don't want a negative overflow
            if (limit <= 0) {
                return 0;
            }
            return limit - 1;

        };

        /**
         * Tick down
         * @param  {Number}  unit   The current value
         * @param  {Boolean} check  Whether to tick this value down by one
         * @return {Number}         The ticked unit - this will be the same as unit unless check is true
         */
        this._countDown = function(unit, check) {
            if (check) {
                return unit - 1;
            }
            return unit;
        };

        /**
         * Wrap around
         * @param  {Number} unit     The current value
         * @param  {Number} limit    The count of how many units e.g. (gone in) 60 seconds
         * @param  {Number} overflow Where to go when you're over the limit (avoiding jail)
         * @return {Number}          The wrapped unit - this will be the same as unit unless we've gone over the limit
         */
        this._wrapDown = function(unit, limit, overflow) {
            // limit is unused here
            if (unit < 0) {
                return overflow;
            }
            return unit;
        };

        /**
         * call the callback
         * @param  {Function} func  Callback function
         * @param  {Number} newHand new value after tick
         * @param  {Number} oldHand old value before tick
         * @return {None}
         */
        this._callback = function(func, newHand, oldHand) {
            if (typeof func == 'function' && newHand != oldHand) {
                try {
                    func();
                } catch (e) {
                    // bury the chker
                }
            }
        };

        /**
         * Whether to tick up/down
         * @param  {Number}  checkSum sum of all dependent chk objects
         * @return {Boolean}          tick or not to tick
         */
        this._check = function() {
            var checkSum = this._checkSum;
            return typeof(checkSum) === undefined ||
                    checkSum === null ||
                    checkSum === 0;
        };

        /**
         * Update the internal state
         *
         * The sum being calculated here is actually a sum of all the previous chained states
         * See details of _checkSum property for more info
         *
         * @param  {Number} newHand     new value after tick
         * @param  {Number} overflow    Where to go when you're over the limit
         */
        this._setCheckSum = function(newHand, overflow) {
            // this here is the bit that makes it all tick
            this._checkSum += (newHand - overflow);
        };

        /**
         * Pad numbers with a single zero for printing
         *
         * @todo This function only works for 0 - 99
         * This needs to be more generic based on the limit e.g. handling 1000ths of a second
         *
         * @param  {Number} newHand The new value to print 0-99
         * @return {String}         01, ..., 09, 10, ...
         */
        this.zeroPad = function (length) {
            return function (newHand) {
                // stick n zeros at the front
                // take last n values from the string
                return ("0".repeat(length) + newHand).slice(-length);
            };
        };

        this.zeroPadLimit = function (limit) {
            return this.zeroPad(this._limitLength(limit));
        };

        this._limitLength = function(limit) {
            // add one to bump powers of 10 into the next 'length' bucket
            return Math.ceil(Math.log10(limit));
        };

        /**
         * Change the outside world
         *
         * @param  {Number} displayHand zero padded value after tick
         * @param  {Number} overflow    Where to go when you're over the limit
         */
        this._print = function(unitElement, displayHand) {
            unitElement.html(displayHand);
        };

        /**
         * Get from the outside world the value of one of the clock 'hands'
         *
         * The meaning doesn't apply if you're using values that aren't hours / minutes / seconds
         * But it's just getting the value for the current unit
         *
         * @param  {Object} unitElement jQuery element
         * @return {Number}             The integer value
         */
        this._hand = function(unitElement) {
            // parseInt() doesn't work here...
            return parseFloat(unitElement.text());
        };

        return this;

    };

})(jQuery);
