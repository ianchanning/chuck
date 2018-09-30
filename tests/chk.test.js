// @todo get ES6 modules working with Jest
// import {chk, sum} from '../chk.es6';
const {chk} = require('../chk.es6');

test('zeropad 1 gives 01', () => {
  expect(chk().zeroPad(2)(1)).toBe('01');
});
test('zeropad for limit 100 gives 01', () => {
  expect(chk().zeroPadLimit(100)(1)).toBe('01');
});
test('zeropad for limit 60 gives 01', () => {
  expect(chk().zeroPadLimit(60)(1)).toBe('01');
});
