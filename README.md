# chk - The JavaScript Chaining Tick

A general object for ticking a set of values up or down.

Each tick is done on a unit (e.g. hour / minute / second) and compared against all the fractions of the unit e.g. seconds are fractions of a minute.

You call the initial function repeatedly and when it ticks past a limit it ticks the next. Kinda like how seconds, minutes and hours work.

* Tick anything (time / health points / pomodoros / slides)
* Tick up or down
* Tick down and cause the next element to tick up (pomodoros)
* Set callbacks for each individual tick.

It's still very much a work in progress, but it is currently powering my pomodoro timer: http://pom.ianchanning.com

## Syntax

### Up
```javascript
chk().up(element, count[, callback]);
```

### Down
```javascript
chk().down(element, count[, callback]);
```

## Starter example

```javascript
<div id="seconds">00</div>
<input id="go" type="button" value="Go">
<script src="chk.js"></script>
<script>
(function() {
  document.querySelector('#go').addEventListener('click', function() {
    setInterval(function() {
      chk().down(document.querySelector('#seconds'), 10);
    }, 1000);
  });
})();
</script>
```

## Examples

Rubiks cube stopwatch (N.B. `tickInterval` = 10ms)

  ```javascript
  setInterval(function() {
      chk()
      .up(document.querySelector('#hundredths'), 100)
      .up(document.querySelector('#seconds'), 60);
  }, 10);
  ```
Count down to an event

  ```javascript
  setInterval(function() {
      chk()
      .down(document.querySelector('#sec'), 60)
      .down(document.querySelector('#min'), 60)
      .down(document.querySelector('#hour'), 24)
      .down(document.querySelector('#day'), 365);
  }, 1000);
  ```
Pomodoros

  ```javascript
  var notification = function(){alert('take a break');};
  setInterval(function() {
      chk()
      .down(document.querySelector('#sec'), 60)
      .down(document.querySelector('#min'), 25)
      .up(document.querySelector('#pomo'), 100, notification);
  }, 1000);
  ```

## Tests

There is a basic implementation of Jest tests. First install `yarn` and then:

```bash
yarn install
yarn test
```

Also there is a basic example page at `tests/index.html`, a relatively simple way of doing this is via `npx`. First install `npm` globally which should give you `npx`. You can then run:

```bash
npx http-server
```

in this directory and go to <http://localhost:8080/tests> to see the basic countdown working.
