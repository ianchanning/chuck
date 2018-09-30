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
    // internal state
    // @todo I still get confused by how this all hangs together
    // we use external state from the state of the counters in the HTML elements
    let _checkSum = null
    const _upOverflow = limit => 0
    // @todo the down overflow for the primary number should be 'limit'
    // for example t-minus goes from 10...1, but possibly it should also hit zero,
    // the counter should be left at zero after the lift off
    // but for tenths of a second counting down it goes 9...0
    // so the action happens on the transition from 1 -> 0 instead of 0 -> 9
    // for a regular clock though the tick happens from 00 -> 59
    const _downOverflow = limit => limit <= 0 ? 0 : limit - 1
    const _countUp = (unit, check) => check ? unit + 1 : unit
    const _countDown = (unit, check) => check ? unit - 1 : unit
    const _wrapUp = (unit, limit, overflow) => unit >= limit ? overflow : unit
    // @todo in the primary number case the wrap should happen when the everything is zero except the smallest unit is 1
    const _wrapDown = (unit, limit, overflow) => unit < 0 ? overflow : unit
    const _check = () => typeof(_checkSum) === undefined || _checkSum === null || _checkSum === 0
    const _setCheckSum = (newHand, overflow) => { _checkSum += (newHand - overflow) }
    const _print = (unitElement, displayHand) => { unitElement.innerHTML = displayHand }
    const _hand = unitElement => parseFloat(unitElement.innerText)
    // for the main count down e.g. t-minus we want 10..01 (then blast off at 00)
    // this is also similar to the primary counter in a count down timer
    // e.g. for a 25:00 pomodoro, when you get down to 00:01 you want to transition to 25:00 again
    // but at 01:01 you want to transition to 01:00 and then to 00:59
    // for regular time count down e.g. tenth's of a second we want 9..0
    // this function can't handle both
    // to handle the t-minus/pomodoro minutes case we should use limit + 1
    const limitLength = limit => Math.ceil(Math.log10(limit))
    // these functions are still confusing
    // we prepend length + 1 zeros
    // and then cut off as many zeros as newhand.length
    // zeroPad(3)(99) ---> '00099' ---> '099'
    // zeroPad(1)(99) ---> '099' ---> '9'
    const zeroPad = length => newHand => ("0".repeat(length) + newHand).slice(-length)
    // With the comments for limitLength we have an oddity for zeroPadLimit(100)(1) === '01' not '001'
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
// @todo switch to ES6 module exports, but need to get babel + jest properly working
module.exports.chk = chk
