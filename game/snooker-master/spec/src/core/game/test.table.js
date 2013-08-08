describe("Snooker Table", function () {
    describe("when creating", function () {
        var table1, table2;

        beforeEach(function () {
            table1 = new snooker.Table();
            table2 = new snooker.Table();
        });

        it("should create new object instance", function () {
            expect(table1 === table2).toBeFalsy();
        });

        it("should create the same Table models", function () {
            expect(table1).toEqual(table2);
        });
    });
});