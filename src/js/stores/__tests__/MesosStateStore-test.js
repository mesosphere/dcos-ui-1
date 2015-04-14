var _ = require("underscore");

jest.dontMock("../MesosStateStore");
jest.dontMock("./fixtures/MockStates");

var MesosStateStore = require("../MesosStateStore");
var MockStates = require("./fixtures/MockStates");

describe("Mesos State Store", function () {

  beforeEach(function () {
    MesosStateStore.init();
  });

  describe("#getTaskFailureRate", function () {

    it("is 0% initially", function () {
      var taskFailureRate = MesosStateStore.getTaskFailureRate();
      expect(_.last(taskFailureRate).rate).toEqual(0);
    });

    it("is 0% when one task finishes", function () {
      MesosStateStore.processState(MockStates.oneTaskRunning);
      MesosStateStore.getTaskFailureRate();
      MesosStateStore.processState(MockStates.oneTaskFinished);
      var taskFailureRate = MesosStateStore.getTaskFailureRate();
      expect(_.last(taskFailureRate).rate).toEqual(0);
    });

    it("is 100% when one task fails", function () {
      MesosStateStore.processState(MockStates.oneTaskRunning);
      MesosStateStore.getTaskFailureRate();
      MesosStateStore.processState(MockStates.oneTaskFailed);
      var taskFailureRate = MesosStateStore.getTaskFailureRate();
      expect(_.last(taskFailureRate).rate).toEqual(100);
    });

    it("is 0% when one task is killed", function () {
      MesosStateStore.processState(MockStates.oneTaskRunning);
      MesosStateStore.getTaskFailureRate();
      MesosStateStore.processState(MockStates.oneTaskKilled);
      var taskFailureRate = MesosStateStore.getTaskFailureRate();
      expect(_.last(taskFailureRate).rate).toEqual(0);
    });

  });

});
