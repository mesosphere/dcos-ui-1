/** @jsx React.DOM */

jest.dontMock("../ServiceTable");
jest.dontMock("../../mixins/InternalStorageMixin");
jest.dontMock("../../stores/MesosStateStore");
jest.dontMock("../../stores/__tests__/fixtures/state.json");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var MesosStateStore = require("../../stores/MesosStateStore");
var ServiceTable = require("../ServiceTable");
var HealthLabels = require("../../constants/HealthLabels");

// That is a single snapshot from
// http://srv5.hw.ca1.mesosphere.com:5050/master/state.json
var stateJSON = require("../../stores/__tests__/fixtures/state.json");

MesosStateStore.init();
MesosStateStore.processState(stateJSON);

describe("ServiceTable", function () {
  var table;

  beforeEach(function () {
    this.frameworks = MesosStateStore.getFrameworks();
  });

  it("should initialize component with frameworks", function () {
    table = TestUtils.renderIntoDocument(
      <ServiceTable frameworks={this.frameworks} />
    );
    expect(table).toBeDefined();
  });

  describe("#renderHealth", function () {
    it("should have loaders on all frameworks", function () {
      this.frameworks.slice(0).forEach(function (row) {
        var healthlabel = TestUtils.renderIntoDocument(
          table.renderHealth(null, row)
        );

        var fn = TestUtils.findRenderedDOMComponentWithClass.bind(TestUtils,
          healthlabel, "loader-small"
        );
        expect(fn).not.toThrow();
      });
    });
  });

  it("should have health error processed", function () {
    expect(MesosStateStore.getHealthProcessed()).toBe(false);
    MesosStateStore.processMarathonHealthError();
    expect(MesosStateStore.getHealthProcessed()).toBe(true);
  });

  describe("#renderHealth", function () {
    it("should have N/A health status on all frameworks",
        function () {
      this.frameworks.slice(0).forEach(function (row) {
        var healthlabel = TestUtils.renderIntoDocument(
          table.renderHealth(null, row)
        );
        expect(healthlabel.getDOMNode().innerHTML).toEqual(HealthLabels.NA);
      });
    });
  });

});
