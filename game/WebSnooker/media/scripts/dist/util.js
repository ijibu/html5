var hexcase = 0;
var b64pad = "";
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
function rstr_hmac_md5(key, _62) {
    var _63 = rstr2binl(key);
    if (_63.length > 16) {
        _63 = binl_md5(_63, key.length * 8)
    }
    var _64 = Array(16),
    _65 = Array(16);
    for (var i = 0; i < 16; i++) {
        _64[i] = _63[i] ^ 909522486;
        _65[i] = _63[i] ^ 1549556828
    }
    var _66 = binl_md5(_64.concat(rstr2binl(_62)), 512 + _62.length * 8);
    return binl2rstr(binl_md5(_65.concat(_66), 512 + 128))
};
function rstr2hex(_67) {
    try {
        hexcase
    } catch(e) {
        hexcase = 0
    }
    var _68 = hexcase ? "0123456789ABCDEF": "0123456789abcdef";
    var _69 = "";
    var x;
    for (var i = 0; i < _67.length; i++) {
        x = _67.charCodeAt(i);
        _69 += _68.charAt((x >>> 4) & 15) + _68.charAt(x & 15)
    }
    return _69
};
function rstr2b64(_6a) {
    try {
        b64pad
    } catch(e) {
        b64pad = ""
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var _6b = "";
    var len = _6a.length;
    for (var i = 0; i < len; i += 3) {
        var _6c = (_6a.charCodeAt(i) << 16) | (i + 1 < len ? _6a.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? _6a.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > _6a.length * 8) {
                _6b += b64pad
            } else {
                _6b += tab.charAt((_6c >>> 6 * (3 - j)) & 63)
            }
        }
    }
    return _6b
};
function rstr2any(_6d, _6e) {
    var _6f = _6e.length;
    var i, j, q, x, _70;
    var _71 = Array(Math.ceil(_6d.length / 2));
    for (i = 0; i < _71.length; i++) {
        _71[i] = (_6d.charCodeAt(i * 2) << 8) | _6d.charCodeAt(i * 2 + 1)
    }
    var _72 = Math.ceil(_6d.length * 8 / (Math.log(_6e.length) / Math.log(2)));
    var _73 = Array(_72);
    for (j = 0; j < _72; j++) {
        _70 = Array();
        x = 0;
        for (i = 0; i < _71.length; i++) {
            x = (x << 16) + _71[i];
            q = Math.floor(x / _6f);
            x -= q * _6f;
            if (_70.length > 0 || q > 0) {
                _70[_70.length] = q
            }
        }
        _73[j] = x;
        _71 = _70
    }
    var _74 = "";
    for (i = _73.length - 1; i >= 0; i--) {
        _74 += _6e.charAt(_73[i])
    }
    return _74
};
function str2rstr_utf8(_75) {
    var _76 = "";
    var i = -1;
    var x, y;
    while (++i < _75.length) {
        x = _75.charCodeAt(i);
        y = i + 1 < _75.length ? _75.charCodeAt(i + 1) : 0;
        if (55296 <= x && x <= 56319 && 56320 <= y && y <= 57343) {
            x = 65536 + ((x & 1023) << 10) + (y & 1023);
            i++
        }
        if (x <= 127) {
            _76 += String.fromCharCode(x)
        } else {
            if (x <= 2047) {
                _76 += String.fromCharCode(192 | ((x >>> 6) & 31), 128 | (x & 63))
            } else {
                if (x <= 65535) {
                    _76 += String.fromCharCode(224 | ((x >>> 12) & 15), 128 | ((x >>> 6) & 63), 128 | (x & 63))
                } else {
                    if (x <= 2097151) {
                        _76 += String.fromCharCode(240 | ((x >>> 18) & 7), 128 | ((x >>> 12) & 63), 128 | ((x >>> 6) & 63), 128 | (x & 63))
                    }
                }
            }
        }
    }
    return _76
};
function str2rstr_utf16le(_77) {
    var _78 = "";
    for (var i = 0; i < _77.length; i++) {
        _78 += String.fromCharCode(_77.charCodeAt(i) & 255, (_77.charCodeAt(i) >>> 8) & 255)
    }
    return _78
};
function str2rstr_utf16be(_79) {
    var _7a = "";
    for (var i = 0; i < _79.length; i++) {
        _7a += String.fromCharCode((_79.charCodeAt(i) >>> 8) & 255, _79.charCodeAt(i) & 255)
    }
    return _7a
};
function rstr2binl(_7b) {
    var _7c = Array(_7b.length >> 2);
    for (var i = 0; i < _7c.length; i++) {
        _7c[i] = 0
    }
    for (var i = 0; i < _7b.length * 8; i += 8) {
        _7c[i >> 5] |= (_7b.charCodeAt(i / 8) & 255) << (i % 32)
    }
    return _7c
};
function binl2rstr(_7d) {
    var _7e = "";
    for (var i = 0; i < _7d.length * 32; i += 8) {
        _7e += String.fromCharCode((_7d[i >> 5] >>> (i % 32)) & 255)
    }
    return _7e
};
function binl_md5(x, len) {
    x[len >> 5] |= 128 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i = 0; i < x.length; i += 16) {
        var _7f = a;
        var _80 = b;
        var _81 = c;
        var _82 = d;
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
        a = safe_add(a, _7f);
        b = safe_add(b, _80);
        c = safe_add(c, _81);
        d = safe_add(d, _82)
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
function __0(key) {
    if (supports_local_storage()) {
        value = localStorage.getItem("snooker_" + key);
        if (typeof value != "undefined" && value != null) {
            return value
        }
    }
    return config[key]
};
function __2(key, _83) {
    if (supports_local_storage()) {
        localStorage.setItem("snooker_" + key, _83)
    }
    config[key] = _83
};
function __3(pA, pB) {
    var h = pB.x - pA.x;
    var v = pB.y - pA.y;
    return v / h
};
function __4(pA, pB) {
    var h = pB.x - pA.x;
    var v = pB.y - pA.y;
    return h / v
};
function __5(v) {
    return Math.atan2(v.y, v.x) + Math.PI / 2
};
function __6(v) {
    return {
        x: v.x,
        y: v.y
    }
};
function __7(pA, pB) {
    return {
        x: pB.x - pA.x,
        y: pB.y - pA.y
    }
};
function __8(v) {
    var len = __13(v);
    return len == 0 ? {
        x: 0,
        y: 0
    }: __12(v, len)
};
function __9(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
};
function __10(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
};
function __11(v, mul) {
    return {
        x: v.x * mul,
        y: v.y * mul
    }
};
function __12(v, div) {
    return {
        x: v.x / div,
        y: v.y / div
    }
};
function __13(_101) {
    return Math.sqrt(_101.x * _101.x + _101.y * _101.y)
};
function __14(pA, pB) {
    var _102 = __7(pA, pB);
    return Math.sqrt(_102.x * _102.x + _102.y * _102.y)
};
function __15(line, p) {
    var _103 = __7(line.a, line.b);
    var pVec = __7(line.a, p);
    var _104 = __17(pVec, _103) / __13(_103);
    var rP = undefined;
    if (_104 < 0) {
        rP = line.a
    } else {
        if (_104 > __13(_103)) {
            rP = line.b
        } else {
            var _105 = __8(_103);
            rP = __9(line.a, __11(_105, _104))
        }
    }
    return {
        dist: __14(rP, p),
        normal: __8(__7(p, rP))
    }
};
function __16(line) {
    var xMin = 0,
    xMax = 0,
    yMin = 0,
    yMax = 0;
    if (line.a.x < line.b.x) {
        xMin = line.a.x;
        xMax = line.b.x
    } else {
        xMin = line.b.x;
        xMax = line.a.x
    }
    if (line.a.y < line.b.y) {
        yMin = line.a.y;
        yMax = line.b.y
    } else {
        yMin = line.b.y;
        yMax = line.a.y
    }
    line.min = {
        x: xMin,
        y: yMin
    };
    line.max = {
        x: xMax,
        y: yMax
    };
    return line
};
function __17(vA, vB) {
    return vA.x * vB.x + vA.y * vB.y
};
function __18(vA, vB) {
    return vA.x * vB.y - vA.y * vB.x
};
function __19(pos, r, line) {
    var v = __7(line.b, line.a);
    var _106 = __8(v);
    var _107 = {
        x: -_106.y,
        y: _106.x
    };
    var d = __17(_107, __7(pos, line.b));
    var p = null;
    if (Math.abs(d) < 2 * r) {
        var pA = __9(pos, __11(_107, d));
        var _108 = Math.sqrt(4 * r * r - d * d);
        p = __10(pA, __11(_106, -_108));
        var _109 = __14(p, line.a);
        if (_109 > __13(v) || _109 < 0) {
            p = null
        }
    }
    return p == null ? null: {
        pos: p,
        normal: __8(__7(p, pos))
    }
};
function __20(vec, _10a) {
    var len = __13(vec);
    var a = __8(vec);
    var b = {
        x: Math.cos(_10a) * len,
        y: Math.sin(_10a) * len
    };
    return __11({
        x: a.x * b.x - a.y * b.y,
        y: a.y * b.x + a.x * b.y
    },
    len)
};
function sleep(_10b) {
    var _10c = new Date().getTime();
    for (var i = 0; i < 10000000; i++) {
        if ((new Date().getTime() - _10c) > _10b) {
            break
        }
    }
};
function notify_permission() {
    if (support_notifications() && window.webkitNotifications.checkPermission() != 0) {
        window.webkitNotifications.requestPermission()
    }
};
function notify(_10d) {
    if (support_notifications()) {
        if (window.webkitNotifications.checkPermission() == 0) {
            if (!window_active) {}
        }
    }
};