function Sound() {
    var _1 = 0;
    var _2 = 0;
    var _3 = new Object();
    var _4 = false;
    this.loadSound = function(_5, _6) {
        _3[_5] = $("<audio><source src=\"" + _6 + ".ogg\" type=\"audio/ogg\"><source src=\"" + _6 + ".wav\" type=\"audio/wave\"></audio>")[0]
    };
    this.play = function(_7) {
        try {
            var _8 = _3[_7];
            if (__18("sound") != "on") {
                return
            }
            if (!$.browser.opera) {
                _8.pause();
                _8.currentTime = 0;
                _8.play()
            }
        } catch(e) {}
    }
};
function __0(pA, pB) {
    var h = pB.x - pA.x;
    var v = pB.y - pA.y;
    return v / h
};
function __1(pA, pB) {
    var h = pB.x - pA.x;
    var v = pB.y - pA.y;
    return h / v
};
function __2(v) {
    return Math.atan2(v.y, v.x) + Math.PI / 2
};
function __3(v) {
    return {
        x: v.x,
        y: v.y
    }
};
function __4(pA, pB) {
    return {
        x: pB.x - pA.x,
        y: pB.y - pA.y
    }
};
function __5(v) {
    var _9 = __10(v);
    return _9 == 0 ? {
        x: 0,
        y: 0
    }: __9(v, _9)
};
function __6(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
};
function __7(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
};
function __8(v, _a) {
    return {
        x: v.x * _a,
        y: v.y * _a
    }
};
function __9(v, _b) {
    return {
        x: v.x / _b,
        y: v.y / _b
    }
};
function __10(_c) {
    return Math.sqrt(_c.x * _c.x + _c.y * _c.y)
};
function __11(pA, pB) {
    var _d = __4(pA, pB);
    return Math.sqrt(_d.x * _d.x + _d.y * _d.y)
};
function __12(_e, p) {
    var _f = __4(_e.a, _e.b);
    var _10 = __4(_e.a, p);
    var _11 = __14(_10, _f) / __10(_f);
    var rP = undefined;
    if (_11 < 0) {
        rP = _e.a
    } else {
        if (_11 > __10(_f)) {
            rP = _e.b
        } else {
            var _12 = __5(_f);
            rP = __6(_e.a, __8(_12, _11))
        }
    }
    return {
        dist: __11(rP, p),
        normal: __5(__4(p, rP))
    }
};
function __13(_13) {
    var _14 = 0,
    _15 = 0,
    _16 = 0,
    _17 = 0;
    if (_13.a.x < _13.b.x) {
        _14 = _13.a.x;
        _15 = _13.b.x
    } else {
        _14 = _13.b.x;
        _15 = _13.a.x
    }
    if (_13.a.y < _13.b.y) {
        _16 = _13.a.y;
        _17 = _13.b.y
    } else {
        _16 = _13.b.y;
        _17 = _13.a.y
    }
    _13.min = {
        x: _14,
        y: _16
    };
    _13.max = {
        x: _15,
        y: _17
    };
    return _13
};
function __14(vA, vB) {
    return vA.x * vB.x + vA.y * vB.y
};
function __15(vA, vB) {
    return vA.x * vB.y - vA.y * vB.x
};
function __16(pos, r, _18) {
    var v = __4(_18.b, _18.a);
    var _19 = __5(v);
    var _1a = {
        x: -_19.y,
        y: _19.x
    };
    var d = __14(_1a, __4(pos, _18.b));
    var p = null;
    if (Math.abs(d) < 2 * r) {
        var pA = __6(pos, __8(_1a, d));
        var _1b = Math.sqrt(4 * r * r - d * d);
        p = __7(pA, __8(_19, -_1b));
        var _1c = __11(p, _18.a);
        if (_1c > __10(v) || _1c < 0) {
            p = null
        }
    }
    return p == null ? null: {
        pos: p,
        normal: __5(__4(p, pos))
    }
};
function __17(vec, _1d) {
    var len = __10(vec);
    var a = __5(vec);
    var b = {
        x: Math.cos(_1d) * len,
        y: Math.sin(_1d) * len
    };
    return __8({
        x: a.x * b.x - a.y * b.y,
        y: a.y * b.x + a.x * b.y
    },
    len)
};
function Progress(_1e, fn) {
    var _1f = fn();
    $("#loading-screen div.progress-bar").css("width", _1f * 80 + "%");
    if (_1f < 1) {
        setTimeout(function() {
            Progress(_1e, fn)
        },
        _1e)
    }
};
function colorToStr(_20) {
    return "rgba(" + _20.r * 255 + ", " + _20.g * 255 + ", " + _20.b * 255 + ", " + _20.a + ")"
};

function Input() {
    var _62 = new Object();
    var _63 = new Object();
    var _64 = new Object();
    var _65 = new Object();
    var mB = new Object();
    var _66 = new Object();
    var _67 = {
        x: 0,
        y: 0
    };
    var _68 = {
        x: 0,
        y: 0
    };
    var _69 = this;
    $(window).keydown(function(_6a) {
        if (!_69.isKeyPressed(_6a.keyCode)) {
            _62[_6a.keyCode] = true
        }
    });
    $(window).keyup(function(_6b) {
        _62[_6b.keyCode] = false
    });
    $("canvas").dblclick(function() {
        return false
    });
    $("canvas").mousedown(function(_6c) {
        if (!_69.isMousePressed(_6c.button)) {
            _65[_6c.button] = true
        }
        return false
    });
    $("canvas").mousemove(function(_6d) {
        _68.x = _67.x;
        _68.y = _67.y;
        _67.x = (_6d.offsetX ? _6d.offsetX: _6d.layerX) - $("canvas").position().left;
        _67.y = (_6d.offsetY ? _6d.offsetY: _6d.layerY) - $("canvas").position().top;
        return false
    });
    $("canvas").mouseup(function(_6e) {
        _65[_6e.button] = false;
        return false
    });
    $("canvas").click(function() {
        return false
    });
    $("canvas").bind("contextmenu",
    function() {
        return false
    });
    this.isKeyPressed = function(key) {
        return (_63[parseInt(key)] != undefined) && _63[parseInt(key)]
    };
    this.isKeyDown = function(key) {
        var k = parseInt(key);
        return ((_64[k] == undefined) || !_64[k]) && this.isKeyPressed(key)
    };
    this.isKeyUp = function(key) {
        var k = parseInt(key);
        return (_64[k] != undefined) && _64[k] && !this.isKeyPressed(key)
    };
    this.isMousePressed = function(key) {
        return (mB[parseInt(key)] != undefined) && mB[parseInt(key)]
    };
    this.isMouseDown = function(key) {
        var k = parseInt(key);
        return ((_66[k] == undefined) || !_66[k]) && this.isMousePressed(key)
    };
    this.isMouseUp = function(key) {
        var k = parseInt(key);
        return (_66[k] != undefined) && _66[k] && !this.isMousePressed(key)
    };
    this.mousePos = function() {
        return __3(_67)
    };
    this.mouseDelta = function() {
        return __7(_67, _68)
    };
    this.update = function() {
        $.each(_65,
        function(key, _6f) {
            _66[key] = mB[key];
            mB[key] = _6f
        });
        $.each(_62,
        function(key, _70) {
            _64[key] = _63[key];
            _63[key] = _70
        })
    }
};

var hexcase = 0;
var b64pad = "";

/**
 * MD5相关的函数
 */
function hex_md5(s) {
    return rstr2hex(rstr_md5(str2rstr_utf8(s)))
};
function b64_md5(s) {
    return rstr2b64(rstr_md5(str2rstr_utf8(s)))
};
function any_md5(s, e) {
    return rstr2any(rstr_md5(str2rstr_utf8(s)), e)
};
function hex_hmac_md5(k, d) {
    return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)))
};
function b64_hmac_md5(k, d) {
    return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)))
};
function any_hmac_md5(k, d, e) {
    return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e)
};
function md5_vm_test() {
    return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72"
};
function rstr_md5(s) {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
};
function rstr_hmac_md5(key, _cd) {
    var _ce = rstr2binl(key);
    if (_ce.length > 16) {
        _ce = binl_md5(_ce, key.length * 8)
    }
    var _cf = Array(16),
    _d0 = Array(16);
    for (var i = 0; i < 16; i++) {
        _cf[i] = _ce[i] ^ 909522486;
        _d0[i] = _ce[i] ^ 1549556828
    }
    var _d1 = binl_md5(_cf.concat(rstr2binl(_cd)), 512 + _cd.length * 8);
    return binl2rstr(binl_md5(_d0.concat(_d1), 512 + 128))
};
function rstr2hex(_d2) {
    try {
        hexcase
    } catch(e) {
        hexcase = 0
    }
    var _d3 = hexcase ? "0123456789ABCDEF": "0123456789abcdef";
    var _d4 = "";
    var x;
    for (var i = 0; i < _d2.length; i++) {
        x = _d2.charCodeAt(i);
        _d4 += _d3.charAt((x >>> 4) & 15) + _d3.charAt(x & 15)
    }
    return _d4
};
function rstr2b64(_d5) {
    try {
        b64pad
    } catch(e) {
        b64pad = ""
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var _d6 = "";
    var len = _d5.length;
    for (var i = 0; i < len; i += 3) {
        var _d7 = (_d5.charCodeAt(i) << 16) | (i + 1 < len ? _d5.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? _d5.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > _d5.length * 8) {
                _d6 += b64pad
            } else {
                _d6 += tab.charAt((_d7 >>> 6 * (3 - j)) & 63)
            }
        }
    }
    return _d6
};
function rstr2any(_d8, _d9) {
    var _da = _d9.length;
    var i, j, q, x, _db;
    var _dc = Array(Math.ceil(_d8.length / 2));
    for (i = 0; i < _dc.length; i++) {
        _dc[i] = (_d8.charCodeAt(i * 2) << 8) | _d8.charCodeAt(i * 2 + 1)
    }
    var _dd = Math.ceil(_d8.length * 8 / (Math.log(_d9.length) / Math.log(2)));
    var _de = Array(_dd);
    for (j = 0; j < _dd; j++) {
        _db = Array();
        x = 0;
        for (i = 0; i < _dc.length; i++) {
            x = (x << 16) + _dc[i];
            q = Math.floor(x / _da);
            x -= q * _da;
            if (_db.length > 0 || q > 0) {
                _db[_db.length] = q
            }
        }
        _de[j] = x;
        _dc = _db
    }
    var _df = "";
    for (i = _de.length - 1; i >= 0; i--) {
        _df += _d9.charAt(_de[i])
    }
    return _df
};
function str2rstr_utf8(_e0) {
    var _e1 = "";
    var i = -1;
    var x, y;
    while (++i < _e0.length) {
        x = _e0.charCodeAt(i);
        y = i + 1 < _e0.length ? _e0.charCodeAt(i + 1) : 0;
        if (55296 <= x && x <= 56319 && 56320 <= y && y <= 57343) {
            x = 65536 + ((x & 1023) << 10) + (y & 1023);
            i++
        }
        if (x <= 127) {
            _e1 += String.fromCharCode(x)
        } else {
            if (x <= 2047) {
                _e1 += String.fromCharCode(192 | ((x >>> 6) & 31), 128 | (x & 63))
            } else {
                if (x <= 65535) {
                    _e1 += String.fromCharCode(224 | ((x >>> 12) & 15), 128 | ((x >>> 6) & 63), 128 | (x & 63))
                } else {
                    if (x <= 2097151) {
                        _e1 += String.fromCharCode(240 | ((x >>> 18) & 7), 128 | ((x >>> 12) & 63), 128 | ((x >>> 6) & 63), 128 | (x & 63))
                    }
                }
            }
        }
    }
    return _e1
};
function str2rstr_utf16le(_e2) {
    var _e3 = "";
    for (var i = 0; i < _e2.length; i++) {
        _e3 += String.fromCharCode(_e2.charCodeAt(i) & 255, (_e2.charCodeAt(i) >>> 8) & 255)
    }
    return _e3
};
function str2rstr_utf16be(_e4) {
    var _e5 = "";
    for (var i = 0; i < _e4.length; i++) {
        _e5 += String.fromCharCode((_e4.charCodeAt(i) >>> 8) & 255, _e4.charCodeAt(i) & 255)
    }
    return _e5
};
function rstr2binl(_e6) {
    var _e7 = Array(_e6.length >> 2);
    for (var i = 0; i < _e7.length; i++) {
        _e7[i] = 0
    }
    for (var i = 0; i < _e6.length * 8; i += 8) {
        _e7[i >> 5] |= (_e6.charCodeAt(i / 8) & 255) << (i % 32)
    }
    return _e7
};
function binl2rstr(_e8) {
    var _e9 = "";
    for (var i = 0; i < _e8.length * 32; i += 8) {
        _e9 += String.fromCharCode((_e8[i >> 5] >>> (i % 32)) & 255)
    }
    return _e9
};

/**
 * MD5相关的函数
 */
function binl_md5(x, len) {
    x[len >> 5] |= 128 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i = 0; i < x.length; i += 16) {
        var _ea = a;
        var _eb = b;
        var _ec = c;
        var _ed = d;
        a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safe_add(a, _ea);
        b = safe_add(b, _eb);
        c = safe_add(c, _ec);
        d = safe_add(d, _ed)
    }
    return Array(a, b, c, d)
};

function md5_cmn(q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
};
function md5_ff(a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
};
function md5_gg(a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
};
function md5_hh(a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t)
};
function md5_ii(a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
};
function safe_add(x, y) {
    var lsw = (x & 65535) + (y & 65535);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 65535)
};
function bit_rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
};
function supports_local_storage() {
    try {
        return "localStorage" in window && window["localStorage"] !== null
    } catch(e) {
        return false
    }
};
function supports_canvas() {
    return !! document.createElement("canvas").getContext
};
function supports_audio() {
    return !! document.createElement("audio").canPlayType
};
function support_notifications() {
    return window.webkitNotifications
};

function __18(key) {
    if (supports_local_storage()) {
        value = localStorage.getItem("snooker_" + key);
        if (typeof value != "undefined" && value != null) {
            return value
        }
    }
    return config[key]
};
function __20(key, _ee) {
    if (supports_local_storage()) {
        localStorage.setItem("snooker_" + key, _ee)
    }
    config[key] = _ee
};
function sleep(_131) {
    var _132 = new Date().getTime();
    for (var i = 0; i < 10000000; i++) {
        if ((new Date().getTime() - _132) > _131) {
            break
        }
    }
};

function notify_permission() {
    if (support_notifications() && window.webkitNotifications.checkPermission() != 0) {
        window.webkitNotifications.requestPermission()
    }
};
function notify(_133) {
    if (support_notifications()) {
        if (window.webkitNotifications.checkPermission() == 0) {
            if (!window_active) {}
        }
    }
};

function Obj(b) {
    var a = b;
    this.alert = function() {
        alert(a)
    }
};