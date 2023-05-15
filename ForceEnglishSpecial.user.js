// ==UserScript==
// @name         Wiki: Force English Special
// @namespace    pl.enux.wiki
// @version      1.0.1
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
	g.init();
}

var FesGadget = class {

	constructor(mw) {
		this.mw = mw;
	}

	/** Run all. */
	init() {
		const data = this.prepareTitle();
		if (data === false) {
			return;
		}
		//this.replaceUrl(data);
		const url = this.canonicalUrl(data);
		console.log(url.href);
	}

	/** Get canonical URL. */
	canonicalUrl(data) {
		const url = new URL(location.href);
		// ?title=...
		if (url.searchParams.has('title')) {
			url.searchParams.set('title', data.en);
		} else {
			let full = mw.config.get('wgPageName');
			url.pathname = url.pathname.replace(full, data.en);
		}
		return url;
	}
	/** Replace in URL. */
	replaceUrl(data) {
		const url = this.canonicalUrl(data);
		window.history.replaceState(null, null, url.href);
		return url;
	}

	/** Add English title. */
	prepareTitle() {
		const mw = this.mw;

		if (!this.initialTitle) {
			this.initialTitle = document.querySelector('h1').textContent;
		}
		
		let ns = mw.config.get('wgCanonicalNamespace');
		if (ns !== 'Special') {
			return false;
		}
		let p = mw.config.get('wgCanonicalSpecialPageName');
		let en = `${ns}:${p}`;
		let local = this.initialTitle;
		let style = `
			display:flex;
			gap:1em;
			align-items: baseline;
			justify-content: space-between;
		`;
		document.querySelector('h1').innerHTML = `
			<div style="${style}" class="fes">
				<div>${local}</div>
				<div style="font-size:80%; cursor: pointer;" tabindex="0" role="button" class="canon">${en}</div>
			</div>
		`;
		const data = {en};
		const btn = document.querySelector('h1 .fes .canon');
		this.prepareCanonical(btn, data);
		return data;
	}
	
	/**
	 * Prepare canonical URL replacement.
	 * 
	 * @param {Element} btn Button to prepare.
	 * @param {Object} data 
	 */
	prepareCanonical(btn, data) {
		btn.addEventListener('click', ()=>{
			// avoid repeating
			if (this._lastUrl && this._lastUrl === location.href) {
				return;
			}
			const url = this.replaceUrl(data);
			console.log(url.href);
			this._lastUrl = url.href;
		});
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