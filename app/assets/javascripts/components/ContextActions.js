import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';

import UIStore from './stores/UIStore';

export default class ContextActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = UIStore.getState();
  }

  componentDidMount() {
    UIStore.listen(this.onChange.bind(this));
  }

  componentWillUnmount() {
    UIStore.unlisten(this.onChange.bind(this));
  }

  onChange(state) {
    this.setState(state);
  }

  _createSample() {
    Aviator.navigate(this._createSampleUrl());
  }

  _createSampleUrl() {
    return `${this._collectionUrl()}/sample/new`
  }

  _collectionUrl() {
    let uiState = UIStore.getState();
    return `/collection/${uiState.currentCollectionId}`
  }

  availableActions() {
    // TODO später auch für reaktionen usw
    // TODO replace dummy implementation
    if(this.state.sample.checkedIds.size == 0) {
      return (
        <ButtonGroup vertical block>
          <Button onClick={e => this._createSample()}>Create Sample</Button>
          <Button>Create Reaction</Button>
          <Button>Create Wellplate</Button>
        </ButtonGroup>
      )
    } else {
      return (
        <ButtonGroup vertical block>
          <Button>Split as Subsample(s)</Button>
          <Button>Create Reaction</Button>
          <Button>Create Wellplate</Button>
        </ButtonGroup>
      )
    }
  }

  render() {
    return (
      <div>
        {this.availableActions()}
      </div>
    )
  }
}
