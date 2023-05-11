// ==UserScript==
// @name         Wiki: Force English Special
// @namespace    pl.enux.wiki
// @version      1.0.0
// @description  Forces English names of Special pages.
// @author       Nux
// @match        https://*.wikipedia.org/*
// @grant        none
// @updateURL    https://github.com/Eccenux/wiki-ForceEnglishSpecial/raw/master/ForceEnglishSpecial.meta.js
// @downloadURL  https://github.com/Eccenux/wiki-ForceEnglishSpecial/raw/master/ForceEnglishSpecial.user.js
// ==/UserScript==
/* global mw */

// -------------------------------------------------------------------
//  Gadget START
// -------------------------------------------------------------------
function initGadget(mw) {
	const g = new FesGadget(mw);
	g.prepareTitle();
}

var FesGadget = class {

	constructor(mw) {
		this.mw = mw;
	}

	/** Add English title. */
	prepareTitle() {
		const mw = this.mw;

		let ns = mw.config.get('wgCanonicalNamespace');
		if (ns !== 'Special') {
			return false;
		}
		let p = mw.config.get('wgCanonicalSpecialPageName');
		let en = `${ns}:${p}`;
		let local = mw.config.get('wgTitle'); // mw.config.get('wgPageName');
		let style = `
			display:flex;
			gap:1em;
			align-items: baseline;
			justify-content: space-between;
		`;
		document.querySelector('h1').innerHTML = `<div style="${style}"><div>${local}</div> <div style="font-size:80%">${en}</div></div>`;
		return {en, local};
	}
}

// -------------------------------------------------------------------
//  Gadget END
// -------------------------------------------------------------------

/**
 * Wait for condition (e.g. for object/function to be defined).
 * 
 * @param {Function} condition Wait until true.
 * @param {Function} callback Function to run after true.
 * @param {Number} interval [optional] Interval for checking the condition.
 */
function waitForCondition(condition, callback, interval) {
	if (condition()) {
		callback();
	} else {
		if (typeof interval !== 'number') {
			interval = 200;
		}
		let intervalId = setInterval(function() {
			//console.log('waiting...');
			if (condition()) {
				//console.log('done');
				clearInterval(intervalId);
				callback();
			}
		}, interval);
	}
}

// wait for mw.loader and then for mw.util
waitForCondition(function(){
	return typeof mw == 'object' && 'loader' in mw && typeof mw.loader.using === 'function';
}, function() {
	mw.loader.using(["mediawiki.util"]).then( function() {
		initGadget(mw);
	});
});