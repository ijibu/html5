(function (global) {
    "use strict";

    var snooker = (global.snooker = global.snooker || {});

    /**
     * Game scale.
     * @type {number}
     */
    snooker.SCALE = 1;

    /**
     * Game area.
     * @type {null|Object}
     */
    snooker.area = null;

    /**
     * Game dimensions.
     * @type {null|number}
     */
    snooker.GAME_WIDTH = null;
    snooker.GAME_HEIGHT = null;

    snooker.init = function () {
        /**
         * Setup Table dimensions.
         * @type {number}
         */
        snooker.Table.WIDTH = 410.5 * snooker.SCALE;
        snooker.Table.HEIGHT = 229.5 * snooker.SCALE;

        /**
         * Setup Game dimensions.
         * @type {number}
         */
        snooker.GAME_WIDTH =  356.9 * snooker.SCALE;
        snooker.GAME_HEIGHT = 177.8 * snooker.SCALE;

        /**
         * Setup Ball dimensions.
         * @type {number}
         */
        snooker.Ball.RADIUS = 5.25 * snooker.SCALE;

        this.area = new snooker.Table();
        this.area.create(function (context) {
            /*
            new snooker.Cue().create(context, {
                x: 170,
                y: snooker.Table.HEIGHT * 0.15
            });

            new snooker.Cue().create(context, {
                x: 170,
                y: snooker.Table.HEIGHT * 0.85
            });
            */

            onEachBall(function (type, position) {
                var ball = new snooker.Ball(type);
                ball.create(context, position);
            });
        });
    };

    function onEachBall(callback) {
        _.each(snooker.getMap(), function (balls, type) {
            _.each(balls, function (position) {
                if (typeof callback === "function") {
                    callback(type, position);
                }
            });
        });
    }

    snooker.getMap = function () {
        return {
            "WHITE": [{ x: snooker.Table.WIDTH * 0.225, y: snooker.Table.HEIGHT * 0.53 }],
            "GREEN": [{ x: snooker.Table.WIDTH * 0.265, y: snooker.Table.HEIGHT * 0.35 }],
            "BROWN": [{ x: snooker.Table.WIDTH * 0.265, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS}],
            "YELLOW": [{ x: snooker.Table.WIDTH * 0.265, y: snooker.Table.HEIGHT * 0.6 }],
            "BLUE": [{ x: snooker.Table.WIDTH / 2 - snooker.Ball.RADIUS, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS }],
            "PINK": [{ x: snooker.Table.WIDTH * 0.63, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS}],
            "RED": [
                // 1
                { x: snooker.Table.WIDTH * 0.67, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS },

                // 2
                { x: snooker.Table.WIDTH * 0.70, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS * 1.5 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.70, y: snooker.Table.HEIGHT / 2 + snooker.Ball.RADIUS * 1.5 - snooker.Ball.RADIUS },

                // 3
                { x: snooker.Table.WIDTH * 0.73, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS * 3 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.73, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.73, y: snooker.Table.HEIGHT / 2 + snooker.Ball.RADIUS * 3 - snooker.Ball.RADIUS },

                // 4
                { x: snooker.Table.WIDTH * 0.76, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS * 4.5 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.76, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS * 1.5 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.76, y: snooker.Table.HEIGHT / 2 + snooker.Ball.RADIUS * 1.5 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.76, y: snooker.Table.HEIGHT / 2 + snooker.Ball.RADIUS * 4.5 - snooker.Ball.RADIUS },

                // 5
                { x: snooker.Table.WIDTH * 0.79, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS * 6 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.79, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS * 3 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.79, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.79, y: snooker.Table.HEIGHT / 2 + snooker.Ball.RADIUS * 3 - snooker.Ball.RADIUS },
                { x: snooker.Table.WIDTH * 0.79, y: snooker.Table.HEIGHT / 2 + snooker.Ball.RADIUS * 6 - snooker.Ball.RADIUS }
            ],
            "BLACk": [{ x: snooker.Table.WIDTH * 0.84, y: snooker.Table.HEIGHT / 2 - snooker.Ball.RADIUS}]
        };
    };

}(this));
