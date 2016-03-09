import {SidePanel} from 'reactjs-components';
import React from 'react';

import VIPDetailSidePanelContents from './VIPDetailSidePanelContents';

let SDK = require('../SDK').getSDK();

const METHODS_TO_BIND = [
  'handlePanelClose'
];

class NetworkSidePanel extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  handlePanelClose(closeInfo) {
    if (!this.isOpen()) {
      return;
    }

    let router = this.context.router;

    if (closeInfo && closeInfo.closedByBackdrop) {
      router.transitionTo(this.props.openedPage, router.getCurrentParams());
      return;
    }

    SDK.Hooks.doAction('goBack', router);
  }

  isOpen() {
    return this.props.vip != null && SDK.Store.getAppState()
    .summary.statesProcessed;
  }

  getHeader() {
    return (
      <div className="side-panel-header-container">
        <div className="side-panel-header-actions
          side-panel-header-actions-primary">
          <span className="side-panel-header-action"
            onClick={this.handlePanelClose}>
            <i className={`icon icon-sprite
              icon-sprite-small
              icon-close
              icon-sprite-small-white`}></i>
            Close
          </span>
        </div>
      </div>
    );
  }

  getContents(vip, port, protocol) {
    if (!this.isOpen()) {
      return null;
    }

    return (
      <VIPDetailSidePanelContents port={port} vip={vip} protocol={protocol}
        parentRouter={this.context.router} />
    );
  }

  render() {
    let {vip, port, protocol} = this.props;

    return (
      <div>
        <SidePanel className="side-panel-detail"
          header={this.getHeader(vip, port, protocol)}
          headerContainerClass="container container-fluid container-fluid-narrow
            container-pod container-pod-short"
          bodyClass="side-panel-content flex-container-col"
          onClose={this.handlePanelClose}
          open={this.isOpen()}>
          {this.getContents(vip, port, protocol)}
        </SidePanel>
      </div>
    );
  }
}

NetworkSidePanel.contextTypes = {
  router: React.PropTypes.func
};

NetworkSidePanel.propTypes = {
  vip: React.PropTypes.string,
  protocol: React.PropTypes.string,
  port: React.PropTypes.string
};

module.exports = NetworkSidePanel;