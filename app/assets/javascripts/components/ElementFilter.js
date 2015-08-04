import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';

class ElementFilter extends React.Component {
  constructor(props) {
    super();
    this.state = {
    }
  }

  render() {
    return (
      <ButtonGroup id="element-filter">
        <Button>Sample</Button>
        <Button>Reaction</Button>
        <Button>Wellplate</Button>
      </ButtonGroup>
    )
  }
}

module.exports = ElementFilter;
