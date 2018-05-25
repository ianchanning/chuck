/**
 * A general object for ticking a set of values up or down
 *
 * Updated with ES6 syntax
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
/*jshint esversion: 6 */
/*jshint asi: true */
const chk = () => {
    "use strict"
    let _checkSum = null
    const _upOverflow = limit => 0
    const _downOverflow = limit => limit <= 0 ? 0 : limit - 1
    const _countUp = (unit, check) => check ? unit + 1 : unit
    const _countDown = (unit, check) => check ? unit - 1 : unit
    const _wrapUp = (unit, limit, overflow) => unit >= limit ? overflow : unit
    const _wrapDown = (unit, limit, overflow) => unit < 0 ? overflow : unit
    const _check = () => typeof(_checkSum) === undefined || _checkSum === null || _checkSum === 0
    const _setCheckSum = (newHand, overflow) => { _checkSum += (newHand - overflow) }
    const _print = (unitElement, displayHand) => { unitElement.innerHTML = displayHand }
    const _hand = unitElement => parseFloat(unitElement.innerText)
    const limitLength = limit => Math.ceil(Math.log10(limit))
    const zeroPad = length => newHand => ("0".repeat(length) + newHand).slice(-length)
    const zeroPadLimit = limit => zeroPad(limitLength(limit))
    const _callback = (func, newHand, oldHand) => {
        if (typeof func == 'function' && newHand != oldHand) {
            try {
                func()
            } catch (e) {
                // bury the chker
            }
        }
    }
    const _controller = (
        unitElement,
        limit,
        func,
        overflowFunc,
        countFunc,
        wrapFunc
    ) => {
        const overflow = overflowFunc(limit)
        const oldHand = _hand(unitElement)
        const newHand = wrapFunc(
            countFunc(oldHand, _check()),
            limit,
            overflow
        )
        _callback(func, newHand, oldHand)
        _print(unitElement, zeroPadLimit(limit)(newHand))
        _setCheckSum(newHand, overflow)
    }
    return {
        up: function (unitElement, limit, func) {
            _controller(unitElement, limit, func, _upOverflow, _countUp, _wrapUp)
            return this
        },
        down: function (unitElement, limit, func) {
            _controller(unitElement, limit, func, _downOverflow, _countDown, _wrapDown)
            return this
        },
        zeroPadLimit: zeroPadLimit,
        zeroPad: zeroPad,
        limitLength: limitLength
    }
}
