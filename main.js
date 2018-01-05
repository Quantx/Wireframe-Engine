var c = document.getElementById("game");
var ctx = c.getContext("2d");
var keymap = [];
function Engine()
{
  this.FPS = 30;
  this.gloop = window.setInterval(function(){gameLoop();},1000 / this.FPS);
  this.handleKeys = function(ply,key)
  {
    
    if(key[87] && !key[83]) //forward
    {
      ply.obj.z -= Math.cos(ply.obj.ry) * ply.obj.speed;
      ply.obj.x -= Math.sin(ply.obj.ry) * ply.obj.speed;
    }
    else if(key[83] && !key[87]) //back
    {
      ply.obj.z += Math.cos(ply.obj.ry) * ply.obj.speed;
      ply.obj.x += Math.sin(ply.obj.ry) * ply.obj.speed;
    }
    
    if(key[65] && !key[68]) //left
    {
      ply.obj.z += Math.cos(ply.obj.ry + Math.PI / 2) * ply.obj.speed;
      ply.obj.x += Math.sin(ply.obj.ry + Math.PI / 2) * ply.obj.speed;
    }
    else if(key[68] && !key[65]) //right
    {
      ply.obj.z -= Math.cos(ply.obj.ry + Math.PI / 2) * ply.obj.speed;
      ply.obj.x -= Math.sin(ply.obj.ry + Math.PI / 2) * ply.obj.speed;
    }
    
    if(key[88] && !key[67] && !key[90])
    {
      ply.stance = 0;//stand (x)
      ply.obj.speed = 3;
    }
    else if(key[67] && !key[88] && !key[90])
    {
      ply.stance = 1;//crouch (c)
      ply.obj.speed = 2;
    }
    else if(key[90] && !key[88] && !key[67])
    {
      ply.stance = 2;//prone (z)
      ply.obj.speed = 1;
    }
    
    if(key[32] && ply.stance != 2) //jump (space)
    {
      
    }
    
    if(ply.stance === 0 && ply.height < 48)ply.height += 2;
    else if(ply.stance === 1 && ply.height > 32)ply.height -= 2;
    else if(ply.stance === 1 && ply.height < 32)ply.height += 2;
    else if(ply.stance === 2 && ply.height > 16)ply.height -= 2;
    
  };
  this.handleMouse = function(ply,mouse)
  {
    ply.obj.ry += this.degToRad(mouse.x);
    ply.obj.rx += this.degToRad(mouse.y);
    if(ply.obj.rx < -Math.PI / 2)ply.obj.rx = -Math.PI / 2;
    if(ply.obj.rx >  Math.PI / 2)ply.obj.rx =  Math.PI / 2;
  };
  this.cls = function()
  {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,c.width,c.height);
  };
  this.getURIVar = function(variable)
  {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++)
    {
      var pair = vars[i].split("=");
      if(pair[0] == variable)
      {
        return pair[1];
      }
    } 
    return null;
  };
  this.rotMatrix = function(px,py,pz,rx,ry,rz)
  {
    var oup = {x:px,y:py,z:pz};
    var temp = oup.x; //rotate around y-axis (yaw)
    oup.x = oup.x * Math.cos(ry) - oup.z * Math.sin(ry);
    oup.z = oup.z * Math.cos(ry) + temp  * Math.sin(ry);
    temp = oup.y; //rotate around the x-axis (pitch)
    oup.y = oup.y * Math.cos(rx) - oup.z * Math.sin(rx);
    oup.z = oup.z * Math.cos(rx) + temp  * Math.sin(rx);
    temp = oup.x; //rotate around the z-axis (roll)
    oup.x = oup.x * Math.cos(rz) - oup.y * Math.sin(rz);
    oup.y = oup.y * Math.cos(rz) + temp  * Math.sin(rz);
    return oup;
  };
  this.convert3d2d = function(x,y,z,px,py,pz,rx,ry,rz,ply)
  {
    //invert y to display correctly
    y = -y;
    py = -py;
    
    var oup = {x:px,y:py,z:pz};
    
    //rotate model
    oup = this.rotMatrix(oup.x,oup.y,oup.z,rx,ry,rz);
    
    //move model to its worldly position and offset it by the player
    oup.x += x + ply.obj.x;
    oup.y += y + ply.obj.y + ply.height;
    oup.z += z + ply.obj.z;
    
    //rotate camera
    oup = this.rotMatrix(oup.x,oup.y,oup.z,ply.obj.rx,ply.obj.ry,ply.obj.rz);
    
    //convert point from 3d space to 2d space
    oup.x = oup.x / oup.z * (c.width / 2);
    oup.y = oup.y / oup.z * (c.width / 2);
    
    //move origin to center of screen
    oup.x += c.width  / 2;
    oup.y += c.height / 2;
    
    return oup;
  };
  this.degToRad = function(deg)
  {
    return (Math.PI / 180 * deg);
  };
  this.radToDeg = function(rad)
  {
    return (180 / Math.PI * rad);
  };
  this.drawHud = function(ply)
  {
    ctx.strokeStyle = ply.obj.color;
    ctx.fillStyle   = ply.obj.color;
    ctx.textAlign = "center";
    ctx.font = "11px Monospace";
    ctx.beginPath();
    var ang = 0;
    var p1;
    var p2;
    var p3;
    var compas = ["N","NW","W","SW","S","SE","E","NE"];
    for(var i = 0; i < 8; i++)
    {
      if(i % 2 === 0)
      {
        p1 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,8 ,0,8 ,0,ang,0,ply);
        p2 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,32,0,32,0,ang,0,ply);
        p3 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,36,0,36,0,ang,0,ply);
    }
      else
      {
        p1 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,8 ,0,8 ,0,ang,0,ply);
        p2 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,24,0,24,0,ang,0,ply);
        p3 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,28,0,28,0,ang,0,ply);
      }
      
      if(p1.z > 0 && p2.z > 0)
      {
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
      }
      if(p3.z > 0)ctx.fillText(compas[i] + " [" + (360 - Math.floor(this.radToDeg(ang))) + "]",p3.x,p3.y);
      ang += this.degToRad(45);
    }
    ang = Math.atan2(ply.obj.z - ply.targetZ,ply.obj.x - ply.targetX);
    if( ang < 0) ang = 2 * Math.PI +  ang;
    p1 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,-6,0,-3,0,ang,0,ply);
    p2 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z,-6,0, 3,0,ang,0,ply);
    p3 = this.convert3d2d(-ply.obj.x,ply.obj.y,-ply.obj.z, 6,0, 0,0,ang,0,ply);
    if(p1.z > 0 && p2.z > 0 && p3.z > 0)
    {
      ctx.moveTo(p1.x,p1.y);
      ctx.lineTo(p2.x,p2.y);
      ctx.lineTo(p3.x,p3.y);
      ctx.lineTo(p1.x,p1.y);
    }
    ctx.stroke();
    /* draws the vertical angle on the left side of the screen
      var deg = -Math.floor(this.radToDeg(ply.obj.rx));
      var inv = c.height / 9;
      for(i = 0; i < 9; i++)
      {
        ctx.fillText("[" + (deg - (i - 4)) + "]",16,inv * i + inv / 2);
      }
    */
    
  };
  this.render = function(px,py,pz,rx,ry,rz,plist,col,ply)
  {
    ctx.strokeStyle = col;
    var lsz;
    ctx.beginPath();
    for(var i = 0; i < plist.length; i++)
    {
      var sc = this.convert3d2d(px,py,pz,plist[i].x,plist[i].y,plist[i].z,rx,ry,rz,ply);
      if(plist[i].l && sc.z > 0 && lsz > 0)ctx.lineTo(sc.x,sc.y);
      else ctx.moveTo(sc.x,sc.y);
      lsz = sc.z;
    }
    ctx.stroke();
  };
}

function Core(x,y,z,rx,ry,rz,speed,color,plist) //core data for each object
{
  this.x = x;
  this.y = y;
  this.z = z;
  this.rx = rx;
  this.ry = ry;
  this.rz = rz;
  this.color = color;
  this.speed = speed;
  this.model = [];
  for(var i = 0; i < plist.length; i++)this.model[i] = 
  {
    x:plist[i].x,
    y:plist[i].y,
    z:plist[i].z,
    l:plist[i].l
  };
  this.checkPointCollision = function(px,py,pz,eng)
  {
    if(this.model.length === 0)return false;//if obj doesn't have a model return false;
    var minp = eng.rotMatrix(this.model[0].x,this.model[0].y,this.model[0].z,this.rx,this.ry,this.rz);
    var maxp = {x:minp.x,y:minp.y,z:minp.z};
    for(var i = 0; i < this.model.length; i++)//find aabb min and max xyz points for obj after the rotation
    {
      var newp = eng.rotMatrix(this.model[i].x,this.model[i].y,this.model[i].z,this.rx,this.ry,this.rz);
      if(newp.x < minp.x)minp.x = newp.x;
      if(newp.x > maxp.x)maxp.x = newp.x;
      if(newp.y < minp.y)minp.y = newp.y;
      if(newp.y > maxp.y)maxp.y = newp.y;
      if(newp.z < minp.z)minp.z = newp.z;
      if(newp.z > maxp.z)maxp.z = newp.z;
    }
    minp.x += this.x;//offset obj's min and max xyz points by it's worldy position
    minp.y += this.y;
    minp.z += this.z;
    maxp.x += this.x;
    maxp.y += this.y;
    maxp.z += this.z;
    
    //check if the obj1's bounding box contains the point
    return(px > minp.x && px < maxp.x && py > minp.y && py < maxp.y && pz > minp.z && pz < maxp.z);
  };
  this.checkObjCollision = function(iobj,eng)//checks for a collision between two rotateded and translated objects using 3d aabb
  {
    if(this.model.length === 0 && iobj.model.length === 0)return false;//if either obj doesn't have a model return false;
    //declare vars to hold the min and max values for obj1 and obj2
    var min1 = eng.rotMatrix(this.model[0].x,this.model[0].y,this.model[0].z,this.rx,this.ry,this.rz);
    var max1 = {x:min1.x,y:min1.y,z:min1.z};
    var min2 = eng.rotMatrix(iobj.model[0].x,iobj.model[0].y,iobj.model[0].z,iobj.rx,iobj.ry,iobj.rz);
    var max2 = {x:min2.x,y:min2.y,z:min2.z};
    for(var i = 0; i < this.model.length; i++)//find aabb min and max xyz points for obj1 after the rotation
    {
      var new1 = eng.rotMatrix(this.model[i].x,this.model[i].y,this.model[i].z,this.rx,this.ry,this.rz);
      if(new1.x < min1.x)min1.x = new1.x;
      if(new1.x > max1.x)max1.x = new1.x;
      if(new1.y < min1.y)min1.y = new1.y;
      if(new1.y > max1.y)max1.y = new1.y;
      if(new1.z < min1.z)min1.z = new1.z;
      if(new1.z > max1.z)max1.z = new1.z;
    }
    min1.x += this.x;//offset obj1's min and max xyz points by it's worldy position
    min1.y += this.y;
    min1.z += this.z;
    max1.x += this.x;
    max1.y += this.y;
    max1.z += this.z;
    for(var k = 0; k < iobj.model.length; k++)//find aabb min and max xyz points for obj2 after the rotation
    {
      var new2 = eng.rotMatrix(iobj.model[k].x,iobj.model[k].y,iobj.model[k].z,iobj.rx,iobj.ry,iobj.rz);
      if(new2.x < min2.x)min2.x = new2.x;
      if(new2.x > max2.x)max2.x = new2.x;
      if(new2.y < min2.y)min2.y = new2.y;
      if(new2.y > max2.y)max2.y = new2.y;
      if(new2.z < min2.z)min2.z = new2.z;
      if(new2.z > max2.z)max2.z = new2.z;
    }
    min2.x += iobj.x;//offset obj2's min and max xyz points by it's worldy position
    min2.y += iobj.y;
    min2.z += iobj.z;
    max2.x += iobj.x;
    max2.y += iobj.y;
    max2.z += iobj.z;
    
    //check if the obj1's bounding box collides with obj2's
    return(max1.x > min2.x && min1.x < max2.x && max1.y > min2.y && min1.y < max2.y && max1.z > min2.z && min1.z < max2.z);
  };
  this.drawModel = function(eng,ply)
  {
    eng.render(this.x,this.y,this.z,this.rx,this.ry,this.rz,this.model,this.color,ply);
  };
}

function Player(x,y,z,rx,ry,rz,color)
{
  this.obj = new Core(x,y,z,rx,ry,rz,3,color,[]);
  this.targetX = 0;
  this.targetY = 70;
  this.targetZ = 0;
  this.height = y;
  this.stance = 0; //0 = standing //1 = crouch //2 = prone
}

function Test(x,y,z,rx,ry,rz,color,plist)
{
  this.obj = new Core(x,y,z,rx,ry,rz,0,color,plist);
}

var fps = new Engine();
var mark = new Player(0,48,0,0,0,0,"blue");
var thing = new Test(0,64,3,0,0,0,"green",
[
  //bottom half
  {x: 4,y: 1,z: 1,l:false},
  {x: 1,y: 1,z: 0,l:true },
  {x:-1,y: 1,z: 0,l:true },
  {x:-4,y: 1,z: 1,l:true },//left midwing
  {x: 0,y: 1,z: 3,l:true },//nose
  {x: 4,y: 1,z: 1,l:true },//right midwing
  {x: 6,y: 1,z:-3,l:true },//right wingtip
  {x: 3,y: 1,z:-2,l:true },//right inwingtip
  {x: 1,y: 1,z: 0,l:true },//right tailbase
  {x: 1,y: 1,z:-2,l:true },
  {x: 0,y: 0,z:-5,l:true },//tail
  {x:-1,y: 1,z:-2,l:true },
  {x: 1,y: 1,z:-2,l:true },
  {x:-1,y: 1,z:-2,l:false},
  {x:-1,y: 1,z: 0,l:true },//left tailbase
  {x:-3,y: 1,z:-2,l:true },//left inwingtip
  {x:-6,y: 1,z:-3,l:true },//left wingtip
  {x:-4,y: 1,z: 1,l:true },
  //top half
  {x: 4,y: 0,z:-1,l:false},
  {x: 1,y: 0,z:-2,l:true },
  {x:-1,y: 0,z:-2,l:true },
  {x:-4,y: 0,z:-1,l:true },//left midwing
  {x: 0,y: 0,z: 1,l:true },//nose
  {x: 4,y: 0,z:-1,l:true },//right midwing
  {x: 6,y: 0,z:-5,l:true },//right wingtip
  {x: 3,y: 0,z:-4,l:true },//right inwingtip
  {x: 1,y: 0,z:-2,l:true },//right tailbase
  {x: 0,y: 0,z:-5,l:true },//tail
  {x:-1,y: 0,z:-2,l:true },//left tailbase
  {x:-3,y: 0,z:-4,l:true },//left inwingtip
  {x:-6,y: 0,z:-5,l:true },//left wingtip
  {x:-4,y: 0,z:-1,l:true },
  //connectors
  {x: 0,y: 1,z: 3,l:false},//nose
  {x: 0,y: 0,z: 1,l:true },
  {x: 4,y: 1,z: 1,l:false},//right midwing
  {x: 4,y: 0,z:-1,l:true },
  {x: 6,y: 1,z:-3,l:false},//right wingtip
  {x: 6,y: 0,z:-5,l:true },
  {x: 3,y: 1,z:-2,l:false},//right inwingtip
  {x: 3,y: 0,z:-4,l:true },
  {x: 1,y: 1,z: 0,l:false},//right tailbase
  {x: 1,y: 0,z:-2,l:true },
  {x:-1,y: 1,z: 0,l:false},//left tailbase
  {x:-1,y: 0,z:-2,l:true },
  {x:-3,y: 1,z:-2,l:false},//left inwingtip
  {x:-3,y: 0,z:-4,l:true },
  {x:-6,y: 1,z:-3,l:false},//left wingtip
  {x:-6,y: 0,z:-5,l:true },
  {x:-4,y: 1,z: 1,l:false},//left midwing
  {x:-4,y: 0,z:-1,l:true }
]);

function gameLoop()
{
  fps.cls();
  if(isMouseLocked())
  {
    fps.handleKeys(mark,keymap);
    fps.drawHud(mark);
    //mouse input is handled in the event below
    thing.obj.drawModel(fps,mark);
    
    thing.obj.rx += 0.0349;
    thing.obj.ry += 0.0349;
    thing.obj.rz += 0.0349;
    
  }
  else
  {
    ctx.fillStyle = "red";
    ctx.font = "48px Monospace";
    ctx.textAlign = "center";
    ctx.fillText("Click Here to Resume",c.width / 2,c.height / 2);
  }
  
}

c.requestPointerLock = c.requestPointerLock || c.mozRequestPointerLock || c.webkitRequestPointerLock;
c.webkitRequestFullscreen = c.webkitRequestFullscreen || c.mozRequestFullScreen();

function isMouseLocked()
{
  return (document.pointerLockElement === c ||
          document.mozPointerLockElement === c ||
          document.webkitPointerLockElement === c);
}

onkeydown = onkeyup = function(e)
{
    e = e || event;
    keymap[e.keyCode] = e.type == 'keydown';
    e.keyCode = 0;
    e.preventDefault();    
    e.stopPropagation();
    return false;
};

c.onclick = function(e)
{
  if(!isMouseLocked())
  {
    c.requestPointerLock();
    c.webkitRequestFullscreen();
  }
  else
  {
    
  }
};

onmousemove = function(e)
{
  var mouse = {x:0,y:0};
  mouse.x = e.movementX || e.mozMovementX || 0;
  mouse.y = e.movementY || e.mozMovementY || 0;
  if(isMouseLocked())fps.handleMouse(mark,mouse);
};