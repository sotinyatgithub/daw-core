"use strict";

DAW.Pianoroll = class {
	constructor( daw ) {
		const waSched = new gswaScheduler();

		this.daw = daw;
		this.keys = {};
		this.looping =
		this.playing = false;
		this.currentTime = 0;
		this._ctx = daw.ctx;
		this._waSched = waSched;
		this._keysStarted = {};
		this._keysStartedLive = {};
		waSched.currentTime = () => this._ctx.currentTime;
		waSched.ondatastart = this._startKey.bind( this );
		waSched.ondatastop = this._stopKey.bind( this );
	}

	change( patObj, keysObj ) {
		DAW.objectDeepAssign( this._waSched.data, keysObj );
		if ( "duration" in patObj && !this.looping ) {
			this._waSched.setLoopBeat( 0, patObj.duration );
		}
	}
	empty() {
		this.stop();
		if ( this.keys ) {
			// ...
		}
	}

	// ........................................................................
	_startKey( startedId, blc, when, off, dur ) {
		this._keysStarted[ startedId ] =
			this.getSynth().startKey( blc.key, when, off, dur, blc.gain, blc.pan );
	}
	_stopKey( startedId, blc ) {
		this.getSynth().stopKey( this._keysStarted[ startedId ] );
		delete this._keysStarted[ startedId ];
	}

	// controls
	// ........................................................................
	getSynth() {
		return this.daw.composition.getSynthOpened();
	}
	getCurrentTime() {
		return this._waSched.getCurrentOffsetBeat();
	}
	setCurrentTime( t ) {
		this.currentTime = t;
		this._waSched.setCurrentOffsetBeat( t );
	}
	setBPM( bpm ) {
		this._waSched.setBPM( bpm );
	}
	setLoop( a, b ) {
		this.looping = true;
		this._waSched.setLoopBeat( a, b );
	}
	clearLoop() {
		this.looping = false;
		this._waSched.setLoopBeat( 0, this.daw.get.beatsPerMeasure() );
	}
	liveKeydown( midi ) {
		if ( !( midi in this._keysStartedLive ) ) {
			this._keysStartedLive[ midi ] = this.getSynth().startKey(
				midi, this._waSched.currentTime(), 0, Infinity, .8, 0 );
		}
	}
	liveKeyup( midi ) {
		if ( this._keysStartedLive[ midi ] ) {
			this.getSynth().stopKey( this._keysStartedLive[ midi ] );
			delete this._keysStartedLive[ midi ];
		}
	}
	bpm( bpm ) {
		this._waSched.setBPM( bpm );
	}
	play() {
		if ( !this.playing ) {
			this._waSched.startBeat( 0, this.currentTime );
			this.playing = true;
		}
	}
	pause() {
		if ( this.playing ) {
			this.playing = false;
			this.currentTime = this.getCurrentTime();
			this._waSched.stop();
		}
	}
	stop() {
		if ( this.playing ) {
			this.pause();
		} else {
			this.currentTime = 0;
		}
	}
};