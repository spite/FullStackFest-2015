/**
 * @author spite / https://github.com/spite
 */
/*global THREE, console */

THREE.GamepadControls = function ( object ) {

	this.rotMatrix = new THREE.Matrix4();
	this.dir = new THREE.Vector3( 0, 0, 1 );
	this.tmpVector = new THREE.Vector3();
	this.object = object;
	this.lon = -90;
	this.lat = 0;
	this.target = new THREE.Vector3();
	this.axesOffsets = null;
	this.buttonsOffsets = null;

	this.init = function(){

		var gamepadSupportAvailable = navigator.getGamepads ||
		!!navigator.webkitGetGamepads ||
		!!navigator.webkitGamepads;

		if (!gamepadSupportAvailable) {
			console.log( 'NOT SUPPORTED' );
		} else {
			if ('ongamepadconnected' in window) {
				window.addEventListener('gamepadconnected', onGamepadConnect.bind( this ), false);
				window.addEventListener('gamepaddisconnected', gamepadSupport.onGamepadDisconnect.bind( this ), false);
			} else {
				this.startPolling();
			}
		}
	}

	this.startPolling = function() {

		if (!this.ticking) {
			this.ticking = true;
			this.tick();
		}
	}

	this.stopPolling = function() {
		this.ticking = false;
	}

	this.tick = function() {
		this.pollStatus();
		this.scheduleNextTick();
	}

	this.scheduleNextTick = function() {

		if (this.ticking) {
			requestAnimationFrame( this.tick.bind( this ) );
		}
	}

	this.pollStatus = function() {

		this.pollGamepads();

	}

	this.pollGamepads = function() {

		var rawGamepads =
		(navigator.getGamepads && navigator.getGamepads()) ||
		(navigator.webkitGetGamepads && navigator.webkitGetGamepads());

		if( rawGamepads && rawGamepads[ 0 ] ) {

			var g = rawGamepads[ 0 ];

			if( this.axesOffsets === null ) {
				this.axesOffsets = [];
				for( var j = 0; j < g.axes.length; j++ ) {
					this.axesOffsets[ j ] = g.axes[ j ];
				}
			}

			if( this.buttonsOffsets === null ) {
				this.buttonsOffsets = [];
				for( var j = 0; j < g.buttons.length; j++ ) {
					this.buttonsOffsets[ j ] = g.buttons[ j ].value;
				}
			}
			
			this.lon += g.axes[ 0 ] - this.axesOffsets[ 0 ];
			this.lat -= g.axes[ 1 ] - this.axesOffsets[ 1 ];
			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			var phi = ( 90 - this.lat ) * Math.PI / 180;
			var theta = this.lon * Math.PI / 180;

			this.target.x = 10 * Math.sin( phi ) * Math.cos( theta );
			this.target.y = 10 * Math.cos( phi );
			this.target.z = 10 * Math.sin( phi ) * Math.sin( theta );

			this.target.add( this.object.position );
			this.object.lookAt( this.target );

			this.rotMatrix.extractRotation( this.object.matrix );
			this.dir.set( 
				g.axes[ 2 ] - this.axesOffsets[ 2 ], 
				( g.buttons[ 6 ].value - this.buttonsOffsets[ 6 ] ) - g.buttons[ 7 ].value - this.buttonsOffsets[ 7 ], 
				g.axes[ 3 ] - this.axesOffsets[ 3 ]
			);
			this.dir.applyMatrix4( this.rotMatrix );
			this.object.position.add( this.dir );
			
		}

	}

	this.init();
	
};

THREE.GamepadControls.prototype = Object.create( THREE.EventDispatcher.prototype );