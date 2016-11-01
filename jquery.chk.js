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
 *
 * @link https://github.com/andrew8088/dome
 */
window.chk = (function () {
    "use strict";

    function Chk() {
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
        var _checkSum = null;
     }

    /**
     * What to set the value to when it overflows the limit
     * @param  {Number} limit The count at which to overflow and cycle back
     * @return {Number} zero, ignoring the limit
     */
    Chk.prototype._upOverflow = function (limit) {
        return 0;
    };

    /**
     * Tick up
     * @param  {Number}  unit   The current value
     * @param  {Boolean} check  Whether to tick this value up by one
     * @return {Number}         The ticked unit - this will be the same as unit unless check is true
     */
    Chk.prototype._countUp = function (unit, check) {
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
    Chk.prototype._wrapUp = function (unit, limit, overflow) {
        if (unit >= limit) {
            return overflow;
        }
        return unit;
    };

    /**
     * Get the unit, update it, print it and store chained state
     * This is now the central function
     * It allows passing in overflowFunc, countFunc and wrapFunc
     * to be independent of counting up / down
     *
     * @param  {Object}   unitElement  JavaScript element for getting, setting
     * @param  {Number}   limit        The count at which to overflow and cycle back, cannot be less than zero
     * @param  {Function} func         Callback function
     * @param  {Function} overflowFunc get the overflow value beyond the limit
     * @param  {Function} countFunc    the tick function
     * @param  {Function} wrapFunc     the wrap around function
     * @return {Object}                this (with updated _checkSum property)
     */
    Chk.prototype._controller = function (
        unitElement,
        limit,
        func,
        overflowFunc,
        countFunc,
        wrapFunc
    ) {
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
    Chk.prototype._downOverflow = function (limit) {
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
    Chk.prototype._countDown = function (unit, check) {
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
    Chk.prototype._wrapDown = function (unit, limit, overflow) {
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
    Chk.prototype._callback = function (func, newHand, oldHand) {
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
    Chk.prototype._check = function () {
        var checkSum = this._checkSum;
        return typeof(checkSum) === undefined ||
                checkSum === null ||
                checkSum === 0;
    };

    /**
     * Update the internal state
     *
     * The sum being calculated here is actually
     * a sum of all the previous chained states
     * See details of _checkSum property for more info
     *
     * @param  {Number} newHand     new value after tick
     * @param  {Number} overflow    Where to go when you're over the limit
     */
    Chk.prototype._setCheckSum = function (newHand, overflow) {
        // this here is the bit that makes it all tick
        this._checkSum += (newHand - overflow);
    };

    /**
     * Change the outside world
     *
     * @param  {Object} unitElement JavaScript element
     * @param  {Object} displayHand zero padded value after tick
     */
    Chk.prototype._print = function (unitElement, displayHand) {
        unitElement.innerHTML = displayHand;
    };

    /**
     * Get from the outside world the value of one of the clock 'hands'
     *
     * The meaning doesn't apply if you're using values
     * that aren't hours / minutes / seconds
     * But it's just getting the value for the current unit
     *
     * @param  {Object} unitElement JavaScript element
     * @return {Number}             The integer value
     */
    Chk.prototype._hand = function (unitElement) {
        // parseInt() doesn't work here...
        return parseFloat(unitElement.innerText);
    };

    var chk = {

        /**
         * Stopwatch style tick up
         *
         * @param  {Object}   unitElement JavaScript element
         * @param  {Number}   limit       The count at which to overflow and cycle back
         * @param  {Function} func        Callback function for each tick of this object
         * @return {Object}               this, allow for chaining
         */
        up: function (unitElement, limit, func) {
            var chker = new Chk();
            return chker._controller(
                unitElement,
                limit,
                func,
                chker._upOverflow,
                chker._countUp,
                chker._wrapUp
            );
        },

        /**
         * Timer style tick down
         *
         * @param  {Object} unitElement JavaScript element
         * @param  {Number} limit       The count at which to overflow and cycle back, cannot be less than zero
         * @return {Object}             this, allow for chaining
         */
        down: function (unitElement, limit, func) {
            var chker = new Chk();
            return chker._controller(
                unitElement,
                limit,
                func,
                chker._downOverflow,
                chker._countDown,
                chker._wrapDown
            );
        },

        /**
         * Pad numbers with a single zero for printing
         *
         * @param  {Number} length  How many zeros to pad
         * @param  {Number} newHand The new value to print 0+
         * @return {String}         01, ..., 09, 10, ...
         */
        zeroPad: function (length) {
            return function (newHand) {
                // stick n zeros at the front
                // return last n values from the string
                return ("0".repeat(length) + newHand).slice(-length);
            };
        },

        /**
         * Calculate the number of zeros based on the max value
         * @param  {Number} limit Max value for the counter
         * @return {Number}       Zero padded limit
         */
        zeroPadLimit: function (limit) {
            return this.zeroPad(this.limitLength(limit));
        },

        /**
         * Convert a value to a power of 10
         * @param  {Number} limit Max value for the counter
         * @return {Number}       Length of zeros for the limit
         */
        limitLength: function (limit) {
            return Math.ceil(Math.log10(limit));
        }

    };

    return chk;

}());
