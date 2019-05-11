"use strict";

DAWCore.Composition.format = function( cmp ) {
	const blcsValues = Object.values( cmp.blocks );

	// loopA/B
	// ..........................................
	if ( Number.isFinite( cmp.loopA ) && Number.isFinite( cmp.loopB ) ) {
		cmp.loopA = Math.max( 0, cmp.loopA );
		cmp.loopB = Math.max( 0, cmp.loopB );
		if ( cmp.loopA === cmp.loopB ) {
			cmp.loopA =
			cmp.loopB = null;
		}
	} else {
		cmp.loopA =
		cmp.loopB = null;
	}

	// channels
	// ..........................................
	if ( !cmp.channels ) {
		cmp.channels = DAWCore.json.channels();
		Object.values( cmp.synths ).forEach( syn => syn.dest = "main" );
	}

	// ..........................................
	if ( !cmp.synths ) {
		Object.values( cmp.patterns ).forEach( pat => pat.synth = "0" );
		cmp.synthOpened = "0";
		cmp.synths = { 0: DAWCore.json.synth( "synth" ) };
	}
	Object.values( cmp.synths ).forEach( syn => {
		delete syn.envelopes;
	} );
	Object.values( cmp.tracks ).reduce( ( order, tr ) => {
		tr.name = typeof tr.name === "string" ? tr.name : "";
		tr.order = typeof tr.order === "number" ? tr.order : order;
		tr.toggle = typeof tr.toggle === "boolean" ? tr.toggle : true;
		return tr.order + 1;
	}, 0 );
	blcsValues.sort( DAWCore.Composition.format_sortWhen );
	cmp.blocks = blcsValues.reduce( ( obj, blc, i ) => {
		blc.offset = blc.offset || 0;
		blc.selected = !!blc.selected;
		blc.durationEdited = !!blc.durationEdited;
		obj[ i ] = blc;
		return obj;
	}, {} );
	Object.values( cmp.keys ).forEach( keys => {
		Object.values( keys ).forEach( k => {
			k.pan = +DAWCore.castToNumber( -1, 1, 0, k.pan ).toFixed( 2 );
			k.gain = +DAWCore.castToNumber( 0, 1, .8, k.gain ).toFixed( 2 );
			k.selected = !!k.selected;
			if ( k.prev == null ) { k.prev = null; }
			if ( k.next == null ) { k.next = null; }
			delete k.durationEdited;
			if ( typeof k.key === "string" ) {
				if ( window.gsuiKeys ) {
					k.key = window.gsuiKeys.keyStrToMidi( k.key );
				} else {
					console.warn( "DAWCore.Composition.format: gsuiKeys is needed to convert an old midi notation" );
					return false;
				}
			}
		} );
	} );
	return true;
};

DAWCore.Composition.format_sortWhen = function( a, b ) {
	return a.when < b.when ? -1 : a.when > b.when ? 1 : 0;
};
