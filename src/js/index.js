function init() {
	function isMobile() {
		return window.innerWidth < 810;
	}
	
	function getGap() {
		return isMobile() ? 80 : 300;
	}
	
	function setBodyHeight() {
		var height = d.calcClientHeightsSum("section.skrollr-deck") + getGap()*6;
		document.body.style.height = height + "px";
	}

	function showTopBarEntries() {
		var menuEntries = d.qsa(".top-bar__tab-container");
		menuEntries.forEach(function(entry, index) {
			entry.classList.add("top-bar__tab-container--in", "top-bar__tab-container--in" + (index + 1));
		});
	}
	
	let tabPosition = undefined;
	let isLineMoving = false;
	
	function moveLine(position, noBlocking) {
		if (!isLineMoving && ((position !== undefined && position !== tabPosition) || position === undefined)) {
			tabPosition = typeof position === "number" ? position : tabPosition;
			isLineMoving = noBlocking ? false : d.st(function() { isLineMoving = false; }, 500);
			const tabs = d.calcPositionsToViewport(".top-bar__tab");
			const line = d.gc("top-bar__line");
			line.style.width = tabs[tabPosition].width + "px";
			line.style.transform = "translate3d(" + tabs[tabPosition].left + "px, 0, 0)";
		}
	}
	
	// Sets up Skroller
	var gap = getGap();
	
	var offsetFunctions = {
		get d0()	{ return d.gi("intro").clientHeight; },
		get d0g()	{ return this.d0 + gap; },
		get d1()	{ return d.gi("introduction").clientHeight + this.d0g; },
		get d1g()	{ return this.d1 + gap; },
		get d2()	{ return d.gi("programme").clientHeight + this.d1g; },
		get d2g()	{ return this.d2 + gap; },
		get d3()	{ return d.gi("locations").clientHeight + this.d2g; },
		get d3g()	{ return this.d3 + gap; },
		get d4()	{ return d.gi("confirm").clientHeight + this.d3g; },
		get d4g()	{ return this.d4 + gap; },
		get d5()	{ return d.gi("get-ready").clientHeight + this.d4g; },
		get d5g()	{ return this.d5 + gap; },
		get d6()	{ return d.gi("organisers").clientHeight + this.d5g; }
	};
	
	var skrollrInstance = skrollr.init({
		smoothScrolling: false,
		forceHeight: false,
		constants: offsetFunctions,
		mobileCheck: function() { return false; },
		keyframe: function(element, name, direction) {
			const up = direction === "up" ? -1 : 0;
			switch (name.slice(6)) {
				case "0": moveLine(1 + up); break;
				case "1": moveLine(2 + up); break;
				case "2": moveLine(3 + up); break;
				case "3": moveLine(4 + up); break;
				case "4": moveLine(5 + up); break;
				case "5": moveLine(6 + up); break;
			}
		}
	});
	
	// Sets up Skroller Menu
	skrollr.menu.init(skrollrInstance, {
		animate: true,
		easing: "outCubic",
		duration: 800,
		handleLink: function(link) {
			var extraSpace = -100;
			var linkText = link.href.split("#").pop();
			var linkPositionIntroduction = d.calcRelativePosition("#introduction", "#" + linkText);
			var linkPositionProgramme = d.calcRelativePosition("#programme", "#" + linkText);
			var linkPositionLocations = d.calcRelativePosition("#locations", "#" + linkText);
			var linkPositionGetReady = d.calcRelativePosition("#get-ready", "#" + linkText);
			
			switch (linkText) {
				case "intro":						moveLine(0); return 0;
				case "introduction":				moveLine(1); return offsetFunctions.d0g;
				case "what-is-aegee":				moveLine(1); return offsetFunctions.d0g + linkPositionIntroduction.top + extraSpace;
				case "programme":					moveLine(2); return offsetFunctions.d1g;
				case "european-night":				moveLine(2); return offsetFunctions.d1g + linkPositionProgramme.top + extraSpace;
				case "locations":					moveLine(3); return offsetFunctions.d2g;
				case "hostel":
				case "sky-garden":
				case "rest-of-london":				moveLine(3); return offsetFunctions.d2g + linkPositionLocations.top + extraSpace;
				case "confirm":						moveLine(4); return offsetFunctions.d3g;
				case "get-ready":					moveLine(5); return offsetFunctions.d4g;
				case "what-to-bring":
				case "what-the-fee-includes":
				case "how-to-reach-london-centre":
				case "useful-information":			moveLine(5); return offsetFunctions.d4g + linkPositionGetReady.top + extraSpace;
				case "organisers":					moveLine(6); return offsetFunctions.d5g;
			}
			
			window.history.replaceState(null, null, " "); // https://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-url-with-javascript-without-page-r
			return 0;
		}
	});
	
	
	
	// Adapts the UI to remove intro animations if the URL points to a section
	var hash = window.location.hash;
	if ((hash && hash !== "#intro") || isMobile()) {
		d.gc("top-bar").classList.add("top-bar--in");
		d.st(function() { d.gc("top-bar").classList.remove("top-bar--in-no-delay"); }, 1000);
		showTopBarEntries();
	}
	

	
	// Set ups the navigation top bar for mobile screens
	d.qsa(".top-bar__tab, .top-bar__three-bars, .top-bar__three-bars-close-surface").forEach(function(item) {
		item.addEventListener("click", function() {
			if (isMobile()) {
				d.gc("top-bar").classList.toggle("top-bar--open");
				d.gc("top-bar__three-bars-close-surface").classList.toggle("top-bar__three-bars-close-surface--in");
			}
		});
	});
	
	
	
	// Adds logic for 'scroll' and 'resize' events
	var scrolled = false,
		distance = offsetFunctions.d0 / 2,
		header = d.gc("top-bar");
	
	d.ae("scroll", function() {
		if (window.scrollY > distance && !scrolled) {
			header.classList.add("top-bar--in");
			scrolled = true;
		} else if (window.scrollY < distance && scrolled) {
			header.classList.remove("top-bar--in");
			scrolled = false;
		}
	});
	
	d.ae("resize", function() {
		d.st(function() {
			moveLine();
			setBodyHeight();
			skrollrInstance.refresh();
		}, 300);
		d.gc("top-bar").classList.remove("top-bar--open");
		d.gc("top-bar__three-bars-close-surface").classList.remove("top-bar__three-bars-close-surface--in");
	});
	
	d.ae("load", function() {
		setBodyHeight();
	});
	
	
	
	setBodyHeight();
	moveLine(0, true);
	d.st(function() { showTopBarEntries(); }, 2500);
	d.gc("body").classList.add("body--in");
}



d.notifyWhenLoaded(".intro__logo");
d.notifyWhenLoaded(".intro__bg");
d.notifyWhenLoaded(".intro__mannequin");
d.notifyWhenLoaded(".intro__frame");

async function loadFonts() {
	window.document.fonts.onloadingerror = (event) => {
		console.error(event); // eslint-disable-line no-console
		window.location.reload();
	};
	// https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400&family=Roboto+Slab:wght@300&family=Source+Sans+Pro:wght@300;900
	const fonts = await Promise.all([
		(new FontFace("Bebas Neue", "url(https://fonts.gstatic.com/s/bebasneue/v9/JTUSjIg69CK48gW7PXoo9WlhyyTh89Y.woff2)")).load(),
		(new FontFace("Source Sans Pro", "url(https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlxdu3cOWxw.woff2)", { weight: "300" })).load(),
		(new FontFace("Source Sans Pro", "url(https://fonts.gstatic.com/s/sourcesanspro/v21/6xKydSBYKcSV-LCoeQqfX1RYOo3iu4nwlxdu3cOWxw.woff2)", { weight: "900" })).load()
	]);
	fonts?.forEach(font => window.document.fonts.add(font));
	window.document.fonts.ready.then(() => d.runWhenAllLoaded(init));
}
loadFonts();
