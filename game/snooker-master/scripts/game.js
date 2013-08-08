(function (global) {
    "use strict";

    var snooker = (global.snooker = global.snooker || {});
    var utils = (global.utils = global.utils || {});

    function setScale(evt) {
        /**
         * No small, smallest version.
         */
        if (evt.wheelDelta < 0 && snooker.SCALE === setScale.SMALLEST_SCALE) {
            return false;
        }

        /**
         * No zoom, the biggest version.
         */
        if (evt.wheelDelta > 0 && snooker.SCALE === setScale.BIGGEST_SCALE) {
            return false;
        }

        /**
         * Change SCALE value.
         * @type {number}
         */
        snooker.SCALE += 0.05 * (evt.wheelDelta / 10);

        /**
         * Secure for change SCALE not too small.
         */
        if (snooker.SCALE < setScale.SMALLEST_SCALE) {
            snooker.SCALE = setScale.SMALLEST_SCALE;
        }

        /**
         * Secure for change SCALE not too big.
         */
        if (snooker.SCALE > setScale.BIGGEST_SCALE) {
            snooker.SCALE = setScale.BIGGEST_SCALE;
        }

        return true;
    }

    setScale.SMALLEST_SCALE = 1;
    setScale.BIGGEST_SCALE = 3;

    utils.listener.add(window, "load", function () {
        snooker.init();
    });

    utils.listener.add(document, "mousewheel", function (evt) {
        if (setScale(evt)) {
            snooker.init();
        }

        evt.preventDefault();
        evt.stopPropagation();
    });

}(this));
