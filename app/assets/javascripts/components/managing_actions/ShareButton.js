import React from 'react';
import {Button} from 'react-bootstrap';
import Aviator from 'aviator';

export default class ShareButton extends React.Component {
  constructor(props) {
    super(props);
  }

  showShareModal() {
    Aviator.navigate(Aviator.getCurrentURI()+'/sharing');
  }

  render() {
    return (
      <Button block onClick={this.showShareModal.bind(this)}>Share</Button>
    )
  }
}
