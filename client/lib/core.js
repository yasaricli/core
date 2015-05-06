var root = this;

if (!_.has(root, 'MeteorSounds')) {
  MeteorSounds = {
    play: function() {},
    stop: function() {},
    loop: function() {}
  };
}

root.vibrate = function(v) {
  if (_.has(navigator, 'notification')) {
    return navigator.notification.vibrate(v || 100);
  }
};

root.Core = new function() {
  var self = this;

	var player, canvas, contex;
  var FRAMERATE = 60,

	    world = {
		    width: window.innerWidth,
		    height: window.innerHeight
	    },

	  // Game elements
	  organisms = [],
	  particles = [],

	  // Mouse properties
	  mouseX = (window.innerWidth + world.width) * 0.5,
	  mouseY = (window.innerHeight + world.height) * 0.5,
	  mouseIsDown = false,
	  spaceIsDown = false,

	  // Game properties and scoring
	  playing = new ReactiveVar(false),
	  score = new ReactiveVar(0),

	  time = new ReactiveVar(0),
	  duration = new ReactiveVar(0),
	  difficulty = new ReactiveVar(1),
	  lastspawn = new ReactiveVar(0),

	  // Game statistics
    fc = 0, // Frame count
	  fs = 0, // Frame score
	  cs = 0, // Collision score
	  frames = 0,

	    // The world's velocity
	  velocity = { x: -1.3, y: 1 },

	  // Performance (FPS) tracking
	  fps = new ReactiveVar(0),
	  fpsMin = new ReactiveVar(1000),
	  fpsMax = new ReactiveVar(0),
	  timeLastSecond = new ReactiveVar(new Date().getTime());

  this.isEnemy = function(type) {
    return type == 'enemy';
  };

  this.isEnergy = function(type) {
    return type == 'energy';
  };

  this.resume = function() {
    playing.set(true);
    MeteorSounds.loop('bg');
  };

  // if index page then stop or game page then pause.
  this.pause = function() {
    playing.set(false);
    MeteorSounds.stop('bg');
  };

  this.getScore = function() {
    return Math.round(score.get());
  };

  this.getPlaying = function() {
    return playing.get();
  };

	this.init = function(){
    canvas = document.getElementById('Game');
		context = canvas.getContext('2d');

    if (!player) {
		  // Register event listeners
		  canvas.addEventListener('touchstart', documentTouchStartHandler, false);
		  window.addEventListener('resize', windowResizeHandler, false);
		  document.addEventListener('mousemove', documentMouseMoveHandler, false);
		  document.addEventListener('mousedown', documentMouseDownHandler, false);
		  document.addEventListener('mouseup', documentMouseUpHandler, false);
		  document.addEventListener('touchmove', documentTouchMoveHandler, false);
		  document.addEventListener('touchend', documentTouchEndHandler, false);
		  document.addEventListener('keydown', documentKeyDownHandler, false);
		  document.addEventListener('keyup', documentKeyUpHandler, false);

		  // Define our player
		  player = new Player();
		  animate();
    }

		// Force an initial resize to make sure the UI is sized correctly
		windowResizeHandler();
	};

	/**
	 * Handles click on the start button in the UI.
	 */
	this.StartGame = function() {
		if(!playing.get()) {
			playing.set(true);

			// Reset game properties
			organisms = [];
			score.set(0);
			difficulty.set(1);

			// Reset game tracking properties
			fc = 0;
			fs = 0;
			ms = 0;
			cs = 0;

			// Reset the player data
			player.energy = 30;
			time.set(new Date().getTime());

      // background music play
      MeteorSounds.loop('bg');
		}
	};

	/**
	 * Stops the currently ongoing game and shows the
	 * resulting data in the UI.
	 */
	function gameOver() {
		playing.set(false);

		// Determine the duration of the game
		duration.set(new Date().getTime() - time.get());

    // background music play
    MeteorSounds.stop('bg');

    // goto finish router
    Router.go('GameOver');

    // game over vibrate
    vibrate(750);
	}

	function documentKeyDownHandler(event) {
		switch(event.keyCode) {
			case 32:
				if(!spaceIsDown && player.energy > 15) {
					player.energy -= 4;
				}
				spaceIsDown = true;
				event.preventDefault();
				break;
		}
	}
	function documentKeyUpHandler(event) {
		switch( event.keyCode ) {
			case 32:
				spaceIsDown = false;
				event.preventDefault();
				break;
		}
	}

	/**
	 * Event handler for document.onmousemove.
	 */
	function documentMouseMoveHandler(event){
		mouseX = event.clientX - (window.innerWidth - world.width) * 0.5;
		mouseY = event.clientY - (window.innerHeight - world.height) * 0.5;
	}

	/**
	 * Event handler for document.onmousedown.
	 */
	function documentMouseDownHandler(event){
		mouseIsDown = true;
	}

	/**
	 * Event handler for document.onmouseup.
	 */
	function documentMouseUpHandler(event) {
		mouseIsDown = false;
	}

	/**
	 * Event handler for document.ontouchstart.
	 */
	function documentTouchStartHandler(event) {
		if(event.touches.length == 1) {
			event.preventDefault();
			mouseX = event.touches[0].pageX - (window.innerWidth - world.width) * 0.5;
			mouseY = event.touches[0].pageY - (window.innerHeight - world.height) * 0.5;
			mouseIsDown = true;
		}
	}

	/**
	 * Event handler for document.ontouchmove.
	 */
	function documentTouchMoveHandler(event) {
		if(event.touches.length == 1) {
			event.preventDefault();

			mouseX = event.touches[0].pageX - (window.innerWidth - world.width) * 0.5 - 60;
			mouseY = event.touches[0].pageY - (window.innerHeight - world.height) * 0.5 - 30;
		}
	}

	/**
	 * Event handler for document.ontouchend.
	 */
	function documentTouchEndHandler(event) {
		mouseIsDown = false;
	}

	/**
	 * Event handler for window.onresize.
	 */
	function windowResizeHandler() {
		world.width = window.innerWidth;
		world.height = window.innerHeight;

		// Center the player
		player.position.x = world.width * 0.5;
		player.position.y = world.height * 0.5;

		// Resize the canvas
		canvas.width = world.width;
		canvas.height = world.height;

		// Determine the x/y position of the canvas
		var cvx = (window.innerWidth - world.width) * 0.5;
		var cvy = (window.innerHeight - world.height) * 0.5;

		// Position the canvas
		canvas.style.position = 'absolute';
		canvas.style.left = cvx + 'px';
		canvas.style.top = cvy + 'px';
	}

	/**
	 * Emits a random number of particles from a set point.
	 *
	 * @param position The point where particles will be
	 * emitted from
	 * @param spread The pixel spread of the emittal
	 */
	function emitParticles( position, direction, spread, seed ) {
		var q = seed + ( Math.random() * seed );
		while( --q >= 0 ) {
			var p = new Point();
			p.position.x = position.x + ( Math.sin(q) * spread );
			p.position.y = position.y + ( Math.cos(q) * spread );
			p.velocity = { x: direction.x + ( -1 + Math.random() * 2 ), y: direction.y + ( - 1 + Math.random() * 2 ) };
			p.alpha = 1;
			particles.push( p );
		}
	}

	/**
	 * Called on every frame to update the game properties
	 * and render the current state to the canvas.
	 */
	function animate() {

		// Fetch the current time for this frame
		var frameTime = new Date().getTime();

		// Increase the frame count
		frames ++;

		// Check if a second has passed since the last time we updated the FPS
		if( frameTime > timeLastSecond.get() + 1000 ) {
			// Establish the current, minimum and maximum FPS
			fps.set(Math.min(Math.round( ( frames * 1000 ) / ( frameTime - timeLastSecond.get() ) ), FRAMERATE));
			fpsMin.set(Math.min(fpsMin.get(), fps.get()));
			fpsMax.set(Math.max(fpsMax.get(), fps.get()));

			timeLastSecond.set(frameTime);
			frames = 0;
		}

		// A factor by which the score will be scaled, depending on current FPS
		var scoreFactor = 0.01 + ( Math.max( Math.min( fps.get(), FRAMERATE ), 0 ) / FRAMERATE * 0.99 );

		// Scales down the factor by itself
		scoreFactor = scoreFactor * scoreFactor;

		// Clear the canvas of all old pixel data
		context.clearRect(0,0,canvas.width,canvas.height);

		var i,
			ilen,
			j,
			jlen;

		// Only update game properties and draw the player if a game is active
		if(playing.get()) {

			// Increment the difficulty slightly
			difficulty.set(difficulty.get() + 0.0015);

			// Increment the score depending on difficulty
			score.set( score.get() + ((0.4 * difficulty.get()) * scoreFactor));

			// Increase the game frame count stat
			fc ++;

			// Increase the score count stats
			fs += (0.4 * difficulty.get()) * scoreFactor;

			//player.angle = Math.atan2( mouseY - player.position.y, mouseX - player.position.x );

			var targetAngle = Math.atan2( mouseY - player.position.y, mouseX - player.position.x );

			if( Math.abs( targetAngle - player.angle ) > Math.PI ) {
				player.angle = targetAngle;
			}

			player.angle += ( targetAngle - player.angle ) * 0.2;

			player.energyRadiusTarget = ( player.energy / 100 ) * ( player.radius * 0.8 );
			player.energyRadius += ( player.energyRadiusTarget - player.energyRadius ) * 0.2;

			player.shield = { x: player.position.x + Math.cos( player.angle ) * player.radius, y: player.position.y + Math.sin( player.angle ) * player.radius };

			// Shield
			context.beginPath();
			context.strokeStyle = '#3be2d4';
			context.lineWidth = 8;
			context.arc( player.position.x, player.position.y, player.radius, player.angle + 1.6, player.angle - 1.6, true );
			context.stroke();

			// Core
			context.beginPath();
			context.fillStyle = "#249d93";
			context.strokeStyle = "#3be2d4";
			context.lineWidth = 3;

			player.updateCore();

			var loopedNodes = player.coreNodes.concat();
			loopedNodes.push(player.coreNodes[0]);

			for( var i = 0; i < loopedNodes.length; i++ ) {
				p = loopedNodes[i];
				p2 = loopedNodes[i+1];

				p.position.x += ( (player.position.x + p.normal.x + p.offset.x) - p.position.x ) * 0.2;
				p.position.y += ( (player.position.y + p.normal.y + p.offset.y) - p.position.y ) * 0.2;

				if( i == 0 ) {
					// This is the first loop, so we need to start by moving into position
					context.moveTo( p.position.x, p.position.y );
				}
				else if( p2 ) {
					// Draw a curve between the current and next trail point
					context.quadraticCurveTo( p.position.x, p.position.y, p.position.x + ( p2.position.x - p.position.x ) / 2, p.position.y + ( p2.position.y - p.position.y ) / 2 );
				}
			}

			context.closePath();
			context.fill();
			context.stroke();

		  if( spaceIsDown && player.energy > 10 ) {
		  	player.energy -= 0.1;
		  	context.beginPath();
		  	context.fillStyle = 'rgba( 0, 100, 100, ' + ( player.energy / 100 ) * 0.9 + ' )';
		  	context.arc( player.position.x, player.position.y, player.radius, 0, Math.PI*2, true );
		  	context.fill();
		  }

		  var enemyCount = 0;
		  var energyCount = 0;

		  // Go through each enemy and draw it + update its properties
		  for( i = 0; i < organisms.length; i++ ) {
		  	p = organisms[i];

		  	p.position.x += p.velocity.x;
		  	p.position.y += p.velocity.y;

		  	p.alpha += ( 1 - p.alpha ) * 0.1;

        // fillStyle type
        context.fillStyle = p.fillStyle

		  	context.beginPath();
		  	context.arc(p.position.x, p.position.y, p.size/2, 0, Math.PI*2, true);
		  	context.fill();

		  	var angle = Math.atan2( p.position.y - player.position.y, p.position.x - player.position.x );
		  	if (playing.get()) {
		  		var dist = Math.abs( angle - player.angle );

		  		if( dist > Math.PI ) {
		  			dist = ( Math.PI * 2 ) - dist;
		  		}

		  		if ( dist < 1.6 ) {
		  			if (p.distanceTo(player.position) > player.radius - 5 && p.distanceTo(player.position) < player.radius + 5) {
		  				p.dead = true;
		  			}
		  		}

		  		if (spaceIsDown && p.distanceTo(player.position) < player.radius && player.energy > 11) {
		  			p.dead = true;
		  			score.set(score.get() + 5);
            console.log('dead2');
		  		}

		  		if (p.distanceTo(player.position) < player.energyRadius + (p.size * 0.5)) {
		  			if (self.isEnemy(p.type)) {
              vibrate(p.size * 60);
              MeteorSounds.play('enemy');
		  				player.energy -= 5;
		  			}

		  			if (self.isEnergy(p.type)) {
              MeteorSounds.play('energy');
		  				player.energy += 10;
		  				score.set(score.get() + 50);
		  			}

		  			player.energy = Math.max(Math.min(player.energy, 100), 0);
		  			p.dead = true;
		  		}
		  	}

		  	// If the enemy is outside of the game bounds, destroy it
		  	if( p.position.x < -p.size || p.position.x > world.width + p.size || p.position.y < -p.size || p.position.y > world.height + p.size ) {
		  		p.dead = true;
		  	}

		  	// If the enemy is dead, remove it
		  	if( p.dead ) {
		  		emitParticles( p.position, { x: (p.position.x - player.position.x) * 0.02, y: (p.position.y - player.position.y) * 0.02 }, 5, 5 );
		  		organisms.splice( i, 1 );
		  		i --;
		  	}
		  	else {
		  		if(self.isEnemy(p.type)) enemyCount ++;
		  		if(self.isEnergy(p.type)) energyCount ++;
		  	}
		  }

		  // If there are less enemies than intended for this difficulty, add another one
		  if( enemyCount < 1 * difficulty.get() && new Date().getTime() - lastspawn.get() > 100 ) {
		  	organisms.push( giveLife( new Enemy() ) );
		  	lastspawn.set(new Date().getTime());
		  }

		  //
		  if( energyCount < 1 && Math.random() > 0.996 ) {
		  	organisms.push( giveLife( new Energy() ) );
		  }

		  // Go through and draw all particle effects
		  for( i = 0; i < particles.length; i++ ) {
		  	p = particles[i];

		  	// Apply velocity to the particle
		  	p.position.x += p.velocity.x;
		  	p.position.y += p.velocity.y;

		  	// Fade out
		  	p.alpha -= 0.02;

		  	// Draw the particle
		  	context.fillStyle = 'rgba(255,255,255,'+Math.max(p.alpha,0)+')';
		  	context.fillRect( p.position.x, p.position.y, 1, 1 );

		  	// If the particle is faded out to less than zero, remove it
		  	if( p.alpha <= 0 ) {
		  		particles.splice( i, 1 );
		  	}
		  }

			if(!player.energy) {
				emitParticles( player.position, { x: 0, y: 0 }, 10, 40 );
				gameOver();
			}
		}

		root.requestAnimationFrame(animate);
	}

	/**
	 *
	 */
	function giveLife(organism) {
		var side = Math.round(Math.random() * 3);

		switch(side) {
			case 0:
				organism.position.x = 10;
				organism.position.y = world.height * Math.random();
				break;
			case 1:
				organism.position.x = world.width * Math.random();
				organism.position.y = 10;
				break;
			case 2:
				organism.position.x = world.width - 10;
				organism.position.y = world.height * Math.random();
				break;
			case 3:
				organism.position.x = world.width * Math.random();
				organism.position.y = world.height - 10;
				break;
		}

		organism.speed = Math.min(Math.max( Math.random(), 0.6 ), 0.75);

		organism.velocity.x = (player.position.x - organism.position.x) * 0.006 * organism.speed;
		organism.velocity.y = (player.position.y - organism.position.y) * 0.006 * organism.speed;

		if(self.isEnemy(organism.type)) {
			organism.velocity.x *= (1+(Math.random()*0.1));
			organism.velocity.y *= (1+(Math.random()*0.1));
		}

		organism.alpha = 0;
		return organism;
	}
};

function Point(x, y) {
	this.position = { x: x, y: y };
}

Point.prototype.distanceTo = function(p) {
	var dx = p.x-this.position.x,
      dy = p.y-this.position.y;
	return Math.sqrt(dx*dx + dy*dy);
};

Point.prototype.clonePosition = function() {
	return { x: this.position.x, y: this.position.y };
};

function Player() {
	this.position = { x: 0, y: 0 };
	this.length = 15;
	this.energy = 30;
	this.energyRadius = 0;
	this.energyRadiusTarget = 0;
	this.radius = 60;
	this.angle = 0;
	this.coreQuality = 15;
	this.coreNodes = [];
};

Player.prototype = new Point();
Player.prototype.updateCore = function() {
	if(!this.coreNodes.length) {
		for (var i = 0; i < this.coreQuality; i++) {
		  this.coreNodes.push({
				position: { x: this.position.x, y: this.position.y },
				normal: { x: 0, y: 0 },
				normalTarget: { x: 0, y: 0 },
				offset: { x: 0, y: 0 }
			});
		}
	}

	for (var i = 0; i < this.coreQuality; i++) {
		var n = this.coreNodes[i],
		    angle = ( (i / this.coreQuality) * (Math.PI * 2) );

		n.normal.x = Math.cos(angle) * this.energyRadius;
		n.normal.y = Math.sin(angle) * this.energyRadius;
		n.offset.x = Math.random() * 5;
		n.offset.y = Math.random() * 5;
	}
};

function Enemy() {
	this.position = { x: 0, y: 0 };
	this.velocity = { x: 0, y: 0 };
	this.size = 6 + ( Math.random() * 4 );
	this.speed = 1;
	this.type = 'enemy';
  this.fillStyle = '#e1453d';
}
Enemy.prototype = new Point();

function Energy() {
	this.position = { x: 0, y: 0 };
	this.velocity = { x: 0, y: 0 };
	this.size = 10 + (Math.random()*6);
	this.speed = 1;
	this.type = 'energy';
  this.fillStyle = '#3be2d4';
}

Energy.prototype = new Point();
