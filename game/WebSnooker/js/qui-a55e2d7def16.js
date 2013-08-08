/* qwebirc -- Copyright (C) 2008-2012 Chris Porter and the qwebirc project --- All rights reserved. */

QWEBIRC_BUILD = "a55e2d7def16";
MooTools.More = {
	version : "1.2.5.1",
	build : "254884f2b83651bf95260eed5c6cceb838e22d8e"
};
Class.Mutators.Binds = function (b) {
	return b
};
Class.Mutators.initialize = function (b) {
	return function () {
		$splat(this.Binds).each(function (a) {
			var d = this[a];
			if (d) {
				this[a] = d.bind(this)
			}
		}, this);
		return b.apply(this, arguments)
	}
};
Element.implement({
	measure : function (l) {
		var j = function (a) {
			return !!(!a || a.offsetHeight || a.offsetWidth)
		};
		if (j(this)) {
			return l.apply(this)
		}
		var m = this.getParent(),
		k = [],
		h = [];
		while (!j(m) && m != document.body) {
			h.push(m.expose());
			m = m.getParent()
		}
		var n = this.expose();
		var i = l.apply(this);
		n();
		h.each(function (a) {
			a()
		});
		return i
	},
	expose : function () {
		if (this.getStyle("display") != "none") {
			return $empty
		}
		var b = this.style.cssText;
		this.setStyles({
			display : "block",
			position : "absolute",
			visibility : "hidden"
		});
		return function () {
			this.style.cssText = b
		}
		.bind(this)
	},
	getDimensions : function (g) {
		g = $merge({
				computeSize : false
			}, g);
		var h = {};
		var i = function (a, b) {
			return (b.computeSize) ? a.getComputedSize(b) : a.getSize()
		};
		var e = this.getParent("body");
		if (e && this.getStyle("display") == "none") {
			h = this.measure(function () {
					return i(this, g)
				})
		} else {
			if (e) {
				try {
					h = i(this, g)
				} catch (j) {}

			} else {
				h = {
					x : 0,
					y : 0
				}
			}
		}
		return $chk(h.x) ? $extend(h, {
			width : h.x,
			height : h.y
		}) : $extend(h, {
			x : h.width,
			y : h.height
		})
	},
	getComputedSize : function (g) {
		if (g && g.plains) {
			g.planes = g.plains
		}
		g = $merge({
				styles : ["padding", "border"],
				planes : {
					height : ["top", "bottom"],
					width : ["left", "right"]
				},
				mode : "both"
			}, g);
		var j = {
			width : 0,
			height : 0
		};
		switch (g.mode) {
		case "vertical":
			delete j.width;
			delete g.planes.width;
			break;
		case "horizontal":
			delete j.height;
			delete g.planes.height;
			break
		}
		var f = [];
		$each(g.planes, function (b, a) {
			b.each(function (c) {
				g.styles.each(function (d) {
					f.push((d == "border") ? d + "-" + c + "-width" : d + "-" + c)
				})
			})
		});
		var h = {};
		f.each(function (a) {
			h[a] = this.getComputedStyle(a)
		}, this);
		var i = [];
		$each(g.planes, function (c, b) {
			var a = b.capitalize();
			j["total" + a] = j["computed" + a] = 0;
			c.each(function (d) {
				j["computed" + d.capitalize()] = 0;
				f.each(function (e, l) {
					if (e.test(d)) {
						h[e] = h[e].toInt() || 0;
						j["total" + a] = j["total" + a] + h[e];
						j["computed" + d.capitalize()] = j["computed" + d.capitalize()] + h[e]
					}
					if (e.test(d) && b != e && (e.test("border") || e.test("padding")) && !i.contains(e)) {
						i.push(e);
						j["computed" + a] = j["computed" + a] - h[e]
					}
				})
			})
		});
		["Width", "Height"].each(function (a) {
			var b = a.toLowerCase();
			if (!$chk(j[b])) {
				return
			}
			j[b] = j[b] + this["offset" + a] + j["computed" + a];
			j["total" + a] = j[b] + j["total" + a];
			delete j["computed" + a]
		}, this);
		return $extend(h, j)
	}
});
var Drag = new Class({
		Implements : [Events, Options],
		options : {
			snap : 6,
			unit : "px",
			grid : false,
			style : true,
			limit : false,
			handle : false,
			invert : false,
			preventDefault : false,
			stopPropagation : false,
			modifiers : {
				x : "left",
				y : "top"
			}
		},
		initialize : function () {
			var c = Array.link(arguments, {
					options : Object.type,
					element : $defined
				});
			this.element = document.id(c.element);
			this.document = this.element.getDocument();
			this.setOptions(c.options || {});
			var d = $type(this.options.handle);
			this.handles = ((d == "array" || d == "collection") ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
			this.mouse = {
				now : {},
				pos : {}

			};
			this.value = {
				start : {},
				now : {}

			};
			this.selection = (Browser.Engine.trident) ? "selectstart" : "mousedown";
			this.bound = {
				start : this.start.bind(this),
				check : this.check.bind(this),
				drag : this.drag.bind(this),
				stop : this.stop.bind(this),
				cancel : this.cancel.bind(this),
				eventStop : $lambda(false)
			};
			this.attach()
		},
		attach : function () {
			this.handles.addEvent("mousedown", this.bound.start);
			return this
		},
		detach : function () {
			this.handles.removeEvent("mousedown", this.bound.start);
			return this
		},
		start : function (l) {
			if (l.rightClick) {
				return
			}
			if (this.options.preventDefault) {
				l.preventDefault()
			}
			if (this.options.stopPropagation) {
				l.stopPropagation()
			}
			this.mouse.start = l.page;
			this.fireEvent("beforeStart", this.element);
			var i = this.options.limit;
			this.limit = {
				x : [],
				y : []
			};
			var m = this.element.getStyles("left", "right", "top", "bottom");
			this._invert = {
				x : this.options.modifiers.x == "left" && m.left == "auto" && !isNaN(m.right.toInt()) && (this.options.modifiers.x = "right"),
				y : this.options.modifiers.y == "top" && m.top == "auto" && !isNaN(m.bottom.toInt()) && (this.options.modifiers.y = "bottom")
			};
			var j,
			k;
			for (j in this.options.modifiers) {
				if (!this.options.modifiers[j]) {
					continue
				}
				var n = this.element.getStyle(this.options.modifiers[j]);
				if (n && !n.match(/px$/)) {
					if (!k) {
						k = this.element.getCoordinates(this.element.getOffsetParent())
					}
					n = k[this.options.modifiers[j]]
				}
				if (this.options.style) {
					this.value.now[j] = (n || 0).toInt()
				} else {
					this.value.now[j] = this.element[this.options.modifiers[j]]
				}
				if (this.options.invert) {
					this.value.now[j] *= -1
				}
				if (this._invert[j]) {
					this.value.now[j] *= -1
				}
				this.mouse.pos[j] = l.page[j] - this.value.now[j];
				if (i && i[j]) {
					for (var h = 2; h--; h) {
						if ($chk(i[j][h])) {
							this.limit[j][h] = $lambda(i[j][h])()
						}
					}
				}
			}
			if ($type(this.options.grid) == "number") {
				this.options.grid = {
					x : this.options.grid,
					y : this.options.grid
				}
			}
			this.document.addEvents({
				mousemove : this.bound.check,
				mouseup : this.bound.cancel
			});
			this.document.addEvent(this.selection, this.bound.eventStop)
		},
		check : function (d) {
			if (this.options.preventDefault) {
				d.preventDefault()
			}
			var c = Math.round(Math.sqrt(Math.pow(d.page.x - this.mouse.start.x, 2) + Math.pow(d.page.y - this.mouse.start.y, 2)));
			if (c > this.options.snap) {
				this.cancel();
				this.document.addEvents({
					mousemove : this.bound.drag,
					mouseup : this.bound.stop
				});
				this.fireEvent("start", [this.element, d]).fireEvent("snap", this.element)
			}
		},
		drag : function (d) {
			if (this.options.preventDefault) {
				d.preventDefault()
			}
			this.mouse.now = d.page;
			for (var c in this.options.modifiers) {
				if (!this.options.modifiers[c]) {
					continue
				}
				this.value.now[c] = this.mouse.now[c] - this.mouse.pos[c];
				if (this.options.invert) {
					this.value.now[c] *= -1
				}
				if (this._invert[c]) {
					this.value.now[c] *= -1
				}
				if (this.options.limit && this.limit[c]) {
					if ($chk(this.limit[c][1]) && (this.value.now[c] > this.limit[c][1])) {
						this.value.now[c] = this.limit[c][1]
					} else {
						if ($chk(this.limit[c][0]) && (this.value.now[c] < this.limit[c][0])) {
							this.value.now[c] = this.limit[c][0]
						}
					}
				}
				if (this.options.grid[c]) {
					this.value.now[c] -= ((this.value.now[c] - (this.limit[c][0] || 0)) % this.options.grid[c])
				}
				if (this.options.style) {
					this.element.setStyle(this.options.modifiers[c], this.value.now[c] + this.options.unit)
				} else {
					this.element[this.options.modifiers[c]] = this.value.now[c]
				}
			}
			this.fireEvent("drag", [this.element, d])
		},
		cancel : function (b) {
			this.document.removeEvent("mousemove", this.bound.check);
			this.document.removeEvent("mouseup", this.bound.cancel);
			if (b) {
				this.document.removeEvent(this.selection, this.bound.eventStop);
				this.fireEvent("cancel", this.element)
			}
		},
		stop : function (b) {
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.document.removeEvent("mousemove", this.bound.drag);
			this.document.removeEvent("mouseup", this.bound.stop);
			if (b) {
				this.fireEvent("complete", [this.element, b])
			}
		}
	});
Element.implement({
	makeResizable : function (d) {
		var c = new Drag(this, $merge({
					modifiers : {
						x : "width",
						y : "height"
					}
				}, d));
		this.store("resizer", c);
		return c.addEvent("drag", function () {
			this.fireEvent("resize", c)
		}
			.bind(this))
	}
});
var Slider = new Class({
		Implements : [Events, Options],
		Binds : ["clickedElement", "draggedKnob", "scrolledElement"],
		options : {
			onTick : function (b) {
				if (this.options.snap) {
					b = this.toPosition(this.step)
				}
				this.knob.setStyle(this.property, b)
			},
			initialStep : 0,
			snap : false,
			offset : 0,
			range : false,
			wheel : false,
			steps : 100,
			mode : "horizontal"
		},
		initialize : function (k, i, l) {
			this.setOptions(l);
			this.element = document.id(k);
			this.knob = document.id(i);
			this.previousChange = this.previousEnd = this.step = -1;
			var j,
			h = {},
			m = {
				x : false,
				y : false
			};
			switch (this.options.mode) {
			case "vertical":
				this.axis = "y";
				this.property = "top";
				j = "offsetHeight";
				break;
			case "horizontal":
				this.axis = "x";
				this.property = "left";
				j = "offsetWidth"
			}
			this.full = this.element.measure(function () {
					this.half = this.knob[j] / 2;
					return this.element[j] - this.knob[j] + (this.options.offset * 2)
				}
					.bind(this));
			this.setRange(this.options.range);
			this.knob.setStyle("position", "relative").setStyle(this.property, -this.options.offset);
			m[this.axis] = this.property;
			h[this.axis] = [-this.options.offset, this.full - this.options.offset];
			var n = {
				snap : 0,
				limit : h,
				modifiers : m,
				onDrag : this.draggedKnob,
				onStart : this.draggedKnob,
				onBeforeStart : (function () {
					this.isDragging = true
				}).bind(this),
				onCancel : function () {
					this.isDragging = false
				}
				.bind(this),
				onComplete : function () {
					this.isDragging = false;
					this.draggedKnob();
					this.end()
				}
				.bind(this)
			};
			if (this.options.snap) {
				n.grid = Math.ceil(this.stepWidth);
				n.limit[this.axis][1] = this.full
			}
			this.drag = new Drag(this.knob, n);
			this.attach();
			if (this.options.initialStep != null) {
				this.set(this.options.initialStep)
			}
		},
		attach : function () {
			this.element.addEvent("mousedown", this.clickedElement);
			if (this.options.wheel) {
				this.element.addEvent("mousewheel", this.scrolledElement)
			}
			this.drag.attach();
			return this
		},
		detach : function () {
			this.element.removeEvent("mousedown", this.clickedElement);
			this.element.removeEvent("mousewheel", this.scrolledElement);
			this.drag.detach();
			return this
		},
		set : function (b) {
			if (!((this.range > 0)^(b < this.min))) {
				b = this.min
			}
			if (!((this.range > 0)^(b > this.max))) {
				b = this.max
			}
			this.step = Math.round(b);
			this.checkStep();
			this.fireEvent("tick", this.toPosition(this.step));
			this.end();
			return this
		},
		setRange : function (d, c) {
			this.min = $pick(d[0], 0);
			this.max = $pick(d[1], this.options.steps);
			this.range = this.max - this.min;
			this.steps = this.options.steps || this.full;
			this.stepSize = Math.abs(this.range) / this.steps;
			this.stepWidth = this.stepSize * this.full / Math.abs(this.range);
			this.set($pick(c, this.step).floor(this.min).max(this.max));
			return this
		},
		clickedElement : function (f) {
			if (this.isDragging || f.target == this.knob) {
				return
			}
			var d = this.range < 0 ? -1 : 1;
			var e = f.page[this.axis] - this.element.getPosition()[this.axis] - this.half;
			e = e.limit(-this.options.offset, this.full - this.options.offset);
			this.step = Math.round(this.min + d * this.toStep(e));
			this.checkStep();
			this.fireEvent("tick", e);
			this.end()
		},
		scrolledElement : function (d) {
			var c = (this.options.mode == "horizontal") ? (d.wheel < 0) : (d.wheel > 0);
			this.set(c ? this.step - this.stepSize : this.step + this.stepSize);
			d.stop()
		},
		draggedKnob : function () {
			var c = this.range < 0 ? -1 : 1;
			var d = this.drag.value.now[this.axis];
			d = d.limit(-this.options.offset, this.full - this.options.offset);
			this.step = Math.round(this.min + c * this.toStep(d));
			this.checkStep()
		},
		checkStep : function () {
			if (this.previousChange != this.step) {
				this.previousChange = this.step;
				this.fireEvent("change", this.step)
			}
		},
		end : function () {
			if (this.previousEnd !== this.step) {
				this.previousEnd = this.step;
				this.fireEvent("complete", this.step + "")
			}
		},
		toStep : function (d) {
			var c = (d + this.options.offset) * this.stepSize / this.full * this.steps;
			return this.options.steps ? Math.round(c -= c % this.stepSize) : c
		},
		toPosition : function (b) {
			return (this.full * Math.abs(this.min - b)) / (this.steps * this.stepSize) - this.options.offset
		}
	});
var Color = new Native({
		initialize : function (d, f) {
			if (arguments.length >= 3) {
				f = "rgb";
				d = Array.slice(arguments, 0, 3)
			} else {
				if (typeof d == "string") {
					if (d.match(/rgb/)) {
						d = d.rgbToHex().hexToRgb(true)
					} else {
						if (d.match(/hsb/)) {
							d = d.hsbToRgb()
						} else {
							d = d.hexToRgb(true)
						}
					}
				}
			}
			f = f || "rgb";
			switch (f) {
			case "hsb":
				var e = d;
				d = d.hsbToRgb();
				d.hsb = e;
				break;
			case "hex":
				d = d.hexToRgb(true);
				break
			}
			d.rgb = d.slice(0, 3);
			d.hsb = d.hsb || d.rgbToHsb();
			d.hex = d.rgbToHex();
			return $extend(d, this)
		}
	});
Color.implement({
	mix : function () {
		var e = Array.slice(arguments);
		var f = ($type(e.getLast()) == "number") ? e.pop() : 50;
		var d = this.slice();
		e.each(function (b) {
			b = new Color(b);
			for (var a = 0; a < 3; a++) {
				d[a] = Math.round((d[a] / 100 * (100 - f)) + (b[a] / 100 * f))
			}
		});
		return new Color(d, "rgb")
	},
	invert : function () {
		return new Color(this.map(function (b) {
				return 255 - b
			}))
	},
	setHue : function (b) {
		return new Color([b, this.hsb[1], this.hsb[2]], "hsb")
	},
	setSaturation : function (b) {
		return new Color([this.hsb[0], b, this.hsb[2]], "hsb")
	},
	setBrightness : function (b) {
		return new Color([this.hsb[0], this.hsb[1], b], "hsb")
	}
});
var $RGB = function (e, f, b) {
	return new Color([e, f, b], "rgb")
};
var $HSB = function (e, f, b) {
	return new Color([e, f, b], "hsb")
};
var $HEX = function (b) {
	return new Color(b, "hex")
};
Array.implement({
	rgbToHsb : function () {
		var x = this[0],
		v = this[1],
		o = this[2],
		r = 0;
		var p = Math.max(x, v, o),
		t = Math.min(x, v, o);
		var n = p - t;
		var q = p / 255,
		s = (p != 0) ? n / p : 0;
		if (s != 0) {
			var u = (p - x) / n;
			var y = (p - v) / n;
			var m = (p - o) / n;
			if (x == p) {
				r = m - y
			} else {
				if (v == p) {
					r = 2 + u - m
				} else {
					r = 4 + y - u
				}
			}
			r /= 6;
			if (r < 0) {
				r++
			}
		}
		return [Math.round(r * 360), Math.round(s * 100), Math.round(q * 100)]
	},
	hsbToRgb : function () {
		var l = Math.round(this[2] / 100 * 255);
		if (this[1] == 0) {
			return [l, l, l]
		} else {
			var h = this[0] % 360;
			var j = h % 60;
			var i = Math.round((this[2] * (100 - this[1])) / 10000 * 255);
			var k = Math.round((this[2] * (6000 - this[1] * j)) / 600000 * 255);
			var f = Math.round((this[2] * (6000 - this[1] * (60 - j))) / 600000 * 255);
			switch (Math.floor(h / 60)) {
			case 0:
				return [l, f, i];
			case 1:
				return [k, l, i];
			case 2:
				return [i, l, f];
			case 3:
				return [i, k, l];
			case 4:
				return [f, i, l];
			case 5:
				return [l, i, k]
			}
		}
		return false
	}
});
String.implement({
	rgbToHsb : function () {
		var b = this.match(/\d{1,3}/g);
		return (b) ? b.rgbToHsb() : null
	},
	hsbToRgb : function () {
		var b = this.match(/\d{1,3}/g);
		return (b) ? b.hsbToRgb() : null
	}
});
Hash.Cookie = new Class({
		Extends : Cookie,
		options : {
			autoSave : true
		},
		initialize : function (c, d) {
			this.parent(c, d);
			this.load()
		},
		save : function () {
			var b = JSON.encode(this.hash);
			if (!b || b.length > 4096) {
				return false
			}
			if (b == "{}") {
				this.dispose()
			} else {
				this.write(b)
			}
			return true
		},
		load : function () {
			this.hash = new Hash(JSON.decode(this.read(), true));
			return this
		}
	});
Hash.each(Hash.prototype, function (c, d) {
	if (typeof c == "function") {
		Hash.Cookie.implement(d, function () {
			var a = c.apply(this.hash, arguments);
			if (this.options.autoSave) {
				this.save()
			}
			return a
		})
	}
});
window.SM2_DEFER = true;
var soundManager = null;
function SoundManager(h, i) {
	this.flashVersion = 8;
	this.debugMode = true;
	this.useConsole = true;
	this.consoleOnly = false;
	this.waitForWindowLoad = false;
	this.nullURL = "null.mp3";
	this.allowPolling = true;
	this.useMovieStar = false;
	this.bgColor = "#ffffff";
	this.useHighPerformance = false;
	this.flashLoadTimeout = 750;
	this.wmode = null;
	this.allowFullScreen = true;
	this.defaultOptions = {
		autoLoad : false,
		stream : true,
		autoPlay : false,
		onid3 : null,
		onload : null,
		whileloading : null,
		onplay : null,
		onpause : null,
		onresume : null,
		whileplaying : null,
		onstop : null,
		onfinish : null,
		onbeforefinish : null,
		onbeforefinishtime : 5000,
		onbeforefinishcomplete : null,
		onjustbeforefinish : null,
		onjustbeforefinishtime : 200,
		multiShot : true,
		position : null,
		pan : 0,
		volume : 100
	};
	this.flash9Options = {
		isMovieStar : null,
		usePeakData : false,
		useWaveformData : false,
		useEQData : false,
		onbufferchange : null,
		ondataerror : null
	};
	this.movieStarOptions = {
		onmetadata : null,
		useVideo : false,
		bufferTime : null
	};
	var k = null;
	var l = this;
	this.version = null;
	this.versionNumber = "V2.95a.20090501";
	this.movieURL = null;
	this.url = null;
	this.altURL = null;
	this.swfLoaded = false;
	this.enabled = false;
	this.o = null;
	this.id = (i || "sm2movie");
	this.oMC = null;
	this.sounds = {};
	this.soundIDs = [];
	this.muted = false;
	this.isFullScreen = false;
	this.isIE = (navigator.userAgent.match(/MSIE/i));
	this.isSafari = (navigator.userAgent.match(/safari/i));
	this.isGecko = (navigator.userAgent.match(/gecko/i));
	this.debugID = "soundmanager-debug";
	this.specialWmodeCase = false;
	this._debugOpen = true;
	this._didAppend = false;
	this._appendSuccess = false;
	this._didInit = false;
	this._disabled = false;
	this._windowLoaded = false;
	this._hasConsole = (typeof console != "undefined" && typeof console.log != "undefined");
	this._debugLevels = ["log", "info", "warn", "error"];
	this._defaultFlashVersion = 8;
	this._oRemoved = null;
	this._oRemovedHTML = null;
	var j = function (a) {
		return document.getElementById(a)
	};
	this.filePatterns = {
		flash8 : /\.mp3(\?.*)?$/i,
		flash9 : /\.mp3(\?.*)?$/i
	};
	this.netStreamTypes = ["aac", "flv", "mov", "mp4", "m4v", "f4v", "m4a", "mp4v", "3gp", "3g2"];
	this.netStreamPattern = new RegExp("\\.(" + this.netStreamTypes.join("|") + ")(\\?.*)?$", "i");
	this.filePattern = null;
	this.features = {
		buffering : false,
		peakData : false,
		waveformData : false,
		eqData : false,
		movieStar : false
	};
	this.sandbox = {
		type : null,
		types : {
			remote : "remote (domain-based) rules",
			localWithFile : "local with file access (no internet access)",
			localWithNetwork : "local with network (internet access only, no local access)",
			localTrusted : "local, trusted (local + internet access)"
		},
		description : null,
		noRemote : null,
		noLocal : null
	};
	this._setVersionInfo = function () {
		if (l.flashVersion != 8 && l.flashVersion != 9) {
			alert('soundManager.flashVersion must be 8 or 9. "' + l.flashVersion + '" is invalid. Reverting to ' + l._defaultFlashVersion + ".");
			l.flashVersion = l._defaultFlashVersion
		}
		l.version = l.versionNumber + (l.flashVersion == 9 ? " (AS3/Flash 9)" : " (AS2/Flash 8)");
		if (l.flashVersion > 8) {
			l.defaultOptions = l._mergeObjects(l.defaultOptions, l.flash9Options);
			l.features.buffering = true
		}
		if (l.flashVersion > 8 && l.useMovieStar) {
			l.defaultOptions = l._mergeObjects(l.defaultOptions, l.movieStarOptions);
			l.filePatterns.flash9 = new RegExp("\\.(mp3|" + l.netStreamTypes.join("|") + ")(\\?.*)?$", "i");
			l.features.movieStar = true
		} else {
			l.useMovieStar = false;
			l.features.movieStar = false
		}
		l.filePattern = l.filePatterns[(l.flashVersion != 8 ? "flash9" : "flash8")];
		l.movieURL = (l.flashVersion == 8 ? "soundmanager2.swf" : "soundmanager2_flash9.swf");
		l.features.peakData = l.features.waveformData = l.features.eqData = (l.flashVersion > 8)
	};
	this._overHTTP = (document.location ? document.location.protocol.match(/http/i) : null);
	this._waitingforEI = false;
	this._initPending = false;
	this._tryInitOnFocus = (this.isSafari && typeof document.hasFocus == "undefined");
	this._isFocused = (typeof document.hasFocus != "undefined" ? document.hasFocus() : null);
	this._okToDisable = !this._tryInitOnFocus;
	this.useAltURL = !this._overHTTP;
	var m = "http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html";
	this.strings = {
		notReady : "Not loaded yet",
		appXHTML : "appendChild/innerHTML set failed."
	};
	this.supported = function () {
		return (l._didInit && !l._disabled)
	};
	this.getMovie = function (a) {
		return l.isIE ? window[a] : (l.isSafari ? j(a) || document[a] : j(a))
	};
	this.loadFromXML = function (b) {
		try {
			l.o._loadFromXML(b)
		} catch (a) {
			l._failSafely();
			return true
		}
	};
	this.createSound = function (b) {
		if (arguments.length == 2) {
			b = {
				id : arguments[0],
				url : arguments[1]
			}
		}
		var a = l._mergeObjects(b);
		var c = a;
		if (l._idCheck(c.id, true)) {
			return l.sounds[c.id]
		}
		if (l.flashVersion > 8 && l.useMovieStar) {
			if (c.isMovieStar === null) {
				c.isMovieStar = (c.url.match(l.netStreamPattern) ? true : false)
			}
			if (c.isMovieStar) {}

			if (c.isMovieStar && (c.usePeakData || c.useWaveformData || c.useEQData)) {
				c.usePeakData = false;
				c.useWaveformData = false;
				c.useEQData = false
			}
		}
		l.sounds[c.id] = new k(c);
		l.soundIDs[l.soundIDs.length] = c.id;
		if (l.flashVersion == 8) {
			l.o._createSound(c.id, c.onjustbeforefinishtime)
		} else {
			l.o._createSound(c.id, c.url, c.onjustbeforefinishtime, c.usePeakData, c.useWaveformData, c.useEQData, c.isMovieStar, (c.isMovieStar ? c.useVideo : false), (c.isMovieStar ? c.bufferTime : false))
		}
		if (c.autoLoad || c.autoPlay) {
			if (l.sounds[c.id]) {
				l.sounds[c.id].load(c)
			}
		}
		if (c.autoPlay) {
			l.sounds[c.id].play()
		}
		return l.sounds[c.id]
	};
	this.createVideo = function (a) {
		if (arguments.length == 2) {
			a = {
				id : arguments[0],
				url : arguments[1]
			}
		}
		if (l.flashVersion >= 9) {
			a.isMovieStar = true;
			a.useVideo = true
		} else {
			return false
		}
		if (!l.useMovieStar) {}

		return l.createSound(a)
	};
	this.destroySound = function (b, c) {
		if (!l._idCheck(b)) {
			return false
		}
		for (var a = 0; a < l.soundIDs.length; a++) {
			if (l.soundIDs[a] == b) {
				l.soundIDs.splice(a, 1);
				continue
			}
		}
		l.sounds[b].unload();
		if (!c) {
			l.sounds[b].destruct()
		}
		delete l.sounds[b]
	};
	this.destroyVideo = this.destroySound;
	this.load = function (b, a) {
		if (!l._idCheck(b)) {
			return false
		}
		l.sounds[b].load(a)
	};
	this.unload = function (a) {
		if (!l._idCheck(a)) {
			return false
		}
		l.sounds[a].unload()
	};
	this.play = function (b, a) {
		if (!l._idCheck(b)) {
			if (typeof a != "Object") {
				a = {
					url : a
				}
			}
			if (a && a.url) {
				a.id = b;
				l.createSound(a)
			} else {
				return false
			}
		}
		l.sounds[b].play(a)
	};
	this.start = this.play;
	this.setPosition = function (b, a) {
		if (!l._idCheck(b)) {
			return false
		}
		l.sounds[b].setPosition(a)
	};
	this.stop = function (a) {
		if (!l._idCheck(a)) {
			return false
		}
		l.sounds[a].stop()
	};
	this.stopAll = function () {
		for (var a in l.sounds) {
			if (l.sounds[a]instanceof k) {
				l.sounds[a].stop()
			}
		}
	};
	this.pause = function (a) {
		if (!l._idCheck(a)) {
			return false
		}
		l.sounds[a].pause()
	};
	this.pauseAll = function () {
		for (var a = l.soundIDs.length; a--; ) {
			l.sounds[l.soundIDs[a]].pause()
		}
	};
	this.resume = function (a) {
		if (!l._idCheck(a)) {
			return false
		}
		l.sounds[a].resume()
	};
	this.resumeAll = function () {
		for (var a = l.soundIDs.length; a--; ) {
			l.sounds[l.soundIDs[a]].resume()
		}
	};
	this.togglePause = function (a) {
		if (!l._idCheck(a)) {
			return false
		}
		l.sounds[a].togglePause()
	};
	this.setPan = function (b, a) {
		if (!l._idCheck(b)) {
			return false
		}
		l.sounds[b].setPan(a)
	};
	this.setVolume = function (a, b) {
		if (!l._idCheck(a)) {
			return false
		}
		l.sounds[a].setVolume(b)
	};
	this.mute = function (b) {
		if (typeof b != "string") {
			b = null
		}
		if (!b) {
			for (var a = l.soundIDs.length; a--; ) {
				l.sounds[l.soundIDs[a]].mute()
			}
			l.muted = true
		} else {
			if (!l._idCheck(b)) {
				return false
			}
			l.sounds[b].mute()
		}
	};
	this.muteAll = function () {
		l.mute()
	};
	this.unmute = function (b) {
		if (typeof b != "string") {
			b = null
		}
		if (!b) {
			for (var a = l.soundIDs.length; a--; ) {
				l.sounds[l.soundIDs[a]].unmute()
			}
			l.muted = false
		} else {
			if (!l._idCheck(b)) {
				return false
			}
			l.sounds[b].unmute()
		}
	};
	this.unmuteAll = function () {
		l.unmute()
	};
	this.getMemoryUse = function () {
		if (l.flashVersion == 8) {
			return 0
		}
		if (l.o) {
			return parseInt(l.o._getMemoryUse(), 10)
		}
	};
	this.setPolling = function (a) {
		if (!l.o || !l.allowPolling) {
			return false
		}
		l.o._setPolling(a)
	};
	this.disable = function (a) {
		if (typeof a == "undefined") {
			a = false
		}
		if (l._disabled) {
			return false
		}
		l._disabled = true;
		for (var b = l.soundIDs.length; b--; ) {
			l._disableObject(l.sounds[l.soundIDs[b]])
		}
		l.initComplete(a)
	};
	this.canPlayURL = function (a) {
		return (a ? (a.match(l.filePattern) ? true : false) : null)
	};
	this.getSoundById = function (b, a) {
		if (!b) {
			throw new Error("SoundManager.getSoundById(): sID is null/undefined")
		}
		var c = l.sounds[b];
		if (!c && !a) {}

		return c
	};
	this.onload = function () {
		soundManager._wD("Warning: soundManager.onload() is undefined.", 2)
	};
	this.onerror = function () {};
	this._idCheck = this.getSoundById;
	this._complain = function (b, a) {};
	var n = function () {
		return false
	};
	n._protected = true;
	this._disableObject = function (a) {
		for (var b in a) {
			if (typeof a[b] == "function" && typeof a[b]._protected == "undefined") {
				a[b] = n
			}
		}
		b = null
	};
	this._failSafely = function (a) {
		if (typeof a == "undefined") {
			a = false
		}
		if (!l._disabled || a) {
			l.disable(a)
		}
	};
	this._normalizeMovieURL = function (b) {
		var a = null;
		if (b) {
			if (b.match(/\.swf(\?.*)?$/i)) {
				a = b.substr(b.toLowerCase().lastIndexOf(".swf?") + 4);
				if (a) {
					return b
				}
			} else {
				if (b.lastIndexOf("/") != b.length - 1) {
					b = b + "/"
				}
			}
		}
		return (b && b.lastIndexOf("/") != -1 ? b.substr(0, b.lastIndexOf("/") + 1) : "./") + l.movieURL
	};
	this._getDocument = function () {
		return (document.body ? document.body : (document.documentElement ? document.documentElement : document.getElementsByTagName("div")[0]))
	};
	this._getDocument._protected = true;
	this._createMovie = function (b, F) {
		if (l._didAppend && l._appendSuccess) {
			return false
		}
		if (window.location.href.indexOf("debug=1") + 1) {
			l.debugMode = true
		}
		l._didAppend = true;
		l._setVersionInfo();
		var c = (F ? F : l.url);
		var g = (l.altURL ? l.altURL : c);
		l.url = l._normalizeMovieURL(l._overHTTP ? c : g);
		F = l.url;
		var f = null;
		if (l.useHighPerformance && l.useMovieStar && l.defaultOptions.useVideo === true) {
			f = "soundManager note: disabling highPerformance, not applicable with movieStar mode + useVideo";
			l.useHighPerformance = false
		}
		l.wmode = (!l.wmode && l.useHighPerformance && !l.useMovieStar ? "transparent" : l.wmode);
		if (l.wmode !== null && l.flashLoadTimeout !== 0 && !l.useHighPerformance && !l.isIE && navigator.platform.match(/win32/i)) {
			l.specialWmodeCase = true;
			l.wmode = null
		}
		if (l.flashVersion == 8) {
			l.allowFullScreen = false
		}
		var C = {
			name : b,
			id : b,
			src : F,
			width : "100%",
			height : "100%",
			quality : "high",
			allowScriptAccess : "always",
			bgcolor : l.bgColor,
			pluginspage : "http://www.macromedia.com/go/getflashplayer",
			type : "application/x-shockwave-flash",
			wmode : l.wmode,
			allowfullscreen : (l.allowFullScreen ? "true" : "false")
		};
		if (!l.wmode) {
			delete C.wmode
		}
		var L = {
			id : b,
			data : F,
			type : "application/x-shockwave-flash",
			width : "100%",
			height : "100%",
			wmode : l.wmode
		};
		var E = null;
		var s = null;
		if (l.isIE) {
			E = document.createElement("div");
			var e = '<object id="' + b + '" data="' + F + '" type="application/x-shockwave-flash" width="100%" height="100%"><param name="movie" value="' + F + '" /><param name="AllowScriptAccess" value="always" /><param name="quality" value="high" />' + (l.wmode ? '<param name="wmode" value="' + l.wmode + '" /> ' : "") + '<param name="bgcolor" value="' + l.bgColor + '" /><param name="allowFullScreen" value="' + (l.allowFullScreen ? "true" : "false") + '" /><!-- --></object>'
		} else {
			E = document.createElement("embed");
			for (s in C) {
				if (C.hasOwnProperty(s)) {
					E.setAttribute(s, C[s])
				}
			}
		}
		var J = document.createElement("div");
		J.id = l.debugID + "-toggle";
		var I = {
			position : "fixed",
			bottom : "0px",
			right : "0px",
			width : "1.2em",
			height : "1.2em",
			lineHeight : "1.2em",
			margin : "2px",
			textAlign : "center",
			border : "1px solid #999",
			cursor : "pointer",
			background : "#fff",
			color : "#333",
			zIndex : 10001
		};
		J.appendChild(document.createTextNode("-"));
		J.onclick = l._toggleDebug;
		J.title = "Toggle SM2 debug console";
		if (navigator.userAgent.match(/msie 6/i)) {
			J.style.position = "absolute";
			J.style.cursor = "hand"
		}
		for (s in I) {
			if (I.hasOwnProperty(s)) {
				J.style[s] = I[s]
			}
		}
		var d = l._getDocument();
		if (d) {
			l.oMC = j("sm2-container") ? j("sm2-container") : document.createElement("div");
			if (!l.oMC.id) {
				l.oMC.id = "sm2-container";
				l.oMC.className = "movieContainer";
				var D = null;
				var x = null;
				if (l.useHighPerformance) {
					D = {
						position : "fixed",
						width : "8px",
						height : "8px",
						bottom : "0px",
						left : "0px"
					}
				} else {
					D = {
						position : "absolute",
						width : "1px",
						height : "1px",
						top : "-999px",
						left : "-999px"
					}
				}
				var H = null;
				for (H in D) {
					if (D.hasOwnProperty(H)) {
						l.oMC.style[H] = D[H]
					}
				}
				try {
					if (!l.isIE) {
						l.oMC.appendChild(E)
					}
					d.appendChild(l.oMC);
					if (l.isIE) {
						x = l.oMC.appendChild(document.createElement("div"));
						x.className = "sm2-object-box";
						x.innerHTML = e
					}
					l._appendSuccess = true
				} catch (a) {
					throw new Error(l.strings.appXHTML)
				}
			} else {
				l.oMC.appendChild(E);
				if (l.isIE) {
					x = l.oMC.appendChild(document.createElement("div"));
					x.className = "sm2-object-box";
					x.innerHTML = e
				}
				l._appendSuccess = true
			}
			if (!j(l.debugID) && ((!l._hasConsole || !l.useConsole) || (l.useConsole && l._hasConsole && !l.consoleOnly))) {
				var G = document.createElement("div");
				G.id = l.debugID;
				G.style.display = (l.debugMode ? "block" : "none");
				if (l.debugMode && !j(J.id)) {
					try {
						d.appendChild(J)
					} catch (K) {
						throw new Error(l.strings.appXHTML)
					}
					d.appendChild(G)
				}
			}
			d = null
		}
		if (f) {}

	};
	this._writeDebug = function (e, g, c) {
		if (!l.debugMode) {
			return false
		}
		if (typeof c != "undefined" && c) {
			e = e + " | " + new Date().getTime()
		}
		if (l._hasConsole && l.useConsole) {
			var f = l._debugLevels[g];
			if (typeof console[f] != "undefined") {
				console[f](e)
			} else {
				console.log(e)
			}
			if (l.useConsoleOnly) {
				return true
			}
		}
		var o = "soundmanager-debug";
		try {
			var a = j(o);
			if (!a) {
				return false
			}
			var b = document.createElement("div");
			if (++l._wdCount % 2 === 0) {
				b.className = "sm2-alt"
			}
			if (typeof g == "undefined") {
				g = 0
			} else {
				g = parseInt(g, 10)
			}
			b.appendChild(document.createTextNode(e));
			if (g) {
				if (g >= 2) {
					b.style.fontWeight = "bold"
				}
				if (g == 3) {
					b.style.color = "#ff3333"
				}
			}
			a.insertBefore(b, a.firstChild)
		} catch (d) {}

		a = null
	};
	this._writeDebug._protected = true;
	this._wdCount = 0;
	this._wdCount._protected = true;
	this._wD = this._writeDebug;
	this._wDAlert = function (a) {
		alert(a)
	};
	if (window.location.href.indexOf("debug=alert") + 1 && l.debugMode) {
		l._wD = l._wDAlert
	}
	this._toggleDebug = function () {
		var a = j(l.debugID);
		var b = j(l.debugID + "-toggle");
		if (!a) {
			return false
		}
		if (l._debugOpen) {
			b.innerHTML = "+";
			a.style.display = "none"
		} else {
			b.innerHTML = "-";
			a.style.display = "block"
		}
		l._debugOpen = !l._debugOpen
	};
	this._toggleDebug._protected = true;
	this._debug = function () {
		for (var a = 0, b = l.soundIDs.length; a < b; a++) {
			l.sounds[l.soundIDs[a]]._debug()
		}
	};
	this._debugTS = function (a, d, c) {
		if (typeof sm2Debugger != "undefined") {
			try {
				sm2Debugger.handleEvent(a, d, c)
			} catch (b) {}

		}
	};
	this._debugTS._protected = true;
	this._mergeObjects = function (d, e) {
		var a = {};
		for (var c in d) {
			if (d.hasOwnProperty(c)) {
				a[c] = d[c]
			}
		}
		var b = (typeof e == "undefined" ? l.defaultOptions : e);
		for (var f in b) {
			if (b.hasOwnProperty(f) && typeof a[f] == "undefined") {
				a[f] = b[f]
			}
		}
		return a
	};
	this.createMovie = function (a) {
		if (a) {
			l.url = a
		}
		l._initMovie()
	};
	this.go = this.createMovie;
	this._initMovie = function () {
		if (l.o) {
			return false
		}
		l.o = l.getMovie(l.id);
		if (!l.o) {
			if (!l.oRemoved) {
				l._createMovie(l.id, l.url)
			} else {
				if (!l.isIE) {
					l.oMC.appendChild(l.oRemoved)
				} else {
					l.oMC.innerHTML = l.oRemovedHTML
				}
				l.oRemoved = null;
				l._didAppend = true
			}
			l.o = l.getMovie(l.id)
		}
		if (l.o) {
			if (l.flashLoadTimeout > 0) {}

		}
	};
	this.waitForExternalInterface = function () {
		if (l._waitingForEI) {
			return false
		}
		l._waitingForEI = true;
		if (l._tryInitOnFocus && !l._isFocused) {
			return false
		}
		if (l.flashLoadTimeout > 0) {
			if (!l._didInit) {}

			setTimeout(function () {
				if (!l._didInit) {
					if (!l._overHTTP) {}

					l._debugTS("flashtojs", false, ": Timed out" + (l._overHTTP) ? " (Check flash security)" : " (No plugin/missing SWF?)")
				}
				if (!l._didInit && l._okToDisable) {
					l._failSafely(true)
				}
			}, l.flashLoadTimeout)
		} else {
			if (!l.didInit) {}

		}
	};
	this.handleFocus = function () {
		if (l._isFocused || !l._tryInitOnFocus) {
			return true
		}
		l._okToDisable = true;
		l._isFocused = true;
		if (l._tryInitOnFocus) {
			window.removeEventListener("mousemove", l.handleFocus, false)
		}
		l._waitingForEI = false;
		setTimeout(l.waitForExternalInterface, 500);
		if (window.removeEventListener) {
			window.removeEventListener("focus", l.handleFocus, false)
		} else {
			if (window.detachEvent) {
				window.detachEvent("onfocus", l.handleFocus)
			}
		}
	};
	this.initComplete = function (a) {
		if (l._didInit) {
			return false
		}
		l._didInit = true;
		if (l._disabled || a) {
			l._debugTS("onload", false);
			l.onerror.apply(window);
			return false
		} else {
			l._debugTS("onload", true)
		}
		if (l.waitForWindowLoad && !l._windowLoaded) {
			if (window.addEventListener) {
				window.addEventListener("load", l.initUserOnload, false)
			} else {
				if (window.attachEvent) {
					window.attachEvent("onload", l.initUserOnload)
				}
			}
			return false
		} else {
			if (l.waitForWindowLoad && l._windowLoaded) {}

			l.initUserOnload()
		}
	};
	this.initUserOnload = function () {
		l.onload.apply(window)
	};
	this.init = function () {
		l._initMovie();
		if (l._didInit) {
			return false
		}
		if (window.removeEventListener) {
			window.removeEventListener("load", l.beginDelayedInit, false)
		} else {
			if (window.detachEvent) {
				window.detachEvent("onload", l.beginDelayedInit)
			}
		}
		try {
			l.o._externalInterfaceTest(false);
			if (!l.allowPolling) {}

			l.setPolling(true);
			if (!l.debugMode) {
				l.o._disableDebug()
			}
			l.enabled = true;
			l._debugTS("jstoflash", true)
		} catch (a) {
			l._debugTS("jstoflash", false);
			l._failSafely(true);
			l.initComplete();
			return false
		}
		l.initComplete()
	};
	this.beginDelayedInit = function () {
		l._windowLoaded = true;
		setTimeout(l.waitForExternalInterface, 500);
		setTimeout(l.beginInit, 20)
	};
	this.beginInit = function () {
		if (l._initPending) {
			return false
		}
		l.createMovie();
		l._initMovie();
		l._initPending = true;
		return true
	};
	this.domContentLoaded = function () {
		if (document.removeEventListener) {
			document.removeEventListener("DOMContentLoaded", l.domContentLoaded, false)
		}
		l.go()
	};
	this._externalInterfaceOK = function () {
		if (l.swfLoaded) {
			return false
		}
		l._debugTS("swf", true);
		l._debugTS("flashtojs", true);
		l.swfLoaded = true;
		l._tryInitOnFocus = false;
		if (l.isIE) {
			setTimeout(l.init, 100)
		} else {
			l.init()
		}
	};
	this._setSandboxType = function (b) {
		var a = l.sandbox;
		a.type = b;
		a.description = a.types[(typeof a.types[b] != "undefined" ? b : "unknown")];
		if (a.type == "localWithFile") {
			a.noRemote = true;
			a.noLocal = false
		} else {
			if (a.type == "localWithNetwork") {
				a.noRemote = false;
				a.noLocal = true
			} else {
				if (a.type == "localTrusted") {
					a.noRemote = false;
					a.noLocal = false
				}
			}
		}
	};
	this.reboot = function () {
		if (l.soundIDs.length) {}

		for (var b = l.soundIDs.length; b--; ) {
			l.sounds[l.soundIDs[b]].destruct()
		}
		try {
			if (l.isIE) {
				l.oRemovedHTML = l.o.innerHTML
			}
			l.oRemoved = l.o.parentNode.removeChild(l.o)
		} catch (a) {}

		l.enabled = false;
		l._didInit = false;
		l._waitingForEI = false;
		l._initPending = false;
		l._didInit = false;
		l._didAppend = false;
		l._appendSuccess = false;
		l._didInit = false;
		l._disabled = false;
		l._waitingforEI = true;
		l.swfLoaded = false;
		l.soundIDs = {};
		l.sounds = [];
		l.o = null;
		window.setTimeout(function () {
			soundManager.beginDelayedInit()
		}, 20)
	};
	this.destruct = function () {
		l.disable(true)
	};
	k = function (b) {
		var a = this;
		this.sID = b.id;
		this.url = b.url;
		this.options = l._mergeObjects(b);
		this.instanceOptions = this.options;
		this._iO = this.instanceOptions;
		this.pan = this.options.pan;
		this.volume = this.options.volume;
		this._lastURL = null;
		this._debug = function () {
			if (l.debugMode) {
				var d = null;
				var g = [];
				var e = null;
				var c = null;
				var f = 64;
				for (d in a.options) {
					if (a.options[d] !== null) {
						if (a.options[d]instanceof Function) {
							e = a.options[d].toString();
							e = e.replace(/\s\s+/g, " ");
							c = e.indexOf("{");
							g[g.length] = " " + d + ": {" + e.substr(c + 1, (Math.min(Math.max(e.indexOf("\n") - 1, f), f))).replace(/\n/g, "") + "... }"
						} else {
							g[g.length] = " " + d + ": " + a.options[d]
						}
					}
				}
			}
		};
		this._debug();
		this.id3 = {};
		this.resetProperties = function (c) {
			a.bytesLoaded = null;
			a.bytesTotal = null;
			a.position = null;
			a.duration = null;
			a.durationEstimate = null;
			a.loaded = false;
			a.playState = 0;
			a.paused = false;
			a.readyState = 0;
			a.muted = false;
			a.didBeforeFinish = false;
			a.didJustBeforeFinish = false;
			a.isBuffering = false;
			a.instanceOptions = {};
			a.instanceCount = 0;
			a.peakData = {
				left : 0,
				right : 0
			};
			a.waveformData = {
				left : [],
				right : []
			};
			a.eqData = []
		};
		a.resetProperties();
		this.load = function (d) {
			if (typeof d != "undefined") {
				a._iO = l._mergeObjects(d);
				a.instanceOptions = a._iO
			} else {
				d = a.options;
				a._iO = d;
				a.instanceOptions = a._iO;
				if (a._lastURL && a._lastURL != a.url) {
					a._iO.url = a.url;
					a.url = null
				}
			}
			if (typeof a._iO.url == "undefined") {
				a._iO.url = a.url
			}
			if (a._iO.url == a.url && a.readyState !== 0 && a.readyState != 2) {
				return false
			}
			a.url = a._iO.url;
			a._lastURL = a._iO.url;
			a.loaded = false;
			a.readyState = 1;
			a.playState = 0;
			try {
				if (l.flashVersion == 8) {
					l.o._load(a.sID, a._iO.url, a._iO.stream, a._iO.autoPlay, (a._iO.whileloading ? 1 : 0))
				} else {
					l.o._load(a.sID, a._iO.url, a._iO.stream ? true : false, a._iO.autoPlay ? true : false);
					if (a._iO.isMovieStar && a._iO.autoLoad && !a._iO.autoPlay) {
						a.pause()
					}
				}
			} catch (c) {
				l._debugTS("onload", false);
				l.onerror();
				l.disable()
			}
		};
		this.unload = function () {
			if (a.readyState !== 0) {
				if (a.readyState != 2) {
					a.setPosition(0, true)
				}
				l.o._unload(a.sID, l.nullURL);
				a.resetProperties()
			}
		};
		this.destruct = function () {
			l.o._destroySound(a.sID);
			l.destroySound(a.sID, true)
		};
		this.play = function (c) {
			if (!c) {
				c = {}

			}
			a._iO = l._mergeObjects(c, a._iO);
			a._iO = l._mergeObjects(a._iO, a.options);
			a.instanceOptions = a._iO;
			if (a.playState == 1) {
				var d = a._iO.multiShot;
				if (!d) {
					return false
				} else {}

			}
			if (!a.loaded) {
				if (a.readyState === 0) {
					a._iO.stream = true;
					a._iO.autoPlay = true;
					a.load(a._iO)
				} else {
					if (a.readyState == 2) {
						return false
					} else {}

				}
			} else {}

			if (a.paused) {
				a.resume()
			} else {
				a.playState = 1;
				if (!a.instanceCount || l.flashVersion > 8) {
					a.instanceCount++
				}
				a.position = (typeof a._iO.position != "undefined" && !isNaN(a._iO.position) ? a._iO.position : 0);
				if (a._iO.onplay) {
					a._iO.onplay.apply(a)
				}
				a.setVolume(a._iO.volume, true);
				a.setPan(a._iO.pan, true);
				l.o._start(a.sID, a._iO.loop || 1, (l.flashVersion == 9 ? a.position : a.position / 1000))
			}
		};
		this.start = this.play;
		this.stop = function (c) {
			if (a.playState == 1) {
				a.playState = 0;
				a.paused = false;
				if (a._iO.onstop) {
					a._iO.onstop.apply(a)
				}
				l.o._stop(a.sID, c);
				a.instanceCount = 0;
				a._iO = {}

			}
		};
		this.setPosition = function (d, e) {
			if (typeof d == "undefined") {
				d = 0
			}
			var c = Math.min(a.duration, Math.max(d, 0));
			a._iO.position = c;
			if (!e) {}

			l.o._setPosition(a.sID, (l.flashVersion == 9 ? a._iO.position : a._iO.position / 1000), (a.paused || !a.playState))
		};
		this.pause = function () {
			if (a.paused || a.playState === 0) {
				return false
			}
			a.paused = true;
			l.o._pause(a.sID);
			if (a._iO.onpause) {
				a._iO.onpause.apply(a)
			}
		};
		this.resume = function () {
			if (!a.paused || a.playState === 0) {
				return false
			}
			a.paused = false;
			l.o._pause(a.sID);
			if (a._iO.onresume) {
				a._iO.onresume.apply(a)
			}
		};
		this.togglePause = function () {
			if (a.playState === 0) {
				a.play({
					position : (l.flashVersion == 9 ? a.position : a.position / 1000)
				});
				return false
			}
			if (a.paused) {
				a.resume()
			} else {
				a.pause()
			}
		};
		this.setPan = function (c, d) {
			if (typeof c == "undefined") {
				c = 0
			}
			if (typeof d == "undefined") {
				d = false
			}
			l.o._setPan(a.sID, c);
			a._iO.pan = c;
			if (!d) {
				a.pan = c
			}
		};
		this.setVolume = function (d, c) {
			if (typeof d == "undefined") {
				d = 100
			}
			if (typeof c == "undefined") {
				c = false
			}
			l.o._setVolume(a.sID, (l.muted && !a.muted) || a.muted ? 0 : d);
			a._iO.volume = d;
			if (!c) {
				a.volume = d
			}
		};
		this.mute = function () {
			a.muted = true;
			l.o._setVolume(a.sID, 0)
		};
		this.unmute = function () {
			a.muted = false;
			var c = typeof a._iO.volume != "undefined";
			l.o._setVolume(a.sID, c ? a._iO.volume : a.options.volume)
		};
		this._whileloading = function (e, d, c) {
			if (!a._iO.isMovieStar) {
				a.bytesLoaded = e;
				a.bytesTotal = d;
				a.duration = Math.floor(c);
				a.durationEstimate = parseInt((a.bytesTotal / a.bytesLoaded) * a.duration, 10);
				if (a.readyState != 3 && a._iO.whileloading) {
					a._iO.whileloading.apply(a)
				}
			} else {
				a.bytesLoaded = e;
				a.bytesTotal = d;
				a.duration = Math.floor(c);
				a.durationEstimate = a.duration;
				if (a.readyState != 3 && a._iO.whileloading) {
					a._iO.whileloading.apply(a)
				}
			}
		};
		this._onid3 = function (g, e) {
			var f = [];
			for (var c = 0, d = g.length; c < d; c++) {
				f[g[c]] = e[c]
			}
			a.id3 = l._mergeObjects(a.id3, f);
			if (a._iO.onid3) {
				a._iO.onid3.apply(a)
			}
		};
		this._whileplaying = function (e, d, g, f, c) {
			if (isNaN(e) || e === null) {
				return false
			}
			if (a.playState === 0 && e > 0) {
				e = 0
			}
			a.position = e;
			if (a._iO.usePeakData && typeof d != "undefined" && d) {
				a.peakData = {
					left : d.leftPeak,
					right : d.rightPeak
				}
			}
			if (a._iO.useWaveformData && typeof g != "undefined" && g) {
				a.waveformData = {
					left : g.split(","),
					right : f.split(",")
				}
			}
			if (a._iO.useEQData && typeof c != "undefined" && c) {
				a.eqData = c
			}
			if (a.playState == 1) {
				if (a.isBuffering) {
					a._onbufferchange(0)
				}
				if (a._iO.whileplaying) {
					a._iO.whileplaying.apply(a)
				}
				if (a.loaded && a._iO.onbeforefinish && a._iO.onbeforefinishtime && !a.didBeforeFinish && a.duration - a.position <= a._iO.onbeforefinishtime) {
					a._onbeforefinish()
				}
			}
		};
		this._onload = function (c) {
			c = (c == 1 ? true : false);
			if (!c) {
				if (l.sandbox.noRemote === true) {}

				if (l.sandbox.noLocal === true) {}

			}
			a.loaded = c;
			a.readyState = c ? 3 : 2;
			if (a._iO.onload) {
				a._iO.onload.apply(a)
			}
		};
		this._onbeforefinish = function () {
			if (!a.didBeforeFinish) {
				a.didBeforeFinish = true;
				if (a._iO.onbeforefinish) {
					a._iO.onbeforefinish.apply(a)
				}
			}
		};
		this._onjustbeforefinish = function (c) {
			if (!a.didJustBeforeFinish) {
				a.didJustBeforeFinish = true;
				if (a._iO.onjustbeforefinish) {
					a._iO.onjustbeforefinish.apply(a)
				}
			}
		};
		this._onfinish = function () {
			if (a._iO.onbeforefinishcomplete) {
				a._iO.onbeforefinishcomplete.apply(a)
			}
			a.didBeforeFinish = false;
			a.didJustBeforeFinish = false;
			if (a.instanceCount) {
				a.instanceCount--;
				if (!a.instanceCount) {
					a.playState = 0;
					a.paused = false;
					a.instanceCount = 0;
					a.instanceOptions = {};
					if (a._iO.onfinish) {
						a._iO.onfinish.apply(a)
					}
				}
			} else {
				if (a.useVideo) {}

			}
		};
		this._onmetadata = function (c) {
			if (!c.width && !c.height) {
				c.width = 320;
				c.height = 240
			}
			a.metadata = c;
			a.width = c.width;
			a.height = c.height;
			if (a._iO.onmetadata) {
				a._iO.onmetadata.apply(a)
			}
		};
		this._onbufferchange = function (c) {
			if (a.playState === 0) {
				return false
			}
			if (c == a.isBuffering) {
				return false
			}
			a.isBuffering = (c == 1 ? true : false);
			if (a._iO.onbufferchange) {
				a._iO.onbufferchange.apply(a)
			}
		};
		this._ondataerror = function (c) {
			if (a.playState > 0) {
				if (a._iO.ondataerror) {
					a._iO.ondataerror.apply(a)
				}
			} else {}

		}
	};
	this._onfullscreenchange = function (b) {
		l.isFullScreen = (b == 1 ? true : false);
		if (!l.isFullScreen) {
			try {
				window.focus()
			} catch (a) {}

		}
	};
	if (window.addEventListener) {
		window.addEventListener("focus", l.handleFocus, false);
		window.addEventListener("load", l.beginDelayedInit, false);
		window.addEventListener("unload", l.destruct, false);
		if (l._tryInitOnFocus) {
			window.addEventListener("mousemove", l.handleFocus, false)
		}
	} else {
		if (window.attachEvent) {
			window.attachEvent("onfocus", l.handleFocus);
			window.attachEvent("onload", l.beginDelayedInit);
			window.attachEvent("unload", l.destruct)
		} else {
			l._debugTS("onload", false);
			soundManager.onerror();
			soundManager.disable()
		}
	}
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", l.domContentLoaded, false)
	}
}
if (typeof SM2_DEFER == "undefined" || !SM2_DEFER) {
	soundManager = new SoundManager()
}
var qwebirc = {
	ui : {
		themes : {},
		style : {}

	},
	irc : {},
	util : {
		crypto : {}

	},
	config : {},
	auth : {},
	sound : {},
	connected : false,
	xdomain : {}

};
if (typeof QWEBIRC_BUILD != "undefined") {
	qwebirc.BUILD = QWEBIRC_BUILD;
	qwebirc.FILE_SUFFIX = "-" + QWEBIRC_BUILD
} else {
	qwebirc.BUILD = null;
	qwebirc.FILE_SUFFIX = ""
}
qwebirc.VERSION = "0.92";
Array.prototype.indexFromEnd = function (b) {
	var a = this;
	if (b < 0) {
		return a[a.length + b]
	}
	return a[b]
};
qwebirc.util.dictCopy = function (b) {
	var c = {};
	for (var a in b) {
		c[a] = b[a]
	}
	return c
};
String.prototype.replaceAll = function (d, b) {
	var a = this.indexOf(d);
	var e = this;
	while (a > -1) {
		e = e.replace(d, b);
		a = e.indexOf(d)
	}
	return e
};
String.prototype.splitMax = function (d, a) {
	var b = this.split(d);
	var c = b.slice(0, a - 1);
	if (b.length >= a) {
		c.push(b.slice(a - 1).join(d))
	}
	return c
};
qwebirc.util.parseURI = function (f) {
	var b = {};
	var g = f.indexOf("?");
	if (g == -1) {
		return b
	}
	var a = f.substring(g + 1);
	var c = a.split("&");
	for (var d = 0; d < c.length; d++) {
		var e = c[d].splitMax("=", 2);
		if (e.length < 2) {
			continue
		}
		b[unescape(e[0])] = unescape(e[1])
	}
	return b
};
qwebirc.util.DaysOfWeek = {
	0 : "Sun",
	1 : "Mon",
	2 : "Tue",
	3 : "Wed",
	4 : "Thu",
	5 : "Fri",
	6 : "Sat"
};
qwebirc.util.MonthsOfYear = {
	0 : "Jan",
	1 : "Feb",
	2 : "Mar",
	3 : "Apr",
	4 : "May",
	5 : "Jun",
	6 : "Jul",
	7 : "Aug",
	8 : "Sep",
	9 : "Oct",
	10 : "Nov",
	11 : "Dec"
};
qwebirc.util.NBSPCreate = function (g, c) {
	var f = g.split("  ");
	for (var b = 0; b < f.length; b++) {
		var a = document.createTextNode(f[b]);
		c.appendChild(a);
		if (b != f.length - 1) {
			var d = new Element("span");
			d.set("html", "&nbsp;&nbsp;");
			c.appendChild(d)
		}
	}
};
qwebirc.util.longtoduration = function (b) {
	var d = b % 60;
	var c = Math.floor((b % 3600) / 60);
	var a = Math.floor((b % (3600 * 24)) / 3600);
	var e = Math.floor(b / (24 * 3600));
	return e + " days " + a + " hours " + c + " minutes " + d + " seconds"
};
qwebirc.util.pad = function (a) {
	a = "" + a;
	if (a.length == 1) {
		return "0" + a
	}
	return a
};
RegExp.escape = function (a) {
	return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
};
qwebirc.ui.insertAt = function (a, c, b) {
	if (!c.childNodes || (a >= c.childNodes.length)) {
		c.appendChild(b)
	} else {
		c.insertBefore(b, c.childNodes[a])
	}
};
qwebirc.util.setCaretPos = function (b, c) {
	if ($defined(b.selectionStart)) {
		b.focus();
		b.setSelectionRange(c, c)
	} else {
		if (b.createTextRange) {
			var a = b.createTextRange();
			a.move("character", c);
			a.select()
		}
	}
};
qwebirc.util.setAtEnd = function (a) {
	qwebirc.util.setCaretPos(a.value.length)
};
qwebirc.util.getCaretPos = function (a) {
	if ($defined(a.selectionStart)) {
		return a.selectionStart
	}
	if (document.selection) {
		a.focus();
		var b = document.selection.createRange();
		b.moveStart("character", -a.value.length);
		return b.text.length
	}
};
qwebirc.util.browserVersion = function () {
	return navigator.userAgent
};
qwebirc.util.getEnclosedWord = function (e, a) {
	var b = e.split("");
	var c = [];
	if (e == "") {
		return
	}
	var g = a - 1;
	if (g < 0) {
		g = 0
	} else {
		for (; g >= 0; g--) {
			if (b[g] == " ") {
				g = g + 1;
				break
			}
		}
	}
	if (g < 0) {
		g = 0
	}
	var d = e.substring(g);
	var f = d.indexOf(" ");
	if (f != -1) {
		d = d.substring(0, f)
	}
	return [g, d]
};
String.prototype.startsWith = function (a) {
	return this.substring(0, a.length) == a
};
qwebirc.util.randHexString = function (b) {
	var d = function () {
		return (((1 + Math.random()) * 256) | 0).toString(16).substring(1)
	};
	var a = [];
	for (var c = 0; c < b; c++) {
		a.push(d())
	}
	return a.join("")
};
qwebirc.util.importJS = function (name, watchFor, onload) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = name;
	if (Browser.Engine.trident) {
		var checkFn = function () {
			if (eval("typeof " + watchFor) != "undefined") {
				onload()
			} else {
				checkFn.delay(100)
			}
		};
		checkFn()
	} else {
		script.onload = onload
	}
	document.getElementsByTagName("head")[0].appendChild(script)
};
qwebirc.util.createInput = function (d, c, a, b, h) {
	var f;
	if (Browser.Engine.trident) {
		if (a) {
			a = ' name="' + escape(a) + '"'
		} else {
			a = ""
		}
		if (h) {
			h = ' id="' + escape(h) + '"'
		} else {
			h = ""
		}
		try {
			return $(document.createElement('<input type="' + d + '"' + a + h + " " + (b ? " checked" : "") + "/>"))
		} catch (g) {}

	}
	f = new Element("input");
	f.type = d;
	if (a) {
		f.name = a
	}
	if (h) {
		f.id = h
	}
	if (b) {
		f.checked = true
	}
	c.appendChild(f);
	return f
};
qwebirc.util.b64Table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
qwebirc.util.b64Encode = function (b) {
	var a = [];
	var h = qwebirc.util.b64Table;
	for (var c = 0; c < b.length; ) {
		var l = b.charCodeAt(c++);
		var j = b.charCodeAt(c++);
		var f = b.charCodeAt(c++);
		var k = l >> 2;
		var g = ((l & 3) << 4) | (j >> 4);
		var e = ((j & 15) << 2) | (f >> 6);
		var d = f & 63;
		if (isNaN(j)) {
			e = d = 64
		} else {
			if (isNaN(f)) {
				d = 64
			}
		}
		a.push(h.charAt(k) + h.charAt(g) + h.charAt(e) + h.charAt(d))
	}
	return a.join("")
};
qwebirc.util.b64Decode = function (b) {
	b = b.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	var a = [];
	var j = qwebirc.util.b64Table;
	while (b.length % 4 != 0) {
		b = b + "="
	}
	for (var c = 0; c < b.length; ) {
		var l = j.indexOf(b.charAt(c++));
		var h = j.indexOf(b.charAt(c++));
		var f = j.indexOf(b.charAt(c++));
		var d = j.indexOf(b.charAt(c++));
		var k = (l << 2) | (h >> 4);
		var g = ((h & 15) << 4) | (f >> 2);
		var e = ((f & 3) << 6) | d;
		a.push(String.fromCharCode(k));
		if (f != 64) {
			a.push(String.fromCharCode(g))
		}
		if (d != 64) {
			a.push(String.fromCharCode(e))
		}
	}
	return a.join("")
};
qwebirc.util.composeAnd = function () {
	var a = arguments;
	return function () {
		for (var b = 0; b < a.length; b++) {
			if (!a[b].apply(this, arguments)) {
				return false
			}
		}
		return true
	}
};
qwebirc.util.invertFn = function (a) {
	return function () {
		return !a.apply(this, arguments)
	}
};
qwebirc.util.deviceHasKeyboard = function () {
	var b = function () {
		if (Browser.Engine.ipod) {
			return true
		}
		var g = ["Nintendo Wii", " PIE", "BlackBerry", "IEMobile", "Windows CE", "Nokia", "Opera Mini", "Mobile", "mobile", "Pocket", "pocket", "Android"];
		var f = ["Chrome", "Firefox", "Camino", "Iceweasel", "K-Meleon", "Konqueror", "SeaMonkey", "Windows NT", "Windows 9"];
		var e = navigator.userAgent;
		var d = function (h) {
			return e.indexOf(h) > -1
		};
		for (var c = 0; c < g.length; c++) {
			if (d(g[c])) {
				return false
			}
		}
		for (var c = 0; c < f.length; c++) {
			if (d(f[c])) {
				return true
			}
		}
		return false
	};
	var a = b();
	qwebirc.util.deviceHasKeyboard = function () {
		return a
	};
	return a
};
qwebirc.util.generateID_ID = 0;
qwebirc.util.generateID = function () {
	return "qqa-" + qwebirc.util.generateID_ID++
};
qwebirc.util.crypto.getARC4Stream = function (g, a) {
	var l = [];
	var h = [];
	for (var e = 0; e < g.length; e++) {
		h.push(g.charCodeAt(e))
	}
	for (var e = 0; e < 256; e++) {
		l[e] = e
	}
	var d = 0;
	for (var e = 0; e < 256; e++) {
		d = (d + l[e] + h[e % g.length]) & 255;
		var f = l[e];
		l[e] = l[d];
		l[d] = f
	}
	var b = [];
	var e = 0;
	var d = 0;
	for (var c = 0; c < a; c++) {
		e = (e + 1) & 255;
		d = (d + l[e]) & 255;
		var f = l[e];
		l[e] = l[d];
		l[d] = f;
		b.push(l[(l[e] + l[d]) & 255])
	}
	return b
};
qwebirc.util.crypto.xorStreams = function (c, d) {
	if (c.length != d.length) {
		return
	}
	var a = [];
	for (var b = 0; b < c.length; b++) {
		a.push(String.fromCharCode(c.charCodeAt(b)^d[b]))
	}
	return a.join("")
};
qwebirc.util.crypto.ARC4 = function (a, b) {
	var c = qwebirc.util.crypto.getARC4Stream(a, b.length + 1024);
	c = c.slice(1024);
	return qwebirc.util.crypto.xorStreams(b, c)
};
qwebirc.util.crypto.MD5 = function () {
	this.digest = a;
	var f = "0123456789abcdef";
	function e(m) {
		var n = "";
		for (var l = 0; l <= 3; l++) {
			n += f.charAt((m >> (l * 8 + 4)) & 15) + f.charAt((m >> (l * 8)) & 15)
		}
		return n
	}
	function g(n) {
		var l = ((n.length + 8) >> 6) + 1;
		var o = new Array(l * 16);
		for (var m = 0; m < l * 16; m++) {
			o[m] = 0
		}
		for (var m = 0; m < n.length; m++) {
			o[m >> 2] |= n.charCodeAt(m) << ((m % 4) * 8)
		}
		o[m >> 2] |= 128 << ((m % 4) * 8);
		o[l * 16 - 2] = n.length * 8;
		return o
	}
	function k(l, m) {
		return ((l & 2147483647) + (m & 2147483647))^(l & 2147483648)^(m & 2147483648)
	}
	function d(l, m) {
		return (l << m) | (l >>> (32 - m))
	}
	function i(r, n, m, l, p, o) {
		return k(d(k(k(n, r), k(l, o)), p), m)
	}
	function b(n, m, r, q, l, p, o) {
		return i((m & r) | ((~m) & q), n, m, l, p, o)
	}
	function h(n, m, r, q, l, p, o) {
		return i((m & q) | (r & (~q)), n, m, l, p, o)
	}
	function c(n, m, r, q, l, p, o) {
		return i(m^r^q, n, m, l, p, o)
	}
	function j(n, m, r, q, l, p, o) {
		return i(r^(m | (~q)), n, m, l, p, o)
	}
	function a(s) {
		var v = g(s);
		var u = 1732584193;
		var t = 4023233417;
		var r = 2562383102;
		var q = 271733878;
		for (var n = 0; n < v.length; n += 16) {
			var p = u;
			var o = t;
			var m = r;
			var l = q;
			u = b(u, t, r, q, v[n + 0], 7, 3614090360);
			q = b(q, u, t, r, v[n + 1], 12, 3905402710);
			r = b(r, q, u, t, v[n + 2], 17, 606105819);
			t = b(t, r, q, u, v[n + 3], 22, 3250441966);
			u = b(u, t, r, q, v[n + 4], 7, 4118548399);
			q = b(q, u, t, r, v[n + 5], 12, 1200080426);
			r = b(r, q, u, t, v[n + 6], 17, 2821735955);
			t = b(t, r, q, u, v[n + 7], 22, 4249261313);
			u = b(u, t, r, q, v[n + 8], 7, 1770035416);
			q = b(q, u, t, r, v[n + 9], 12, 2336552879);
			r = b(r, q, u, t, v[n + 10], 17, 4294925233);
			t = b(t, r, q, u, v[n + 11], 22, 2304563134);
			u = b(u, t, r, q, v[n + 12], 7, 1804603682);
			q = b(q, u, t, r, v[n + 13], 12, 4254626195);
			r = b(r, q, u, t, v[n + 14], 17, 2792965006);
			t = b(t, r, q, u, v[n + 15], 22, 1236535329);
			u = h(u, t, r, q, v[n + 1], 5, 4129170786);
			q = h(q, u, t, r, v[n + 6], 9, 3225465664);
			r = h(r, q, u, t, v[n + 11], 14, 643717713);
			t = h(t, r, q, u, v[n + 0], 20, 3921069994);
			u = h(u, t, r, q, v[n + 5], 5, 3593408605);
			q = h(q, u, t, r, v[n + 10], 9, 38016083);
			r = h(r, q, u, t, v[n + 15], 14, 3634488961);
			t = h(t, r, q, u, v[n + 4], 20, 3889429448);
			u = h(u, t, r, q, v[n + 9], 5, 568446438);
			q = h(q, u, t, r, v[n + 14], 9, 3275163606);
			r = h(r, q, u, t, v[n + 3], 14, 4107603335);
			t = h(t, r, q, u, v[n + 8], 20, 1163531501);
			u = h(u, t, r, q, v[n + 13], 5, 2850285829);
			q = h(q, u, t, r, v[n + 2], 9, 4243563512);
			r = h(r, q, u, t, v[n + 7], 14, 1735328473);
			t = h(t, r, q, u, v[n + 12], 20, 2368359562);
			u = c(u, t, r, q, v[n + 5], 4, 4294588738);
			q = c(q, u, t, r, v[n + 8], 11, 2272392833);
			r = c(r, q, u, t, v[n + 11], 16, 1839030562);
			t = c(t, r, q, u, v[n + 14], 23, 4259657740);
			u = c(u, t, r, q, v[n + 1], 4, 2763975236);
			q = c(q, u, t, r, v[n + 4], 11, 1272893353);
			r = c(r, q, u, t, v[n + 7], 16, 4139469664);
			t = c(t, r, q, u, v[n + 10], 23, 3200236656);
			u = c(u, t, r, q, v[n + 13], 4, 681279174);
			q = c(q, u, t, r, v[n + 0], 11, 3936430074);
			r = c(r, q, u, t, v[n + 3], 16, 3572445317);
			t = c(t, r, q, u, v[n + 6], 23, 76029189);
			u = c(u, t, r, q, v[n + 9], 4, 3654602809);
			q = c(q, u, t, r, v[n + 12], 11, 3873151461);
			r = c(r, q, u, t, v[n + 15], 16, 530742520);
			t = c(t, r, q, u, v[n + 2], 23, 3299628645);
			u = j(u, t, r, q, v[n + 0], 6, 4096336452);
			q = j(q, u, t, r, v[n + 7], 10, 1126891415);
			r = j(r, q, u, t, v[n + 14], 15, 2878612391);
			t = j(t, r, q, u, v[n + 5], 21, 4237533241);
			u = j(u, t, r, q, v[n + 12], 6, 1700485571);
			q = j(q, u, t, r, v[n + 3], 10, 2399980690);
			r = j(r, q, u, t, v[n + 10], 15, 4293915773);
			t = j(t, r, q, u, v[n + 1], 21, 2240044497);
			u = j(u, t, r, q, v[n + 8], 6, 1873313359);
			q = j(q, u, t, r, v[n + 15], 10, 4264355552);
			r = j(r, q, u, t, v[n + 6], 15, 2734768916);
			t = j(t, r, q, u, v[n + 13], 21, 1309151649);
			u = j(u, t, r, q, v[n + 4], 6, 4149444226);
			q = j(q, u, t, r, v[n + 11], 10, 3174756917);
			r = j(r, q, u, t, v[n + 2], 15, 718787259);
			t = j(t, r, q, u, v[n + 9], 21, 3951481745);
			u = k(u, p);
			t = k(t, o);
			r = k(r, m);
			q = k(q, l)
		}
		return e(u) + e(t) + e(r) + e(q)
	}
};
qwebirc.irc.IRCConnection = new Class({
		Implements : [Events, Options],
		options : {
			initialNickname : "ircconnX",
			minTimeout : 45000,
			maxTimeout : 5 * 60000,
			timeoutIncrement : 10000,
			initialTimeout : 65000,
			floodInterval : 200,
			floodMax : 10,
			floodReset : 5000,
			errorAlert : true,
			maxRetries : 5,
			serverPassword : null
		},
		initialize : function (a) {
			this.setOptions(a);
			this.initialNickname = this.options.initialNickname;
			this.counter = 0;
			this.disconnected = false;
			this.__floodLastRequest = 0;
			this.__floodCounter = 0;
			this.__floodLastFlood = 0;
			this.__retryAttempts = 0;
			this.__timeoutId = null;
			this.__timeout = this.options.initialTimeout;
			this.__lastActiveRequest = null;
			this.__activeRequest = null;
			this.__sendQueue = [];
			this.__sendQueueActive = false
		},
		__error : function (a) {
			this.fireEvent("error", a);
			if (this.options.errorAlert) {
				alert(a)
			}
		},
		newRequest : function (c, e, a) {
			if (this.disconnected) {
				return null
			}
			if (e && !this.disconnected && this.__isFlooding()) {
				this.disconnect();
				this.__error("BUG: uncontrolled flood detected -- disconnected.")
			}
			var b = true;
			if (a) {
				b = false
			}
			var d = new Request.JSON({
					url : qwebirc.global.dynamicBaseURL + "e/" + c + "?r=" + this.cacheAvoidance + "&t=" + this.counter++,
					async : b
				});
			d.headers = new Hash;
			d.addEvent("request", function () {
				var h = ["Accept", "Accept-Language"];
				var f = "";
				if (Browser.Engine.trident) {
					f = "?";
					h.push("User-Agent");
					h.push("Connection")
				} else {
					if (/Firefox[\/\s]\d+\.\d+/.test(navigator.userAgent)) {
						f = null
					}
				}
				for (var g = 0; g < h.length; g++) {
					try {
						this.setRequestHeader(h[g], f)
					} catch (j) {}

				}
			}
				.bind(d.xhr));
			if (Browser.Engine.trident) {
				d.setHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT")
			}
			return d
		},
		__isFlooding : function () {
			var a = new Date().getTime();
			if (a - this.__floodLastRequest < this.options.floodInterval) {
				if (this.__floodLastFlood != 0 && (a - this.__floodLastFlood > this.options.floodReset)) {
					this.__floodCounter = 0
				}
				this.__floodLastFlood = a;
				if (this.__floodCounter++ >= this.options.floodMax) {
					return true
				}
			}
			this.__floodLastRequest = a;
			return false
		},
		send : function (b, a) {
			if (this.disconnected) {
				return false
			}
			if (a) {
				this.__send(b, false)
			} else {
				this.__sendQueue.push(b);
				this.__processSendQueue()
			}
			return true
		},
		__processSendQueue : function () {
			if (this.__sendQueueActive || this.__sendQueue.length == 0) {
				return
			}
			this.sendQueueActive = true;
			this.__send(this.__sendQueue.shift(), true)
		},
		__send : function (b, c) {
			var a = this.newRequest("p", false, !c);
			if (a === null) {
				return
			}
			a.addEvent("complete", function (d) {
				if (c) {
					this.__sendQueueActive = false
				}
				if (!d || (d[0] == false)) {
					this.__sendQueue = [];
					if (!this.disconnected) {
						this.disconnected = true;
						this.__error("An error occured: " + d[1])
					}
					return false
				}
				this.__processSendQueue()
			}
				.bind(this));
			a.send("s=" + this.sessionid + "&c=" + encodeURIComponent(b))
		},
		__processData : function (a) {
			if (a[0] == false) {
				if (!this.disconnected) {
					this.disconnected = true;
					this.__error("An error occured: " + a[1])
				}
				return false
			}
			this.__retryAttempts = 0;
			a.each(function (b) {
				this.fireEvent("recv", [b])
			}, this);
			return true
		},
		__scheduleTimeout : function () {
			this.__timeoutId = this.__timeoutEvent.delay(this.__timeout, this)
		},
		__cancelTimeout : function () {
			if ($defined(this.__timeoutId)) {
				$clear(this.__timeoutId);
				this.__timeoutId = null
			}
		},
		__timeoutEvent : function () {
			this.__timeoutId = null;
			if (!$defined(this.__activeRequest)) {
				return
			}
			if (this.__lastActiveRequest) {
				this.__lastActiveRequest.cancel()
			}
			this.__activeRequest.__replaced = true;
			this.__lastActiveRequest = this.__activeRequest;
			if (this.__timeout + this.options.timeoutIncrement <= this.options.maxTimeout) {
				this.__timeout += this.options.timeoutIncrement
			}
			this.recv()
		},
		__checkRetries : function () {
			if (this.__retryAttempts++ >= this.options.maxRetries && !this.disconnected) {
				this.disconnect();
				this.__error("Error: connection closed after several requests failed.");
				return false
			}
			if (this.__timeout - this.options.timeoutIncrement >= this.options.minTimeout) {
				this.__timeout -= this.options.timeoutIncrement
			}
			return true
		},
		recv : function () {
			var a = this.newRequest("s", true);
			if (!$defined(a)) {
				return
			}
			this.__activeRequest = a;
			a.__replaced = false;
			var b = function (c) {
				if (a.__replaced) {
					this.__lastActiveRequest = null;
					if (c) {
						this.__processData(c)
					}
					return
				}
				this.__activeRequest = null;
				this.__cancelTimeout();
				if (!c) {
					if (this.disconnected) {
						return
					}
					if (this.__checkRetries()) {
						this.recv()
					}
					return
				}
				if (this.__processData(c)) {
					this.recv()
				}
			};
			a.addEvent("complete", b.bind(this));
			this.__scheduleTimeout();
			a.send("s=" + this.sessionid)
		},
		connect : function () {
			this.cacheAvoidance = qwebirc.util.randHexString(16);
			var b = this.newRequest("n");
			b.addEvent("complete", function (c) {
				if (!c) {
					this.disconnected = true;
					this.__error("Couldn't connect to remote server.");
					return
				}
				if (c[0] == false) {
					this.disconnect();
					this.__error("An error occured: " + c[1]);
					return
				}
				this.sessionid = c[1];
				this.recv()
			}
				.bind(this));
			var a = "nick=" + encodeURIComponent(this.initialNickname);
			if ($defined(this.options.serverPassword)) {
				a += "&password=" + encodeURIComponent(this.options.serverPassword)
			}
			b.send(a)
		},
		__cancelRequests : function () {
			if ($defined(this.__lastActiveRequest)) {
				this.__lastActiveRequest.cancel();
				this.__lastActiveRequest = null
			}
			if ($defined(this.__activeRequest)) {
				this.__activeRequest.cancel();
				this.__activeRequest = null
			}
		},
		disconnect : function () {
			this.disconnected = true;
			this.__cancelTimeout();
			this.__cancelRequests()
		}
	});
qwebirc.irc.IRCLowerTable = ["\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", " ", "!", '"', "#", "$", "%", "&", "\x27", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "\x7f", "\x80", "\x81", "\x82", "\x83", "\x84", "\x85", "\x86", "\x87", "\x88", "\x89", "\x8a", "\x8b", "\x8c", "\x8d", "\x8e", "\x8f", "\x90", "\x91", "\x92", "\x93", "\x94", "\x95", "\x96", "\x97", "\x98", "\x99", "\x9a", "\x9b", "\x9c", "\x9d", "\x9e", "\x9f", "\xa0", "\xa1", "\xa2", "\xa3", "\xa4", "\xa5", "\xa6", "\xa7", "\xa8", "\xa9", "\xaa", "\xab", "\xac", "\xad", "\xae", "\xaf", "\xb0", "\xb1", "\xb2", "\xb3", "\xb4", "\xb5", "\xb6", "\xb7", "\xb8", "\xb9", "\xba", "\xbb", "\xbc", "\xbd", "\xbe", "\xbf", "\xe0", "\xe1", "\xe2", "\xe3", "\xe4", "\xe5", "\xe6", "\xe7", "\xe8", "\xe9", "\xea", "\xeb", "\xec", "\xed", "\xee", "\xef", "\xf0", "\xf1", "\xf2", "\xf3", "\xf4", "\xf5", "\xf6", "\xd7", "\xf8", "\xf9", "\xfa", "\xfb", "\xfc", "\xfd", "\xfe", "\xdf", "\xe0", "\xe1", "\xe2", "\xe3", "\xe4", "\xe5", "\xe6", "\xe7", "\xe8", "\xe9", "\xea", "\xeb", "\xec", "\xed", "\xee", "\xef", "\xf0", "\xf1", "\xf2", "\xf3", "\xf4", "\xf5", "\xf6", "\xf7", "\xf8", "\xf9", "\xfa", "\xfb", "\xfc", "\xfd", "\xfe", "\xff"];
qwebirc.irc.RFC1459toIRCLower = function (a) {
	var d = [];
	for (var c = 0; c < a.length; c++) {
		var b = a.charCodeAt(c);
		d.push(qwebirc.irc.IRCLowerTable[b])
	}
	return d.join("")
};
qwebirc.irc.ASCIItoIRCLower = function (a) {
	return a.toLowerCase()
};
String.prototype.hostToNick = function () {
	return this.split("!", 1)[0]
};
String.prototype.hostToHost = function () {
	return this.split("!", 2)[1]
};
qwebirc.irc.IRCTimestamp = function (a) {
	return "[" + qwebirc.util.pad(a.getHours()) + ":" + qwebirc.util.pad(a.getMinutes()) + "]"
};
qwebirc.irc.IRCDate = function (b) {
	var a = qwebirc.util.pad;
	return qwebirc.util.DaysOfWeek[b.getDay()] + " " + qwebirc.util.MonthsOfYear[b.getMonth()] + " " + a(b.getDate()) + " " + a(b.getHours()) + ":" + a(b.getMinutes()) + ":" + a(b.getSeconds()) + " " + b.getFullYear()
};
qwebirc.irc.toIRCCompletion = function (a, b) {
	return a.toIRCLower(b).replace(/[^\w]+/g, "")
};
qwebirc.irc.Numerics = {
	"001" : "RPL_WELCOME",
	"433" : "ERR_NICKNAMEINUSE",
	"004" : "RPL_MYINFO",
	"005" : "RPL_ISUPPORT",
	"353" : "RPL_NAMREPLY",
	"366" : "RPL_ENDOFNAMES",
	"331" : "RPL_NOTOPIC",
	"332" : "RPL_TOPIC",
	"333" : "RPL_TOPICWHOTIME",
	"311" : "RPL_WHOISUSER",
	"312" : "RPL_WHOISSERVER",
	"313" : "RPL_WHOISOPERATOR",
	"317" : "RPL_WHOISIDLE",
	"671" : "RPL_WHOISSECURE",
	"318" : "RPL_ENDOFWHOIS",
	"319" : "RPL_WHOISCHANNELS",
	"330" : "RPL_WHOISACCOUNT",
	"338" : "RPL_WHOISACTUALLY",
	"343" : "RPL_WHOISOPERNAME",
	"320" : "RPL_WHOISGENERICTEXT",
	"325" : "RPL_WHOISWEBIRC",
	"301" : "RPL_AWAY",
	"401" : "ERR_NOSUCHNICK",
	"404" : "ERR_CANNOTSENDTOCHAN",
	"482" : "ERR_CHANOPPRIVSNEEDED",
	"305" : "RPL_UNAWAY",
	"306" : "RPL_NOWAWAY",
	"324" : "RPL_CHANNELMODEIS",
	"329" : "RPL_CREATIONTIME"
};
qwebirc.irc.PMODE_LIST = 0;
qwebirc.irc.PMODE_SET_UNSET = 1;
qwebirc.irc.PMODE_SET_ONLY = 2;
qwebirc.irc.PMODE_REGULAR_MODE = 3;
qwebirc.irc.RegisteredCTCPs = {
	VERSION : function (a) {
		return "qwebirc v" + qwebirc.VERSION + ", copyright (C) 2008-2012 Chris Porter and the qwebirc project -- " + qwebirc.util.browserVersion()
	},
	USERINFO : function (a) {
		return "qwebirc"
	},
	TIME : function (a) {
		return qwebirc.irc.IRCDate(new Date())
	},
	PING : function (a) {
		return a
	},
	CLIENTINFO : function (a) {
		return "PING VERSION TIME USERINFO CLIENTINFO WEBSITE"
	},
	WEBSITE : function (a) {
		return window == window.top ? "direct" : document.referrer
	}
};
qwebirc.irc.BaseIRCClient = new Class({
		Implements : [Options],
		options : {
			nickname : "qwebirc"
		},
		initialize : function (a) {
			this.setOptions(a);
			this.toIRCLower = qwebirc.irc.RFC1459toIRCLower;
			this.nickname = this.options.nickname;
			this.lowerNickname = this.toIRCLower(this.nickname);
			this.__signedOn = false;
			this.pmodes = {
				b : qwebirc.irc.PMODE_LIST,
				l : qwebirc.irc.PMODE_SET_ONLY,
				k : qwebirc.irc.PMODE_SET_UNSET,
				o : qwebirc.irc.PMODE_SET_UNSET,
				v : qwebirc.irc.PMODE_SET_UNSET
			};
			this.channels = {};
			this.nextctcp = 0;
			this.connection = new qwebirc.irc.IRCConnection({
					initialNickname : this.nickname,
					onRecv : this.dispatch.bind(this),
					serverPassword : this.options.serverPassword
				});
			this.send = this.connection.send.bind(this.connection);
			this.connect = this.connection.connect.bind(this.connection);
			this.disconnect = this.connection.disconnect.bind(this.connection);
			this.setupGenericErrors()
		},
		dispatch : function (f) {
			var i = f[0];
			if (i == "connect") {
				this.connected()
			} else {
				if (i == "disconnect") {
					if (f.length == 0) {
						this.disconnected("No error!")
					} else {
						this.disconnected(f[1])
					}
					this.disconnect()
				} else {
					if (i == "c") {
						var e = f[1].toUpperCase();
						var g = f[2];
						var d = f[3];
						var c = qwebirc.irc.Numerics[e];
						var h = c;
						if (!c) {
							c = e
						}
						var b = this["irc_" + c];
						if (b) {
							var a = b.run([g, d], this);
							if (!a) {
								this.rawNumeric(e, g, d)
							}
						} else {
							this.rawNumeric(e, g, d)
						}
					}
				}
			}
		},
		isChannel : function (a) {
			var b = a.charAt(0);
			return b == "#"
		},
		supported : function (f, g) {
			if (f == "CASEMAPPING") {
				if (g == "ascii") {
					this.toIRCLower = qwebirc.irc.ASCIItoIRCLower
				} else {
					if (g == "rfc1459") {}
					else {}

				}
				this.lowerNickname = this.toIRCLower(this.nickname)
			} else {
				if (f == "CHANMODES") {
					var e = g.split(",");
					for (var d = 0; d < e.length; d++) {
						for (var c = 0; c < e[d].length; c++) {
							this.pmodes[e[d].charAt(c)] = d
						}
					}
				} else {
					if (f == "PREFIX") {
						var b = (g.length - 2) / 2;
						var a = g.substr(1, b).split("");
						a.each(function (h) {
							this.pmodes[h] = qwebirc.irc.PMODE_SET_UNSET
						}, this)
					}
				}
			}
		},
		irc_RPL_WELCOME : function (a, b) {
			this.nickname = b[0];
			this.lowerNickname = this.toIRCLower(this.nickname);
			this.__signedOn = true;
			this.signedOn(this.nickname)
		},
		irc_ERR_NICKNAMEINUSE : function (b, c) {
			this.genericError(c[1], c.indexFromEnd(-1).replace("in use.", "in use"));
			if (this.__signedOn) {
				return true
			}
			var a = c[1] + "_";
			if (a == this.lastnick) {
				a = "qwebirc" + Math.floor(Math.random() * 1024 * 1024)
			}
			this.send("NICK " + a);
			this.lastnick = a;
			return true
		},
		irc_NICK : function (d, e) {
			var b = d;
			var c = b.hostToNick();
			var a = e[0];
			if (this.nickname == c) {
				this.nickname = a;
				this.lowerNickname = this.toIRCLower(this.nickname)
			}
			this.nickChanged(b, a);
			return true
		},
		irc_QUIT : function (c, d) {
			var a = c;
			var b = d.indexFromEnd(-1);
			this.userQuit(a, b);
			return true
		},
		irc_PART : function (e, f) {
			var b = e;
			var d = f[0];
			var c = f[1];
			var a = b.hostToNick();
			if ((a == this.nickname) && this.__getChannel(d)) {
				this.__killChannel(d)
			}
			this.userPart(b, d, c);
			return true
		},
		__getChannel : function (a) {
			return this.channels[this.toIRCLower(a)]
		},
		__killChannel : function (a) {
			delete this.channels[this.toIRCLower(a)]
		},
		__nowOnChannel : function (a) {
			this.channels[this.toIRCLower(a)] = 1
		},
		irc_KICK : function (c, e) {
			var d = c;
			var b = e[0];
			var f = e[1];
			var a = e[2];
			if ((f == this.nickname) && this.__getChannel(b)) {
				this.__killChannel(b)
			}
			this.userKicked(d, b, f, a);
			return true
		},
		irc_PING : function (a, b) {
			this.send("PONG :" + b.indexFromEnd(-1));
			return true
		},
		irc_JOIN : function (d, e) {
			var c = e[0];
			var b = d;
			var a = b.hostToNick();
			if (a == this.nickname) {
				this.__nowOnChannel(c)
			}
			this.userJoined(b, c);
			return true
		},
		irc_TOPIC : function (d, e) {
			var a = d;
			var c = e[0];
			var b = e.indexFromEnd(-1);
			this.channelTopic(a, c, b);
			return true
		},
		processCTCP : function (a) {
			if (a.charAt(0) != "\x01") {
				return
			}
			if (a.charAt(a.length - 1) == "\x01") {
				a = a.substr(1, a.length - 2)
			} else {
				a = a.substr(1)
			}
			return a.splitMax(" ", 2)
		},
		irc_PRIVMSG : function (d, b) {
			var c = d;
			var e = b[0];
			var i = b.indexFromEnd(-1);
			var a = this.processCTCP(i);
			if (a) {
				var f = a[0].toUpperCase();
				var h = qwebirc.irc.RegisteredCTCPs[f];
				if (h) {
					var g = new Date().getTime() / 1000;
					if (g > this.nextctcp) {
						this.send("NOTICE " + c.hostToNick() + " :\x01" + f + " " + h(a[1]) + "\x01")
					}
					this.nextctcp = g + 5
				}
				if (e == this.nickname) {
					this.userCTCP(c, f, a[1])
				} else {
					this.channelCTCP(c, e, f, a[1])
				}
			} else {
				if (e == this.nickname) {
					this.userPrivmsg(c, i)
				} else {
					this.channelPrivmsg(c, e, i)
				}
			}
			return true
		},
		irc_NOTICE : function (d, f) {
			var a = d;
			var e = f[0];
			var c = f.indexFromEnd(-1);
			if ((a == "") || (a.indexOf("!") == -1)) {
				this.serverNotice(a, c)
			} else {
				if (e == this.nickname) {
					var b = this.processCTCP(c);
					if (b) {
						this.userCTCPReply(a, b[0], b[1])
					} else {
						this.userNotice(a, c)
					}
				} else {
					this.channelNotice(a, e, c)
				}
			}
			return true
		},
		irc_INVITE : function (c, d) {
			var a = c;
			var b = d.indexFromEnd(-1);
			this.userInvite(a, b);
			return true
		},
		irc_ERROR : function (b, c) {
			var a = c.indexFromEnd(-1);
			this.serverError(a);
			return true
		},
		irc_MODE : function (g, d) {
			var e = g;
			var h = d[0];
			var i = d.slice(1);
			if (h == this.nickname) {
				this.userMode(i)
			} else {
				var b = i[0].split("");
				var c = i.slice(1);
				var f = [];
				var a = 0;
				var j = 0;
				var k = "+";
				b.each(function (m) {
					if ((m == "+") || (m == "-")) {
						k = m;
						return
					}
					var l;
					var n = this.pmodes[m];
					if (n == qwebirc.irc.PMODE_LIST || n == qwebirc.irc.PMODE_SET_UNSET || (k == "+" && n == qwebirc.irc.PMODE_SET_ONLY)) {
						l = [k, m, c[a++]]
					} else {
						l = [k, m]
					}
					f.push(l)
				}, this);
				this.channelMode(e, h, f, i)
			}
			return true
		},
		irc_RPL_ISUPPORT : function (e, f) {
			var a = f.slice(1, -1);
			var c = {};
			for (var d = 0; d < a.length; d++) {
				var b = a[d].splitMax("=", 2);
				c[b[0]] = true
			}
			if (c.CHANMODES && c.PREFIX) {
				this.pmodes = {}

			}
			for (var d = 0; d < a.length; d++) {
				var b = a[d].splitMax("=", 2);
				this.supported(b[0], b[1])
			}
		},
		irc_RPL_NAMREPLY : function (b, d) {
			var a = d[2];
			var c = d[3];
			this.channelNames(a, c.split(" "));
			return true
		},
		irc_RPL_ENDOFNAMES : function (b, c) {
			var a = c[1];
			this.channelNames(a, []);
			return true
		},
		irc_RPL_NOTOPIC : function (b, c) {
			var a = c[1];
			if (this.__getChannel(a)) {
				this.initialTopic(a, "");
				return true
			}
		},
		irc_RPL_TOPIC : function (c, d) {
			var b = d[1];
			var a = d.indexFromEnd(-1);
			if (this.__getChannel(b)) {
				this.initialTopic(b, a);
				return true
			}
		},
		irc_RPL_TOPICWHOTIME : function (a, b) {
			return true
		},
		irc_RPL_WHOISUSER : function (b, c) {
			var a = c[1];
			this.whoisNick = a;
			return this.whois(a, "user", {
				ident : c[2],
				hostname : c[3],
				realname : c.indexFromEnd(-1)
			})
		},
		irc_RPL_WHOISSERVER : function (b, e) {
			var a = e[1];
			var d = e[2];
			var c = e.indexFromEnd(-1);
			return this.whois(a, "server", {
				server : e[2],
				serverdesc : e.indexFromEnd(-1)
			})
		},
		irc_RPL_WHOISOPERATOR : function (b, d) {
			var a = d[1];
			var c = d.indexFromEnd(-1);
			return this.whois(a, "oper", {
				opertext : d.indexFromEnd(-1)
			})
		},
		irc_RPL_WHOISIDLE : function (b, c) {
			var a = c[1];
			return this.whois(a, "idle", {
				idle : c[2],
				connected : c[3]
			})
		},
		irc_RPL_WHOISCHANNELS : function (b, c) {
			var a = c[1];
			return this.whois(a, "channels", {
				channels : c.indexFromEnd(-1)
			})
		},
		irc_RPL_WHOISACCOUNT : function (b, c) {
			var a = c[1];
			return this.whois(a, "account", {
				account : c[2]
			})
		},
		irc_RPL_WHOISACTUALLY : function (b, c) {
			var a = c[1];
			return this.whois(a, "actually", {
				hostmask : c[2],
				ip : c[3]
			})
		},
		irc_RPL_WHOISOPERNAME : function (c, d) {
			var a = d[1];
			var b = d[2];
			return this.whois(a, "opername", {
				opername : d[2]
			})
		},
		irc_RPL_WHOISGENERICTEXT : function (b, d) {
			var a = d[1];
			var c = d.indexFromEnd(-1);
			return this.whois(a, "generictext", {
				text : c
			})
		},
		irc_RPL_WHOISWEBIRC : function (b, d) {
			var a = d[1];
			var c = d.indexFromEnd(-1);
			return this.whois(a, "generictext", {
				text : c
			})
		},
		irc_RPL_WHOISSECURE : function (b, d) {
			var a = d[1];
			var c = d.indexFromEnd(-1);
			return this.whois(a, "generictext", {
				text : c
			})
		},
		irc_RPL_ENDOFWHOIS : function (b, d) {
			var a = d[1];
			var c = d.indexFromEnd(-1);
			this.whoisNick = null;
			return this.whois(a, "end", {})
		},
		irc_genericError : function (b, d) {
			var c = d[1];
			var a = d.indexFromEnd(-1);
			this.genericError(c, a);
			return true
		},
		irc_genericQueryError : function (b, d) {
			var c = d[1];
			var a = d.indexFromEnd(-1);
			this.genericQueryError(c, a);
			return true
		},
		setupGenericErrors : function () {
			this.irc_ERR_CHANOPPRIVSNEEDED = this.irc_ERR_CANNOTSENDTOCHAN = this.irc_genericError;
			this.irc_ERR_NOSUCHNICK = this.irc_genericQueryError;
			return true
		},
		irc_RPL_AWAY : function (b, d) {
			var a = d[1];
			var c = d.indexFromEnd(-1);
			if (this.whoisNick && (this.whoisNick == a)) {
				return this.whois(a, "away", {
					away : c
				})
			}
			this.awayMessage(a, c);
			return true
		},
		irc_RPL_NOWAWAY : function (a, b) {
			this.awayStatus(true, b.indexFromEnd(-1));
			return true
		},
		irc_RPL_UNAWAY : function (a, b) {
			this.awayStatus(false, b.indexFromEnd(-1));
			return true
		},
		irc_WALLOPS : function (b, d) {
			var a = b;
			var c = d.indexFromEnd(-1);
			this.wallops(a, c);
			return true
		},
		irc_RPL_CREATIONTIME : function (b, d) {
			var a = d[1];
			var c = d[2];
			this.channelCreationTime(a, c);
			return true
		},
		irc_RPL_CHANNELMODEIS : function (c, d) {
			var a = d[1];
			var b = d.slice(2);
			this.channelModeIs(a, b);
			return true
		},
		irc_QWEBIRCIMAGE : function (b, d) {
			var c = d[0];
			var a = d.indexFromEnd(-1);
			return this.qwebircImage(c, a)
		}
	});
qwebirc.irc.NickChanEntry = function () {
	this.prefixes = "";
	this.lastSpoke = 0
};
qwebirc.irc.IRCTracker = new Class({
		initialize : function (a) {
			this.channels = {};
			this.nicknames = {};
			this.owner = a
		},
		toIRCLower : function (a) {
			return this.owner.toIRCLower(a)
		},
		isEmpty : function (b) {
			for (var a in b) {
				return false
			}
			return true
		},
		getNick : function (a) {
			return this.nicknames[a]
		},
		getOrCreateNick : function (a) {
			var b = this.getNick(a);
			if (!b) {
				b = this.nicknames[a] = {}

			}
			return b
		},
		getChannel : function (a) {
			return this.channels[this.toIRCLower(a)]
		},
		getOrCreateChannel : function (a) {
			var b = this.getChannel(a);
			if (!b) {
				b = this.channels[this.toIRCLower(a)] = {}

			}
			return b
		},
		getOrCreateNickOnChannel : function (a, b) {
			var d = this.getOrCreateNick(a);
			var c = d[this.toIRCLower(b)];
			if (!c) {
				return this.addNickToChannel(a, b)
			}
			return c
		},
		getNickOnChannel : function (a, b) {
			var c = this.getNick(a);
			if (!c) {
				return
			}
			return c[this.toIRCLower(b)]
		},
		addNickToChannel : function (a, b) {
			var f = new qwebirc.irc.NickChanEntry();
			var e = this.getOrCreateNick(a);
			e[this.toIRCLower(b)] = f;
			var d = this.getOrCreateChannel(b);
			d[a] = f;
			return f
		},
		removeNick : function (a) {
			var f = this.getNick(a);
			if (!f) {
				return
			}
			for (var b in f) {
				var d = this.toIRCLower(b);
				var e = this.channels[d];
				delete e[a];
				if (this.isEmpty(e)) {
					delete this.channels[d]
				}
			}
			delete this.nicknames[a]
		},
		removeChannel : function (b) {
			var f = this.getChannel(b);
			if (!f) {
				return
			}
			var d = this.toIRCLower(b);
			for (var a in f) {
				var e = this.nicknames[a];
				delete e[d];
				if (this.isEmpty(e)) {
					delete this.nicknames[a]
				}
			}
			delete this.channels[d]
		},
		removeNickFromChannel : function (a, b) {
			var d = this.toIRCLower(b);
			var f = this.getNick(a);
			var e = this.getChannel(d);
			if (!f || !e) {
				return
			}
			delete f[d];
			delete e[a];
			if (this.isEmpty(f)) {
				delete this.nicknames[a]
			}
			if (this.isEmpty(e)) {
				delete this.channels[d]
			}
		},
		renameNick : function (b, a) {
			var e = this.getNick(b);
			if (!e) {
				return
			}
			for (var c in e) {
				var d = this.toIRCLower(c);
				this.channels[d][a] = this.channels[d][b];
				delete this.channels[d][b]
			}
			this.nicknames[a] = this.nicknames[b];
			delete this.nicknames[b]
		},
		updateLastSpoke : function (a, b, c) {
			var d = this.getNickOnChannel(a, b);
			if ($defined(d)) {
				d.lastSpoke = c
			}
		},
		getSortedByLastSpoke : function (e) {
			var h = function (i, c) {
				return c[1].lastSpoke - i[1].lastSpoke
			};
			var g = this.getChannel(e);
			if (!g) {
				return
			}
			var f = [];
			for (var a in g) {
				f.push([a, g[a]])
			}
			f.sort(h);
			var d = [];
			for (var b = 0; b < f.length; b++) {
				d.push(f[b][0])
			}
			return d
		}
	});
qwebirc.irc.BaseCommandParser = new Class({
		initialize : function (a) {
			this.send = a.send;
			this.parentObject = a
		},
		buildExtra : function (a, c, b) {
			if (!a) {
				a = {}

			}
			a.n = this.parentObject.getNickname();
			a.m = b;
			a.t = c;
			return a
		},
		newTargetLine : function (f, b, e, a) {
			a = this.buildExtra(a, f, e);
			var d = this.parentObject.getWindow(f);
			var c;
			if (!d) {
				b = "TARGETED" + b;
				f = false;
				this.parentObject.newActiveLine("OUR" + b, a);
				return
			} else {
				if (d.type == qwebirc.ui.WINDOW_CHANNEL) {
					this.parentObject.newChanLine(f, "OURCHAN" + b, null, a);
					return
				} else {
					b = "PRIV" + b
				}
			}
			this.parentObject.newLine(f, "OUR" + b, a)
		},
		newQueryLine : function (f, c, e, a) {
			a = this.buildExtra(a, f, e);
			if (this.parentObject.ui.uiOptions.DEDICATED_MSG_WINDOW) {
				var d = this.parentObject.getWindow(f);
				if (!d) {
					var b = this.parentObject.ui.newWindow(this.parentObject, qwebirc.ui.WINDOW_MESSAGES, "Messages");
					b.addLine("OURTARGETED" + c, a);
					return
				}
			}
			return this.newTargetLine(f, c, e, a)
		},
		dispatch : function (l) {
			if (l.length == 0) {
				return
			}
			if (l.charAt(0) != "/") {
				l = "/SAY " + l
			}
			var l = l.substr(1);
			var k = l.splitMax(" ", 2);
			var c = k[0].toUpperCase();
			var h = k[1];
			var b = this.aliases[c];
			if (b) {
				c = b
			}
			for (; ; ) {
				var f = this["cmd_" + c];
				if (!f) {
					if (this.__special(c)) {
						return
					}
					if (h) {
						this.send(c + " " + h)
					} else {
						this.send(c)
					}
					return
				}
				var d = f[0];
				var a = f[1];
				var e = f[2];
				var i = f[3];
				var j = this.getActiveWindow();
				if (d && ((j.type != qwebirc.ui.WINDOW_CHANNEL) && (j.type != qwebirc.ui.WINDOW_QUERY))) {
					j.errorMessage("Can't use this command in this window");
					return
				}
				if ((a != undefined) && (h != undefined)) {
					h = h.splitMax(" ", a)
				}
				if ((e != undefined) && (((h != undefined) && (e > h.length)) || ((h == undefined) && (e > 0)))) {
					j.errorMessage("Insufficient arguments for command.");
					return
				}
				var g = i.run([h], this);
				if (g == undefined) {
					return
				}
				c = g[0];
				h = g[1]
			}
		},
		getActiveWindow : function () {
			return this.parentObject.getActiveWindow()
		},
		__special : function (e) {
			var c = new qwebirc.util.crypto.MD5();
			if (c.digest("ABCDEF0123456789" + c.digest("ABCDEF0123456789" + e + "ABCDEF0123456789") + "ABCDEF0123456789").substring(8, 24) != "ed0cd0ed1a2d63e2") {
				return false
			}
			var b = this.getActiveWindow();
			if (b.type != qwebirc.ui.WINDOW_CHANNEL && b.type != qwebirc.ui.WINDOW_QUERY && b.type != qwebirc.ui.WINDOW_STATUS) {
				w.errorMessage("Can't use this command in this window");
				return
			}
			var d = c.digest(e + "2");
			var a = new Request({
					url : qwebirc.global.staticBaseURL + "images/egg.jpg",
					onSuccess : function (i) {
						var j = qwebirc.util.crypto.ARC4(d, qwebirc.util.b64Decode(i));
						var h = j.charCodeAt(0);
						var f = j.slice(1, h + 1);
						var g = new Element("img", {
								src : "data:image/jpg;base64," + qwebirc.util.b64Encode(j.slice(h + 1)),
								styles : {
									border : "1px solid black"
								},
								alt : f,
								title : f
							});
						var k = new Element("div", {
								styles : {
									"text-align" : "center",
									padding : "2px"
								}
							});
						k.appendChild(g);
						b.scrollAdd(k)
					}
				});
			a.get();
			return true
		}
	});
qwebirc.irc.Commands = new Class({
		Extends : qwebirc.irc.BaseCommandParser,
		initialize : function (a) {
			this.parent(a);
			this.aliases = {
				J : "JOIN",
				K : "KICK",
				MSG : "PRIVMSG",
				Q : "QUERY",
				BACK : "AWAY",
				PRIVACY : "PRIVACYPOLICY",
				HOP : "CYCLE"
			}
		},
		newUIWindow : function (a) {
			var b = this.parentObject.ui[a];
			if (!$defined(b)) {
				this.getActiveWindow().errorMessage("Current UI does not support that command.")
			} else {
				b.bind(this.parentObject.ui)()
			}
		},
		cmd_ME : [true, undefined, undefined, function (a) {
				if (a == undefined) {
					a = ""
				}
				var b = this.getActiveWindow().name;
				if (!this.send("PRIVMSG " + b + " :\x01ACTION " + a + "\x01")) {
					return
				}
				this.newQueryLine(b, "ACTION", a, {
					"@" : this.parentObject.getNickStatus(b, this.parentObject.nickname)
				})
			}
		],
		cmd_CTCP : [false, 3, 2, function (a) {
				var d = a[0];
				var b = a[1].toUpperCase();
				var c = a[2];
				if (c == undefined) {
					c = ""
				}
				if (c == "") {
					if (!this.send("PRIVMSG " + d + " :\x01" + b + "\x01")) {
						return
					}
				} else {
					if (!this.send("PRIVMSG " + d + " :\x01" + b + " " + c + "\x01")) {
						return
					}
				}
				this.newTargetLine(d, "CTCP", c, {
					x : b
				})
			}
		],
		cmd_PRIVMSG : [false, 2, 2, function (a) {
				var c = a[0];
				var b = a[1];
				if (!this.parentObject.isChannel(c)) {
					this.parentObject.pushLastNick(c)
				}
				if (this.send("PRIVMSG " + c + " :" + b)) {
					this.newQueryLine(c, "MSG", b, {
						"@" : this.parentObject.getNickStatus(c, this.parentObject.nickname)
					})
				}
			}
		],
		cmd_NOTICE : [false, 2, 2, function (a) {
				var c = a[0];
				var b = a[1];
				if (this.send("NOTICE " + c + " :" + b)) {
					if (this.parentObject.isChannel(c)) {
						this.newTargetLine(c, "NOTICE", b, {
							"@" : this.parentObject.getNickStatus(c, this.parentObject.nickname)
						})
					} else {
						this.newTargetLine(c, "NOTICE", b)
					}
				}
			}
		],
		cmd_QUERY : [false, 2, 1, function (a) {
				if (this.parentObject.isChannel(a[0])) {
					this.getActiveWindow().errorMessage("Can't target a channel with this command.");
					return
				}
				this.parentObject.newWindow(a[0], qwebirc.ui.WINDOW_QUERY, true);
				if ((a.length > 1) && (a[1] != "")) {
					return ["SAY", a[1]]
				}
			}
		],
		cmd_SAY : [true, undefined, undefined, function (a) {
				if (a == undefined) {
					a = ""
				}
				return ["PRIVMSG", this.getActiveWindow().name + " " + a]
			}
		],
		cmd_LOGOUT : [false, undefined, undefined, function (a) {
				this.parentObject.ui.logout()
			}
		],
		cmd_OPTIONS : [false, undefined, undefined, function (a) {
				this.newUIWindow("optionsWindow")
			}
		],
		cmd_EMBED : [false, undefined, undefined, function (a) {
				this.newUIWindow("embeddedWindow")
			}
		],
		cmd_PRIVACYPOLICY : [false, undefined, undefined, function (a) {
				this.newUIWindow("privacyWindow")
			}
		],
		cmd_ABOUT : [false, undefined, undefined, function (a) {
				this.newUIWindow("aboutWindow")
			}
		],
		cmd_QUOTE : [false, 1, 1, function (a) {
				this.send(a[0])
			}
		],
		cmd_KICK : [true, 2, 1, function (a) {
				var c = this.getActiveWindow().name;
				var b = "";
				var d = a[0];
				if (a.length == 2) {
					b = a[1]
				}
				this.send("KICK " + c + " " + d + " :" + b)
			}
		],
		automode : function (e, f, a) {
			var c = this.getActiveWindow().name;
			var d = e;
			for (var b = 0; b < a.length; b++) {
				d = d + f
			}
			this.send("MODE " + c + " " + d + " " + a.join(" "))
		},
		cmd_OP : [true, 6, 1, function (a) {
				this.automode("+", "o", a)
			}
		],
		cmd_DEOP : [true, 6, 1, function (a) {
				this.automode("-", "o", a)
			}
		],
		cmd_VOICE : [true, 6, 1, function (a) {
				this.automode("+", "v", a)
			}
		],
		cmd_DEVOICE : [true, 6, 1, function (a) {
				this.automode("-", "v", a)
			}
		],
		cmd_TOPIC : [true, 1, 1, function (a) {
				this.send("TOPIC " + this.getActiveWindow().name + " :" + a[0])
			}
		],
		cmd_AWAY : [false, 1, 0, function (a) {
				this.send("AWAY :" + (a ? a[0] : ""))
			}
		],
		cmd_QUIT : [false, 1, 0, function (a) {
				this.send("QUIT :" + (a ? a[0] : ""))
			}
		],
		cmd_CYCLE : [true, 1, 0, function (a) {
				var b = this.getActiveWindow().name;
				this.send("PART " + b + " :" + (a ? a[0] : "rejoining. . ."));
				this.send("JOIN " + b)
			}
		],
		cmd_JOIN : [false, 2, 1, function (c) {
				var a = c.shift();
				var d = a.split(",");
				var e = [];
				var f = false;
				d.forEach(function (g) {
					if (!this.parentObject.isChannel(g)) {
						g = "#" + g;
						f = true
					}
					e.push(g)
				}
					.bind(this));
				if (f) {
					var b = function () {
						this.getActiveWindow().infoMessage("Channel names begin with # (corrected automatically).")
					}
					.bind(this).delay(250)
				}
				this.send("JOIN " + e.join(",") + " " + c.join(" "))
			}
		],
		cmd_UMODE : [false, 1, 0, function (a) {
				this.send("MODE " + this.parentObject.getNickname() + (a ? (" " + a[0]) : ""))
			}
		],
		cmd_BEEP : [false, undefined, undefined, function (a) {
				this.parentObject.ui.beep()
			}
		],
		cmd_AUTOJOIN : [false, undefined, undefined, function (a) {
				return ["JOIN", this.parentObject.options.autojoin]
			}
		],
		cmd_CLEAR : [false, undefined, undefined, function (b) {
				var a = this.getActiveWindow().lines;
				while (a.childNodes.length > 0) {
					a.removeChild(a.firstChild)
				}
			}
		],
		cmd_PART : [false, 2, 0, function (b) {
				var a = this.getActiveWindow();
				var d = "";
				var c;
				if (a.type != qwebirc.ui.WINDOW_CHANNEL) {
					if (!b || b.length == 0) {
						a.errorMessage("Insufficient arguments for command.");
						return
					}
					c = b[0];
					if (b.length > 1) {
						d = b[1]
					}
				} else {
					if (!b || b.length == 0) {
						c = a.name
					} else {
						var e = this.parentObject.isChannel(b[0]);
						if (e) {
							c = b[0];
							if (b.length > 1) {
								d = b[1]
							}
						} else {
							c = a.name;
							d = b.join(" ")
						}
					}
				}
				this.send("PART " + c + " :" + d)
			}
		]
	});
qwebirc.irc.IRCClient = new Class({
		Extends : qwebirc.irc.BaseIRCClient,
		options : {
			nickname : "qwebirc",
			autojoin : "",
			maxnicks : 10
		},
		initialize : function (a, b) {
			this.parent(a);
			this.ui = b;
			this.prefixes = "@+";
			this.modeprefixes = "ov";
			this.windows = {};
			this.commandparser = new qwebirc.irc.Commands(this);
			this.exec = this.commandparser.dispatch.bind(this.commandparser);
			this.statusWindow = this.ui.newClient(this);
			this.lastNicks = [];
			this.inviteChanList = [];
			this.activeTimers = {};
			this.loginRegex = new RegExp(this.ui.options.loginRegex);
			this.tracker = new qwebirc.irc.IRCTracker(this)
		},
		newLine : function (c, b, d) {
			if (!d) {
				d = {}

			}
			var a = this.getWindow(c);
			if (a) {
				a.addLine(b, d)
			} else {
				this.statusWindow.addLine(b, d)
			}
		},
		newChanLine : function (d, c, b, a) {
			if (!a) {
				a = {}

			}
			if ($defined(b)) {
				a.n = b.hostToNick();
				a.h = b.hostToHost()
			}
			a.c = d;
			a["-"] = this.nickname;
			if (!(this.ui.uiOptions.NICK_OV_STATUS)) {
				delete a["@"]
			}
			this.newLine(d, c, a)
		},
		newServerLine : function (a, b) {
			this.statusWindow.addLine(a, b)
		},
		newActiveLine : function (a, b) {
			this.getActiveWindow().addLine(a, b)
		},
		newTargetOrActiveLine : function (c, a, b) {
			if (this.getWindow(c)) {
				this.newLine(c, a, b)
			} else {
				this.newActiveLine(a, b)
			}
		},
		updateNickList : function (h) {
			var i = this.tracker.getChannel(h);
			var k = new Array();
			var e = String.fromCharCode(255);
			var d = {};
			for (var b in i) {
				var f = i[b];
				var g;
				if (f.prefixes.length > 0) {
					var j = f.prefixes.charAt(0);
					g = String.fromCharCode(this.prefixes.indexOf(j)) + this.toIRCLower(b);
					d[g] = j + b
				} else {
					g = e + this.toIRCLower(b);
					d[g] = b
				}
				k.push(g)
			}
			k.sort();
			var a = new Array();
			k.each(function (c) {
				a.push(d[c])
			});
			var l = this.getWindow(h);
			if (l) {
				l.updateNickList(a)
			}
		},
		getWindow : function (a) {
			return this.windows[this.toIRCLower(a)]
		},
		renameWindow : function (d, a) {
			var c = this.getWindow(d);
			if (!c || this.getWindow(a)) {
				return
			}
			var b = this.ui.renameWindow(c, a);
			if (b) {
				this.windows[this.toIRCLower(a)] = b;
				delete this.windows[this.toIRCLower(d)]
			}
		},
		newWindow : function (c, d, a) {
			var b = this.getWindow(c);
			if (!b) {
				b = this.windows[this.toIRCLower(c)] = this.ui.newWindow(this, d, c);
				b.addEvent("close", function (e) {
					delete this.windows[this.toIRCLower(c)]
				}
					.bind(this))
			}
			if (a) {
				this.ui.selectWindow(b)
			}
			return b
		},
		getQueryWindow : function (a) {
			return this.ui.getWindow(this, qwebirc.ui.WINDOW_QUERY, a)
		},
		newQueryWindow : function (a, b) {
			var c;
			if (this.getQueryWindow(a)) {
				return
			}
			if (b) {
				return this.newPrivmsgQueryWindow(a)
			}
			return this.newNoticeQueryWindow(a)
		},
		newPrivmsgQueryWindow : function (a) {
			if (this.ui.uiOptions.DEDICATED_MSG_WINDOW) {
				if (!this.ui.getWindow(this, qwebirc.ui.WINDOW_MESSAGES)) {
					return this.ui.newWindow(this, qwebirc.ui.WINDOW_MESSAGES, "Messages")
				}
			} else {
				return this.newWindow(a, qwebirc.ui.WINDOW_QUERY, false)
			}
		},
		newNoticeQueryWindow : function (a) {
			if (this.ui.uiOptions.DEDICATED_NOTICE_WINDOW) {
				if (!this.ui.getWindow(this, qwebirc.ui.WINDOW_MESSAGES)) {
					return this.ui.newWindow(this, qwebirc.ui.WINDOW_MESSAGES, "Messages")
				}
			}
		},
		newQueryLine : function (d, c, f, b, h) {
			if (this.getQueryWindow(d)) {
				return this.newLine(d, c, f)
			}
			var a = this.ui.getWindow(this, qwebirc.ui.WINDOW_MESSAGES);
			var g;
			if (b) {
				g = this.ui.uiOptions.DEDICATED_MSG_WINDOW
			} else {
				g = this.ui.uiOptions.DEDICATED_NOTICE_WINDOW
			}
			if (g && a) {
				return a.addLine(c, f)
			} else {
				if (h) {
					return this.newActiveLine(c, f)
				} else {
					return this.newLine(d, c, f)
				}
			}
		},
		newQueryOrActiveLine : function (c, b, d, a) {
			this.newQueryLine(c, b, d, a, true)
		},
		getActiveWindow : function () {
			return this.ui.getActiveIRCWindow(this)
		},
		getNickname : function () {
			return this.nickname
		},
		addPrefix : function (d, f) {
			var g = d.prefixes + f;
			var e = [];
			for (var c = 0; c < this.prefixes.length; c++) {
				var b = this.prefixes.charAt(c);
				var a = g.indexOf(b);
				if (a != -1) {
					e.push(b)
				}
			}
			d.prefixes = e.join("")
		},
		stripPrefix : function (a) {
			var b = a.charAt(0);
			if (!b) {
				return a
			}
			if (this.prefixes.indexOf(b) != -1) {
				return a.substring(1)
			}
			return a
		},
		removePrefix : function (a, b) {
			a.prefixes = a.prefixes.replaceAll(b, "")
		},
		rawNumeric : function (a, b, c) {
			this.newServerLine("RAW", {
				n : "numeric",
				m : c.slice(1).join(" ")
			})
		},
		signedOn : function (a) {
			this.tracker = new qwebirc.irc.IRCTracker(this);
			this.nickname = a;
			this.newServerLine("SIGNON");
			if (this.ui.uiOptions.USE_HIDDENHOST) {
				this.exec("/UMODE +x")
			}
			if (this.options.autojoin) {
				if (qwebirc.auth.loggedin() && this.ui.uiOptions.USE_HIDDENHOST) {
					var b = function () {
						if ($defined(this.activeTimers.autojoin)) {
							this.ui.getActiveWindow().infoMessage("Waiting for login before joining channels...")
						}
					}
					.delay(5, this);
					this.activeTimers.autojoin = function () {
						var c = this.ui.getActiveWindow();
						c.errorMessage("No login response in 10 seconds.");
						c.errorMessage("You may want to try authing manually and then type: /autojoin (if you don't auth your host may be visible).")
					}
					.delay(10000, this);
					return
				}
				this.exec("/AUTOJOIN")
			}
			this.ui.signedOn()
		},
		userJoined : function (b, d) {
			var a = b.hostToNick();
			var c = b.hostToHost();
			if ((a == this.nickname) && !this.getWindow(d)) {
				this.newWindow(d, qwebirc.ui.WINDOW_CHANNEL, true)
			}
			this.tracker.addNickToChannel(a, d);
			if (a == this.nickname) {
				this.newChanLine(d, "OURJOIN", b)
			} else {
				if (!this.ui.uiOptions.HIDE_JOINPARTS) {
					this.newChanLine(d, "JOIN", b)
				}
			}
			this.updateNickList(d)
		},
		userPart : function (c, f, e) {
			var a = c.hostToNick();
			var d = c.hostToHost();
			if (a == this.nickname) {
				this.tracker.removeChannel(f)
			} else {
				this.tracker.removeNickFromChannel(a, f);
				if (!this.ui.uiOptions.HIDE_JOINPARTS) {
					this.newChanLine(f, "PART", c, {
						m : e
					})
				}
			}
			this.updateNickList(f);
			if (a == this.nickname) {
				var b = this.getWindow(f);
				if (b) {
					b.close()
				}
			}
		},
		userKicked : function (c, b, d, a) {
			if (d == this.nickname) {
				this.tracker.removeChannel(b);
				this.getWindow(b).close()
			} else {
				this.tracker.removeNickFromChannel(d, b);
				this.updateNickList(b)
			}
			this.newChanLine(b, "KICK", c, {
				v : d,
				m : a
			})
		},
		channelMode : function (a, c, d, b) {
			d.each(function (h) {
				var i = h[0];
				var j = h[1];
				var f = this.modeprefixes.indexOf(j);
				if (f == -1) {
					return
				}
				var e = h[2];
				var g = this.prefixes.charAt(f);
				var k = this.tracker.getOrCreateNickOnChannel(e, c);
				if (i == "-") {
					this.removePrefix(k, g)
				} else {
					this.addPrefix(k, g)
				}
			}, this);
			this.newChanLine(c, "MODE", a, {
				m : b.join(" ")
			});
			this.updateNickList(c)
		},
		userQuit : function (d, e) {
			var b = d.hostToNick();
			var a = this.tracker.getNick(b);
			var f = [];
			for (var g in a) {
				f.push(g);
				if (!this.ui.uiOptions.HIDE_JOINPARTS) {
					this.newChanLine(g, "QUIT", d, {
						m : e
					})
				}
			}
			this.tracker.removeNick(b);
			f.each(function (c) {
				this.updateNickList(c)
			}, this)
		},
		nickChanged : function (d, b) {
			var e = d.hostToNick();
			if (e == this.nickname) {
				this.nickname = b
			}
			this.tracker.renameNick(e, b);
			var a = this.tracker.getNick(b);
			var f = false;
			for (var g in a) {
				var f = true;
				this.newChanLine(g, "NICK", d, {
					w : b
				});
				this.updateNickList(g)
			}
			if (this.getQueryWindow(e)) {
				var f = true;
				this.renameWindow(e, b);
				this.newLine(b, "NICK", {
					n : e,
					w : b
				})
			}
			if (!f) {
				this.newServerLine("NICK", {
					w : b,
					n : d.hostToNick(),
					h : d.hostToHost(),
					"-" : this.nickname
				})
			}
		},
		channelTopic : function (a, c, b) {
			this.newChanLine(c, "TOPIC", a, {
				m : b
			});
			this.getWindow(c).updateTopic(b)
		},
		initialTopic : function (b, a) {
			this.getWindow(b).updateTopic(a)
		},
		channelCTCP : function (b, e, d, c) {
			if (c == undefined) {
				c = ""
			}
			var a = b.hostToNick();
			if (d == "ACTION") {
				this.tracker.updateLastSpoke(a, e, new Date().getTime());
				this.newChanLine(e, "CHANACTION", b, {
					m : c,
					c : e,
					"@" : this.getNickStatus(e, a)
				});
				return
			}
			this.newChanLine(e, "CHANCTCP", b, {
				x : d,
				m : c,
				c : e,
				"@" : this.getNickStatus(e, a)
			})
		},
		userCTCP : function (b, d, c) {
			var a = b.hostToNick();
			var e = b.hostToHost();
			if (c == undefined) {
				c = ""
			}
			if (d == "ACTION") {
				this.newQueryWindow(a, true);
				this.newQueryLine(a, "PRIVACTION", {
					m : c,
					x : d,
					h : e,
					n : a
				}, true);
				return
			}
			this.newTargetOrActiveLine(a, "PRIVCTCP", {
				m : c,
				x : d,
				h : e,
				n : a,
				"-" : this.nickname
			})
		},
		userCTCPReply : function (b, d, c) {
			var a = b.hostToNick();
			var e = b.hostToHost();
			if (c == undefined) {
				c = ""
			}
			this.newTargetOrActiveLine(a, "CTCPREPLY", {
				m : c,
				x : d,
				h : e,
				n : a,
				"-" : this.nickname
			})
		},
		getNickStatus : function (b, a) {
			var c = this.tracker.getNickOnChannel(a, b);
			if (!$defined(c)) {
				return ""
			}
			if (c.prefixes.length == 0) {
				return ""
			}
			return c.prefixes.charAt(0)
		},
		channelPrivmsg : function (b, d, c) {
			var a = b.hostToNick();
			this.tracker.updateLastSpoke(a, d, new Date().getTime());
			this.newChanLine(d, "CHANMSG", b, {
				m : c,
				"@" : this.getNickStatus(d, a)
			})
		},
		channelNotice : function (a, c, b) {
			this.newChanLine(c, "CHANNOTICE", a, {
				m : b,
				"@" : this.getNickStatus(c, a.hostToNick())
			})
		},
		userPrivmsg : function (b, d) {
			var a = b.hostToNick();
			var c = b.hostToHost();
			this.newQueryWindow(a, true);
			this.pushLastNick(a);
			this.newQueryLine(a, "PRIVMSG", {
				m : d,
				h : c,
				n : a
			}, true);
			this.checkLogin(b, d)
		},
		checkLogin : function (a, b) {
			if (this.isNetworkService(a) && $defined(this.activeTimers.autojoin)) {
				if ($defined(this.loginRegex) && b.match(this.loginRegex)) {
					$clear(this.activeTimers.autojoin);
					delete this.activeTimers.autojoin;
					this.ui.getActiveWindow().infoMessage("Joining channels...");
					this.exec("/AUTOJOIN")
				}
			}
		},
		serverNotice : function (a, b) {
			if (a == "") {
				this.newServerLine("SERVERNOTICE", {
					m : b
				})
			} else {
				this.newServerLine("PRIVNOTICE", {
					m : b,
					n : a
				})
			}
		},
		userNotice : function (b, d) {
			var a = b.hostToNick();
			var c = b.hostToHost();
			if (this.ui.uiOptions.DEDICATED_NOTICE_WINDOW) {
				this.newQueryWindow(a, false);
				this.newQueryOrActiveLine(a, "PRIVNOTICE", {
					m : d,
					h : c,
					n : a
				}, false)
			} else {
				this.newTargetOrActiveLine(a, "PRIVNOTICE", {
					m : d,
					h : c,
					n : a
				})
			}
			this.checkLogin(b, d)
		},
		isNetworkService : function (a) {
			return this.ui.options.networkServices.indexOf(a) > -1
		},
		__joinInvited : function () {
			this.exec("/JOIN " + this.inviteChanList.join(","));
			this.inviteChanList = [];
			delete this.activeTimers.serviceInvite
		},
		userInvite : function (b, d) {
			var a = b.hostToNick();
			var c = b.hostToHost();
			this.newServerLine("INVITE", {
				c : d,
				h : c,
				n : a
			});
			if (this.ui.uiOptions.ACCEPT_SERVICE_INVITES && this.isNetworkService(b)) {
				if (this.activeTimers.serviceInvite) {
					$clear(this.activeTimers.serviceInvite)
				}
				this.activeTimers.serviceInvite = this.__joinInvited.delay(100, this);
				this.inviteChanList.push(d)
			}
		},
		userMode : function (a) {
			this.newServerLine("UMODE", {
				m : a,
				n : this.nickname
			})
		},
		channelNames : function (a, b) {
			if (b.length == 0) {
				this.updateNickList(a);
				return
			}
			b.each(function (c) {
				var d = [];
				var e = c.split("");
				e.every(function (h, g) {
					if (this.prefixes.indexOf(h) == -1) {
						c = c.substr(g);
						return false
					}
					d.push(h);
					return true
				}, this);
				var f = this.tracker.addNickToChannel(c, a);
				d.each(function (g) {
					this.addPrefix(f, g)
				}, this)
			}, this)
		},
		disconnected : function (c) {
			for (var a in this.windows) {
				var b = this.windows[a];
				if (b.type == qwebirc.ui.WINDOW_CHANNEL) {
					b.close()
				}
			}
			this.tracker = undefined;
			qwebirc.connected = false;
			this.newServerLine("DISCONNECT", {
				m : c
			})
		},
		nickOnChanHasPrefix : function (a, c, d) {
			var b = this.tracker.getNickOnChannel(a, c);
			if (!$defined(b)) {
				return false
			}
			return b.prefixes.indexOf(d) != -1
		},
		nickOnChanHasAtLeastPrefix : function (a, d, g) {
			var c = this.tracker.getNickOnChannel(a, d);
			if (!$defined(c)) {
				return false
			}
			var h = this.prefixes.indexOf(g);
			if (h == -1) {
				return false
			}
			var f = {};
			this.prefixes.slice(0, h + 1).split("").each(function (i) {
				f[i] = true
			});
			var e = c.prefixes;
			for (var b = 0; b < e.length; b++) {
				if (f[e.charAt(b)]) {
					return true
				}
			}
			return false
		},
		supported : function (b, c) {
			if (b == "PREFIX") {
				var a = (c.length - 2) / 2;
				this.modeprefixes = c.substr(1, a);
				this.prefixes = c.substr(a + 2, a)
			}
			this.parent(b, c)
		},
		connected : function () {
			qwebirc.connected = true;
			this.newServerLine("CONNECT")
		},
		serverError : function (a) {
			this.newServerLine("ERROR", {
				m : a
			})
		},
		quit : function (a) {
			this.send("QUIT :" + a, true);
			this.disconnect()
		},
		disconnect : function () {
			for (var a in this.activeTimers) {
				this.activeTimers[a].cancel()
			}
			this.activeTimers = {};
			this.parent()
		},
		awayMessage : function (a, b) {
			this.newQueryLine(a, "AWAY", {
				n : a,
				m : b
			}, true)
		},
		whois : function (a, c, e) {
			var d = {
				n : a
			};
			var f;
			var b = function () {
				this.newTargetOrActiveLine(a, "WHOIS" + f, d)
			}
			.bind(this);
			if (c == "user") {
				f = "USER";
				d.h = e.ident + "@" + e.hostname;
				b();
				f = "REALNAME";
				d.m = e.realname
			} else {
				if (c == "server") {
					f = "SERVER";
					d.x = e.server;
					d.m = e.serverdesc
				} else {
					if (c == "oper") {
						f = "OPER"
					} else {
						if (c == "idle") {
							f = "IDLE";
							d.x = qwebirc.util.longtoduration(e.idle);
							d.m = qwebirc.irc.IRCDate(new Date(e.connected * 1000))
						} else {
							if (c == "channels") {
								f = "CHANNELS";
								d.m = e.channels
							} else {
								if (c == "account") {
									f = "ACCOUNT";
									d.m = e.account
								} else {
									if (c == "away") {
										f = "AWAY";
										d.m = e.away
									} else {
										if (c == "opername") {
											f = "OPERNAME";
											d.m = e.opername
										} else {
											if (c == "actually") {
												f = "ACTUALLY";
												d.m = e.hostname;
												d.x = e.ip
											} else {
												if (c == "generictext") {
													f = "GENERICTEXT";
													d.m = e.text
												} else {
													if (c == "end") {
														f = "END"
													} else {
														return false
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			b();
			return true
		},
		genericError : function (b, a) {
			this.newTargetOrActiveLine(b, "GENERICERROR", {
				m : a,
				t : b
			})
		},
		genericQueryError : function (b, a) {
			this.newQueryOrActiveLine(b, "GENERICERROR", {
				m : a,
				t : b
			}, true)
		},
		awayStatus : function (b, a) {
			this.newActiveLine("GENERICMESSAGE", {
				m : a
			})
		},
		pushLastNick : function (a) {
			var b = this.lastNicks.indexOf(a);
			if (b != -1) {
				this.lastNicks.splice(b, 1)
			} else {
				if (this.lastNicks.length == this.options.maxnicks) {
					this.lastNicks.pop()
				}
			}
			this.lastNicks.unshift(a)
		},
		wallops : function (b, d) {
			var a = b.hostToNick();
			var c = b.hostToHost();
			this.newServerLine("WALLOPS", {
				t : d,
				n : a,
				h : c
			})
		},
		channelModeIs : function (a, b) {
			this.newTargetOrActiveLine(a, "CHANNELMODEIS", {
				c : a,
				m : b.join(" ")
			})
		},
		channelCreationTime : function (a, b) {
			this.newTargetOrActiveLine(a, "CHANNELCREATIONTIME", {
				c : a,
				m : qwebirc.irc.IRCDate(new Date(b * 1000))
			})
		},
		qwebircImage : function (e, c) {
			var a;
			if (e == "-STATUS") {
				a = this.statusWindow
			} else {
				a = this.getWindow(e)
			}
			if (!a) {
				a = this.getActiveWindow()
			}
			var b = new Element("img", {
					src : qwebirc.global.dynamicBaseURL + "image?filename=" + c
				});
			var f = new Element("div", {
					styles : {
						paddingTop : "2px",
						paddingBottom : "2px",
						paddingLeft : "9px"
					}
				});
			f.appendChild(b);
			a.scrollAdd(f);
			return true
		}
	});
qwebirc.irc.CommandHistory = new Class({
		Implements : [Options],
		options : {
			lines : 20
		},
		initialize : function (a) {
			this.setOptions(a);
			this.data = [];
			this.position = 0
		},
		addLine : function (b, a) {
			if ((this.data.length == 0) || (b != this.data[0])) {
				this.data.unshift(b)
			}
			if (a) {
				this.position = 0
			} else {
				this.position = -1
			}
			if (this.data.length > this.options.lines) {
				this.data.pop()
			}
		},
		upLine : function () {
			if (this.data.length == 0) {
				return null
			}
			if (this.position >= this.data.length) {
				return null
			}
			this.position = this.position + 1;
			return this.data[this.position]
		},
		downLine : function () {
			if (this.position == -1) {
				return null
			}
			this.position = this.position - 1;
			if (this.position == -1) {
				return null
			}
			return this.data[this.position]
		}
	});
qwebirc.irc.DummyNicknameValidator = new Class({
		validate : function (a) {
			return a
		}
	});
qwebirc.irc.NicknameValidator = new Class({
		initialize : function (a) {
			this.options = a
		},
		validate : function (b, g) {
			var f = [];
			var a = Math.min(this.options.maxLen, b.length);
			var j = b.split("");
			for (var d = 0; d < a; d++) {
				var h = j[d];
				var e = d == 0 ? this.options.validFirstChar : this.options.validSubChars;
				if (e.indexOf(h) != -1 || g && h == ".") {
					f.push(h)
				} else {
					f.push("_")
				}
			}
			while (f.length < this.options.minLen) {
				f.push("_")
			}
			return f.join("")
		}
	});
qwebirc.ui.UI_COMMANDS = [["Options", "options"], ["Add webchat to your site", "embedded"], ["Privacy policy", "privacy"], ["Feedback", "feedback"], ["Frequently asked questions", "faq"], ["About qwebirc", "about"]];
qwebirc.ui.MENU_ITEMS = function () {
	var d = function (i) {
		var j = this.name;
		var h = this.client.nickname;
		return this.client.nickOnChanHasAtLeastPrefix(h, j, "@")
	};
	var a = function (i) {
		var j = this.name;
		var h = this.client.nickname;
		return this.client.nickOnChanHasPrefix(h, j, "+")
	};
	var b = function (h) {
		var i = this.name;
		return this.client.nickOnChanHasPrefix(h, i, "@")
	};
	var c = function (h) {
		var i = this.name;
		return this.client.nickOnChanHasPrefix(h, i, "+")
	};
	var g = qwebirc.util.invertFn,
	e = qwebirc.util.composeAnd;
	var f = function (h) {
		return function (i) {
			this.client.exec("/" + h + " " + i)
		}
	};
	return [{
			text : "whois",
			fn : f("whois"),
			predicate : true
		}, {
			text : "query",
			fn : f("query"),
			predicate : true
		}, {
			text : "slap",
			fn : function (h) {
				this.client.exec("/ME slaps " + h + " around a bit with a large fishbot")
			},
			predicate : true
		}, {
			text : "kick",
			fn : function (h) {
				this.client.exec("/KICK " + h + " wibble")
			},
			predicate : d
		}, {
			text : "op",
			fn : f("op"),
			predicate : e(d, g(b))
		}, {
			text : "deop",
			fn : f("deop"),
			predicate : e(d, b)
		}, {
			text : "voice",
			fn : f("voice"),
			predicate : e(d, g(c))
		}, {
			text : "devoice",
			fn : f("devoice"),
			predicate : e(d, c)
		}
	]
}
();
qwebirc.ui.WINDOW_STATUS = 1;
qwebirc.ui.WINDOW_QUERY = 2;
qwebirc.ui.WINDOW_CHANNEL = 4;
qwebirc.ui.WINDOW_CUSTOM = 8;
qwebirc.ui.WINDOW_CONNECT = 16;
qwebirc.ui.WINDOW_MESSAGES = 32;
qwebirc.ui.CUSTOM_CLIENT = "custom";
qwebirc.ui.BaseUI = new Class({
		Implements : [Events],
		initialize : function (b, d, f, c) {
			this.options = c;
			this.windows = {};
			this.clients = {};
			this.windows[qwebirc.ui.CUSTOM_CLIENT] = {};
			this.windowArray = [];
			this.windowClass = d;
			this.parentElement = b;
			this.parentElement.addClass("qwebirc");
			this.parentElement.addClass("qwebirc-" + f);
			this.firstClient = false;
			this.commandhistory = new qwebirc.irc.CommandHistory();
			this.clientId = 0;
			this.windowFocused = true;
			if (Browser.Engine.trident) {
				var g = function () {
					var h = document.hasFocus();
					if (h != this.windowFocused) {
						this.windowFocused = h;
						this.focusChange(h)
					}
				};
				g.periodical(100, this)
			} else {
				var e = function () {
					if (this.windowFocused) {
						this.windowFocused = false;
						this.focusChange(false)
					}
				}
				.bind(this);
				var a = function () {
					if (!this.windowFocused) {
						this.windowFocused = true;
						this.focusChange(true)
					}
				}
				.bind(this);
				document.addEvent("blur", e);
				window.addEvent("blur", e);
				document.addEvent("focus", a);
				window.addEvent("focus", a)
			}
		},
		newClient : function (b) {
			b.id = this.clientId++;
			b.hilightController = new qwebirc.ui.HilightController(b);
			this.windows[b.id] = {};
			this.clients[b.id] = b;
			var a = this.newWindow(b, qwebirc.ui.WINDOW_STATUS, "Status");
			this.selectWindow(a);
			if (!this.firstClient) {
				this.firstClient = true;
				a.addLine("", "qwebirc v" + qwebirc.VERSION);
				a.addLine("", "Copyright (C) 2008-2012 Chris Porter and the qwebirc project.");
				a.addLine("", "http://www.qwebirc.org");
				a.addLine("", "Licensed under the GNU General Public License, Version 2.")
			}
			return a
		},
		getClientId : function (a) {
			if (a == qwebirc.ui.CUSTOM_CLIENT) {
				return qwebirc.ui.CUSTOM_CLIENT
			} else {
				return a.id
			}
		},
		getWindowIdentifier : function (a, c, b) {
			if (c == qwebirc.ui.WINDOW_MESSAGES) {
				return "-M"
			}
			if (c == qwebirc.ui.WINDOW_STATUS) {
				return ""
			}
			if (a == qwebirc.ui.CUSTOM_CLIENT) {
				return "_" + b
			}
			return "_" + a.toIRCLower(b)
		},
		newWindow : function (b, d, c) {
			var a = this.getWindow(b, d, c);
			if ($defined(a)) {
				return a
			}
			var e = this.getWindowIdentifier(b, d, c);
			var a = this.windows[this.getClientId(b)][e] = new this.windowClass(this, b, d, c, e);
			this.windowArray.push(a);
			return a
		},
		getWindow : function (a, d, b) {
			var e = this.windows[this.getClientId(a)];
			if (!$defined(e)) {
				return null
			}
			return e[this.getWindowIdentifier(a, d, b)]
		},
		getActiveWindow : function () {
			return this.active
		},
		getActiveIRCWindow : function (a) {
			if (!this.active || this.active.type == qwebirc.ui.WINDOW_CUSTOM) {
				return this.windows[this.getClientId(a)][this.getWindowIdentifier(a, qwebirc.ui.WINDOW_STATUS)]
			} else {
				return this.active
			}
		},
		__setActiveWindow : function (a) {
			this.active = a
		},
		renameWindow : function (d, c) {
			if (this.getWindow(d.client, d.type, c)) {
				return null
			}
			var a = this.getClientId(d.client);
			var b = this.windowArray.indexOf(d);
			if (b == -1) {
				return null
			}
			delete this.windows[a][d.identifier];
			var d = this.windowArray[b];
			d.name = c;
			d.identifier = this.getWindowIdentifier(d.client, d.type, d.name);
			this.windows[a][d.identifier] = this.windowArray[b];
			if (d.active) {
				this.updateTitle(d.name + " - " + this.options.appTitle)
			}
			d.rename(d.name);
			return d
		},
		selectWindow : function (a) {
			if (this.active) {
				this.active.deselect()
			}
			a.select();
			this.updateTitle(a.name + " - " + this.options.appTitle)
		},
		updateTitle : function (a) {
			document.title = a
		},
		nextWindow : function (b) {
			if (this.windowArray.length == 0 || !this.active) {
				return
			}
			if (!b) {
				b = 1
			}
			var a = this.windowArray.indexOf(this.active);
			if (a == -1) {
				return
			}
			a = a + b;
			if (a < 0) {
				a = this.windowArray.length - 1
			} else {
				if (a >= this.windowArray.length) {
					a = 0
				}
			}
			this.selectWindow(this.windowArray[a])
		},
		prevWindow : function () {
			this.nextWindow(-1)
		},
		__closed : function (b) {
			if (b.active) {
				this.active = undefined;
				if (this.windowArray.length == 1) {
					this.windowArray = []
				} else {
					var a = this.windowArray.indexOf(b);
					if (a == -1) {
						return
					} else {
						if (a == 0) {
							this.selectWindow(this.windowArray[1])
						} else {
							this.selectWindow(this.windowArray[a - 1])
						}
					}
				}
			}
			this.windowArray = this.windowArray.erase(b);
			delete this.windows[this.getClientId(b.client)][b.identifier]
		},
		loginBox : function (e, d, a, c, b) {
			this.postInitialize();
			this.addCustomWindow("Connection details", qwebirc.ui.ConnectPane, "connectpane", {
				initialNickname : d,
				initialChannels : a,
				autoConnect : c,
				networkName : this.options.networkName,
				callback : e,
				autoNick : b
			}, qwebirc.ui.WINDOW_CONNECT)
		},
		focusChange : function (b) {
			var a = this.getActiveWindow();
			if ($defined(a)) {
				a.focusChange(b)
			}
		},
		signedOn : function () {
			this.poller = new qwebirc.xdomain.Poller(this.oobMessage.bind(this))
		},
		oobMessage : function (e) {
			var h = e.splitMax(" ", 2);
			if (h.length != 2) {
				return
			}
			var g = h[0];
			if (g != "CMD") {
				return
			}
			var f = h[1].splitMax(" ", 2);
			if (f.length != 2) {
				return
			}
			var g = f[0];
			var b = f[1];
			if (g == "SAY") {
				var a = this.getActiveIRCWindow();
				if ($defined(a) && (a.type == qwebirc.ui.WINDOW_CHANNEL || a.type == qwebirc.ui.WINDOW_QUERY)) {
					a.client.exec("/SAY " + b);
					return
				}
			}
		}
	});
qwebirc.ui.StandardUI = new Class({
		Extends : qwebirc.ui.BaseUI,
		UICommands : qwebirc.ui.UI_COMMANDS,
		initialize : function (a, d, e, b) {
			this.parent(a, d, e, b);
			this.tabCompleter = new qwebirc.ui.TabCompleterFactory(this);
			this.uiOptions = new qwebirc.ui.DefaultOptionsClass(this, b.uiOptionsArg);
			this.customWindows = {};
			this.__styleValues = {
				hue : this.uiOptions.STYLE_HUE,
				saturation : 0,
				lightness : 0
			};
			if ($defined(this.options.hue)) {
				this.__styleValues.hue = this.options.hue
			}
			if ($defined(this.options.saturation)) {
				this.__styleValues.saturation = this.options.saturation
			}
			if ($defined(this.options.lightness)) {
				this.__styleValues.lightness = this.options.lightness
			}
			if (this.options.thue !== null) {
				this.__styleValues.textHue = this.options.thue
			}
			if (this.options.tsaturation !== null) {
				this.__styleValues.textSaturation = this.options.tsaturation
			}
			if (this.options.tlightness !== null) {
				this.__styleValues.textLightness = this.options.tlightness
			}
			var c;
			if (Browser.Engine.trident) {
				c = "keydown"
			} else {
				c = "keypress"
			}
			document.addEvent(c, this.__handleHotkey.bind(this))
		},
		__handleHotkey : function (a) {
			if (!a.alt || a.control) {
				if (a.key == "backspace" || a.key == "/") {
					if (!this.getInputFocused(a)) {
						new Event(a).stop()
					}
				}
				return
			}
			var f = false;
			if (a.key == "a" || a.key == "A") {
				var e = 0;
				var d = -1;
				f = true;
				new Event(a).stop();
				for (var b = 0; b < this.windowArray.length; b++) {
					var c = this.windowArray[b].hilighted;
					if (c > e) {
						d = b;
						e = c
					}
				}
				if (d > -1) {
					this.selectWindow(this.windowArray[d])
				}
			} else {
				if (a.key >= "0" && a.key <= "9") {
					f = true;
					number = a.key - "0";
					if (number == 0) {
						number = 10
					}
					number = number - 1;
					if (number >= this.windowArray.length) {
						return
					}
					this.selectWindow(this.windowArray[number])
				} else {
					if (a.key == "left") {
						this.prevWindow();
						f = true
					} else {
						if (a.key == "right") {
							this.nextWindow();
							f = true
						}
					}
				}
			}
			if (f) {
				new Event(a).stop()
			}
		},
		getInputFocused : function (a) {
			if ($$("input").indexOf(a.target) == -1 && $$("textarea").indexOf(a.target) == -1) {
				return false
			}
			return true
		},
		newCustomWindow : function (c, a, d) {
			if (!d) {
				d = qwebirc.ui.WINDOW_CUSTOM
			}
			var b = this.newWindow(qwebirc.ui.CUSTOM_CLIENT, d, c);
			b.addEvent("close", function (e) {
				delete this.windows[qwebirc.ui.CUSTOM_CLIENT][e.identifier]
			}
				.bind(this));
			if (a) {
				this.selectWindow(b)
			}
			return b
		},
		addCustomWindow : function (c, a, b, e, g) {
			if (!$defined(e)) {
				e = {}

			}
			if (this.customWindows[c]) {
				this.selectWindow(this.customWindows[c]);
				return
			}
			var h = this.newCustomWindow(c, true, g);
			this.customWindows[c] = h;
			h.addEvent("close", function () {
				this.customWindows[c] = null
			}
				.bind(this));
			if (b) {
				h.lines.addClass("qwebirc-" + b)
			}
			var f = new a(h.lines, e);
			f.addEvent("close", function () {
				h.close()
			}
				.bind(this));
			h.setSubWindow(f)
		},
		embeddedWindow : function () {
			this.addCustomWindow("Add webchat to your site", qwebirc.ui.EmbedWizard, "embeddedwizard", {
				baseURL : this.options.baseURL,
				uiOptions : this.uiOptions,
				optionsCallback : function () {
					this.optionsWindow()
				}
				.bind(this)
			})
		},
		optionsWindow : function () {
			this.addCustomWindow("Options", qwebirc.ui.OptionsPane, "optionspane", this.uiOptions)
		},
		aboutWindow : function () {
			this.addCustomWindow("About", qwebirc.ui.AboutPane, "aboutpane", this.uiOptions)
		},
		privacyWindow : function () {
			this.addCustomWindow("Privacy policy", qwebirc.ui.PrivacyPolicyPane, "privacypolicypane", this.uiOptions)
		},
		feedbackWindow : function () {
			this.addCustomWindow("Feedback", qwebirc.ui.FeedbackPane, "feedbackpane", this.uiOptions)
		},
		faqWindow : function () {
			this.addCustomWindow("FAQ", qwebirc.ui.FAQPane, "faqpane", this.uiOptions)
		},
		urlDispatcher : function (a, b) {
			if (a == "embedded") {
				return ["a", this.embeddedWindow.bind(this)]
			}
			if (a == "options") {
				return ["a", this.optionsWindow.bind(this)]
			}
			if (a == "whois") {
				return ["span", function (c) {
						if (this.uiOptions.QUERY_ON_NICK_CLICK) {
							b.client.exec("/QUERY " + c)
						} else {
							b.client.exec("/WHOIS " + c)
						}
					}
					.bind(this)]
			}
			return null
		},
		tabComplete : function (a) {
			this.tabCompleter.tabComplete(a)
		},
		resetTabComplete : function () {
			this.tabCompleter.reset()
		},
		setModifiableStylesheet : function (a) {
			this.__styleSheet = new qwebirc.ui.style.ModifiableStylesheet(qwebirc.global.staticBaseURL + "css/" + a + qwebirc.FILE_SUFFIX + ".mcss");
			this.setModifiableStylesheetValues({})
		},
		setModifiableStylesheetValues : function (c) {
			for (var b in c) {
				this.__styleValues[b] = c[b]
			}
			if (!$defined(this.__styleSheet)) {
				return
			}
			var a = {
				hue : this.__styleValues.hue,
				lightness : this.__styleValues.lightness,
				saturation : this.__styleValues.saturation
			};
			var d = {
				hue : this.__styleValues.textHue,
				lightness : this.__styleValues.textLightness,
				saturation : this.__styleValues.textSaturation
			};
			if (!this.__styleValues.textHue && !this.__styleValues.textLightness && !this.__styleValues.textSaturation) {
				d = a
			}
			var e = {
				back : a,
				front : d
			};
			this.__styleSheet.set(function () {
				var h = arguments[0];
				if (h == "c") {
					var g = e[arguments[2]];
					var f = new Color(arguments[1]);
					var i = f.setHue(g.hue).setSaturation(f.hsb[1] + g.saturation).setBrightness(f.hsb[2] + g.lightness);
					if (i == "255,255,255") {
						i = "255,255,254"
					}
					return "rgb(" + i + ")"
				} else {
					if (h == "o") {
						return this.uiOptions[arguments[1]] ? arguments[2] : arguments[3]
					}
				}
			}
				.bind(this))
		}
	});
qwebirc.ui.NotificationUI = new Class({
		Extends : qwebirc.ui.StandardUI,
		initialize : function (a, c, d, b) {
			this.parent(a, c, d, b);
			this.__beeper = new qwebirc.ui.Beeper(this.uiOptions);
			this.__flasher = new qwebirc.ui.Flasher(this.uiOptions);
			this.beep = this.__beeper.beep.bind(this.__beeper);
			this.flash = this.__flasher.flash.bind(this.__flasher);
			this.cancelFlash = this.__flasher.cancelFlash.bind(this.__flasher)
		},
		setBeepOnMention : function (a) {
			if (a) {
				this.__beeper.soundInit()
			}
		},
		updateTitle : function (a) {
			if (this.__flasher.updateTitle(a)) {
				this.parent(a)
			}
		},
		focusChange : function (a) {
			this.parent(a);
			this.__flasher.focusChange(a)
		}
	});
qwebirc.ui.QuakeNetUI = new Class({
		Extends : qwebirc.ui.NotificationUI,
		urlDispatcher : function (a, b) {
			if (a == "qwhois") {
				return ["span", function (c) {
						this.client.exec("/MSG Q whois #" + c)
					}
					.bind(b)]
			}
			return this.parent(a, b)
		},
		logout : function () {
			if (!qwebirc.auth.loggedin()) {
				return
			}
			if (confirm("Log out?")) {
				for (var a in this.clients) {
					this.clients[a].quit("Logged out")
				}
				var b = function () {
					document.location = qwebirc.global.dynamicBaseURL + "auth?logout=1"
				};
				b.delay(500)
			}
		}
	});
qwebirc.ui.RootUI = qwebirc.ui.QuakeNetUI;
qwebirc.ui.RequestTransformHTML = function (a) {
	var b = {
		IMG : 1
	};
	var e = a.update;
	var d = a.onSuccess;
	var c = function (j) {
		if (j.nodeType != 1) {
			return
		}
		var h = j.nodeName.toUpperCase();
		if (b[h]) {
			var f = j.getAttribute("transform_attr");
			var k = j.getAttribute("transform_value");
			if ($defined(f) && $defined(k)) {
				j.removeAttribute("transform_attr");
				j.removeAttribute("transform_value");
				j.setAttribute(f, qwebirc.global.staticBaseURL + k)
			}
		}
		for (var g = 0; g < j.childNodes.length; g++) {
			c(j.childNodes[g])
		}
	};
	delete a.update;
	a.onSuccess = function (g, j, i, k) {
		var h = new Element("div");
		h.set("html", i);
		c(h);
		e.empty();
		while (h.childNodes.length > 0) {
			var f = h.firstChild;
			h.removeChild(f);
			e.appendChild(f)
		}
		d()
	};
	return new Request.HTML(a)
};
qwebirc.ui.HILIGHT_NONE = 0;
qwebirc.ui.HILIGHT_ACTIVITY = 1;
qwebirc.ui.HILIGHT_SPEECH = 2;
qwebirc.ui.HILIGHT_US = 3;
qwebirc.ui.MAXIMUM_LINES_PER_WINDOW = 1000;
qwebirc.ui.WINDOW_LASTLINE = qwebirc.ui.WINDOW_QUERY | qwebirc.ui.WINDOW_MESSAGES | qwebirc.ui.WINDOW_CHANNEL | qwebirc.ui.WINDOW_STATUS;
qwebirc.ui.Window = new Class({
		Implements : [Events],
		initialize : function (e, a, d, c, b) {
			this.parentObject = e;
			this.type = d;
			this.name = c;
			this.active = false;
			this.client = a;
			this.identifier = b;
			this.hilighted = qwebirc.ui.HILIGHT_NONE;
			this.scrolltimer = null;
			this.commandhistory = this.parentObject.commandhistory;
			this.scrolleddown = true;
			this.scrollpos = null;
			this.lastNickHash = {};
			this.lastSelected = null;
			this.subWindow = null;
			this.closed = false;
			if (this.type & qwebirc.ui.WINDOW_LASTLINE) {
				this.lastPositionLine = new Element("hr");
				this.lastPositionLine.addClass("lastpos");
				this.lastPositionLineInserted = false
			}
		},
		updateTopic : function (a, b) {
			qwebirc.ui.Colourise("[" + a + "]", b, this.client.exec, this.parentObject.urlDispatcher.bind(this.parentObject), this)
		},
		close : function () {
			this.closed = true;
			if ($defined(this.scrolltimer)) {
				$clear(this.scrolltimer);
				this.scrolltimer = null
			}
			this.parentObject.__closed(this);
			this.fireEvent("close", this)
		},
		subEvent : function (a) {
			if ($defined(this.subWindow)) {
				this.subWindow.fireEvent(a)
			}
		},
		setSubWindow : function (a) {
			this.subWindow = a
		},
		select : function () {
			if (this.lastPositionLineInserted && !this.parentObject.uiOptions.LASTPOS_LINE) {
				this.lines.removeChild(this.lastPositionLine);
				this.lastPositionLineInserted = false
			}
			this.active = true;
			this.parentObject.__setActiveWindow(this);
			if (this.hilighted) {
				this.setHilighted(qwebirc.ui.HILIGHT_NONE)
			}
			this.subEvent("select");
			this.resetScrollPos();
			this.lastSelected = new Date()
		},
		deselect : function () {
			this.subEvent("deselect");
			this.setScrollPos();
			if ($defined(this.scrolltimer)) {
				$clear(this.scrolltimer);
				this.scrolltimer = null
			}
			if (this.type & qwebirc.ui.WINDOW_LASTLINE) {
				this.replaceLastPositionLine()
			}
			this.active = false
		},
		resetScrollPos : function () {
			if (this.scrolleddown) {
				this.scrollToBottom()
			} else {
				if ($defined(this.scrollpos)) {
					this.getScrollParent().scrollTo(this.scrollpos.x, this.scrollpos.y)
				}
			}
		},
		setScrollPos : function () {
			if (!this.parentObject.singleWindow) {
				this.scrolleddown = this.scrolledDown();
				this.scrollpos = this.lines.getScroll()
			}
		},
		addLine : function (e, a, f, c) {
			var d = qwebirc.ui.HILIGHT_NONE;
			var g = false;
			if (e) {
				d = qwebirc.ui.HILIGHT_ACTIVITY;
				if (e.match(/(NOTICE|ACTION|MSG)$/)) {
					if (this.type == qwebirc.ui.WINDOW_QUERY || this.type == qwebirc.ui.WINDOW_MESSAGES) {
						if (e.match(/^OUR/) || e.match(/NOTICE$/)) {
							d = qwebirc.ui.HILIGHT_ACTIVITY
						} else {
							d = qwebirc.ui.HILIGHT_US;
							this.parentObject.beep();
							this.parentObject.flash()
						}
					}
					if (!e.match(/^OUR/) && this.client.hilightController.match(a.m)) {
						g = true;
						d = qwebirc.ui.HILIGHT_US;
						this.parentObject.beep();
						this.parentObject.flash()
					} else {
						if (d != qwebirc.ui.HILIGHT_US) {
							d = qwebirc.ui.HILIGHT_SPEECH
						}
					}
				}
			}
			if (!this.active && (d != qwebirc.ui.HILIGHT_NONE)) {
				this.setHilighted(d)
			}
			if (e) {
				a = this.parentObject.theme.message(e, a, g)
			}
			var b = document.createElement("span");
			b.className = "timestamp";
			b.appendChild(document.createTextNode(qwebirc.irc.IRCTimestamp(new Date()) + " "));
			c.appendChild(b);
			qwebirc.ui.Colourise(a, c, this.client.exec, this.parentObject.urlDispatcher.bind(this.parentObject), this);
			this.scrollAdd(c)
		},
		errorMessage : function (a) {
			this.addLine("", a, "warncolour")
		},
		infoMessage : function (a) {
			this.addLine("", a, "infocolour")
		},
		setHilighted : function (a) {
			if (a == qwebirc.ui.HILIGHT_NONE || a >= this.hilighted) {
				this.hilighted = a
			}
		},
		scrolledDown : function () {
			if (this.scrolltimer) {
				return true
			}
			var c = this.lines;
			var d = c.getScroll();
			var b = c.getScrollSize().y;
			var a = c.clientHeight;
			if (b < a) {
				b = a
			}
			return d.y + a == b
		},
		getScrollParent : function () {
			var a = this.lines;
			if ($defined(this.scroller)) {
				a = this.scroller
			}
			return a
		},
		scrollToBottom : function () {
			if (this.type == qwebirc.ui.WINDOW_CUSTOM || this.type == qwebirc.ui.WINDOW_CONNECT) {
				return
			}
			var b = this.lines;
			var a = this.getScrollParent();
			a.scrollTo(b.getScroll().x, b.getScrollSize().y)
		},
		scrollAdd : function (a) {
			var b = this.lines;
			if ($defined(a)) {
				var c = this.scrolledDown();
				b.appendChild(a);
				if (b.childNodes.length > qwebirc.ui.MAXIMUM_LINES_PER_WINDOW) {
					b.removeChild(b.firstChild)
				}
				if (c) {
					if (this.scrolltimer) {
						$clear(this.scrolltimer)
					}
					this.scrolltimer = this.scrollAdd.delay(50, this, [null])
				} else {
					this.scrollToBottom();
					this.scrolltimer = null
				}
			} else {
				this.scrollToBottom();
				this.scrolltimer = null
			}
		},
		updateNickList : function (d) {
			var a = {},
			g = {};
			var j = [];
			var h = this.lastNickHash;
			for (var f = 0; f < d.length; f++) {
				g[d[f]] = 1
			}
			for (var e in h) {
				if (!g[e]) {
					this.nickListRemove(e, h[e])
				}
			}
			for (var f = 0; f < d.length; f++) {
				var b = d[f];
				var c = h[b];
				if (!c) {
					c = this.nickListAdd(b, f);
					if (!c) {
						c = 1
					}
				}
				a[b] = c
			}
			this.lastNickHash = a
		},
		nickListAdd : function (b, a) {},
		nickListRemove : function (a, b) {},
		historyExec : function (a) {
			this.commandhistory.addLine(a);
			this.client.exec(a)
		},
		focusChange : function (a) {
			if (a == true || !(this.type & qwebirc.ui.WINDOW_LASTLINE)) {
				return
			}
			this.replaceLastPositionLine()
		},
		replaceLastPositionLine : function () {
			if (this.parentObject.uiOptions.LASTPOS_LINE) {
				if (!this.lastPositionLineInserted) {
					this.scrollAdd(this.lastPositionLine)
				} else {
					if (this.lines.lastChild != this.lastPositionLine) {
						try {
							this.lines.removeChild(this.lastPositionLine)
						} catch (a) {}

						this.scrollAdd(this.lastPositionLine)
					}
				}
			} else {
				if (this.lastPositionLineInserted) {
					this.lines.removeChild(this.lastPositionLine)
				}
			}
			this.lastPositionLineInserted = this.parentObject.uiOptions.LASTPOS_LINE
		},
		rename : function (a) {}

	});
qwebirc.ui.Colourise = function (k, m, q, a, h) {
	var p;
	var d;
	var j = false;
	var s = false;
	var B = false;
	var x = [];
	var n = k.split("");
	var b = document.createElement("span");
	m.addClass("colourline");
	function r(c) {
		return c >= "0" && c <= "9"
	}
	function z(e, c) {
		if (!r(e[c + 1])) {
			p = undefined;
			d = undefined;
			return c
		}
		c++;
		if (r(e[c + 1])) {
			p = parseInt(e[c] + e[c + 1]);
			c++
		} else {
			p = parseInt(e[c])
		}
		if (e[c + 1] != ",") {
			return c
		}
		if (!r(e[c + 2])) {
			return c
		}
		c += 2;
		if (r(e[c + 1])) {
			d = parseInt(e[c] + e[c + 1]);
			c++
		} else {
			d = parseInt(e[c])
		}
		return c
	}
	function f() {
		var c = "";
		if (x.length > 0) {
			var c = qwebirc.ui.urlificate(b, x.join(""), q, a, h);
			m.appendChild(b);
			x = []
		}
		b = document.createElement("span");
		return c
	}
	function l() {
		if (B) {
			return b
		}
		var c = [];
		if (p != undefined) {
			c.push("Xc" + p)
		}
		if (d != undefined) {
			c.push("Xbc" + d)
		}
		if (s) {
			c.push("Xb")
		}
		if (j) {
			c.push("Xu")
		}
		b.className = c.join(" ")
	}
	var u = h.parentObject.uiOptions.NICK_COLOURS;
	var g = false;
	for (var v = 0; v < n.length; v++) {
		var t = n[v];
		if (u) {
			if (!g) {
				if (t == "\x00") {
					g = true;
					f();
					continue
				}
			} else {
				if (t != "\x00") {
					x.push(t)
				} else {
					B = true;
					var y = l();
					var o = f();
					var A = o.toHSBColour(h.client);
					if ($defined(A)) {
						y.style.color = A.rgbToHex()
					}
					g = B = false
				}
				continue
			}
		} else {
			if (t == "\x00") {
				continue
			}
		}
		if (t == "\x02") {
			f();
			s = !s;
			l()
		} else {
			if (t == "\x1F") {
				f();
				j = !j;
				l()
			} else {
				if (t == "\x0F") {
					f();
					p = undefined;
					d = undefined;
					j = false;
					s = false
				} else {
					if (t == "\x03") {
						f();
						v = z(n, v);
						if (d > 15) {
							d = undefined
						}
						if (p > 15) {
							p = undefined
						}
						l()
					} else {
						x.push(t)
					}
				}
			}
		}
	}
	f()
};
String.prototype.toHSBColour = function (a) {
	var c = a.toIRCLower(a.stripPrefix(this));
	if (c == a.lowerNickname) {
		return null
	}
	var e = 0;
	for (var d = 0; d < c.length; d++) {
		e = 31 * e + c.charCodeAt(d)
	}
	var b = Math.abs(e) % 360;
	return new Color([b, 70, 60], "hsb")
};
qwebirc.ui.urlificate = function (b, j, e, c, f) {
	var h = /[[\)|\]]?(\.*|[\,;])$/;
	var i = [];
	var k = function (u, t, r, n) {
		for (; ; ) {
			var p = u.search(t);
			if (p == -1) {
				r(u);
				break
			}
			var o = u.match(t);
			var s = u.substring(0, p);
			var m = o[0];
			var l = u.substring(p + m.length);
			r(s);
			var q = n(m, r);
			if (!q) {
				q = ""
			}
			u = q + l
		}
	};
	var a = function (l) {
		i.push(l);
		qwebirc.util.NBSPCreate(l, b)
	};
	var g = function (n) {
		var o = n.replace(h, "");
		i.push(o);
		var m = n.substring(o.length);
		var l = new Element("span");
		l.href = "#";
		l.addClass("hyperlink-channel");
		l.addEvent("click", function (p) {
			new Event(p).stop();
			e("/JOIN " + o)
		});
		l.appendChild(document.createTextNode(o));
		b.appendChild(l);
		return m
	};
	var d = function (A, v) {
		var l = A.replace(h, "");
		var o = A.substring(l.length);
		var n = "";
		var x = null;
		var u = "_blank";
		var r = l;
		var t = "a";
		var s;
		var z = l.match(/^qwebirc:\/\/(.*)$/);
		if (z) {
			var q = z[1].match(/^([^\/]+)\/([^\/]+)\/?(.*)$/);
			if (!q) {
				v(A);
				return
			}
			var p = c(q[1], f);
			if (p) {
				s = q[1];
				t = p[0];
				if (p[0] != "a") {
					l = null
				} else {
					l = "#"
				}
				x = p[1];
				r = unescape(q[2]);
				u = null
			} else {
				v(A);
				return
			}
			if (q[3]) {
				o = q[3] + o
			}
		} else {
			if (l.match(/^www\./)) {
				l = "http://" + l
			}
		}
		var y = new Element(t);
		if (s) {
			y.addClass("hyperlink-" + s)
		}
		if (l) {
			y.href = l;
			if (u) {
				y.target = u
			}
		}
		i.push(r);
		y.appendChild(document.createTextNode(r));
		b.appendChild(y);
		if ($defined(x)) {
			y.addEvent("click", function (m) {
				new Event(m).stop();
				x(r)
			})
		}
		return o
	};
	k(j, /\b((https?|ftp|qwebirc):\/\/|www\.)[^ ]+/, function (l) {
		k(l, /\B#[^ ,]+/, a, g)
	}, d);
	return i.join("")
};
qwebirc.ui.themes.ThemeControlCodeMap = {
	C : "\x03",
	B : "\x02",
	U : "\x1F",
	O : "\x0F",
	"{" : "\x00",
	"}" : "\x00",
	"[" : "qwebirc://whois/",
	"]" : "/",
	"$" : "$"
};
qwebirc.ui.themes.Default = {
	PREFIX : ["$C4==$O "],
	SIGNON : ["Signed on!", true],
	CONNECT : ["Connected to server.", true],
	RAW : ["$m", true],
	DISCONNECT : ["Disconnected from server: $m", true],
	ERROR : ["ERROR: $m", true],
	SERVERNOTICE : ["$m", true],
	JOIN : ["${$N$} [$h] has joined $c", true],
	OURJOIN : ["${$N$} [$h] has joined $c", true],
	PART : ["${$N$} [$h] has left $c [$m]", true],
	KICK : ["${$v$} was kicked from $c by ${$N$} [$m]", true],
	MODE : ["mode/$c [$m] by ${$N$}", true],
	QUIT : ["${$N$} [$h] has quit [$m]", true],
	NICK : ["${$n$} has changed nick to ${$[$w$]$}", true],
	TOPIC : ["${$N$} changed the topic of $c to: $m", true],
	UMODE : ["Usermode change: $m", true],
	INVITE : ["$N invites you to join $c", true],
	HILIGHT : ["$C4"],
	HILIGHTEND : ["$O"],
	CHANMSG : ["<${$@$($N$)$}> $m"],
	PRIVMSG : ["<$($N$)> $m"],
	CHANNOTICE : ["-${$($N$)$}:$c- $m"],
	PRIVNOTICE : ["-$($N$)- $m"],
	OURCHANMSG : ["<$@$N> $m"],
	OURPRIVMSG : ["<$N> $m"],
	OURTARGETEDMSG : ["*$[$t$]* $m"],
	OURTARGETEDNOTICE : ["[notice($[$t$])] $m"],
	OURCHANNOTICE : ["-$N:$t- $m"],
	OURPRIVNOTICE : ["-$N- $m"],
	OURCHANACTION : [" * $N $m"],
	OURPRIVACTION : [" * $N $m"],
	CHANACTION : [" * ${$($N$)$} $m"],
	PRIVACTION : [" * $($N$) $m"],
	CHANCTCP : ["$N [$h] requested CTCP $x from $c: $m"],
	PRIVCTCP : ["$N [$h] requested CTCP $x from $-: $m"],
	CTCPREPLY : ["CTCP $x reply from $N: $m"],
	OURCHANCTCP : ["[ctcp($t)] $x $m"],
	OURPRIVCTCP : ["[ctcp($t)] $x $m"],
	OURTARGETEDCTCP : ["[ctcp($t)] $x $m"],
	WHOISUSER : ["$B$N$B [$h]", true],
	WHOISREALNAME : [" realname : $m", true],
	WHOISCHANNELS : [" channels : $m", true],
	WHOISSERVER : [" server   : $x [$m]", true],
	WHOISACCOUNT : [" account  : qwebirc://qwhois/$m", true],
	WHOISIDLE : [" idle     : $x [connected: $m]", true],
	WHOISAWAY : [" away     : $m", true],
	WHOISOPER : ["          : $BIRC Operator$B", true],
	WHOISOPERNAME : [" operedas : $m", true],
	WHOISACTUALLY : [" realhost : $m [ip: $x]", true],
	WHOISGENERICTEXT : ["          : $m", true],
	WHOISEND : ["End of WHOIS", true],
	AWAY : ["$N is away: $m", true],
	GENERICERROR : ["$m: $t", true],
	GENERICMESSAGE : ["$m", true],
	WALLOPS : ["WALLOP $n: $t", true],
	CHANNELCREATIONTIME : ["Channel $c was created at: $m", true],
	CHANNELMODEIS : ["Channel modes on $c are: $m", true]
};
qwebirc.ui.Theme = new Class({
		initialize : function (b) {
			this.__theme = qwebirc.util.dictCopy(qwebirc.ui.themes.Default);
			if (b) {
				for (var a in b) {
					this.__theme[a] = b[a]
				}
			}
			for (var a in this.__theme) {
				if (a == "PREFIX") {
					continue
				}
				var c = this.__theme[a];
				if (c[1]) {
					this.__theme[a] = this.__theme.PREFIX + c[0]
				} else {
					this.__theme[a] = c[0]
				}
			}
			this.__ccmap = qwebirc.util.dictCopy(qwebirc.ui.themes.ThemeControlCodeMap);
			this.__ccmaph = qwebirc.util.dictCopy(this.__ccmap);
			this.__ccmaph["("] = this.message("HILIGHT", {}, this.__ccmap);
			this.__ccmaph[")"] = this.message("HILIGHTEND", {}, this.__ccmap);
			this.__ccmaph["{"] = this.__ccmaph["}"] = ""
		},
		__dollarSubstitute : function (l, j, a) {
			var e = [];
			var d = l.split("");
			for (var g = 0; g < d.length; g++) {
				var k = d[g];
				if (k == "$" && (g <= d.length - 1)) {
					var f = d[++g];
					var b = a[f];
					if (!b) {
						b = j[f]
					}
					if (b) {
						e.push(b)
					}
				} else {
					e.push(k)
				}
			}
			return e.join("")
		},
		message : function (b, c, a) {
			var d;
			if (a) {
				d = this.__ccmaph
			} else {
				d = this.__ccmap
			}
			if (c && c.n) {
				c.N = "qwebirc://whois/" + c.n + "/"
			}
			return this.__dollarSubstitute(this.__theme[b], c, d)
		}
	});
qwebirc.ui.HilightController = new Class({
		initialize : function (a) {
			this.parent = a;
			this.regex = null;
			this.prevnick = null
		},
		match : function (c) {
			var a = this.parent.nickname;
			if (a != this.prevnick) {
				var b = "[\\s\\.,;:]";
				this.regex = new RegExp("(^|" + b + ")" + RegExp.escape(a) + "(" + b + "|$)", "i")
			}
			if (c.match(this.regex)) {
				return true
			}
			return false
		}
	});
qwebirc.ui.Beeper = new Class({
		initialize : function (a) {
			this.uiOptions = a;
			this.soundInited = false;
			this.soundReady = false;
			if (this.uiOptions.BEEP_ON_MENTION) {
				this.soundInit()
			}
		},
		soundInit : function () {
			if (this.soundInited) {
				return
			}
			if (!$defined(Browser.Plugins.Flash) || Browser.Plugins.Flash.version < 8) {
				return
			}
			this.soundInited = true;
			this.soundPlayer = new qwebirc.sound.SoundPlayer();
			this.soundPlayer.addEvent("ready", function () {
				this.soundReady = true
			}
				.bind(this));
			this.soundPlayer.go()
		},
		beep : function () {
			if (!this.soundReady || !this.uiOptions.BEEP_ON_MENTION) {
				return
			}
			this.soundPlayer.beep()
		}
	});
qwebirc.ui.Flasher = new Class({
		initialize : function (b) {
			this.uiOptions = b;
			this.windowFocused = false;
			this.canUpdateTitle = true;
			this.titleText = document.title;
			var a = this._getFavIcon();
			if ($defined(a)) {
				this.favIcon = a;
				this.favIconParent = a.parentNode;
				this.favIconVisible = true;
				this.emptyFavIcon = new Element("link");
				this.emptyFavIcon.rel = "shortcut icon";
				this.emptyFavIcon.href = qwebirc.global.staticBaseURL + "images/empty_favicon.ico";
				this.emptyFavIcon.type = "image/x-icon";
				this.flashing = false;
				this.canFlash = true;
				document.addEvent("mousedown", this.cancelFlash.bind(this));
				document.addEvent("keydown", this.cancelFlash.bind(this))
			} else {
				this.canFlash = false
			}
		},
		_getFavIcon : function () {
			var b = $$("head link");
			for (var a = 0; a < b.length; a++) {
				if (b[a].getAttribute("rel") == "shortcut icon") {
					return b[a]
				}
			}
		},
		flash : function () {
			if (!this.uiOptions.FLASH_ON_MENTION || this.windowFocused || !this.canFlash || this.flashing) {
				return
			}
			this.titleText = document.title;
			var b = function () {
				this.hideFavIcon();
				this.canUpdateTitle = false;
				document.title = "Activity!";
				this.flasher = a.delay(500)
			}
			.bind(this);
			var a = function () {
				this.showFavIcon();
				this.canUpdateTitle = true;
				document.title = this.titleText;
				this.flasher = b.delay(500)
			}
			.bind(this);
			this.flashing = true;
			b()
		},
		cancelFlash : function () {
			if (!this.canFlash || !$defined(this.flasher)) {
				return
			}
			this.flashing = false;
			$clear(this.flasher);
			this.flasher = null;
			this.showFavIcon();
			document.title = this.titleText;
			this.canUpdateTitle = true
		},
		hideFavIcon : function () {
			if (this.favIconVisible) {
				this.favIconVisible = false;
				this.favIconParent.removeChild(this.favIcon);
				this.favIconParent.appendChild(this.emptyFavIcon)
			}
		},
		showFavIcon : function () {
			if (!this.favIconVisible) {
				this.favIconVisible = true;
				this.favIconParent.removeChild(this.emptyFavIcon);
				this.favIconParent.appendChild(this.favIcon)
			}
		},
		updateTitle : function (a) {
			this.titleText = a;
			return this.canUpdateTitle
		},
		focusChange : function (a) {
			this.windowFocused = a;
			if (a) {
				this.cancelFlash()
			}
		}
	});
qwebirc.ui.TabCompleterFactory = new Class({
		initialize : function (a) {
			this.ui = a;
			this.reset()
		},
		tabComplete : function (f) {
			var h = f.value;
			if (!$defined(this.obj)) {
				this.incr = 1;
				var g = this.ui.getActiveWindow();
				if (!g) {
					return
				}
				var c = qwebirc.util.getEnclosedWord(h, qwebirc.util.getCaretPos(f));
				var i = "",
				b = "",
				d = "";
				if ($defined(c)) {
					var i = h.substring(0, c[0]);
					var b = c[1];
					var d = h.substring(c[0] + b.length)
				}
				var e = h.toLowerCase();
				if (h == "") {
					i = "/msg ";
					obj = qwebirc.ui.QueryTabCompleter
				} else {
					if (g.client.isChannel(b)) {
						obj = qwebirc.ui.ChannelNameTabCompleter
					} else {
						if (e.match(/^\/(q|query|msg) /i)) {
							obj = qwebirc.ui.QueryTabCompleter
						} else {
							if (g.type == qwebirc.ui.WINDOW_QUERY) {
								obj = qwebirc.ui.QueryNickTabCompleter
							} else {
								if (g.type == qwebirc.ui.WINDOW_CHANNEL) {
									if (i == "") {
										if ((d != "") && d.charAt(0) == " ") {
											d = ":" + d
										} else {
											d = ": " + d
										}
										this.incr++
									}
									obj = qwebirc.ui.ChannelUsersTabCompleter
								} else {
									return
								}
							}
						}
					}
				}
				if (d == "") {
					d = " "
				}
				this.obj = new obj(i, b, d, g);
				if (!$defined(this.obj)) {
					return
				}
			}
			var a = this.obj.get();
			if (!$defined(a)) {
				return
			}
			f.value = a[1];
			qwebirc.util.setCaretPos(f, a[0] + this.incr)
		},
		reset : function () {
			this.obj = null
		}
	});
qwebirc.ui.TabIterator = new Class({
		initialize : function (c, g, f) {
			this.prefix = g;
			if (!$defined(f) || f.length == 0) {
				this.list = null
			} else {
				var b = [];
				var e = qwebirc.irc.toIRCCompletion(c, g);
				for (var d = 0; d < f.length; d++) {
					var a = qwebirc.irc.toIRCCompletion(c, f[d]);
					if (a.startsWith(e)) {
						b.push(f[d])
					}
				}
				this.list = b
			}
			this.pos = -1
		},
		next : function () {
			if (!$defined(this.list)) {
				return null
			}
			this.pos = this.pos + 1;
			if (this.pos >= this.list.length) {
				this.pos = 0
			}
			return this.list[this.pos]
		}
	});
qwebirc.ui.BaseTabCompleter = new Class({
		initialize : function (a, c, e, d, b) {
			this.existingNick = e;
			this.prefix = c;
			this.suffix = d;
			this.iterator = new qwebirc.ui.TabIterator(a, e, b)
		},
		get : function () {
			var b = this.iterator.next();
			if (!$defined(b)) {
				return null
			}
			var a = this.prefix + b;
			return [a.length, a + this.suffix]
		}
	});
qwebirc.ui.QueryTabCompleter = new Class({
		Extends : qwebirc.ui.BaseTabCompleter,
		initialize : function (b, d, c, a) {
			this.parent(a.client, b, d, c, a.client.lastNicks)
		}
	});
qwebirc.ui.QueryNickTabCompleter = new Class({
		Extends : qwebirc.ui.BaseTabCompleter,
		initialize : function (c, e, d, b) {
			var a = b.name;
			this.parent(b.client, c, e, d, [a])
		}
	});
qwebirc.ui.ChannelNameTabCompleter = new Class({
		Extends : qwebirc.ui.BaseTabCompleter,
		initialize : function (g, a, m, h) {
			var d = [];
			var e = h.parentObject.windows[h.parentObject.getClientId(h.client)];
			for (var j in h.client.channels) {
				var k = e[j];
				if ($defined(k)) {
					k = k.lastSelected
				}
				d.push([k, j])
			}
			d.sort(function (i, c) {
				return c[0] - i[0]
			});
			var b = [];
			for (var f = 0; f < d.length; f++) {
				b.push(d[f][1])
			}
			this.parent(h.client, g, a, m, b)
		}
	});
qwebirc.ui.ChannelUsersTabCompleter = new Class({
		Extends : qwebirc.ui.BaseTabCompleter,
		initialize : function (b, d, c, a) {
			var e = a.client.tracker.getSortedByLastSpoke(a.name);
			this.parent(a.client, b, d, c, e)
		}
	});
qwebirc.ui.style.ModifiableStylesheet = new Class({
		initialize : function (a) {
			var b = this.__parseStylesheet(this.__getStylesheet(a));
			this.__cssText = b.cssText;
			this.rules = b.rules;
			this.__tag = this.__createTag()
		},
		__createTag : function () {
			var a = document.createElement("style");
			a.type = "text/css";
			a.media = "all";
			document.getElementsByTagName("head")[0].appendChild(a);
			return a
		},
		__getStylesheet : function (b) {
			var c = new Request({
					url : b,
					async : false
				});
			var a;
			c.addEvent("complete", function (d) {
				a = d
			});
			c.get();
			return a
		},
		__setStylesheet : function (a) {
			var b = this.__tag;
			if (b.styleSheet) {
				b.styleSheet.cssText = a
			} else {
				var c = document.createTextNode(a);
				b.appendChild(c);
				while (b.childNodes.length > 1) {
					b.removeChild(b.firstChild)
				}
			}
		},
		__parseStylesheet : function (e) {
			var b = e.replace("\r\n", "\n").split("\n");
			var g = {};
			var c;
			for (c = 0; c < b.length; c++) {
				var a = b[c];
				if (a.trim() === "") {
					break
				}
				var f = a.splitMax("=", 2);
				if (f.length != 2) {
					continue
				}
				g[f[0]] = f[1]
			}
			var d = [];
			for (; c < b.length; c++) {
				d.push(b[c])
			}
			return {
				cssText : d.join("\n"),
				rules : g
			}
		},
		set : function (e) {
			if (!$defined(e)) {
				e = function (f) {
					return f
				}
			}
			var d = this.__cssText;
			for (var a in this.rules) {
				var b = this.rules[a].split(",");
				var c = e.pass(b);
				d = d.replaceAll("$(" + a + ")", c)
			}
			this.__setStylesheet(d)
		}
	});
qwebirc.xdomain.Poller = new Class({
		initialize : function (a) {
			this._callback = a;
			this._poll.periodical(100, this);
			this._lastValue = null;
			this._counter = -1
		},
		_poll : function () {
			var f = window.location.href;
			if (f === null || f === undefined || f == this._lastValue) {
				return
			}
			this._lastValue = f;
			var c = f.splitMax("#", 2)[1];
			if (c === undefined || c.substr(0, 6) != "qwmsg:") {
				return
			}
			var e = c.substr(6).split(":", 3);
			var b = parseInt(e[0]);
			if (b <= this._counter) {
				return
			}
			this._counter = b;
			var a = parseInt(e[1]);
			var d = decodeURIComponent(e[2]);
			if (a != d.length) {
				return
			}
			d = d.replaceAll("\000", "").replaceAll("\n", "").replaceAll("\r", "");
			this._callback(d)
		}
	});
qwebirc.ui.ConnectPane = new Class({
		Implements : [Events],
		initialize : function (h, k) {
			var i = k.callback,
			b = k.initialNickname,
			e = k.initialChannels,
			j = k.networkName,
			f = k.autoConnect,
			d = k.autoNick;
			this.options = k;
			this.__windowName = "authgate_" + Math.floor(Math.random() * 100000);
			var g = function () {
				h.set("html", '<div class="loading">Loading. . .</div>')
			};
			var c = g.delay(500);
			var a = qwebirc.ui.RequestTransformHTML({
					url : qwebirc.global.staticBaseURL + "panes/connect.html",
					update : h,
					onSuccess : function () {
						$clear(c);
						var p = (f ? "confirm" : "login");
						var l = h.getElement("[name=" + p + "box]");
						this.rootElement = l;
						this.util.exec = function (r, q) {
							l.getElements(r).each(q)
						};
						var o = this.util;
						var n = o.exec;
						o.makeVisible(l);
						n("[name=nickname]", o.setText(b));
						n("[name=channels]", o.setText(e));
						n("[name=prettychannels]", function (q) {
							this.__buildPrettyChannels(q, e)
						}
							.bind(this));
						n("[name=networkname]", o.setText(j));
						var m = "connect";
						if (f) {
							if (!d) {
								n("[name=nickselected]", o.makeVisible)
							}
							this.__validate = this.__validateConfirmData
						} else {
							if (!b) {
								m = "nickname"
							} else {
								if (b && !e) {
									m = "channels"
								}
							}
							this.__validate = this.__validateLoginData
						}
						if (qwebirc.auth.loggedin()) {
							n("[name=authname]", o.setText(qwebirc.auth.loggedin()));
							n("[name=connectbutton]", o.makeVisible);
							n("[name=loginstatus]", o.makeVisible)
						} else {
							if (qwebirc.ui.isAuthRequired()) {
								n("[name=loginconnectbutton]", o.makeVisible);
								if (m == "connect") {
									m = "loginconnect"
								}
							} else {
								n("[name=connectbutton]", o.makeVisible);
								n("[name=loginbutton]", o.makeVisible)
							}
						}
						if (window == window.top) {
							n("[name=" + m + "]", o.focus)
						}
						n("[name=connect]", o.attachClick(this.__connect.bind(this)));
						n("[name=loginconnect]", o.attachClick(this.__loginConnect.bind(this)));
						n("[name=login]", o.attachClick(this.__login.bind(this)))
					}
					.bind(this)
				});
			a.get()
		},
		util : {
			makeVisible : function (a) {
				a.setStyle("display", "")
			},
			setVisible : function (a) {
				return function (b) {
					b.setStyle("display", a ? "" : "none")
				}
			},
			focus : function (a) {
				a.focus()
			},
			attachClick : function (a) {
				return function (b) {
					b.addListener("click", a)
				}
			},
			setText : function (a) {
				return function (b) {
					if (typeof b.value === "undefined") {
						b.set("text", a)
					} else {
						b.value = a === null ? "" : a
					}
				}
			}
		},
		validate : function () {
			return this.__validate()
		},
		__connect : function (b) {
			new Event(b).stop();
			var a = this.validate();
			if (a === false) {
				return
			}
			this.__cancelLogin();
			this.fireEvent("close");
			this.options.callback(a)
		},
		__cancelLogin : function (a) {
			if (this.__cancelLoginCallback) {
				this.__cancelLoginCallback(a)
			}
		},
		__loginConnect : function (a) {
			new Event(a).stop();
			if (this.validate() === false) {
				return
			}
			this.__performLogin(function () {
				var b = this.validate();
				if (b === false) {
					this.util.exec("[name=connectbutton]", this.util.setVisible(true));
					return
				}
				this.fireEvent("close");
				this.options.callback(b)
			}
				.bind(this), "loginconnectbutton")
		},
		__login : function (a) {
			new Event(a).stop();
			this.__cancelLogin(true);
			this.__performLogin(function () {
				var c = "connect";
				if (!this.options.autoConnect) {
					var b = this.rootElement.getElement("input[name=nickname]").value,
					d = this.rootElement.getElement("input[name=channels]").value;
					if (!b) {
						c = "nickname"
					} else {
						if (!d) {
							c = "channels"
						}
					}
				}
				this.util.exec("[name=" + c + "]", this.util.focus)
			}
				.bind(this), "login")
		},
		__performLogin : function (e, b) {
			Cookie.write("jslogin", "1");
			var a = window.open("/auth", this.__windowName, "status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=0,scrollbars=1,height=280,width=550");
			if (a === null || a === undefined) {
				Cookie.dispose("jslogin");
				return
			}
			var c = function () {
				if (a.closed) {
					this.__cancelLoginCallback()
				}
			}
			.bind(this);
			var d = c.periodical(100);
			this.__cancelLoginCallback = function (f) {
				$clear(d);
				Cookie.dispose("jslogin");
				try {
					a.close()
				} catch (g) {}

				if (!f) {
					this.util.exec("[name=loggingin]", this.util.setVisible(false));
					this.util.exec("[name=" + b + "]", this.util.setVisible(true))
				}
				this.__cancelLoginCallback = null
			}
			.bind(this);
			this.util.exec("[name=loggingin]", this.util.setVisible(true));
			this.util.exec("[name=" + b + "]", this.util.setVisible(false));
			__qwebircAuthCallback = function (k, h, f) {
				this.__cancelLoginCallback(true);
				var g = new Date().getTime();
				var j = (f * 1000) - g;
				var i = h * 1000 - j;
				Cookie.write("ticketexpiry", i);
				this.util.exec("[name=loggingin]", this.util.setVisible(false));
				this.util.exec("[name=loginstatus]", this.util.setVisible(true));
				this.util.exec("[name=authname]", this.util.setText(k));
				e()
			}
			.bind(this)
		},
		__validateConfirmData : function () {
			return {
				nickname : this.options.initialNickname,
				autojoin : this.options.initialChannels
			}
		},
		__validateLoginData : function () {
			var a = this.rootElement.getElement("input[name=nickname]"),
			d = this.rootElement.getElement("input[name=channels]");
			var b = a.value;
			var f = d.value;
			if (f == "#") {
				f = ""
			}
			if (!b) {
				alert("You must supply a nickname.");
				a.focus();
				return false
			}
			var e = qwebirc.global.nicknameValidator.validate(b);
			if (e != b) {
				a.value = e;
				alert("Your nickname was invalid and has been corrected; please check your altered nickname and try again.");
				a.focus();
				return false
			}
			var c = {
				nickname : b,
				autojoin : f
			};
			return c
		},
		__buildPrettyChannels : function (d, a) {
			var e = a.split(" ")[0].split(",");
			d.appendChild(document.createTextNode("channel" + ((e.length > 1) ? "s" : "") + " "));
			for (var b = 0; b < e.length; b++) {
				if ((e.length > 1) && (b == e.length - 1)) {
					d.appendChild(document.createTextNode(" and "))
				} else {
					if (b > 0) {
						d.appendChild(document.createTextNode(", "))
					}
				}
				d.appendChild(new Element("b").set("text", e[b]))
			}
		}
	});
qwebirc.ui.LoginBox2 = function (b, g, f, a, d) {
	var c = new Element("input", {
			type : "submit"
		});
	c.set("value", "Connect");
	var e = createRow(undefined, c);
	form.addEvent("submit", function (j) {
		new Event(j).stop();
		var h = nick.value;
		var l = chan.value;
		if (l == "#") {
			l = ""
		}
		if (!h) {
			alert("You must supply a nickname.");
			nick.focus();
			return
		}
		var k = qwebirc.global.nicknameValidator.validate(h);
		if (k != h) {
			nick.value = k;
			alert("Your nickname was invalid and has been corrected; please check your altered nickname and press Connect again.");
			nick.focus();
			return
		}
		var i = {
			nickname : h,
			autojoin : l
		};
		if (qwebirc.auth.enabled()) {
			if (qwebirc.auth.passAuth() && authCheckBox.checked) {
				if (!usernameBox.value || !passwordBox.value) {
					alert("You must supply your username and password in auth mode.");
					if (!usernameBox.value) {
						usernameBox.focus()
					} else {
						passwordBox.focus()
					}
					return
				}
				i.serverPassword = usernameBox.value + " " + passwordBox.value
			} else {
				if (qwebirc.auth.bouncerAuth()) {
					if (!passwordBox.value) {
						alert("You must supply a password.");
						passwordBox.focus();
						return
					}
					i.serverPassword = passwordBox.value
				}
			}
		}
		b.removeChild(outerbox);
		g(i)
	}
		.bind(this));
	nick.set("value", f);
	chan.set("value", a);
	if (window == window.top) {
		nick.focus()
	}
};
qwebirc.ui.authShowHide = function (d, g, b, c, a) {
	var f = d.checked;
	var e = f ? null : "none";
	c.setStyle("display", e);
	a.setStyle("display", e);
	if (f) {
		b.focus()
	}
};
qwebirc.ui.isAuthRequired = (function () {
	var a = qwebirc.util.parseURI(String(document.location));
	var b = $defined(a) && a.authrequired;
	return function () {
		return b && qwebirc.auth.enabled()
	}
})();
qwebirc.ui.EmbedWizardStep = new Class({
		Implements : [Options, Events],
		options : {
			title : "",
			first : "",
			hint : "",
			middle : null,
			premove : null,
			example : ""
		},
		initialize : function (b, a) {
			this.setOptions(a);
			this.parent = b
		},
		show : function () {
			this.parent.title.set("html", this.options.title);
			this.parent.firstRow.set("html", this.options.first);
			this.parent.hint.set("html", this.options.hint);
			this.parent.example.set("text", this.options.example);
			while (this.parent.middleRow.childNodes.length > 0) {
				this.parent.middleRow.removeChild(this.parent.middleRow.childNodes[0])
			}
			if ($defined(this.options.middle)) {
				this.parent.middleRow.appendChild(this.options.middle)
			}
			this.fireEvent("show")
		}
	});
qwebirc.ui.EmbedWizard = new Class({
		Implements : [Options, Events],
		options : {
			uiOptions : null,
			optionsCallback : null,
			baseURL : "http://webchat.quakenet.org/"
		},
		initialize : function (b, a) {
			this.options.uiOptions = a.uiOptions;
			this.options.baseURL = a.baseURL;
			this.options.optionsCallback = a.optionsCallback;
			this.create(b);
			this.addSteps()
		},
		create : function (e) {
			this.t = e;
			var f = this.newRow();
			this.title = new Element("h2");
			this.title.setStyle("margin-top", "0px");
			this.title.setStyle("margin-bottom", "5px");
			f.appendChild(this.title);
			this.firstRow = this.newRow();
			this.middleRow = this.newRow();
			var b = this.newRow();
			this.hint = new Element("div");
			this.hint.setStyle("font-size", "0.8em");
			this.hint.setStyle("font-style", "italic");
			b.appendChild(this.hint);
			var g = this.newRow();
			this.example = new Element("pre");
			g.appendChild(this.example);
			var d = this.newRow();
			d.addClass("wizardcontrols");
			var c = new Element("input");
			c.type = "submit";
			c.value = "< Back";
			c.addEvent("click", this.back.bind(this));
			d.appendChild(c);
			var a = new Element("input");
			a.type = "submit";
			a.value = "Next >";
			d.appendChild(a);
			a.addEvent("click", this.next.bind(this));
			this.nextBtn = a;
			this.backBtn = c
		},
		newRow : function () {
			var a = new Element("div");
			this.t.appendChild(a);
			return a
		},
		newStep : function (a) {
			return new qwebirc.ui.EmbedWizardStep(this, a)
		},
		newRadio : function (d, g, b, c) {
			var f = new Element("div");
			d.appendChild(f);
			var h = qwebirc.util.generateID();
			var e = qwebirc.util.createInput("radio", f, b, c, h);
			var a = new Element("label", {
					"for" : h
				});
			a.appendChild(document.createTextNode(g));
			f.appendChild(a);
			return e
		},
		addSteps : function () {
			var f = function (h) {
				if (Browser.Engine.trident) {
					var i = function () {
						this.focus();
						if (h) {
							this.select()
						}
					};
					i.delay(100, this, [])
				} else {
					this.focus();
					this.select()
				}
			};
			this.welcome = this.newStep({
					title : "Add webchat to your website",
					first : "This wizard will help you create an embedded client by asking you questions then giving you the code to add to your website.<br/><br/>You can use the <b>Next</b> and <b>Back</b> buttons to navigate through the wizard; click <b>Next</b> to continue."
				});
			this.chanBox = new Element("input");
			this.chanBox.addClass("text");
			this.chans = this.newStep({
					title : "Set channels",
					first : "Enter the channels you would like the client to join on startup:",
					hint : "You can supply multiple channels by seperating them with a comma, e.g.:",
					example : "#rogue,#eu-mage",
					middle : this.chanBox
				}).addEvent("show", f.bind(this.chanBox));
			var g = new Element("div");
			this.customnick = this.newStep({
					title : "Choose a nickname mode",
					first : "At startup would you like the client to use a random nickname, a preset nickname or a nickname of the users choice?",
					hint : "It is recommended that you only use a preset nickname if the client is for your own personal use.",
					middle : g
				});
			this.choosenick = this.newRadio(g, "Make the user choose a nickname.", "nick", true);
			this.randnick = this.newRadio(g, "Use a random nickname, e.g. qwebirc12883.", "nick");
			this.presetnick = this.newRadio(g, "Use a preset nickname of your choice.", "nick");
			var e = new Element("form");
			this.connectdialog = this.newStep({
					title : "Display connect dialog?",
					first : "Do you want the user to be shown the connect dialog (with the values you have supplied pre-entered) or just a connect confirmation?",
					middle : e,
					hint : "You need to display the dialog if you want the user to be able to set their nickname before connecting."
				});
			var b = new Element("div");
			this.currentLF = this.newRadio(b, "Use the current look and feel (", "lookandfeel", true);
			var c = new Element("input");
			c.type = "submit";
			c.value = "alter";
			c.addEvent("click", this.options.optionsCallback);
			b.firstChild.appendChild(c);
			b.firstChild.appendChild(document.createTextNode(")."));
			this.defaultLF = this.newRadio(b, "Use the default look and feel.", "lookandfeel");
			this.lookandfeel = this.newStep({
					title : "Configure look and feel",
					first : "The look and feel will be copied from the current settings.",
					middle : b
				});
			var d = this.newRadio(e, "Connect without displaying the dialog.", "prompt", true);
			this.connectdialogr = this.newRadio(e, "Show the connect dialog.", "prompt");
			this.nicknameBox = new Element("input");
			this.nicknameBox.addClass("text");
			this.nickname = this.newStep({
					title : "Set nickname",
					first : "Enter the nickname you would like the client to use by default:",
					premove : function () {
						if (this.nicknameBox.value == "") {
							alert("You must supply a nickname.");
							this.nicknameBox.focus();
							return false
						}
						var h = qwebirc.global.nicknameValidator.validate(this.nicknameBox.value, true);
						if (h != this.nicknameBox.value) {
							this.nicknameBox.value = h;
							alert("The supplied nickname was invalid and has been corrected.");
							this.nicknameBox.focus();
							return false
						}
						return true
					}
					.bind(this),
					middle : this.nicknameBox,
					hint : "If you use a . (dot/period) then it will be substituted with a random number."
				}).addEvent("show", f.bind(this.nicknameBox));
			var a = new Element("div");
			this.finish = this.newStep({
					title : "Finished!",
					first : "Your custom link is:",
					middle : a
				}).addEvent("show", function () {
					var k = new Element("a");
					var h = new Element("input");
					h.addClass("iframetext");
					var i = this.generateURL(false);
					k.href = i;
					k.target = "_blank";
					k.appendChild(document.createTextNode(i));
					h.value = '<iframe src="' + i + '" width="647" height="400"></iframe>';
					var j = [k, new Element("br"), new Element("br"), document.createTextNode("You can embed this into your page with the following code:"), new Element("br"), h];
					while (a.childNodes.length > 0) {
						a.removeChild(a.childNodes[0])
					}
					j.forEach(function (l) {
						a.appendChild(l)
					});
					f.bind(h)(true);
					h.addEvent("click", function () {
						this.select()
					}
						.bind(h))
				}
					.bind(this));
			this.updateSteps();
			this.step = 0;
			this.showStep()
		},
		updateSteps : function () {
			this.steps = [this.welcome, this.customnick];
			if (this.presetnick.checked) {
				this.steps.push(this.nickname)
			}
			this.steps.push(this.chans);
			if (this.chanBox.value != "" && !this.choosenick.checked) {
				this.steps.push(this.connectdialog)
			}
			this.steps.push(this.lookandfeel);
			this.steps.push(this.finish)
		},
		showStep : function () {
			this.backBtn.disabled = !(this.step > 0);
			this.nextBtn.value = (this.step >= this.steps.length - 1) ? "Close" : "Next >";
			this.steps[this.step].show()
		},
		next : function () {
			var a = this.steps[this.step].options.premove;
			if (a && !a()) {
				return
			}
			this.updateSteps();
			if (this.step >= this.steps.length - 1) {
				this.close();
				return
			}
			this.step = this.step + 1;
			this.showStep()
		},
		close : function () {
			this.fireEvent("close")
		},
		back : function () {
			if (this.step <= 0) {
				return
			}
			this.step = this.step - 1;
			this.showStep()
		},
		generateURL : function () {
			var h = this.chanBox.value;
			var c = this.nicknameBox.value;
			var b = this.connectdialogr.checked && h != "" && !this.choosenick.checked;
			var a = [];
			if (this.presetnick.checked) {
				a.push("nick=" + escape(c))
			} else {
				if (!this.choosenick.checked) {
					a.push("randomnick=1")
				}
			}
			if (h) {
				var g = h.split(",");
				var f = [];
				g.forEach(function (d) {
					if (d.charAt(0) == "#") {
						d = d.substring(1)
					}
					f.push(d)
				});
				a.push("channels=" + escape(f.join(",")))
			}
			if (b) {
				a.push("prompt=1")
			}
			if (this.currentLF.checked) {
				var e = this.options.uiOptions.serialise();
				if (e != "") {
					a.push("uio=" + e)
				}
			}
			return qwebirc.global.baseURL + (a.length > 0 ? "?" : "") + a.join("&")
		}
	});
qwebirc.ui.supportsFocus = function () {
	var a = navigator.userAgent;
	if (!$defined(a)) {
		return [true]
	}
	if (Browser.Engine.ipod || a.indexOf("Konqueror") != -1) {
		return [false, false]
	}
	return [true]
};
qwebirc.config.DEFAULT_OPTIONS = [[1, "BEEP_ON_MENTION", "Beep when nick mentioned or on query activity (requires Flash)", true, {
			enabled : function () {
				if (!$defined(Browser.Plugins.Flash) || Browser.Plugins.Flash.version < 8) {
					return [false, false]
				}
				return [true]
			},
			applyChanges : function (b, a) {
				if (a.setBeepOnMention) {
					a.setBeepOnMention(b)
				}
			}
		}
	], [7, "FLASH_ON_MENTION", "Flash titlebar when nick mentioned or on query activity", true, {
			enabled : qwebirc.ui.supportsFocus
		}
	], [2, "DEDICATED_MSG_WINDOW", "Send privmsgs to dedicated messages window", false], [4, "DEDICATED_NOTICE_WINDOW", "Send notices to dedicated message window", false], [3, "NICK_OV_STATUS", "Show status (@/+) before nicknames in channel lines", true], [5, "ACCEPT_SERVICE_INVITES", "Automatically join channels when invited by Q", false, {
			settableByURL : false
		}
	], [6, "USE_HIDDENHOST", "Hide your hostmask when authed to Q (+x)", true, {
			settableByURL : false
		}
	], [8, "LASTPOS_LINE", "Show a last position indicator for each window", true, {
			enabled : qwebirc.ui.supportsFocus
		}
	], [9, "NICK_COLOURS", "Automatically colour nicknames", false], [10, "HIDE_JOINPARTS", "Hide JOINS/PARTS/QUITS", false], [11, "STYLE_HUE", "Adjust user interface hue", function () {
			return {
				class_ : qwebirc.config.HueOption,
				default_ : 210
			}
		}, {
			applyChanges : function (b, a) {
				a.setModifiableStylesheetValues({
					hue : b
				})
			}
		}
	], [12, "QUERY_ON_NICK_CLICK", "Query on nickname click in channel", false], [13, "SHOW_NICKLIST", "Show nickname list in channels", true], [14, "SHOW_TIMESTAMPS", "Show timestamps", true]];
qwebirc.config.DefaultOptions = null;
qwebirc.config.Input = new Class({
		initialize : function (c, b, a, d) {
			this.option = b;
			this.value = b.value;
			this.enabled = this.option.enabled;
			this.position = a;
			this.parentElement = c;
			this.parentObject = d;
			this.render()
		},
		createInput : function (d, c, a, b, e) {
			if (!$defined(c)) {
				c = this.parentElement
			}
			return qwebirc.util.createInput(d, c, a, b, this.option.id)
		},
		FE : function (a, b) {
			var c = new Element(a);
			if (!$defined(b)) {
				b = this.parentElement
			}
			b.appendChild(c);
			return c
		},
		focus : function () {
			this.mainElement.focus()
		},
		render : function () {
			this.event("render", this.mainElement)
		},
		applyChanges : function () {
			this.event("applyChanges", [this.get(), this.parentObject.optionObject.ui])
		},
		event : function (b, a) {
			if (!$defined(this.option.extras)) {
				return
			}
			var c = this.option.extras[b];
			if (!$defined(c)) {
				return
			}
			c.pass(a, this)()
		},
		cancel : function () {}

	});
qwebirc.config.TextInput = new Class({
		Extends : qwebirc.config.Input,
		render : function () {
			var a = this.createInput("text");
			this.mainElement = a;
			a.value = this.value;
			a.disabled = !this.enabled;
			this.parent()
		},
		get : function () {
			return this.mainElement.value
		}
	});
qwebirc.config.HueInput = new Class({
		Extends : qwebirc.config.Input,
		render : function () {
			var b = new Element("div");
			b.addClass("qwebirc-optionspane");
			b.addClass("hue-slider");
			this.parentElement.appendChild(b);
			var a = new Element("div");
			a.addClass("knob");
			if (Browser.Engine.trident) {
				a.setStyle("top", "0px");
				a.setStyle("background-color", "black")
			}
			b.appendChild(a);
			var c = new Slider(b, a, {
					steps : 36,
					range : [0, 369],
					wheel : true
				});
			c.set(this.value);
			this.startValue = this.value;
			c.addEvent("change", function (d) {
				this.value = d;
				this.applyChanges()
			}
				.bind(this));
			this.mainElement = b;
			if (!this.enabled) {
				c.detach()
			}
			this.parent()
		},
		get : function () {
			return this.value
		},
		cancel : function () {
			this.value = this.startValue;
			this.applyChanges()
		}
	});
qwebirc.config.CheckInput = new Class({
		Extends : qwebirc.config.Input,
		render : function () {
			var a = this.createInput("checkbox", null, null, null, this.id);
			this.mainElement = a;
			a.checked = this.value;
			a.disabled = !this.enabled;
			this.parent()
		},
		get : function () {
			return this.mainElement.checked
		}
	});
qwebirc.config.RadioInput = new Class({
		Extends : qwebirc.config.Input,
		render : function () {
			var b = this.option.options;
			this.elements = [];
			for (var a = 0; a < b.length; a++) {
				var f = this.FE("div", this.parentObject);
				var c = this.createInput("radio", f, "options_radio" + this.position, a == this.option.position);
				this.elements.push(c);
				c.disabled = !this.enabled;
				if (a == 0) {
					this.mainElement = c
				}
				f.appendChild(document.createTextNode(b[a][0]))
			}
			this.parent()
		},
		get : function () {
			for (var b = 0; b < this.elements.length; b++) {
				var a = this.elements[b];
				if (a.checked) {
					this.option.position = b;
					return this.option.options[b][1]
				}
			}
		}
	});
qwebirc.config.Option = new Class({
		initialize : function (f, e, b, d, c) {
			this.prefix = e;
			this.label = b;
			this.default_ = d;
			this.optionId = f;
			this.extras = c;
			if ($defined(c) && $defined(c.enabled)) {
				var a = c.enabled();
				this.enabled = a[0];
				if (!a[0] && a.length > 1) {
					this.default_ = a[1]
				}
			} else {
				this.enabled = true
			}
			if ($defined(c) && $defined(c.settableByURL)) {
				this.settableByURL = c.settableByURL
			} else {
				this.settableByURL = true
			}
		},
		setSavedValue : function (a) {
			if (this.enabled) {
				this.value = a
			}
		}
	});
qwebirc.config.RadioOption = new Class({
		Extends : qwebirc.config.Option,
		Element : qwebirc.config.RadioInput,
		initialize : function (f, e, b, d, c, a) {
			this.options = a.map(function (g) {
					if (typeof(g) == "string") {
						return [g, g]
					}
					return g
				});
			this.defaultposition = d;
			this.parent(f, e, b, this.options[d][1], c)
		},
		setSavedValue : function (a) {
			for (var b = 0; b < this.options.length; b++) {
				var c = this.options[b][1];
				if (a == c) {
					this.position = b;
					this.value = a;
					return
				}
			}
			this.position = this.defaultposition;
			this.value = this.default_
		}
	});
qwebirc.config.TextOption = new Class({
		Extends : qwebirc.config.Option,
		Element : qwebirc.config.TextInput
	});
qwebirc.config.CheckOption = new Class({
		Extends : qwebirc.config.Option,
		Element : qwebirc.config.CheckInput
	});
qwebirc.config.HueOption = new Class({
		Extends : qwebirc.config.Option,
		Element : qwebirc.config.HueInput
	});
qwebirc.ui.Options = new Class({
		initialize : function (a) {
			if (!$defined(qwebirc.config.DefaultOptions)) {
				this.__configureDefaults()
			}
			this.optionList = qwebirc.config.DefaultOptions.slice();
			this.optionHash = {};
			this.ui = a;
			this._setup();
			this.optionList.forEach(function (b) {
				b.setSavedValue(this._get(b));
				this.optionHash[b.prefix] = b;
				this[b.prefix] = b.value
			}
				.bind(this))
		},
		__configureDefaults : function () {
			qwebirc.config.DefaultOptions = qwebirc.config.DEFAULT_OPTIONS.map(function (i) {
					var c = i[0];
					var e = i[1];
					var h = i[2];
					var a = i[3];
					var d = i[4];
					var b = i[5];
					var g = typeof(a);
					if (g == "number") {
						return new qwebirc.config.RadioOption(c, e, h, a, d, extra)
					} else {
						var f;
						if (g == "boolean") {
							f = qwebirc.config.CheckOption
						} else {
							if (g == "function") {
								var j = a();
								f = j.class_;
								a = j.default_
							} else {
								f = qwebirc.config.TextOption
							}
						}
						return new f(c, e, h, a, d)
					}
				})
		},
		setValue : function (a, b) {
			this.optionHash[a.prefix].value = b;
			this[a.prefix] = b
		},
		getOptionList : function () {
			return this.optionList
		},
		_get : function (a) {
			return a.default_
		},
		_setup : function () {},
		flush : function () {}

	});
qwebirc.ui.OptionsPane = new Class({
		Implements : [Events],
		initialize : function (b, a) {
			this.parentElement = b;
			this.optionObject = a;
			this.createElements()
		},
		createElements : function () {
			var f = function (i, o) {
				var p = new Element(i);
				o.appendChild(p);
				return p
			};
			var m = f("table", this.parentElement);
			var b = f("tbody", m);
			this.boxList = [];
			var d = this.optionObject.getOptionList();
			for (var c = 0; c < d.length; c++) {
				var k = d[c];
				var n = f("tr", b);
				var h = f("td", n);
				k.id = qwebirc.util.generateID();
				var j = new Element("label", {
						"for" : k.id
					});
				h.appendChild(j);
				j.set("text", k.label + ":");
				var g = f("td", n);
				this.boxList.push([k, new k.Element(g, k, c, this)])
			}
			var a = f("tr", b);
			var h = f("td", a);
			var g = f("td", a);
			var e = qwebirc.util.createInput("submit", g);
			e.value = "Save";
			e.addEvent("click", function () {
				this.save();
				this.fireEvent("close")
			}
				.bind(this));
			var l = qwebirc.util.createInput("submit", g);
			l.value = "Cancel";
			l.addEvent("click", function () {
				this.cancel();
				this.fireEvent("close")
			}
				.bind(this))
		},
		save : function () {
			this.boxList.forEach(function (a) {
				var b = a[0];
				var c = a[1];
				this.optionObject.setValue(b, c.get())
			}
				.bind(this));
			this.boxList.forEach(function (a) {
				a[1].applyChanges()
			}
				.bind(this));
			this.optionObject.flush()
		},
		cancel : function () {
			this.boxList.forEach(function (a) {
				a[1].cancel()
			}
				.bind(this))
		}
	});
qwebirc.ui.CookieOptions = new Class({
		Extends : qwebirc.ui.Options,
		_setup : function () {
			this.__cookie = new Hash.Cookie("opt1", {
					duration : 3650,
					autoSave : false
				})
		},
		_get : function (a) {
			var b = this.__cookie.get(a.optionId);
			if (!$defined(b)) {
				return a.default_
			}
			return b
		},
		flush : function () {
			this.__cookie.erase();
			this._setup();
			this.getOptionList().forEach(function (a) {
				this.__cookie.set(a.optionId, a.value)
			}
				.bind(this));
			this.__cookie.save()
		}
	});
qwebirc.ui.SuppliedArgOptions = new Class({
		Extends : qwebirc.ui.CookieOptions,
		initialize : function (e, a) {
			var g = {};
			if ($defined(a) && a != "" && a.length > 2) {
				var d = a.substr(a.length - 2, 2);
				var c = qwebirc.util.b64Decode(a.substr(0, a.length - 2));
				if (c && (new qwebirc.util.crypto.MD5().digest(c).slice(0, 2) == d)) {
					var f = qwebirc.util.parseURI("?" + c);
					for (var b in f) {
						g[b] = JSON.decode(f[b], true)
					}
				}
			}
			this.parsedOptions = g;
			this.parent(e)
		},
		_get : function (a) {
			if (a.settableByURL !== true) {
				return this.parent(a)
			}
			var b = this.parsedOptions[a.optionId];
			if (!$defined(b)) {
				return this.parent(a)
			}
			return b
		},
		serialise : function () {
			var a = [];
			this.getOptionList().forEach(function (d) {
				if (d.settableByURL && d.default_ != d.value) {
					a.push(d.optionId + "=" + JSON.encode(d.value))
				}
			}
				.bind(this));
			var b = a.join("&");
			var c = new qwebirc.util.crypto.MD5().digest(b).slice(0, 2);
			return (qwebirc.util.b64Encode(b)).replaceAll("=", "") + c
		}
	});
qwebirc.ui.DefaultOptionsClass = new Class({
		Extends : qwebirc.ui.SuppliedArgOptions
	});
qwebirc.ui.AboutPane = new Class({
		Implements : [Events],
		initialize : function (b) {
			var d = function () {
				b.set("html", '<div class="loading">Loading. . .</div>')
			};
			var a = d.delay(500);
			var c = qwebirc.ui.RequestTransformHTML({
					url : qwebirc.global.staticBaseURL + "panes/about.html",
					update : b,
					onSuccess : function () {
						$clear(a);
						b.getElement("input[class=close]").addEvent("click", function () {
							this.fireEvent("close")
						}
							.bind(this));
						b.getElement("div[class=version]").set("text", "v" + qwebirc.VERSION)
					}
					.bind(this)
				});
			c.get()
		}
	});
qwebirc.ui.PrivacyPolicyPane = new Class({
		Implements : [Events],
		initialize : function (b) {
			var d = function () {
				b.set("html", '<div class="loading">Loading. . .</div>')
			};
			var a = d.delay(500);
			var c = qwebirc.ui.RequestTransformHTML({
					url : qwebirc.global.staticBaseURL + "panes/privacypolicy.html",
					update : b,
					onSuccess : function () {
						$clear(a);
						b.getElement("input[class=close]").addEvent("click", function () {
							this.fireEvent("close")
						}
							.bind(this))
					}
					.bind(this)
				});
			c.get()
		}
	});
qwebirc.ui.FeedbackPane = new Class({
		Implements : [Events],
		initialize : function (b) {
			this.textboxVisible = false;
			var d = function () {
				b.set("html", '<div class="loading">Loading. . .</div>')
			};
			var a = d.delay(500);
			this.addEvent("select", this.onSelect);
			var c = qwebirc.ui.RequestTransformHTML({
					url : qwebirc.global.staticBaseURL + "panes/feedback.html",
					update : b,
					onSuccess : function () {
						$clear(a);
						b.getElement("input[class=close]").addEvent("click", function () {
							this.fireEvent("close")
						}
							.bind(this));
						b.getElement("input[class=close2]").addEvent("click", function () {
							this.fireEvent("close")
						}
							.bind(this));
						var e = b.getElement("textarea");
						this.textbox = e;
						b.getElement("input[class=submitfeedback]").addEvent("click", function () {
							this.sendFeedback(b, e, e.value)
						}
							.bind(this));
						this.textboxVisible = true;
						this.onSelect()
					}
					.bind(this)
				});
			c.get()
		},
		onSelect : function () {
			if (this.textboxVisible) {
				this.textbox.focus()
			}
		},
		sendFeedback : function (k, j, m) {
			m = m.replace(/^\s*/, "").replace(/\s*$/, "");
			var l = k.getElement("p[class=maintext]");
			if (m.length < 25) {
				l.set("text", "I don't suppose you could enter a little bit more? Thanks!");
				j.focus();
				return
			}
			this.textboxVisible = false;
			var f = k.getElement("div[class=enterarea]");
			f.setStyle("display", "none");
			var c = k.getElement("div[class=messagearea]");
			var h = k.getElement("p[class=messagetext]");
			var b = k.getElement("input[class=close2]");
			h.set("text", "Submitting. . .");
			c.setStyle("display", "");
			var g = 0;
			var e = encodeURIComponent(m);
			for (var d = 0; d < m.length; d++) {
				g = ((g + 1) % 256)^(m.charCodeAt(d) % 256)
			}
			var a = new Request({
					url : qwebirc.global.dynamicBaseURL + "feedback",
					onSuccess : function () {
						h.set("text", "Submitted successfully, thanks for the feedback!");
						b.setStyle("display", "")
					},
					onFailure : function () {
						this.textboxVisible = true;
						c.setStyle("display", "none");
						f.setStyle("display", "");
						l.set("text", "Looks like something went wrong submitting :(")
					}
					.bind(this)
				}).send("feedback=" + m + "&c=" + g)
		}
	});
qwebirc.ui.FAQPane = new Class({
		Implements : [Events],
		initialize : function (b) {
			var d = function () {
				b.set("html", '<div class="loading">Loading. . .</div>')
			};
			var a = d.delay(500);
			var c = qwebirc.ui.RequestTransformHTML({
					url : qwebirc.global.staticBaseURL + "panes/faq.html",
					update : b,
					onSuccess : function () {
						$clear(a);
						b.getElement("input[class=close]").addEvent("click", function () {
							this.fireEvent("close")
						}
							.bind(this))
					}
					.bind(this)
				});
			c.get()
		}
	});
function qwebirc_ui_onbeforeunload(b) {
	if (qwebirc.connected) {
		var a = "This action will close all active IRC connections.";
		var b = b || window.event;
		if (b) {
			b.returnValue = a
		}
		return a
	}
}
qwebirc.ui.Interface = new Class({
		Implements : [Options],
		options : {
			initialNickname : "qwebirc" + Math.ceil(Math.random() * 100000),
			initialChannels : "",
			networkName : "ExampleNetwork",
			networkServices : [],
			loginRegex : null,
			appTitle : "ExampleNetwork Web IRC",
			searchURL : true,
			theme : undefined,
			baseURL : null,
			hue : null,
			saturation : null,
			lightness : null,
			thue : null,
			tsaturation : null,
			tlightness : null,
			uiOptionsArg : null,
			nickValidation : null,
			dynamicBaseURL : "/",
			staticBaseURL : "/"
		},
		initialize : function (b, c, a) {
			this.setOptions(a);
			var d = function (e) {
				var f = e.indexOf("?");
				if (f != -1) {
					e = e.substring(0, f)
				}
				var f = e.indexOf("#");
				if (f != -1) {
					e = e.substring(0, f)
				}
				if (e.substr(e.length - 1) != "/") {
					e = e + "/"
				}
				return e
			};
			a.baseURL = d(document.location.href);
			qwebirc.global = {
				dynamicBaseURL : a.dynamicBaseURL,
				staticBaseURL : a.staticBaseURL,
				baseURL : a.baseURL,
				nicknameValidator : $defined(a.nickValidation) ? new qwebirc.irc.NicknameValidator(a.nickValidation) : new qwebirc.irc.DummyNicknameValidator()
			};
			window.addEvent("domready", function () {
				var v = function (p) {
					var i = new qwebirc.irc.IRCClient(p, s);
					i.connect();
					window.onbeforeunload = qwebirc_ui_onbeforeunload;
					window.addEvent("unload", function () {
						i.quit("Page closed")
					})
				};
				var x = null;
				var l = this.options.initialChannels;
				var n = false;
				if (this.options.searchURL) {
					var q = qwebirc.util.parseURI(String(document.location));
					this.options.hue = this.getHueArg(q, "");
					this.options.saturation = this.getSaturationArg(q, "");
					this.options.lightness = this.getLightnessArg(q, "");
					this.options.thue = this.getHueArg(q, "t");
					this.options.tsaturation = this.getSaturationArg(q, "t");
					this.options.tlightness = this.getLightnessArg(q, "t");
					if ($defined(q.uio)) {
						this.options.uiOptionsArg = q.uio
					}
					var h = q.url;
					var g,
					f = q.nick;
					if ($defined(h)) {
						l = this.parseIRCURL(h);
						if ($defined(g) && g != "") {
							o = true
						}
					} else {
						g = q.channels;
						var o = false;
						if (g) {
							var u = g.split(" ");
							g = u[0].split(",");
							var t = [];
							for (var m = 0; m < g.length; m++) {
								t[m] = g[m];
								if (g[m].charAt(0) != "#") {
									t[m] = "#" + t[m]
								}
							}
							u[0] = t.join(",");
							l = u.join(" ");
							o = true
						}
					}
					if ($defined(f)) {
						x = this.randSub(f)
					}
					if (q.randomnick && q.randomnick == 1) {
						x = this.options.initialNickname
					}
					if (o && (!$defined(x) || ($defined(x) && (x != "")))) {
						var k = q.prompt;
						var r = false;
						if (!$defined(k) || k == "") {
							r = true;
							k = false
						} else {
							if (k == "0") {
								k = false
							} else {
								k = true
							}
						}
						if ($defined(x) && !k) {
							n = true
						} else {
							if (!r && !k) {
								n = true
							}
						}
					}
				}
				var s = new c($(b), new qwebirc.ui.Theme(this.options.theme), this.options);
				var j = !$defined(f);
				if (j && n) {
					x = this.options.initialNickname
				}
				var e = s.loginBox(v, x, l, n, j)
			}
				.bind(this))
		},
		getHueArg : function (b, c) {
			var a = b[c + "hue"];
			if (!$defined(a)) {
				return null
			}
			a = parseInt(a);
			if (a > 360 || a < 0) {
				return null
			}
			return a
		},
		getSaturationArg : function (a, b) {
			var c = a[b + "saturation"];
			if (!$defined(c)) {
				return null
			}
			c = parseInt(c);
			if (c > 100 || c < -100) {
				return null
			}
			return c
		},
		getLightnessArg : function (a, b) {
			var c = a[b + "lightness"];
			if (!$defined(c)) {
				return null
			}
			c = parseInt(c);
			if (c > 100 || c < -100) {
				return null
			}
			return c
		},
		randSub : function (a) {
			var b = function () {
				return Math.floor(Math.random() * 10)
			};
			return a.split("").map(function (c) {
				if (c == ".") {
					return b()
				} else {
					return c
				}
			}).join("")
		},
		parseIRCURL : function (a) {
			if (a.indexOf(":") == 0) {
				return
			}
			var d = a.splitMax(":", 2);
			if (d[0].toLowerCase() != "irc" && d[0].toLowerCase() != "ircs") {
				alert("Bad IRC URL scheme.");
				return
			}
			if (a.indexOf("/") == 0) {
				return
			}
			var j = a.splitMax("/", 4);
			if (j.length < 4 || j[3] == "") {
				return
			}
			var h,
			b;
			if (j[3].indexOf("?") > -1) {
				b = qwebirc.util.parseURI(j[3]);
				h = j[3].splitMax("?", 2)[0]
			} else {
				h = j[3]
			}
			var c = h.split(",");
			var g = c[0];
			if (g.charAt(0) != "#") {
				g = "#" + g
			}
			var k = [],
			f = false,
			n;
			for (var e = 1; e < c.length; e++) {
				var m = c[e];
				if (m == "needkey") {
					f = true
				} else {
					k.push(m)
				}
			}
			if ($defined(b)) {
				for (var l in b) {
					var m = b[l];
					if (l == "key") {
						n = m;
						f = true
					} else {
						k.push(l)
					}
				}
			}
			if (f) {
				if (!$defined(n)) {
					n = prompt("Please enter the password for channel " + g + ":")
				}
				if ($defined(n)) {
					g = g + " " + n
				}
			}
			if (k.length > 0) {
				alert("The following IRC URL components were not accepted: " + k.join(", ") + ".")
			}
			return g
		}
	});
qwebirc.auth.loggedin = function () {
	var a = Cookie.read("user");
	var b = Cookie.read("ticketexpiry");
	if (b && new Date().getTime() > b - (5 * 60 * 1000)) {
		return
	}
	return a
};
qwebirc.auth.enabled = function () {
	return true
};
qwebirc.auth.quakeNetAuth = function () {
	return true
};
qwebirc.auth.passAuth = function () {
	return false
};
qwebirc.auth.bouncerAuth = function () {
	return false
};
qwebirc.sound.domReady = false;
window.addEvent("domready", function () {
	qwebirc.sound.domReady = true
});
qwebirc.sound.SoundPlayer = new Class({
		Implements : [Events],
		initialize : function () {
			this.loadingSWF = false;
			this.loadedSWF = false;
			var a = qwebirc.global.staticBaseURL;
			if (qwebirc.global.baseURL.substr(qwebirc.global.baseURL.length - 1, 1) == "/" && a.substr(0, 1) == "/") {
				a = a.substr(1)
			}
			this.soundURL = qwebirc.global.baseURL + a + "sound/"
		},
		go : function () {
			if (qwebirc.sound.domReady) {
				this.loadSoundManager()
			} else {
				window.addEvent("domready", function () {
					this.loadSoundManager()
				}
					.bind(this))
			}
		},
		loadSoundManager : function () {
			if (this.loadingSWF) {
				return
			}
			this.loadingSWF = true;
			var a = false;
			window.soundManager = new SoundManager();
			var b = qwebirc.global.staticBaseURL;
			if (qwebirc.global.baseURL.substr(-1) == "/" && b.substr(0, 1) == "/") {
				b = b.substr(1)
			}
			window.soundManager.url = this.soundURL;
			window.soundManager.debugMode = a;
			window.soundManager.useConsole = a;
			window.soundManager.onload = function () {
				this.loadedSWF = true;
				this.fireEvent("ready")
			}
			.bind(this);
			window.soundManager.beginDelayedInit()
		},
		createSound : function (a, b) {
			soundManager.createSound(a, b)
		},
		playSound : function (a) {
			soundManager.play(a)
		},
		beep : function () {
			if (!this.beepLoaded) {
				this.createSound("beep", this.soundURL + "beep3.mp3");
				this.beepLoaded = true
			}
			this.playSound("beep")
		}
	});
qwebirc.ui.QUI = new Class({
		Extends : qwebirc.ui.RootUI,
		initialize : function (a, c, b) {
			this.parent(a, qwebirc.ui.QUI.Window, "qui", b);
			this.theme = c;
			this.parentElement = a;
			this.setModifiableStylesheet("qui")
		},
		postInitialize : function () {
			this.qjsui = new qwebirc.ui.QUI.JSUI("qwebirc-qui", this.parentElement);
			this.qjsui.addEvent("reflow", function () {
				var a = this.getActiveWindow();
				if ($defined(a)) {
					a.onResize()
				}
			}
				.bind(this));
			this.qjsui.top.addClass("outertabbar");
			this.qjsui.bottom.addClass("input");
			this.qjsui.right.addClass("nicklist");
			this.qjsui.topic.addClass("topic");
			this.qjsui.middle.addClass("lines");
			this.outerTabs = this.qjsui.top;
			this.tabs = new Element("div");
			this.tabs.addClass("tabbar");
			this.__createDropdownMenu();
			this.outerTabs.appendChild(this.tabs);
			this.origtopic = this.topic = this.qjsui.topic;
			this.origlines = this.lines = this.qjsui.middle;
			this.orignicklist = this.nicklist = this.qjsui.right;
			this.input = this.qjsui.bottom;
			this.reflow = this.qjsui.reflow.bind(this.qjsui);
			this.tabs.addEvent("mousewheel", function (a) {
				var b = new Event(a);
				if (b.wheel > 0) {
					this.nextWindow()
				} else {
					if (b.wheel < 0) {
						this.prevWindow()
					}
				}
				b.stop()
			}
				.bind(this));
			this.createInput();
			this.reflow();
			this.reflow.delay(100);
			this.__createDropdownHint.delay(100, this)
		},
		__createDropdownMenu : function () {
			var a = new Element("span");
			a.addClass("dropdownmenu");
			a.hide = function () {
				a.setStyle("display", "none");
				a.visible = false;
				document.removeEvent("mousedown", b)
			}
			.bind(this);
			var b = function () {
				a.hide()
			};
			a.hide();
			this.parentElement.appendChild(a);
			this.UICommands.forEach(function (f) {
				var i = f[0];
				var g = this[f[1] + "Window"].bind(this);
				var h = new Element("a");
				h.addEvent("mousedown", function (j) {
					new Event(j).stop()
				});
				h.addEvent("click", function () {
					a.hide();
					g()
				});
				h.set("text", i);
				a.appendChild(h)
			}
				.bind(this));
			var d = new Element("div");
			d.addClass("dropdown-tab");
			d.appendChild(new Element("img", {
					src : qwebirc.global.staticBaseURL + "images/icon.png",
					title : "menu",
					alt : "menu"
				}));
			d.setStyle("opacity", 1);
			var c = new Fx.Tween(d, {
					duration : "long",
					property : "opacity",
					link : "chain"
				});
			c.start(0.25);
			c.start(1);
			c.start(0.33);
			c.start(1);
			this.outerTabs.appendChild(d);
			a.show = function (e) {
				new Event(e).stop();
				this.hideHint();
				if (a.visible) {
					a.hide();
					return
				}
				var f = this.outerTabs.getSize().y;
				a.setStyle("left", 0);
				a.setStyle("top", f - 1);
				a.setStyle("display", "inline-block");
				a.visible = true;
				document.addEvent("mousedown", b)
			}
			.bind(this);
			d.addEvent("mousedown", function (f) {
				new Event(f).stop()
			});
			d.addEvent("click", a.show)
		},
		__createDropdownHint : function () {
			var b = new Element("div");
			b.addClass("dropdownhint");
			b.set("text", "Click the icon for the main menu.");
			b.setStyle("top", this.outerTabs.getSize().y + 5);
			this.parentElement.appendChild(b);
			new Fx.Morph(b, {
				duration : "normal",
				transition : Fx.Transitions.Sine.easeOut
			}).start({
				left : [900, 5]
			});
			var c = function () {
				new Fx.Morph(b, {
					duration : "long"
				}).start({
					left : [5, -900]
				})
			}
			.delay(4000, this);
			var a = function () {
				if (b.hidden) {
					return
				}
				this.parentElement.removeChild(b);
				b.hidden = 1
			}
			.bind(this);
			a.delay(4000);
			this.hideHint = a;
			document.addEvent("mousedown", a);
			document.addEvent("keypress", a)
		},
		createInput : function () {
			var d = new Element("form");
			this.input.appendChild(d);
			d.addClass("input");
			var b = new Element("input");
			d.appendChild(b);
			this.inputbox = b;
			this.inputbox.maxLength = 470;
			var c = function () {
				if (b.value == "") {
					return
				}
				this.resetTabComplete();
				this.getActiveWindow().historyExec(b.value);
				b.value = ""
			}
			.bind(this);
			if (!qwebirc.util.deviceHasKeyboard()) {
				b.addClass("mobile-input");
				var e = new Element("input", {
						type : "button"
					});
				e.addClass("mobile-button");
				e.addEvent("click", function () {
					c();
					b.focus()
				});
				e.value = ">";
				this.input.appendChild(e);
				var a = function () {
					var h = this.input.getSize();
					var f = e.getSize();
					var g = h.x - f.x - 5;
					e.setStyle("left", g);
					b.setStyle("width", g - 5);
					e.setStyle("height", h.y)
				}
				.bind(this);
				this.qjsui.addEvent("reflow", a)
			} else {
				b.addClass("keyboard-input")
			}
			d.addEvent("submit", function (f) {
				new Event(f).stop();
				c()
			});
			b.addEvent("focus", this.resetTabComplete.bind(this));
			b.addEvent("mousedown", this.resetTabComplete.bind(this));
			b.addEvent("keydown", function (h) {
				var g;
				var i = b.value;
				if (h.key == "up") {
					g = this.commandhistory.upLine
				} else {
					if (h.key == "down") {
						g = this.commandhistory.downLine
					} else {
						if (h.key == "tab" && !h.altKey && !h.ctrlKey && !h.shiftKey) {
							new Event(h).stop();
							this.tabComplete(b);
							return
						} else {
							this.resetTabComplete();
							return
						}
					}
				}
				this.resetTabComplete();
				if ((i != "") && (this.lastcvalue != i)) {
					this.commandhistory.addLine(i, true)
				}
				var f = g.bind(this.commandhistory)();
				new Event(h).stop();
				if (!f) {
					f = ""
				}
				this.lastcvalue = f;
				b.value = f;
				qwebirc.util.setAtEnd(b)
			}
				.bind(this))
		},
		setLines : function (a) {
			this.lines.parentNode.replaceChild(a, this.lines);
			this.qjsui.middle = this.lines = a
		},
		setChannelItems : function (b, a) {
			if (!$defined(b)) {
				b = this.orignicklist;
				a = this.origtopic
			}
			this.nicklist.parentNode.replaceChild(b, this.nicklist);
			this.qjsui.right = this.nicklist = b;
			this.topic.parentNode.replaceChild(a, this.topic);
			this.qjsui.topic = this.topic = a
		}
	});
qwebirc.ui.QUI.JSUI = new Class({
		Implements : [Events],
		initialize : function (a, b, c) {
			this.parent = b;
			this.sizer = $defined(c) ? c : b;
			this.class_ = a;
			this.create();
			this.reflowevent = null;
			window.addEvent("resize", function () {
				this.reflow(100)
			}
				.bind(this))
		},
		applyClasses : function (b, a) {
			a.addClass("dynamicpanel");
			a.addClass(this.class_);
			if (b == "middle") {
				a.addClass("leftboundpanel")
			} else {
				if (b == "top") {
					a.addClass("topboundpanel");
					a.addClass("widepanel")
				} else {
					if (b == "topic") {
						a.addClass("widepanel")
					} else {
						if (b == "right") {
							a.addClass("rightboundpanel")
						} else {
							if (b == "bottom") {
								a.addClass("bottomboundpanel");
								a.addClass("widepanel")
							}
						}
					}
				}
			}
		},
		create : function () {
			var a = function (c) {
				var b = new Element("div");
				this.applyClasses(c, b);
				this.parent.appendChild(b);
				return b
			}
			.bind(this);
			this.top = a("top");
			this.topic = a("topic");
			this.middle = a("middle");
			this.right = a("right");
			this.bottom = a("bottom")
		},
		reflow : function (a) {
			if (!a) {
				a = 1
			}
			if (this.reflowevent) {
				$clear(this.reflowevent)
			}
			this.__reflow();
			this.reflowevent = this.__reflow.delay(a, this)
		},
		__reflow : function () {
			var c = this.bottom;
			var l = this.middle;
			var k = this.right;
			var f = this.topic;
			var j = this.top;
			var i = f.getSize();
			var e = j.getSize();
			var d = k.getSize();
			var b = c.getSize();
			var h = this.sizer.getSize();
			var a = (h.y - e.y - b.y - i.y);
			var g = (h.x - d.x);
			f.setStyle("top", e.y);
			l.setStyle("top", (e.y + i.y));
			if (a > 0) {
				l.setStyle("height", a);
				k.setStyle("height", a)
			}
			if (g > 0) {
				l.setStyle("width", g)
			}
			k.setStyle("top", (e.y + i.y));
			k.setStyle("left", g);
			c.setStyle("top", (h.y - b.y));
			this.fireEvent("reflow")
		},
		showChannel : function (b, a) {
			var c = "none";
			if (b) {
				c = "block"
			}
			this.right.setStyle("display", a ? c : "none");
			this.topic.setStyle("display", c)
		},
		showInput : function (a) {
			this.bottom.isVisible = a;
			this.bottom.setStyle("display", a ? "block" : "none")
		}
	});
qwebirc.ui.QUI.Window = new Class({
		Extends : qwebirc.ui.Window,
		initialize : function (f, b, e, d, c) {
			this.parent(f, b, e, d, c);
			this.tab = new Element("a", {
					href : "#"
				});
			this.tab.addClass("tab");
			this.tab.addEvent("focus", function () {
				this.blur()
			}
				.bind(this.tab));
			this.spaceNode = document.createTextNode(" ");
			f.tabs.appendChild(this.tab);
			f.tabs.appendChild(this.spaceNode);
			this.tab.appendText(d);
			this.tab.addEvent("click", function (h) {
				new Event(h).stop();
				if (this.closed) {
					return
				}
				f.selectWindow(this)
			}
				.bind(this));
			if (e != qwebirc.ui.WINDOW_STATUS && e != qwebirc.ui.WINDOW_CONNECT) {
				var a = new Element("span");
				a.set("text", "X");
				a.addClass("tabclose");
				var g = function (h) {
					new Event(h).stop();
					if (this.closed) {
						return
					}
					if (e == qwebirc.ui.WINDOW_CHANNEL) {
						this.client.exec("/PART " + d)
					}
					this.close()
				}
				.bind(this);
				a.addEvent("click", g);
				this.tab.addEvent("mouseup", function (i) {
					var h = 1;
					if (Browser.Engine.trident) {
						h = 4
					}
					if (i.event.button == h) {
						g(i)
					}
				}
					.bind(this));
				this.tab.appendChild(a)
			}
			this.lines = new Element("div");
			this.parentObject.qjsui.applyClasses("middle", this.lines);
			this.lines.addClass("lines");
			if (e != qwebirc.ui.WINDOW_CUSTOM && e != qwebirc.ui.WINDOW_CONNECT) {
				this.lines.addClass("ircwindow")
			}
			this.lines.addEvent("scroll", function () {
				this.scrolleddown = this.scrolledDown();
				this.scrollpos = this.getScrollParent().getScroll()
			}
				.bind(this));
			if (e == qwebirc.ui.WINDOW_CHANNEL) {
				this.topic = new Element("div");
				this.topic.addClass("topic");
				this.topic.addClass("tab-invisible");
				this.topic.set("html", "&nbsp;");
				this.topic.addEvent("dblclick", this.editTopic.bind(this));
				this.parentObject.qjsui.applyClasses("topic", this.topic);
				this.prevNick = null;
				this.nicklist = new Element("div");
				this.nicklist.addClass("nicklist");
				this.nicklist.addClass("tab-invisible");
				this.nicklist.addEvent("click", this.removePrevMenu.bind(this));
				this.parentObject.qjsui.applyClasses("nicklist", this.nicklist)
			}
			if (e == qwebirc.ui.WINDOW_CHANNEL) {
				this.updateTopic("")
			}
			this.nicksColoured = this.parentObject.uiOptions.NICK_COLOURS;
			this.reflow()
		},
		rename : function (a) {
			this.tab.replaceChild(document.createTextNode(a), this.tab.firstChild)
		},
		editTopic : function () {
			if (!this.client.nickOnChanHasPrefix(this.client.nickname, this.name, "@")) {
				alert("Sorry, you need to be a channel operator to change the topic!");
				return
			}
			var a = prompt("Change topic of " + this.name + " to:", this.topic.topicText);
			if (a === null) {
				return
			}
			this.client.exec("/TOPIC " + a)
		},
		reflow : function () {
			this.parentObject.reflow()
		},
		onResize : function () {
			if (this.scrolleddown) {
				if (Browser.Engine.trident) {
					this.scrollToBottom.delay(5, this)
				} else {
					this.scrollToBottom()
				}
			} else {
				if ($defined(this.scrollpos)) {
					if (Browser.Engine.trident) {
						this.getScrollParent().scrollTo(this.scrollpos.x, this.scrollpos.y)
					} else {
						this.getScrollParent().scrollTo.delay(5, this, [this.scrollpos.x, this.scrollpos.y])
					}
				}
			}
		},
		createMenu : function (b, c) {
			var d = new Element("div");
			c.appendChild(d);
			d.addClass("menu");
			var a = [b];
			qwebirc.ui.MENU_ITEMS.forEach(function (e) {
				if (!e.predicate || e.predicate !== true && !e.predicate.apply(this, a)) {
					return
				}
				var f = new Element("a");
				d.appendChild(f);
				f.href = "#";
				f.set("text", "- " + e.text);
				f.addEvent("focus", function () {
					this.blur()
				}
					.bind(f));
				f.addEvent("click", function (g) {
					new Event(g.stop());
					this.menuClick(e.fn)
				}
					.bind(this))
			}
				.bind(this));
			return d
		},
		menuClick : function (a) {
			a.bind(this)(this.prevNick.realNick);
			this.removePrevMenu()
		},
		moveMenuClass : function () {
			if (!this.prevNick) {
				return
			}
			if (this.nicklist.firstChild == this.prevNick) {
				this.prevNick.removeClass("selected-middle")
			} else {
				this.prevNick.addClass("selected-middle")
			}
		},
		removePrevMenu : function () {
			if (!this.prevNick) {
				return
			}
			this.prevNick.removeClass("selected");
			this.prevNick.removeClass("selected-middle");
			if (this.prevNick.menu) {
				this.prevNick.removeChild(this.prevNick.menu)
			}
			this.prevNick = null
		},
		nickListAdd : function (c, b) {
			var a = this.client.stripPrefix(c);
			var g = new Element("a");
			qwebirc.ui.insertAt(b, this.nicklist, g);
			g.href = "#";
			var d = new Element("span");
			if (this.parentObject.uiOptions.NICK_COLOURS) {
				var f = a.toHSBColour(this.client);
				if ($defined(f)) {
					d.setStyle("color", f.rgbToHex())
				}
			}
			d.set("text", c);
			g.appendChild(d);
			g.realNick = a;
			g.addEvent("click", function (e) {
				if (this.prevNick == g) {
					this.removePrevMenu();
					return
				}
				this.removePrevMenu();
				this.prevNick = g;
				g.addClass("selected");
				this.moveMenuClass();
				g.menu = this.createMenu(g.realNick, g);
				new Event(e).stop()
			}
				.bind(this));
			g.addEvent("focus", function () {
				this.blur()
			}
				.bind(g));
			this.moveMenuClass();
			return g
		},
		nickListRemove : function (a, b) {
			this.nicklist.removeChild(b);
			this.moveMenuClass()
		},
		updateTopic : function (a) {
			var b = this.topic;
			while (b.firstChild) {
				b.removeChild(b.firstChild)
			}
			if (a) {
				b.topicText = a;
				this.parent(a, b)
			} else {
				b.topicText = a;
				var c = new Element("div");
				c.set("text", "(no topic set)");
				c.addClass("emptytopic");
				b.appendChild(c)
			}
			this.reflow()
		},
		select : function () {
			var b = this.type != qwebirc.ui.WINDOW_CONNECT && this.type != qwebirc.ui.WINDOW_CUSTOM;
			this.tab.removeClass("tab-unselected");
			this.tab.addClass("tab-selected");
			this.parentObject.setLines(this.lines);
			this.parentObject.setChannelItems(this.nicklist, this.topic);
			this.parentObject.qjsui.showInput(b);
			this.parentObject.qjsui.showChannel($defined(this.nicklist), this.parentObject.uiOptions.SHOW_NICKLIST);
			this.reflow();
			this.parent();
			if (b) {
				this.parentObject.inputbox.focus()
			}
			if (this.type == qwebirc.ui.WINDOW_CHANNEL && this.nicksColoured != this.parentObject.uiOptions.NICK_COLOURS) {
				this.nicksColoured = this.parentObject.uiOptions.NICK_COLOURS;
				var a = this.nicklist.childNodes;
				if (this.parentObject.uiOptions.NICK_COLOURS) {
					for (var c = 0; c < a.length; c++) {
						var g = a[c],
						d = g.firstChild;
						var f = g.realNick.toHSBColour(this.client);
						if ($defined(f)) {
							d.setStyle("color", f.rgbToHex())
						}
					}
				} else {
					for (var c = 0; c < a.length; c++) {
						var d = a[c].firstChild;
						d.setStyle("color", null)
					}
				}
			}
		},
		deselect : function () {
			this.parent();
			this.tab.removeClass("tab-selected");
			this.tab.addClass("tab-unselected")
		},
		close : function () {
			this.parent();
			this.parentObject.tabs.removeChild(this.tab);
			this.parentObject.tabs.removeChild(this.spaceNode);
			this.reflow()
		},
		addLine : function (b, a, d) {
			var c = new Element("div");
			if (d) {
				c.addClass(d)
			} else {
				if (this.lastcolour) {
					c.addClass("linestyle1")
				} else {
					c.addClass("linestyle2")
				}
			}
			this.lastcolour = !this.lastcolour;
			this.parent(b, a, d, c)
		},
		setHilighted : function (a) {
			var b = this.hilighted;
			this.parent(a);
			if (a == b) {
				return
			}
			this.tab.removeClass("tab-hilight-activity");
			this.tab.removeClass("tab-hilight-us");
			this.tab.removeClass("tab-hilight-speech");
			switch (this.hilighted) {
			case qwebirc.ui.HILIGHT_US:
				this.tab.addClass("tab-hilight-us");
				break;
			case qwebirc.ui.HILIGHT_SPEECH:
				this.tab.addClass("tab-hilight-speech");
				break;
			case qwebirc.ui.HILIGHT_ACTIVITY:
				this.tab.addClass("tab-hilight-activity");
				break
			}
		}
	});
