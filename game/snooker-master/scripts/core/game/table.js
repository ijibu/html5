(function (global) {
    "use strict";

    var _ = global._;
    var snooker = (global.snooker = global.snooker || {});
    var utils = (global.utils = global.utils || {});

    /**
     * @constructor
     */
    snooker.Table = function () {
        this.canvas = null;
        this.ctx = null;
    };

    snooker.Table.WIDTH = null;
    snooker.Table.HEIGHT = null;

    /**
     * @param {Function} callback
     */
    snooker.Table.prototype.create = function (callback) {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", snooker.Table.WIDTH + "px");
        this.canvas.setAttribute("height", snooker.Table.HEIGHT + "px");
        this._render();

        _.extend(this.canvas.style, {
            "width": snooker.Table.WIDTH + "px",
            "height": snooker.Table.HEIGHT + "px",
            "margin-left": (-1 * snooker.Table.WIDTH / 2) + "px",
            "margin-top": (-1 * snooker.Table.HEIGHT / 2) + "px"
        });

        this.ctx = this.canvas.getContext("2d");
        this._addTexture(callback);

        return this;
    };

    /**
     * @private
     */
    snooker.Table.prototype._render = function () {
        var body = document.body;
        _.each(body.childNodes, function (node) {
            body.removeChild(node);
        });
        body.appendChild(this.canvas);
    };

    /**
     * @param {Function} callback
     * @private
     */
    snooker.Table.prototype._addTexture = function (callback) {
        var self = this;
        var img = new Image();
        img.src = "textures/table.png";

        utils.listener.add(img, "load", function () {
            self.ctx.drawImage(img, 0, 0, snooker.Table.WIDTH, snooker.Table.HEIGHT);

            if (typeof callback === "function") {
                callback(self.ctx);
            }
        });
    };

}(this));
