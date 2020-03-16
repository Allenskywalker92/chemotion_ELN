import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, ListGroup, ListGroupItem, ButtonToolbar, Button, Tooltip, OverlayTrigger, Row, Col, Tabs, Tab } from 'react-bootstrap';
import SVG from 'react-inlinesvg';
import { includes, last, findKey, values } from 'lodash';
import ElementCollectionLabels from '../ElementCollectionLabels';
import UIStore from '../stores/UIStore';
import UIActions from '../actions/UIActions';

import ElementActions from '../actions/ElementActions';
import DetailActions from '../actions/DetailActions';
import ResearchPlansFetcher from '../fetchers/ResearchPlansFetcher';
import ResearchPlansLiteratures from '../DetailsTabLiteratures';
import Attachment from '../models/Attachment';
import Utils from '../utils/Functions';
import LoadingActions from '../actions/LoadingActions';
import ConfirmClose from './common/ConfirmClose';

import ResearchPlanDetailsAttachments from './ResearchPlanDetailsAttachments';
import ResearchPlanDetailsBody from './ResearchPlanDetailsBody';
import ResearchPlanDetailsName from './ResearchPlanDetailsName';


export default class ResearchPlanDetails extends Component {
  constructor(props) {
    super(props);
    const { research_plan } = props;
    this.state = {
      research_plan,
      edit: true,
      update: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const {research_plan} = nextProps;
    this.setState({ research_plan });
  }

  toggleFullScreen() {
    this.props.toggleFullScreen()

    // toogle update prop to notify react data grid for view change
    this.setState({ update: !this.state.update })
  }

  // handle functions

  handleSubmit() {
    const { research_plan } = this.state;
    LoadingActions.start();

    if (research_plan.isNew) {
      ElementActions.createResearchPlan(research_plan);
    } else {
      ElementActions.updateResearchPlan(research_plan);
    }

    if (research_plan.is_new) {
      const force = true;
      DetailActions.close(research_plan, force);
    }
  }

  handleSelect(eventKey) {
    UIActions.selectTab({tabKey: eventKey, type: 'screen'});
    this.setState({
      activeTab: eventKey
    })
  }

  toggleEdit() {
    let {edit} = this.state

    this.setState({
      edit: !edit
    });
  }

  // handle name actions

  handleNameChange(value) {
    let {research_plan} = this.state
    research_plan.changed = true
    research_plan.name = value

    this.setState({ research_plan });
  }

  // handle body actions

  handleBodyChange(value, id) {
    let {research_plan} = this.state
    let index = research_plan.body.findIndex(field => field.id == id)

    research_plan.body[index].value = value
    research_plan.changed = true

    this.setState({ research_plan });
  }

  handleBodyDrop(source, target) {
    let {research_plan} = this.state

    research_plan.body.splice(target, 0, research_plan.body.splice(source, 1)[0]);
    research_plan.changed = true

    this.setState({ research_plan });
  }

  handleBodyAdd(type) {
    let {research_plan} = this.state

    research_plan.addBodyField(type)
    research_plan.changed = true

    this.setState({ research_plan });
  }

  handleBodyDelete(id) {
    let {research_plan} = this.state
    let index = research_plan.body.findIndex(field => field.id == id)

    research_plan.body.splice(index, 1)
    research_plan.changed = true

    this.setState({ research_plan });
  }

  // handle attachment actions

  handleAttachmentDrop(files) {
    let { research_plan } = this.state;

    research_plan.changed = true;

    files.map(file => {
      let attachment = Attachment.fromFile(file)
      research_plan.attachments.push(attachment)
    })

    this.setState({ research_plan });
  }

  handleAttachmentDelete(attachment) {
    let { research_plan } = this.state;
    let index = research_plan.attachments.indexOf(attachment);

    research_plan.changed = true;
    research_plan.attachments[index].is_deleted = true;

    this.setState({ research_plan });
  }

  handleAttachmentUndoDelete(attachment) {
    let { research_plan } = this.state;
    let index = research_plan.attachments.indexOf(attachment);

    research_plan.attachments[index].is_deleted = false;

    this.setState({
      research_plan: research_plan
    });
  }

  handleAttachmentDownload(attachment) {
      Utils.downloadFile({contents: `/api/v1/attachments/${attachment.id}`, name: attachment.filename});
  }

  handleAttachmentEdit(attachment) {
    const { research_plan } = this.state;

    // update only this attachment
    research_plan.attachments.map((current_attachment) => {
      if (current_attachment.id === attachment.id) return attachment;
    })
    this.setState({ research_plan });
    this.forceUpdate();
  }

  // render functions

  renderResearchPlanInfo(research_plan) {
    const style = {height: 'auto'};

    return (
      <Row style={style}>
        <Col md={6}>
          <h4>{research_plan.name}</h4>
        </Col>
      </Row>
    )
  }

  renderPropertiesTab(research_plan) {
    const { name, body, attachments } = research_plan
    const { update, edit } = this.state
    const submitLabel = research_plan.isNew ? "Create" : "Save"

    return (
      <ListGroup fill="true">
        <ListGroupItem>
          <ResearchPlanDetailsName value={name}
              disabled={research_plan.isMethodDisabled('name')}
              onChange={this.handleNameChange.bind(this)}
              edit={edit} />

          <ResearchPlanDetailsBody body={body}
              disabled={research_plan.isMethodDisabled('body')}
              onChange={this.handleBodyChange.bind(this)}
              onDrop={this.handleBodyDrop.bind(this)}
              onAdd={this.handleBodyAdd.bind(this)}
              onDelete={this.handleBodyDelete.bind(this)}
              update={update}
              edit={edit} />

          <ResearchPlanDetailsAttachments attachments={attachments}
              onDrop={this.handleAttachmentDrop.bind(this)}
              onDelete={this.handleAttachmentDelete.bind(this)}
              onUndoDelete={this.handleAttachmentUndoDelete.bind(this)}
              onDownload={this.handleAttachmentDownload.bind(this)}
              onEdit={this.handleAttachmentEdit.bind(this)}
              edit={edit} />
        </ListGroupItem>
      </ListGroup>
    );
  }

  renderLiteratureTab(research_plan) {
    const submitLabel = research_plan.isNew ? "Create" : "Save";

    return (
      <ResearchPlansLiteratures
        element={research_plan}
      />
    );
  }

  renderPanelHeading(research_plan) {
    let saveBtnDisplay = research_plan.changed ? '' : 'none'

    return (
      <Panel.Heading>
        <i className="fa fa-file-text-o" />
        &nbsp; <span>{research_plan.name}</span> &nbsp;
        <ElementCollectionLabels element={research_plan} placement="right"/>
        <OverlayTrigger placement="bottom"
                        overlay={<Tooltip id="closeresearch_plan">Close research_plan</Tooltip>}>

          <Button bsStyle="danger" bsSize="xsmall" className="button-right"
            onClick={() => DetailActions.close(research_plan)} >
            <i className="fa fa-times"></i>
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom"
                        overlay={<Tooltip id="saveresearch_plan">Save research_plan</Tooltip>}>

          <Button bsStyle="warning" bsSize="xsmall" className="button-right"
                  onClick={() => this.handleSubmit()}
                  style={{display: saveBtnDisplay}} >
            <i className="fa fa-floppy-o "></i>
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom"
                        overlay={<Tooltip id="saveresearch_plan">Toggle edit research_plan</Tooltip>}>

          <Button bsStyle="warning" bsSize="xsmall" className="button-right"
                  onClick={() => this.toggleEdit()}>
            <i className="fa fa-pencil"></i>
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom"
                        overlay={<Tooltip id="fullSample">Fullresearch_plan</Tooltip>}>

          <Button bsStyle="info" bsSize="xsmall" className="button-right"
            onClick={this.toggleFullScreen.bind(this)}>
            <i className="fa fa-expand"></i>
          </Button>
        </OverlayTrigger>
      </Panel.Heading>
    )
  }

  renderPanelBody(research_plan, edit) {
    const submitLabel = research_plan.isNew ? "Create" : "Save"

    return (
      <Panel.Body>
        {this.renderResearchPlanInfo(research_plan)}
        <Tabs activeKey={this.state.activeTab} onSelect={key => this.handleSelect(key)}
           id="screen-detail-tab">
          <Tab eventKey={0} title={'Properties'}>
            {this.renderPropertiesTab(research_plan)}
          </Tab>
          <Tab eventKey={1} title={'Literature'}>
            {this.renderLiteratureTab(research_plan)}
          </Tab>
        </Tabs>
        <ButtonToolbar>
          <Button bsStyle="primary" onClick={() => DetailActions.close(research_plan)}>Close</Button>
          <Button bsStyle="warning" onClick={() => this.handleSubmit()}>{submitLabel}</Button>
        </ButtonToolbar>
      </Panel.Body>
    )
  }

  render() {
    const { research_plan, edit } = this.state;

    return (
      <Panel bsStyle={research_plan.isPendingToSave ? 'info' : 'primary'}
             className="panel-detail research-plan-details">
        {this.renderPanelHeading(research_plan)}
        {this.renderPanelBody(research_plan, edit)}
      </Panel>
    );
  }
}

ResearchPlanDetails.propTypes = {
  research_plan: PropTypes.object,
  toggleFullScreen: PropTypes.func,
}
