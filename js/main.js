(function() {
 var DEBUG, before, c, clamp, collides, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

 c = document.getElementById('draw');

 ctx = c.getContext('2d');

 delta = 0;

 now = 0;

 before = Date.now();

 elapsed = 0;

 loading = 0;

 DEBUG = false;

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
 music = [];

 framesThisSecond = 0;
 fpsElapsed = 0;
 fps = 0

 jumping = 100;
 amplitude = 0;
 moving = false;
 lastJumpTime = 0;
 jumpPeriod = 0;
 dir = 0;

 popups = [];

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
   x: 0,
   y: 373,
 }

resetPlayer = function() {
    player_animation_frame = 0;
    frame_counter = 0;

    jumping = 100;
    amplitude = 0;
    moving = false;
    lastJumpTime = 0;
    jumpPeriod = 0;
    dir = 0;

    player.x = 0;
    player.y = playerYs[currentLevel];
}

playerYs = [373, 526, 520, 300];
levelPeriods = [2, 3, 2.5, 2];


levels = [[
    new Wave(0, 100, 400),
    new ParallaxThing("house2", 540, 170, -0.03),
    new ParallaxThing("house1", 20, 340, -0.03),
    new ParallaxThing("house3", 300, 80, -0.06),
    "player",
    new StaticThing("bridge/background", 0, 250),
    new StaticThing("bridge/base", 0, 250),
    new Jebbable(0, 250, 800, 500, ["bridge/cokol", "bridge/main", "bridge/lines"]),
],
[
    new ParallaxThing("reichstag/plane", 70, 30, 0.5),
    new ParallaxThing("reichstag/zeppelin", 70, 0, -0.1),
    new Jebbable(-20, 10, 800, 600, ["reichstag/building"]),
    "player",
    new StaticThing("reichstag/background", 0, 0),
],
[
    new ParallaxThing("trump/trump", 70, 0, -0.3),
    new ParallaxThing("trump/chopper", 70, 0, -0.3),
    new Jebbable(0, 10, 800, 600, ["trump/tower"]),
    new StaticThing("trump/people", 0, 0),
    "player",
    new StaticThing("trump/background", 0, 0),
],
[
    "player",
]];

currentLevel = 0;
level = levels[currentLevel];

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

function Wave(x, y, length) {
    this.x = x;
    this.y = y;
    this.length = length;
}

Wave.prototype.draw = function(ctx) {
     for(var x = this.x; x < this.length; x += 1) {
        var y = Math.sin(x / 10 + elapsed) * 20;
        ctx.fillStyle = "#aaaaaa";
        ctx.fillRect(x, y + this.y, 1, 1);
        ctx.fillRect(x, this.y, 1, 1);
     }
}

function StaticThing(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
}

StaticThing.prototype.draw = function(ctx) {
     ctx.drawImage(images[this.image], this.x, this.y);
}

function ParallaxThing(image, x, y, shift) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.shift = shift;
}

ParallaxThing.prototype.draw = function(ctx) {
     ctx.drawImage(images[this.image], this.x + player.x * this.shift, this.y);
}

function Jebbable(x, y, width, height, layers, ctx) {
    this.cc = document.createElement("canvas");
    this.x = x
    this.y = y
    this.cc.width = width;
    this.cc.height = height;
    this.layers = layers;
    this.btx = this.cc.getContext("2d");

    if(ctx) {
         this.btx.fillStyle = "#FFFFFF";
         this.btx.fillRect(0, 0, this.cc.width, this.cc.height);
         for(var i = 0; i < this.layers.length; i++) {
             this.btx.drawImage(images[this.layers[i]], 0, 0);
         }
    }
}

Jebbable.prototype.draw = function(ctx) {

     if(amplitude < 8) {
         this.btx.fillStyle = "#FFFFFF";
         this.btx.fillRect(0, 0, this.cc.width, this.cc.height);
         for(var i = 0; i < this.layers.length; i++) {
             this.btx.drawImage(images[this.layers[i]], 0, 0);
         }
     }

     var imageData = this.btx.getImageData(0, 0, this.cc.width, this.cc.height);
     var data = imageData.data;

     this.btx.fillStyle = "#FFFFFF";
     this.btx.fillRect(0, 0, this.cc.width, this.cc.height);
     var newImageData = this.btx.createImageData(this.cc.width, this.cc.height)
     var newData = newImageData.data;

     if(amplitude < 8) {
         for(var i = 0; i < data.length; i += 4) {
             var x = (i / 4) % this.cc.width;
             var y = Math.floor((i / 4) / this.cc.width);

             if(data[i] != 255) {
                 // WONSZ
                 y += Math.floor(Math.sin(x / 20 + elapsed * 5) * amplitude);

                 var j = 4 * (y * this.cc.width + x);
                 newData[j] = data[i]
                 newData[j + 1] = data[i + 1]
                 newData[j + 2] = data[i + 2]
                 newData[j + 3] = data[i + 3]
             }
         }
     } else {
         for(var x = 0; x < this.cc.width; x += 1) {
             for(var y = 0; y < this.cc.height; y += 1) {
                 var i = 4 * (y * this.cc.width + x);
                 var nx = x;
                 var ny = y;

                 if(data[i + 3] > 0) {
                     // JEB
                     ny += yRandom()
                     nx += xRandom()

                     var j = 4 * (ny * this.cc.width + nx);
                     if(j + 3 < data.length) {
                         newData[j] = data[i]
                         newData[j + 1] = data[i + 1]
                         newData[j + 2] = data[i + 2]
                         newData[j + 3] = data[i + 3]
                     }
                 }
             }
         }
     }

     this.btx.putImageData(newImageData, 0, 0)

     ctx.drawImage(this.cc, this.x, this.y)
}

makePopup = function(image) {
    popups.push({
        x:     player.x,
        y:     player.y - 30,
        image:  image,
        ttl:   2,
        speed: 20,
    })
}

 update = function(delta) {
     if(currentLevel == -1) {
         return
     }

     framesThisSecond += 1;
     fpsElapsed += delta;
     if(fpsElapsed >= 1) {
        fps = framesThisSecond / fpsElapsed;
        framesThisSecond = fpsElapsed = 0;
     }

     if(keysPressed[82]) {
        currentLevel++;
        level = levels[currentLevel];
        resetPlayer();
     }

     if(keysDown[65] && player.x > -10) {
         player.x -= delta * 100;
         if(!moving) {
            animations["go"].reset()
         }

         moving = true
     } else if(keysDown[68] && (player.x < 760 || amplitude > 8)) {
         player.x += delta * 100;
         if(!moving) {
            animations["go"].reset()
         }

         moving = true
     } else {
         moving = false;
     }

     if(player.x > 800) {
        currentLevel++;
        level = levels[currentLevel];
        resetPlayer();
     }

     if(keysPressed[32] && jumping > 3.14) {
        jumping = 0;
        animations["jump"].reset()
     }

     if(jumping <= 3.14) {
        player.y = playerYs[currentLevel] - Math.sin(jumping) * 30;
        jumping += delta * 6;
     } else if(jumping > (3.14 - 0.1) && jumping < 100) {
         jumping = 100;
         var y = (Math.min(0.2, Math.sin(elapsed * 2)) + 0.2) * 2;

         if(lastJumpTime) {
            jumpPeriod = elapsed - lastJumpTime;

            targetPeriod = levelPeriods[currentLevel];
            error = (jumpPeriod - targetPeriod) * (jumpPeriod - targetPeriod)

            console.log(error)
            if(error < 0.3) {
                dir = 0;
                amplitude += (currentLevel == 3) ? 5 : 3;
            } else {
                dir = jumpPeriod - targetPeriod;

                if(dir > 0) {
                    makePopup("snail")
                } else if(dir < 0) {
                    makePopup("rabbit");
                }

                if(amplitude < 8) {
                    amplitude -= 0.4;
                }
            }
         }

         lastJumpTime = elapsed;

         player.y = playerYs[currentLevel]
         console.log("JEB")
         audios["jeb"].play();
     }

     if(amplitude > 0) {
        if(amplitude < 8) {
            amplitude -= delta * 0.05
        } else {
            audios["ultimate_jeb"].play();
            if(currentLevel == 3) {
                level = [new Jebbable(player.x, player.y, 400, 400, ["meskam"], ctx)];
                currentLevel = -1;
            }
        }
     } else {
        amplitude = 0
     }

     for(var i = 0; i < popups.length; i++) {
        var popup = popups[i];
        popup.ttl -= delta;
        popup.y -= popup.speed * delta;
        if(popup.ttl <= 0) {
            popup.delete = true;
        }
     }

     for(var i = 0; i < popups.length; i++) {
        var popup = popups[i];
        if(popup.delete) {
            popups.splice(i, 1);
            break;
        }
     }
 };

 draw = function(delta) {
     frame_counter = (frame_counter + 1) % fps_limit;

     ctx.fillStyle = "#FFFFFF";
     ctx.fillRect(0, 0, c.width, c.height);

     if(DEBUG) {
        ctx.fillStyle = "#888888";
        ctx.font = "20px Sans";
        ctx.fillText(Math.round(fps), 10, 20);
     }


     for(var i = 0; i < level.length; i++) {
         if(level[i] == "player") {
             if(jumping < 3.14) {
                animations["jump"].draw(ctx, player.x, player.y, 60, 60);
             } else if(moving) {
                animations["go"].draw(ctx, player.x, player.y, 60, 60);
             } else {
                animations["stay"].draw(ctx, player.x, player.y, 60, 60);
             }
         } else {
             level[i].draw(ctx);
         }
     }

     if(currentLevel !== -1) {
         for(var i = 0; i < popups.length; i++) {
            var popup = popups[i];
            ctx.drawImage(images[popup.image], popup.x, popup.y, 50, 50);
         }
     }
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

 playRandomMusic = function() {
    music[Math.floor(Math.random() * (music.length))].play();
 }

 loadMusic = function(name) {
    var m = new Audio("sounds/"+name+".ogg");
    m.volume = 0.3;
    m.addEventListener("ended", function() {
        this.currentTime = 0;
        playRandomMusic();
    });

    music.push(m);
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

 loadImage("trump/tower");
 loadImage("trump/background");
 loadImage("trump/people");
 loadImage("trump/chopper");
 loadImage("trump/trump");

 loadImage("reichstag/background");
 loadImage("reichstag/building");
 loadImage("reichstag/plane");
 loadImage("reichstag/zeppelin");

 loadImage("snail");
 loadImage("rabbit");

 loadImage("meskam");

 audios["jeb"] = new Audio('sounds/jeb.ogg');
 audios["ultimate_jeb"] = new Audio("sounds/ultimate_jeb.ogg");

 loadMusic("melody1");



 makeRandom = function(min, max) {
     for (var i=1e6, lookupTable=[]; i--;) {
        lookupTable.push(Math.floor(Math.random() * (max - min) + min));
     }

     var lookupCounter = 0

     return function() {
        return ++lookupCounter >= lookupTable.length ? lookupTable[lookupCounter=0] : lookupTable[lookupCounter];
     }
 }

 yRandom = makeRandom(0, 12);
 xRandom = makeRandom(-5, 5)

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         playRandomMusic();
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
