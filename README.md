# chk - The jQuery Chaining Tick

A general object for ticking a set of values up or down.

Each tick is done on a unit (e.g. hour / minute / second) and compared against all the fractions of the unit e.g. seconds are fractions of a minute.

You call the initial function repeatedly and when it ticks past a limit it ticks the next. Kinda like how seconds, minutes and hours work.

* Tick anything (time / health points / pomodoros / slides)
* Tick up or down
* Tick down and cause the next element to tick up (pomodoros)
* Set callbacks for each individual tick.

Finally it's tiny - 600 bytes minified.

It's still very much a work in progress, but it is currently powering my pomodoro timer: http://ianchanning.com/chk

## Syntax

```javascript
$(this).chk().up(element, count, callback);
```

```javascript
$(this).chk().down(element, count, callback);
```

## Very basic example

```javascript
<div id="seconds">00</div>
<input id="go" type="button" value="Go">
<script src="//code.jquery.com/jquery.min.js"></script>
<script src="jquery.chk.min.js"></script>
<script>
(function($) {
  $('#go').click(function() {
    setInterval(function() {
      $(this).chk().down($('#seconds'), 10);
    }, 1000);
  });
})(jQuery);
</script>
```

## Examples

1. Rubiks cube stopwatch (tickInterval = 10)

  ```javascript
  setInterval(function() {
      $(this).chk()
      .up($('#hundredths'), 100)
      .up($('#seconds'), 60);
  }, 10);
  ```
1. Count down to an event

  ```javascript
  setInterval(function() {
      $(this).chk()
      .down($('#sec'), 60)
      .down($('#min'), 60)
      .down($('#hour'), 24)
      .down($('#day'), 365);
  }, 1000);
  ```
1. Pomodoros

    ```javascript
    var notification = function(){alert('take a break');};
    setInterval(function() {
        $(this).chk()
        .down($('#sec'), 60)
        .down($('#min'), 25)
        .up($('#pomo'), 100, notification);
    }, 1000);
    ```
