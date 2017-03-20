import React from 'react';
import { Pagination, Table, Form, Col, Row, Button, InputGroup,
         FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import ElementActions from './actions/ElementActions';

import ElementStore from './stores/ElementStore';
import ElementAllCheckbox from './ElementAllCheckbox';
import ElementsTableEntries from './ElementsTableEntries';
import ElementsTableSampleEntries from './ElementsTableSampleEntries'
import ElementsSvgCheckbox from './ElementsSvgCheckbox';
import deepEqual from 'deep-equal';

export default class ElementsTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      elements: [],
      currentElement: null,
      ui: {},
      sampleCollapseAll: false,
      moleculeSort: false
    }
    this.onChange = this.onChange.bind(this)
    this.onChangeUI = this.onChangeUI.bind(this)

    this.collapseSample = this.collapseSample.bind(this)
  }

  componentDidMount() {
    UIStore.getState();
    ElementStore.listen(this.onChange);
    UIStore.listen(this.onChangeUI);
    this.initializePagination();
    this.initState();
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange);
    UIStore.unlisten(this.onChangeUI);
  }

  initializePagination() {
    const {page, pages, perPage, totalElements} = this.state;
    this.setState({
      page, pages, perPage, totalElements
    });
  }

  initState(){
    this.onChange(ElementStore.getState());
  }

  onChangeUI(state) {
    let {checkedIds, uncheckedIds, checkedAll} = state[this.props.type];

    // check if element details of any type are open at the moment
    let currentId = state.sample.currentId || state.reaction.currentId ||
                    state.wellplate.currentId;

    if (checkedIds || uncheckedIds || checkedAll || currentId ||
        state.showPreviews) {
      this.setState({
        ui: {
          checkedIds: checkedIds,
          uncheckedIds: uncheckedIds,
          checkedAll: checkedAll,
          currentId: currentId,
          showPreviews: state.showPreviews,
          number_of_results: state.number_of_results
        }
      });
    }

  }

  onChange(state) {
    let type = this.props.type + 's';
    let elementsState = state.elements[type];

    const {elements, page, pages, perPage, totalElements} = elementsState;

    let currentElement;
    if(!state.currentElement || state.currentElement.type == this.props.type) {
      currentElement = state.currentElement
    }

    let elementsDidChange = elements && ! deepEqual(elements, this.state.elements);
    let currentElementDidChange = !deepEqual(currentElement, this.state.currentElement);

    if (elementsDidChange) {
      this.setState({
        elements, page, pages, perPage, totalElements, currentElement
      }),
      () => this.initializePagination()
    }
    else if (currentElementDidChange) {
      this.setState({
        page, pages, perPage, totalElements, currentElement
      }),
      () => this.initializePagination()
    }
  }

  collapseSample(sampelCollapseAll) {
    this.setState({sampleCollapseAll: !sampelCollapseAll})
  }

  changeSort() {
    let {moleculeSort} = this.state
    moleculeSort = !moleculeSort

    this.setState({
      moleculeSort
    }, () => ElementActions.changeSorting(moleculeSort))
  }

  handlePaginationSelect(eventKey) {
    const {pages} = this.state;
    const {type} = this.props;

    if(eventKey > 0 && eventKey <= pages) {
      this.setState({
        page: eventKey
      }, () => UIActions.setPagination({type, page: this.state.page}));
    }
  }

  pagination() {
    const {page, pages} = this.state;
    if(pages > 1) {
      return (
        <div className='list-pagination'>
          <Pagination
            prev
            next
            first
            last
            maxButtons={5}
            activePage={page}
            items={pages}
            bsSize="small"
            onSelect={(eventKey) => this.handlePaginationSelect(eventKey)}/>
        </div>
      )
    }
  }

  previewCheckbox() {
    const {ui} = this.state;
    const {type} = this.props;
    if(type == 'reaction' || type == 'sample') {
      return (
        <ElementsSvgCheckbox checked={ui.showPreviews}/>
      )
    }
  }

  handleNumberOfResultsChange(event) {
    const value = event.target.value;
    const {type} = this.props;
    UIActions.changeNumberOfResultsShown(value);
    ElementActions.refreshElements(type)
  }

  numberOfResultsInput() {
    let {ui} = this.state
    return (
      <Form horizontal className='list-show-count'>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>Show</InputGroup.Addon>
            <FormControl type="text" style={{textAlign: 'center'}}
                         onChange={event => this.handleNumberOfResultsChange(event)}
                         value={ui.number_of_results ? ui.number_of_results : 0} />
          </InputGroup>
        </FormGroup>
      </Form>
    );
  }

  renderEntries() {
    const {elements, ui, currentElement, sampleCollapseAll, moleculeSort} = this.state

    const {overview, showReport, type} = this.props
    if(type == 'sample') {
      return (
        <div>
          <Table className="elements" bordered hover style={{marginBottom: 0}}>
            <thead><tr>
              <th className="check" style={{verticalAlign: "middle"}}>
                <ElementAllCheckbox type={this.props.type}
                  checked={ui.checkedAll}
                  showReport={showReport}/>
              </th>
              <th colSpan={3} style={{verticalAlign: "middle", position: "relative"}}>
                <span style={{position: "absolute", top: "30%"}}>All {type}s</span>
                <div style={{display: "initial", verticalAlign: "middle", width: "100%"}}>
                  <div style={{float: "right"}}>
                    <Button bsStyle="info" style={{width: "120px", padding: "5px"}}
                        onClick={() => this.changeSort()}>
                      {moleculeSort ? "Sort by Sample" : "Sort by Molecule"}
                    </Button>
                    &nbsp;&nbsp;
                    <span>Collapse all</span> &nbsp;
                    <input type="checkbox" checked={sampleCollapseAll}
                      onChange={() => this.collapseSample(sampleCollapseAll)} />
                  </div>
                </div>
              </th>
            </tr></thead>
          </Table>
          <div className="list-elements">
            <ElementsTableSampleEntries collapseAll={sampleCollapseAll}
              elements={elements} currentElement={currentElement}
              showDragColumn={!overview} ui={ui} moleculeSort={moleculeSort}
              onChangeCollapse={(checked) => this.collapseSample(!checked)}
            />
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Table className="elements" bordered hover style={{marginBottom: 0}}>
            <thead><tr>
              <th className="check">
                <ElementAllCheckbox type={this.props.type}
                  checked={ui.checkedAll}
                  showReport={showReport}/>
              </th>
              <th colSpan={3}>
                All {type.replace('_', ' ')}s
              </th>
            </tr></thead>
          </Table>
          <div className="list-elements">
            <ElementsTableEntries
              elements={elements}
              currentElement={currentElement}
              showDragColumn={!overview}
              ui={ui}
            />
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="list-container">
        {this.renderEntries()}
        <div className="list-container-bottom">
          <Row>
            <Col sm={6}>{this.previewCheckbox()}</Col>
            <Col sm={6}>{this.numberOfResultsInput()}</Col>
          </Row>
          <Row>
            <Col sm={12}>{this.pagination()}</Col>
          </Row>
        </div>
      </div>
    );
  }
}
