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
 animations = [];
 player_animation_frame = 0;
 frame_counter = 0;
 fps_limit = 60;

 audios = [];

 jumping = 100;
 amplitude = 0;
 moving = false;

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
   x: 50,
   y: 373,
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

    /**
    name - image name
    s_width - sheet width (columns)
    s_height - sheet height (rows)
    f_width - frame width (pixels)
    f_height - frame height (pixels)
    **/

animatedImage = function(name, s_width, s_height, f_width, f_height, fps, limit) {
    var img = images[name];
    var number = 0;
    return {
        draw: function(ctx, dx, dy, dw, dh) {
            if (frame_counter % fps == 0)
                number ++;
            number = number % limit;
            var y = Math.floor(number / s_width);
            var x = number - (y * s_width);
            if (dw && dh) {
                return ctx.drawImage(img, f_width * x, f_height * y,
                   f_width, f_height, dx, dy, dw, dh);
            } else {
                return ctx.drawImage(img, f_width * x, f_height * y,
                   f_width, f_height, dx, dy, f_width, f_height);
            }

        },

        reset: function() {
            number = 0;
        }
    }
}

 update = function(delta) {
     if(keysDown[65]) {
         player.x -= delta * 100;
         if(!moving) {
            animations["go"].reset()
         }

         moving = true
     } else if(keysDown[68]) {
         player.x += delta * 100;
         if(!moving) {
            animations["go"].reset()
         }

         moving = true
     } else {
         moving = false;
     }

     if(keysPressed[32] && jumping > 3.14 * 2) {
        jumping = 0;
        animations["jump"].reset()
     }

     if(jumping <= 3.14 * 2) {
        player.y -= Math.sin(jumping) * 10;
        jumping += delta * 4;
     } else if(jumping > (3.14 * 2 - 0.1) && jumping < 100) {
         jumping = 100;
         var y = (Math.min(0.2, Math.sin(elapsed * 2)) + 0.2) * 2;
         amplitude += 1;
         player.y = 373
         console.log("JEB")
         audios["jeb"].play();
     }

     console.log(amplitude)

     if(amplitude > 0) {
        amplitude -= delta * 0.05
     } else {
        amplitude = 0
     }
 };

 draw = function(delta) {
     frame_counter = (frame_counter + 1) % fps_limit;
     ctx.fillStyle = "#FFFFFF";
     ctx.fillRect(0, 0, c.width, c.height);

     ctx.fillStyle = "#888888";
     ctx.drawImage(images["house1"], 520 - player.x / 20, 400)
     ctx.drawImage(images["house2"], 70 - player.x / 20, 260)
     ctx.drawImage(images["house3"], 300 - player.x / 40, 80)

     //ctx.drawImage(images["meskam"], player.x, player.y);
     if(jumping < 3.14 * 2) {
        animations["jump"].draw(ctx, player.x, player.y, 60, 60);
     } else if(moving) {
        animations["go"].draw(ctx, player.x, player.y, 60, 60);
     } else {
        animations["stay"].draw(ctx, player.x, player.y, 60, 60);
     }
     ctx.drawImage(images["bridge/background"], 0, 250);
     ctx.drawImage(images["bridge/base"], 0, 250);


     if(amplitude < 8) {
         btx.fillStyle = "#FFFFFF";
         btx.fillRect(0, 0, cc.width, cc.height);
         btx.drawImage(images["bridge/cokol"], 0, 100);
         btx.drawImage(images["bridge/main"], 0, 100);
         btx.drawImage(images["bridge/lines"], 0, 100);
     }

     for(var x = 0; x < 400; x += 1) {
        var y = (Math.min(0.2, Math.sin(x / 10 + elapsed)) + 0.2) * 20;
        ctx.fillStyle = "#888888";
        ctx.fillRect(x, y + 100, 1, 1);

        ctx.fillRect(x, 100, 1, 1);
     }

     var y = (Math.min(0.2, Math.sin(elapsed * 2)) + 0.2) * 20;
     ctx.fillRect(100, y + 140, 10, 10);
     ctx.fillRect(100, 150 + 10, 14, 2);

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
             if(amplitude < 8) {
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

     ctx.drawImage(cc, 0, 150)
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

 loadImage = function(name, callback) {
    var img = new Image()
    console.log('loading')
    loading += 1
    img.onload = function() {
        console.log('loaded ' + name)
        images[name] = img
        loading -= 1
        if(callback) {
            callback(name);
        }
    }

    img.src = 'img/' + name + '.png'
 }

 loadImage("bridge");
 loadImage("house1");
 loadImage("house2");
 loadImage("house3");

 loadImage("stay", function(name) {
     animations["stay"] = animatedImage("stay", 1, 2, 300, 300, 20, 2);
 });

 loadImage("go", function(name) {
     animations["go"] = animatedImage("go", 4, 4, 300, 300, 1, 16);
 });

  loadImage("jump", function(name) {
     animations["jump"] = animatedImage("jump", 4, 4, 300, 300, 1, 14);
 });

 loadImage("bridge/lines");
 loadImage("bridge/main");
 loadImage("bridge/cokol");
 loadImage("bridge/background");
 loadImage("bridge/base");

 audios["jeb"] = new Audio('sounds/jeb.ogg');


 cc = document.createElement("canvas")
 cc.width = 800
 cc.height = 500
 btx = cc.getContext("2d");

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         // btx.fillStyle = "#FFFFFF";
         // btx.fillRect(0, 0, cc.width, cc.height);
         // btx.drawImage(images["bridge"], 0, 100);
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
