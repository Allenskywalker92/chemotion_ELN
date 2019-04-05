import React from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import UIStore from './../stores/UIStore';
import NotificationActions from '../actions/NotificationActions';

export default class ModalExportCollection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nested: true
    }
    this.handleClick = this.handleClick.bind(this)
    this.toggleCheckbox = this.toggleCheckbox.bind(this)
  }

  checkbox() {
    return (
      <div>
        <input type="checkbox"
                 onChange={this.toggleCheckbox}
                 checked={this.state.nested}
                 className="common-checkbox" />
        <span className="g-marginLeft--10"> Include nested collections </span>
      </div>
    )
  }

  buttonBar() {
    const { onHide } = this.props;
    return (
      <ButtonToolbar>
        <div className="pull-right">
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={onHide}>Cancel</Button>
            <Button bsStyle="warning" id="md-export-dropdown"
                title="Export as ZIP file (incl. attachments)" onClick={this.handleClick}>
                Export ZIP
            </Button>
          </ButtonToolbar>
        </div>
      </ButtonToolbar>
    )
  }

  handleClick() {
    const uiState = UIStore.getState();
    const { onHide, action, full } = this.props;

    let params = {
      collections: (full ? [] : [uiState.currentCollection.id]),
      format: 'zip',
      nested: this.state.nested
    }
    action(params);

    onHide();

    let notification = {
      title: "Export collections",
      message: "The export file is created on the server. This might take a while. The download will start automatically. Please don't close the window.",
      level: "warning",
      dismissible: false,
      uid: "export_collections",
      position: "bl",
      autoDismiss: null
    }

    NotificationActions.add(notification);
  }

  toggleCheckbox() {
    let newNested = !this.state.nested;

    this.setState({
      nested: newNested
    })
  }

  render() {
    const onChange = (v) => this.setState(
      previousState => {return { ...previousState, value: v }}
    )
    const { full } = this.props;
    return (
      <div>
        {!full && this.checkbox()}
        {this.buttonBar()}
      </div>
    )
  }
}
