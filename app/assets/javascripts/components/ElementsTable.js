import React from 'react';
import {Label, Pagination, Table} from 'react-bootstrap';

import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';

import ElementStore from './stores/ElementStore';
import ElementAllCheckbox from './ElementAllCheckbox';
import ElementCheckbox from './ElementCheckbox';
import ElementCollectionLabels from './ElementCollectionLabels';
import SampleContainer from './SampleContainer'
import WellplateContainer from './WellplateContainer'

import SVG from 'react-inlinesvg';
import Aviator from 'aviator';
import deepEqual from 'deep-equal';

import ArrayUtils from './utils/ArrayUtils';

export default class ElementsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      ui: {},
      // Pagination
      activePage: this.props.activePage || 1,
      numberOfPages: 0,
      pageSize: 5
    }
  }

  componentDidMount() {
    UIStore.getState();
    ElementStore.listen(this.onChange.bind(this));
    UIStore.listen(this.onChangeUI.bind(this));
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange.bind(this));
    UIStore.unlisten(this.onChangeUI.bind(this));
  }

  onChangeUI(state) {
    let type = this.props.type;
    let page = state.pagination && state.pagination[type] && state.pagination[type].page;
    if (page) {
      this.setState({
        activePage: parseInt(page)
      });
    }

    //console.log('ElementsType: ' + type + '#activePage ' + page);

    let {checkedIds, uncheckedIds, checkedAll} = state[this.props.type];

    // check if element details of any type are open at the moment
    let currentId = state.sample.currentId || state.reaction.currentId || state.wellplate.currentId;

    if (checkedIds || uncheckedIds || checkedAll || currentId) {
      this.setState({
        ui: {
          checkedIds: checkedIds,
          uncheckedIds: uncheckedIds,
          checkedAll: checkedAll,
          currentId: currentId
        }
      });
    }

  }

  onChange(state) {
    let type = this.props.type + 's';

    const elements = state.elements[type].elements;
    const totalElements = state.elements[type].totalElements;

    let currentElement;
    if(!state.currentElement || state.currentElement.type == this.props.type) {
      currentElement = state.currentElement
    }

    let elementsDidChange = elements && ! deepEqual(elements, this.state.elements);
    let currentElementDidChange = ! deepEqual(currentElement, this.state.currentElement);

    let page = this.state.activePage;

    let numberOfPages = Math.ceil(totalElements / this.state.pageSize);
    if (page > numberOfPages) {
      page = 1
    }

    if (elementsDidChange) {
      this.setState({
        elements: elements,
        currentElement: currentElement,
        numberOfPages: numberOfPages,
        activePage: page
      });
    }
    else if (currentElementDidChange) {
      this.setState({
        currentElement: currentElement,
        activePage: page
      });
    }
  }

  elementLabel(element) {
    if (element.type == 'sample') {
      return <SampleContainer sample={element}/>
    } else if (element.type == 'wellplate') {
      return <WellplateContainer wellplate={element}/>
    } else {
      return element.name;
    }
  }

  entries() {
    // Pagination: startAt...Arrayindex to start with...
    // TODO Move to PaginationUtils?
    let pageSize = this.state.pageSize;
    let elements = this.state.elements;

    return elements.map((element, index) => {
      let isSelected = this.state.currentElement && this.state.currentElement.id == element.id;
      let checked = this.isElementChecked(element);

      let optionalLabelColumn;
      if (this.showElementDetailsColumns()) {
        optionalLabelColumn = (
          <td className="labels">
            <ElementCollectionLabels element={element} key={element.id}/>
          </td>
        )
      }

      let svgColumn;
      if (element.molecule) {
        svgColumn = this.moleculeSVGColumn(element.molecule, {selected: isSelected});
      } else {
        svgColumn = (<td className="molecule" margin="0" padding="0">SVG ..</td>);
      }

      let style = {}
      if (isSelected) {
        style = {
          color: '#fff',
          background: '#337ab7'
        }
      }
      return (
        <tr key={index} height="100" style={style}>
          <td className="check">
            <ElementCheckbox element={element} key={element.id} checked={checked}/>
          </td>
          <td className="name"
              onClick={e => this.showDetails(element)}
              style={{cursor: 'pointer'}}>
            {this.elementLabel(element)}
          </td>
          {optionalLabelColumn}
          {svgColumn}
        </tr>
      )
    });
  }

  moleculeSVGColumn(molecule, options = {}) {
    let className = options.selected ? 'molecule-selected' : 'molecule';
    let moleculeSVG = this.moleculeSVG(molecule, className);
    return (
      <td className="molecule" margin="0" padding="0">
        {moleculeSVG}
      </td>
    );
  }

  moleculeSVG(molecule, className) {
    let svgPath = `/images/molecules/${molecule.molecule_svg_file}`;
    return (
      <SVG src={svgPath} className={className} key={molecule.id}/>
    );
  }

  showElementDetailsColumns() {
    return !(this.state.ui.currentId);
  }

  showDetails(element) {
    Aviator.navigate(this._elementDetailsUrl(element));
  }

  handlePaginationSelect(event, selectedEvent) {
    this.setState({
      activePage: selectedEvent.eventKey
    }, () => {
      let type = this.props.type;
      let pagination = {type: type, page: this.state.activePage};
      UIActions.setPagination(pagination)
    })
  }

  isElementChecked(element) {
    let {checkedIds, uncheckedIds, checkedAll} = this.state.ui

    let checked = (checkedAll && ArrayUtils.isValNotInArray(uncheckedIds || [], element.id))
      || ArrayUtils.isValInArray(checkedIds || [], element.id);

    return checked;
  }

  _elementDetailsUrl(element) {
    return `${this._collectionUrl()}/${element.type}/${element.id}`
  }

  _collectionUrl() {
    let uiState = UIStore.getState();
    return `/collection/${uiState.currentCollectionId}`
  }

  pagination() {
    if (this.state.numberOfPages > 1) {
      return (
        <Pagination activePage={this.state.activePage}
                    items={this.state.numberOfPages}
                    onSelect={this.handlePaginationSelect.bind(this)}/>
      )
    }
  }

  header() {
    let colSpan = this.showElementDetailsColumns() ? "3" : "2";
    let checkedAll = this.state.ui.checkedAll;

    return (
      <thead>
      <th className="check">
        <ElementAllCheckbox type={this.props.type} checked={checkedAll}/>
      </th>
      <th colSpan={colSpan}>
        All {this.props.type}s
      </th>
      </thead>
    )
  }

  render() {
    let entries = this.entries();
    let result;
    if (entries) {
      result = (
        <div>
          <Table className="elements" bordered hover>
            {this.header()}
            <tbody>
            {entries}
            </tbody>
          </Table>
          {this.pagination()}
        </div>
      )
    } else {
      result = (
        <div>
          'Nothing found.'
        </div>
      )
    }

    return result;
  }
}
