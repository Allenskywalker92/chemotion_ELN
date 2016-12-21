import React from 'react';
import _ from 'lodash';
import {Tab, Button, Row, Col, Nav, NavItem,
        Popover, OverlayTrigger, ButtonToolbar} from 'react-bootstrap';

import ElementsTable from './ElementsTable';
import TabLayoutContainer from './TabLayoutContainer';

import ElementStore from './stores/ElementStore';
import UIStore from './stores/UIStore';
import UserStore from './stores/UserStore';

import UserActions from './actions/UserActions';
import UIActions from './actions/UIActions';
import KeyboardActions from './actions/KeyboardActions';

export default class List extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalSampleElements: 0,
      totalReactionElements: 0,
      totalWellplateElements: 0,
      totalScreenElements: 0,
      visible: [],
      hidden: [],
      currentTab: 0
    }

    this.onChange = this.onChange.bind(this)
    this.onChangeUser = this.onChangeUser.bind(this)
    this.initState = this.initState.bind(this)
    this.changeLayout = this.changeLayout.bind(this)
    this.handleTabSelect = this.handleTabSelect.bind(this)
  }

  _checkedElements(type) {
    let elementUI = UIStore.getState()[type];
    let element   = ElementStore.getState()['elements'][type+"s"];
    if (elementUI.checkedAll) {
      return element.totalElements - elementUI.uncheckedIds.size;
    } else {
      return elementUI.checkedIds.size;
    }
  }

  componentDidMount() {
    ElementStore.listen(this.onChange);
    UserStore.listen(this.onChangeUser);

    this.initState();
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange);
    UserStore.unlisten(this.onChangeUser);
  }

  initState(){
    this.onChange(ElementStore.getState())
  }

  onChange(state) {
    this.setState({
      totalSampleElements: state.elements.samples.totalElements,
      totalReactionElements: state.elements.reactions.totalElements,
      totalWellplateElements: state.elements.wellplates.totalElements,
      totalScreenElements: state.elements.screens.totalElements
    });
  }

  onChangeUser(state) {
    let visible = this.getArrayFromLayout(state.currentUser.layout, true)
    let hidden = this.getArrayFromLayout(state.currentUser.layout, false)
    if (hidden.length == 0) {
      hidden.push("hidden")
    }

    let currentType = this.state.visible[this.state.currentTab]
    let currentTabIndex = _.findKey(visible, function (e) {
      return e == currentType
    })
    if (!currentTabIndex) currentTabIndex = 0;

    let uiState = UIStore.getState()
    let type = state.currentType
    if (type == "") type = visible[0]

    if (!uiState[type] || !uiState[type].page) return;

    let page = uiState[type].page;

    UIActions.setPagination.defer({type: type, page: page})
    KeyboardActions.contextChange.defer(type)

    this.setState({
      currentTab: state.currentTab,
      visible: visible,
      hidden: hidden
    })
  }

  changeLayout() {
    let {visible, hidden} = this.refs.tabLayoutContainer.state

    let layout = {}

    visible.forEach(function (value, index) {
      layout[value] = (index + 1).toString()
    })
    hidden.forEach(function (value, index) {
      if (value != "hidden") layout[value] = (- index - 1).toString()
    })

    UserActions.changeLayout(layout)
  }

  handleTabSelect(tab) {
    UserActions.selectTab(tab);

    // TODO sollte in tab action handler
    let uiState = UIStore.getState();
    let type = this.state.visible[tab];

    if (!uiState[type] || !uiState[type].page) return;

    let page = uiState[type].page;

    UIActions.setPagination({type: type, page: page});
    KeyboardActions.contextChange(type);
  }

  getArrayFromLayout(layout, isVisible) {
    let array = []

    Object.keys(layout).forEach(function (key) {
      let order = layout[key]
      if (isVisible && order < 0) return;
      if (!isVisible && order > 0) return;

      array[Math.abs(order)] = key
    })

    array = array.filter(function(n){ return n != undefined })

    return array
  }

  render() {
    let {visible, hidden, currentTab} = this.state

    const {overview, showReport} = this.props
    const elementState = this.state
    let checkedElements = this._checkedElements

    let popoverLayout = (
      <Popover id="popover-layout" title="Tab Layout Editing">
        <TabLayoutContainer visible={visible} hidden={hidden}
                            ref="tabLayoutContainer"/>
      </Popover>
    )

    let navItems = []
    let tabContents = []
    for (let i = 0; i < visible.length; i++) {
      let value = visible[i]
      let navItem = (
        <NavItem eventKey={i} key={value + "_navItem"}>
          <i className={"icon-" + value}>
            {elementState["total" + _.upperFirst(value) + "Elements"]}
            ({checkedElements(value)})
          </i>
        </NavItem>
      )
      let tabContent = (
        <Tab.Pane eventKey={i} key={value + "_tabPanel"}>
          <ElementsTable overview={overview} showReport={showReport}
                         type={value}/>
        </Tab.Pane>
      )

      navItems.push(navItem)
      tabContents.push(tabContent)
    }

    return (
      <Tab.Container id="tabList" defaultActiveKey={0} activeKey={currentTab}
                     onSelect={(e) => this.handleTabSelect(e)}>
        <Row className="clearfix">
          <Col sm={12}>
            <Nav bsStyle="tabs">
              {navItems}
              &nbsp;&nbsp;&nbsp;
              <OverlayTrigger trigger="click" placement="bottom"
                              overlay={popoverLayout} rootClose
                              onExit={() => this.changeLayout()}>
                <Button bsSize="xsmall" bsStyle="danger"
                        style={{marginTop: "9px"}}>
                  <i className="fa fa-cog"></i>
                </Button>
              </OverlayTrigger>
            </Nav>
          </Col>
          <Col sm={12}>
            <Tab.Content animation>
              {tabContents}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    )
  }
}
