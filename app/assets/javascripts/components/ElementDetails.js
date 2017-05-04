import React, {Component} from 'react';
import StickyDiv from 'react-stickydiv'
import {Tabs, Tab, Label} from 'react-bootstrap';
import SampleDetails from './SampleDetails';
import DeviceDetails from './DeviceDetails';
import ReactionDetails from './ReactionDetails';
import WellplateDetails from './WellplateDetails';
import ScreenDetails from './ScreenDetails';
import ResearchPlanDetails from './ResearchPlanDetails';
import ElementActions from './actions/ElementActions';
import ElementStore from './stores/ElementStore';
import { ConfirmModal } from './common/ConfirmModal';
import ReportContainer from './report/ReportContainer';
import DetailActions from './actions/DetailActions';
import DetailStore from './stores/DetailStore';

export default class ElementDetails extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offsetTop: 70,
      fullScreen: false,
      ...DetailStore.getState(),
    }

    this.handleResize = this.handleResize.bind(this)
    this.toggleFullScreen = this.toggleFullScreen.bind(this)
    this.onDetailChange = this.onDetailChange.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    window.scrollTo(window.scrollX, window.scrollY + 1)
    // imitate scroll event to make StickyDiv element visible in current area
    DetailStore.listen(this.onDetailChange)
    DetailActions.changeCurrentElement.defer(null, this.props.currentElement)
  }

  componentWillReceiveProps(nextProps) {
    const oriProps = this.props
    DetailActions.changeCurrentElement.defer(oriProps.currentElement, nextProps.currentElement)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    DetailStore.unlisten(this.onDetailChange)
  }

  onDetailChange(state) {
    this.setState({...state})
  }

  toggleFullScreen() {
    const { fullScreen } = this.state;
    this.setState({ fullScreen: !fullScreen });
  }

  handleResize(e = null) {
    let windowHeight = window.innerHeight || 1;
    if (this.state.fullScreen || windowHeight < 500) {
      this.setState({offsetTop: 0});
    } else {this.setState( {offsetTop: 70}) }
  }

  content(el) {
    switch (el.type) {
      case 'sample':
        return <SampleDetails sample={el}
                  toggleFullScreen={this.toggleFullScreen}/>;
      case 'reaction':
        return <ReactionDetails reaction={el}
                  toggleFullScreen={this.toggleFullScreen}/>;
      case 'wellplate':
        return <WellplateDetails wellplate={el}
                  toggleFullScreen={this.toggleFullScreen}/>;
      case 'screen':
        return <ScreenDetails screen={el}
                  toggleFullScreen={this.toggleFullScreen}/>;
      case 'deviceCtrl':
        return <DeviceDetails device={el}
                  toggleFullScreen={this.toggleFullScreen}/>;
      // case 'deviceAnalysis':
      //   return <DeviceAnalysisDetails analysis={el}
      //     toggleFullScreen={this.toggleFullScreen}/>;
      case 'research_plan':
        return <ResearchPlanDetails research_plan={el}
                  toggleFullScreen={this.toggleFullScreen}/>;
      case 'report':
        return <ReportContainer report={el}/>
    }
  }

  tabTitle(el, elKey) {
    let bsStyle = el.isPendingToSave ? 'info' : 'primary';
    const focusing = elKey === this.state.activeKey;

    let iconElement = (<i className={`icon-${el.type}`}/>)
    let title = el.title()

    if (el.type === 'report') {
      title = "Report"
      bsStyle = "primary"
      iconElement = (
        <span>
          <i className="fa fa-file-text-o" />&nbsp;&nbsp;
          <i className="fa fa-pencil" />
        </span>
      )
    } else if (el.type === 'deviceCtrl') {
      title = "Measurement"
      bsStyle = "primary"
      iconElement = (
        <span>
          <i className="fa fa-bar-chart"/>
          <i className="fa fa-cogs"/>
        </span>
      )
    }

    let icon = focusing
      ? (iconElement)
      : <Label bsStyle={bsStyle}>{iconElement}</Label>

    return <div>{icon} &nbsp; {title} </div>
  }

  confirmDeleteContent() {
    return (
      <div>
        <p>If you select Yes, you will lose the unsaved data.</p>
        <p>Are you sure to close it?</p>
      </div>
    );
  }

  render() {
    const { fullScreen, selecteds, activeKey, offsetTop, deletingElement } = this.state;
    const fScrnClass = fullScreen ? "full-screen" : "normal-screen";

    return(
      <div>
         <StickyDiv zIndex={fullScreen ? 9 : 2} offsetTop={offsetTop}>
          <div className={fScrnClass}>
          <Tabs activeKey={activeKey} onSelect={DetailActions.select}
                id="elements-tabs">
            {selecteds.map( (el, i) => {
              return el
                ? <Tab key={i} eventKey={i} title={this.tabTitle(el, i)} unmountOnExit={true}>
                    {this.content(el)}
                  </Tab>
                : null;
            })}
          </Tabs></div>
        </StickyDiv>
        <ConfirmModal showModal={deletingElement !== null}
          title="Confirm Close"
          content={this.confirmDeleteContent()}
          onClick={DetailActions.confirmDelete} />
      </div>
    )
  }
}

ElementDetails.propTypes = {
  currentElement: React.PropTypes.object,
}
