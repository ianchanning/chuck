// @todo get ES6 modules working with Jest
// N.B. ES6 modules without babel is a PITA
// @link https://github.com/vuejs/vue-cli/issues/2040#issuecomment-449877687
import { chk } from '../chk.es6';

test('zeropad 1 gives 01', () => {
  expect(chk().zeroPad(2)(1)).toBe('01');
});
test('zeropad for limit 100 gives 01', () => {
  expect(chk().zeroPadLimit(100)(1)).toBe('01');
});
test('zeropad for limit 60 gives 01', () => {
  expect(chk().zeroPadLimit(60)(1)).toBe('01');
});
