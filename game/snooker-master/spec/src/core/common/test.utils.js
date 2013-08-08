describe("common/utils", function() {
    describe("listener when running", function () {
        var foo, action;

        beforeEach(function () {
            foo = {};
            action = jasmine.createSpy('action');

            spyOn(utils.listener, "add");

            utils.listener.add(foo, "change", action);
        });

        it("should listening", function () {
            expect(utils.listener.add).toHaveBeenCalled();
            expect(utils.listener.add.calls.length).toEqual(1);
            expect(utils.listener.add).toHaveBeenCalledWith(foo, "change", action);
            expect(utils.listener.add).toHaveBeenCalledWith(
                jasmine.any(Object), jasmine.any(String), jasmine.any(Function)
            );
        });
    });
});