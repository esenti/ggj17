(function() {
 var DEBUG, before, c, clamp, collides, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

 c = document.getElementById('draw');

 ctx = c.getContext('2d');

 delta = 0;

 now = 0;

 before = Date.now();

 elapsed = 0;

 loading = 0;

 DEBUG = true;

 c.width = 800;

 c.height = 600;

 keysDown = {};

 keysPressed = {};

 window.addEventListener("keydown", function(e) {
         keysDown[e.keyCode] = true;
         return keysPressed[e.keyCode] = true;
         }, false);

 window.addEventListener("keyup", function(e) {
         return delete keysDown[e.keyCode];
         }, false);

 setDelta = function() {
     now = Date.now();
     delta = (now - before) / 1000;
     return before = now;
 };

 if (!DEBUG) {
     console.log = function() {
         return null;
     };
 }

 ogre = false;

 clamp = function(v, min, max) {
     if (v < min) {
         return min;
     } else if (v > max) {
         return max;
     } else {
         return v;
     }
 };

 collides = function(a, b, as, bs) {
     return a.x + as > b.x && a.x < b.x + bs && a.y + as > b.y && a.y < b.y + bs;
 };

 player = {
x: 100,
   y: 100,
 }

 tick = function() {
     setDelta();
     elapsed += delta;
     update(delta);
     draw(delta);
     keysPressed = {};
     if (!ogre) {
         return window.requestAnimationFrame(tick);
     }
 };

 update = function(delta) {
     if(keysDown[65]) {
         player.x -= delta * 100;
     }

     if(keysDown[68]) {
         player.x += delta * 100;
     }
 };

 draw = function(delta) {

     var imageData = ctx.getImageData(0, 0, c.width, c.height);
     var data = imageData.data;

     var newImageData = ctx.createImageData(c.width, c.height)
     var newData = newImageData.data;

     for(var i = 0; i < data.length; i += 4) {
         var x = (i / 4) % c.width;
         var y = parseInt((i / 4) / c.width);

         if(data[i] !== 0) {
             if(elapsed <= 10) {
                 // WONSZ
                 y += parseInt(Math.sin(x / 20 + elapsed * 5) * elapsed);
             } else {
                 // JEB
                 y += parseInt(Math.random() * 24);
                 x += parseInt(Math.random() * 10 - 5);
             }

             newData[4 * (y * c.width + x) + 0] = data[i + 0]
             newData[4 * (y * c.width + x) + 1] = data[i + 1]
             newData[4 * (y * c.width + x) + 2] = data[i + 2]
             newData[4 * (y * c.width + x) + 3] = data[i + 3]
         }
     }

     ctx.putImageData(newImageData, 0, 0)

     ctx.save();
     return ctx.restore();
 };

 (function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (w.requestAnimationFrame) {
  break;
  }
  w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
  }
  if (!w.requestAnimationFrame) {
  targetTime = 0;
  return w.requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
  return w.setTimeout((function() {
          return callback(+(new Date));
          }), targetTime - currentTime);
  };
  }
 })();

 load = function() {
     ctx.clearRect(0, 0, c.width, c.height);
     ctx.fillStyle = "#FFFFFF";
     ctx.fillRect(300, 200, 400, 20);
     return window.requestAnimationFrame(tick);
 };

 load();

}).call(this);
