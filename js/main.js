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

 images = [];

 jumping = 100;
 amplitude = 0;

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
   y: 200,
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

     if(keysPressed[32] && jumping > 3.14 * 2) {
        jumping = 0;
     }

     if(jumping <= 3.14 * 2) {
        // player.y -= Math.sin(jumping) * 3;
        jumping += delta * 6;
     } else if(jumping > 3.14 * 2 && jumping < 100) {
         jumping = 100;
         amplitude += 0.3;
         console.log("JEB")
     }

     console.log(jumping)
 };

 draw = function(delta) {
     ctx.fillStyle = "#FFFFFF";
     ctx.fillRect(0, 0, c.width, c.height);

     ctx.fillStyle = "#888888";
     ctx.fillRect(150 - player.x / 10, 50, 100, 300);

     ctx.fillRect(player.x, player.y, 20, 50);

     if(amplitude < 4) {
         btx.fillStyle = "#FFFFFF";
         btx.fillRect(0, 0, cc.width, cc.height);
         btx.drawImage(images["bridge"], 0, 100);
     }

     var imageData = btx.getImageData(0, 0, cc.width, cc.height);
     var data = imageData.data;

     var newImageData = btx.createImageData(cc.width, cc.height)
     var newData = newImageData.data;

     for(var i = 0; i < newData.length; i += 4) {
         newData[i] = 255;
         newData[i + 1] = 255;
         newData[i + 2] = 255;
         newData[i + 3] = 0;
     }

     for(var i = 0; i < data.length; i += 4) {
         var x = (i / 4) % cc.width;
         var y = Math.floor((i / 4) / cc.width);

         if(data[i] !== 255) {
             if(amplitude < 4) {
                 // WONSZ
                 y += Math.floor(Math.sin(x / 20 + elapsed * 5) * amplitude);
             } else {
                 // JEB
                 y += Math.floor(Math.random() * 24);
                 x += Math.floor(Math.random() * 10 - 5);
             }

             newData[4 * (y * cc.width + x) + 0] = data[i + 0]
             newData[4 * (y * cc.width + x) + 1] = data[i + 1]
             newData[4 * (y * cc.width + x) + 2] = data[i + 2]
             newData[4 * (y * cc.width + x) + 3] = data[i + 3]
         }
     }

     btx.putImageData(newImageData, 0, 0)

     ctx.drawImage(cc, 200, 100)
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

 loadImage = function(name) {
    img = new Image()
    console.log('loading')
    loading += 1
    img.onload = function() {
        console.log('loaded')
        images[name] = img
        loading -= 1
    }

    img.src = 'img/' + name + '.png'
 }

 loadImage("bridge");

 cc = document.createElement("canvas")
 cc.width = 400
 cc.height = 400
 btx = cc.getContext("2d");

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         btx.fillStyle = "#FFFFFF";
         btx.fillRect(0, 0, cc.width, cc.height);
         btx.drawImage(images["bridge"], 0, 100);
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
