import React, {Component} from 'react'
import {Panel, Button, Tabs, Tab, Row, Col, FormGroup, ControlLabel,
        FormControl, Tooltip, OverlayTrigger } from 'react-bootstrap';
import _ from 'lodash';
import ReportActions from '../actions/ReportActions';
import ReportStore from '../stores/ReportStore';
import UIActions from '../actions/UIActions';
import UIStore from '../stores/UIStore';
import Setting from './Setting';
import Previews from './Previews';
import Orders from './Orders';
import Archives from './Archives';
import Config from './Config';
import PanelHeader from '../common/PanelHeader';
import { CloseBtn, ResetBtn, GenerateReportBtn } from './ReportComponent';

export default class ReportContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...ReportStore.getState(),
    }
    this.onChange = this.onChange.bind(this);
    this.onChangeUI = this.onChangeUI.bind(this);
    this.panelHeader = this.panelHeader.bind(this);
    this.fileNameRule = this.fileNameRule.bind(this);
    this.toggleConfigs = this.toggleConfigs.bind(this);
    this.toggleConfigsAll = this.toggleConfigsAll.bind(this);
    this.handleImgFormatChanged = this.handleImgFormatChanged.bind(this);
    this.updateQueue = this.updateQueue.bind(this);
  }

  componentDidMount() {
    ReportStore.listen(this.onChange);
    UIStore.listen(this.onChangeUI);
    let state = UIStore.getState();
    this.onChangeUI(state);
    ReportActions.getArchives.defer();
  }

  componentWillUnmount() {
    ReportStore.unlisten(this.onChange)
    UIStore.unlisten(this.onChangeUI)
  }

  onChange(state) {
    this.setState({...state})
  }

  onChangeUI(state) {
    const newTags = { sampleIds: state['sample'].checkedIds.toArray(),
                      reactionIds: state['reaction'].checkedIds.toArray() };
    const oldTags = this.state.selectedObjTags;
    const defaultTags = this.state.defaultObjTags;
    ReportActions.updateCheckedTags.defer(oldTags, newTags, defaultTags);
  }

  panelHeader() {
    const { report } = this.props;
    const allState = this.state;
    const btns = [
      <CloseBtn key="closeBtn" report={report} />,
      <GenerateReportBtn
        key="generateReportBtn"
        allState={allState}
        updateQueue={this.updateQueue}
      />,
      <ResetBtn key="resetBtn" />,
    ];
    return <PanelHeader title="Report Generation" btns={btns} />;
  }

  render() {
    const { splSettings, checkedAllSplSettings,
            rxnSettings, checkedAllRxnSettings,
            configs, checkedAllConfigs,
            selectedObjs, archives, activeKey,
            imgFormat, fileName, template } = this.state;
    return (
      <Panel header={this.panelHeader()}
             bsStyle="default">

        <Tabs activeKey={activeKey}
              onSelect={this.selectTab}
              id="report-tabs" >
          <Tab eventKey={0} title={"Config"}>
            <Config
              imgFormat={imgFormat}
              fileName={fileName}
              configs={configs}
              checkedAllConfigs={checkedAllConfigs}
              template={template}
              fileNameRule={this.fileNameRule}
              toggleConfigs={this.toggleConfigs}
              toggleConfigsAll={this.toggleConfigsAll}
              handleImgFormatChanged={this.handleImgFormatChanged}
              handleTemplateChanged={this.handleTemplateChanged}
            />
          </Tab>

          <Tab eventKey={1} title={"Setting"}>
            <Setting
              template={template}
              splSettings={splSettings}
              toggleSplSettings={this.toggleSplSettings}
              toggleSplSettingsAll={this.toggleSplSettingsAll}
              checkedAllSplSettings={checkedAllSplSettings}
              rxnSettings={rxnSettings}
              toggleRxnSettings={this.toggleRxnSettings}
              toggleRxnSettingsAll={this.toggleRxnSettingsAll}
              checkedAllRxnSettings={checkedAllRxnSettings} />
          </Tab>

          <Tab eventKey={2} title={"Order"}>
            <div className="panel-fit-screen">
              <Orders selectedObjs={selectedObjs} template={template} />
            </div>
          </Tab>

          <Tab eventKey={3} title={"Preview"}>
            <div className="panel-fit-screen">
              <Previews selectedObjs={selectedObjs}
                         splSettings={splSettings}
                         rxnSettings={rxnSettings}
                         configs={configs}
                         template={template} />
            </div>
          </Tab>

          <Tab eventKey={4} title={this.archivesTitle()}>
            <div className="panel-fit-screen">
              <Archives archives={archives} />
            </div>
          </Tab>
        </Tabs>

      </Panel>
    );
  }

  fileNameRule() {
    return (
      <Tooltip id="file-name-rule" >
        <p>Max 40 characters.</p>
        <p>allowed: a to z, A to Z, 0 to 9, -, _</p>
      </Tooltip>
    );
  }

  toggleSplSettings(text, checked){
    ReportActions.updateSplSettings({text, checked})
  }

  toggleRxnSettings(text, checked){
    ReportActions.updateRxnSettings({text, checked})
  }

  toggleConfigs(text, checked){
    ReportActions.updateConfigs({text, checked})
  }

  toggleSplSettingsAll() {
    ReportActions.toggleSplSettingsCheckAll()
  }

  toggleRxnSettingsAll() {
    ReportActions.toggleRxnSettingsCheckAll()
  }

  toggleConfigsAll() {
    ReportActions.toggleConfigsCheckAll()
  }

  handleImgFormatChanged(e) {
    ReportActions.updateImgFormat(e.value);
  }

  handleTemplateChanged(e) {
    ReportActions.updateTemplate(e.value);
  }

  selectTab(key) {
    ReportActions.updateActiveKey(key);
  }

  archivesTitle() {
    const unreadIds = this.unreadIds();
    const unReadBadge = unreadIds.length > 0
      ? <span className='badge-danger'>{unreadIds.length}</span>
      : null;

    return(
      <span>Archive {unReadBadge}</span>
    );
  }

  unreadIds() {
    let ids = [];
    this.state.archives.forEach( a => {
      if(a.unread) {
        ids = [...ids, a.id];
      }
    });
    return ids;
  }

  updateQueue() {
    const { processings } = this.state;
    if (processings.length > 0) {
      ReportActions.updateProcessQueue.defer(processings);
    }
  }
}
