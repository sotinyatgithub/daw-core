"use strict";

DAWCore.actions.addPatternDrums = function( get ) {
	const pats = get.patterns(),
		drumsId = DAWCore.common.getNextIdOf( get.keys() ),
		patId = DAWCore.common.getNextIdOf( pats ),
		patName = this._createUniqueName( "patterns", "drums" ),
		order = Object.values( pats ).reduce( ( max, pat ) => {
			return pat.type !== "drums"
				? max
				: Math.max( max, pat.order );
		}, 0 ) + 1,
		obj = {
			drums: { [ drumsId ]: {} },
			patterns: { [ patId ]: {
				order,
				type: "drums",
				name: patName,
				drums: drumsId,
				duration: get.beatsPerMeasure(),
			} },
			patternDrumsOpened: patId,
		};

	return [
		obj,
		[ "patterns", "addPattern", "drums", patName ],
	];
};
