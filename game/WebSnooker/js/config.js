/**
 * 游戏配置对象
 */
var config = {
    title: "Web Snooker",
    masterserver: "server.php",
    debug: false,
    skin_path: "media/skins/",
    skin: "default",
    sound: "on",
    shadows: "on",
    cue: "on",
    hints: "on",
    player: "Guest",
    scoreboard_pos: "bottom",
    background: "default",
    backgrounds: {
        "default": {
            "default": {
                "color": "#855926",
                "image": "media/images/floor/light-yellow.jpg"
            },
            "blue": {
                "color": "#072c80",
                "image": "media/images/floor/blue.jpg"
            },
            "red": {
                "color": "#480000",
                "image": "media/images/floor/red.jpg"
            },
            "darkred": {
                "color": "#090100",
                "image": "media/images/floor/dark-red.jpg"
            },
            "darkred2": {
                "color": "#480000",
                "image": "media/images/floor/dark-red-2.jpg"
            },
            "black": {
                "color": "#050607",
                "image": "media/images/floor/black.jpg"
            },
            "lightyellow": {
                "color": "#855926",
                "image": "media/images/floor/light-yellow.jpg"
            }
        },
        "satan": {
            "default": {
                "color": "#480000",
                "image": "media/images/floor/dark-red-2.jpg"
            },
            "blue": {
                "color": "#072c80",
                "image": "media/images/floor/blue.jpg"
            },
            "red": {
                "color": "#480000",
                "image": "media/images/floor/red.jpg"
            },
            "darkred": {
                "color": "#090100",
                "image": "media/images/floor/dark-red.jpg"
            },
            "darkred2": {
                "color": "#480000",
                "image": "media/images/floor/dark-red-2.jpg"
            },
            "black": {
                "color": "#050607",
                "image": "media/images/floor/black.jpg"
            },
            "lightyellow": {
                "color": "#855926",
                "image": "media/images/floor/light-yellow.jpg"
            }
        }
    },
    scoreboard_style: ($(window).height() <= 666 ? "compact": "extended"),
    server_name: "Snooker room",
    gamemodes: {
        "snooker": "Full Snooker",
        "short-snooker": "Short Snooker",
        "mini-snooker": "Mini Snooker"
    },
    shottime: {
        "0": "Unlimited",
        "300": "5min",
        "180": "3min",
        "60": "1min",
        "45": "45s",
        "30": "30s",
        "15": "15s"
    }
};