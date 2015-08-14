import React from 'react';
import {Label, Pagination, Table} from 'react-bootstrap';

import ElementStore from './stores/ElementStore';
import ElementAllCheckbox from './ElementAllCheckbox';
import ElementCheckbox from './ElementCheckbox';

import SVG from 'react-inlinesvg';
import Aviator from 'aviator';

export default class ElementsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],

      // Pagination
      activePage: 1,
      numberOfPages: 0,
      pageSize: 5
    }
  }

  componentDidMount() {
    ElementStore.listen(this.onChange.bind(this));
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange.bind(this));
  }

  onChange(state) {
    let elements = state.samples;
    let numberOfPages = Math.ceil(elements.length / this.state.pageSize);
    let activePage = elements === this.state.elements ? this.state.activePage : 1;

    let currentElement;
    if(state.currentElement && state.currentElement.type == this.props.type) {
      currentElement = state.currentElement
    }

    this.setState({
      elements: elements,
      currentElement: currentElement,
      numberOfPages: numberOfPages,
      activePage: activePage
    });
  }

  entries() {
    // Pagination: startAt...Arrayindex to start with...
    // TODO Move to PaginationUtils?
    let pageSize = this.state.pageSize;
    let startAt = (this.state.activePage - 1) * pageSize;
    let endAt = startAt + pageSize;
    let elementsOnActivePage = this.state.elements.slice(startAt, endAt);

    return elementsOnActivePage.map((element, index) => {
      let optionalLabelColumn
      let optionalMoleculeColumn

      if(this.showElementDetailsColumns()) {

        optionalLabelColumn = (
          <td className="labels">
            {this.collectionLabels(element)}
          </td>
        )

        optionalMoleculeColumn = (
          <td className="molecule" margin="0" padding="0">
            <SVG src="/assets/361.svg" className="molecule" />
          </td>
        )

      }

      let style = {}
      let isSelected = this.state.currentElement && this.state.currentElement.id == element.id;
      if(isSelected) {
        style = {
          background: '#eee'
        }
      }

      return (
        <tr key={index} height="100" style={style}>
          <td className="check">
            <ElementCheckbox element={element}/>
          </td>
          <td className="name" onClick={e => this.showDetails(element)} style={{cursor: 'pointer'}}>
            {element.name}
          </td>
         {optionalLabelColumn}
         {optionalMoleculeColumn}
        </tr>
      )
    });
  }

  showElementDetailsColumns() {
    return !(this.state.currentElement);
  }

  collectionLabels(element) {
    return element.collection_labels.map((label, index) => {
      return (
        <span>
          <Label bsStyle="primary" key={index}>{label}</Label>
          &nbsp;
        </span>
      )
    });
  }

  showDetails(element) {
    Aviator.navigate(`/${element.type}/${element.id}`);
  }

  handlePaginationSelect(event, selectedEvent) {
    this.setState({
      activePage: selectedEvent.eventKey
    });
  }

  pagination() {
    if(this.state.numberOfPages > 1) {
      return (
        <Pagination activePage={this.state.activePage}
                    items={this.state.numberOfPages}
                    onSelect={this.handlePaginationSelect.bind(this)}/>
      )
    }
  }

  header() {
    let colSpan = this.showElementDetailsColumns() ? "3" : "1";
    return (
      <thead>
        <th className="check">
          <ElementAllCheckbox type={this.props.type} />
        </th>
        <th colSpan={colSpan}>
          All {this.props.type}s
        </th>
      </thead>
    )
  }

  render() {
    return (
      <div>
        <Table className="elements" bordered hover>
          {this.header()}
          <tbody>
            {this.entries()}
          </tbody>
        </Table>
        {this.pagination()}
      </div>
    )
  }
}

