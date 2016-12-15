import React, {PropTypes, Component} from 'react';
import {Well, Panel, Input, ListGroup, ListGroupItem, ButtonToolbar, Button,
  Tabs, Tab, Tooltip, OverlayTrigger, Col, Row} from 'react-bootstrap';
import QRCode from 'qrcode.react';
import Barcode from 'react-barcode';

import ElementCollectionLabels from './ElementCollectionLabels';
import ElementActions from './actions/ElementActions';
import CollectionActions from './actions/CollectionActions';
import Wellplate from './Wellplate';
import WellplateList from './WellplateList';
import WellplateProperties from './WellplateProperties';

import UIStore from './stores/UIStore';

const cols = 12;

export default class WellplateDetails extends Component {
  constructor(props) {
    super(props);
    const {wellplate} = props;
    this.state = {
      wellplate,
      activeTab: 0,
      showWellplate: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    const {wellplate} = this.state;
    const nextWellplate = nextProps.wellplate;
    if (nextWellplate.id != wellplate.id || nextWellplate.updated_at != wellplate.updated_at) {
      this.setState({
        wellplate: nextWellplate
      });
    }
  }

  handleSubmit() {
    const {currentCollection} = UIStore.getState();
    const {wellplate} = this.state;

    if(wellplate.isNew) {
      ElementActions.createWellplate(wellplate.serialize());
    } else {
      ElementActions.updateWellplate(wellplate.serialize());
    }
    if(wellplate.is_new) {
      const force = true;
      this.props.closeDetails(wellplate, force);
    }
  }

  handleWellsChange(wells) {
    let {wellplate} = this.state;
    wellplate.wells = wells;
    this.setState({ wellplate });
  }

  handleChangeProperties(change) {
    let {wellplate} = this.state;
    let {type, value} = change;

    switch (type) {
      case 'name':
        wellplate.name = value;
        break;
      case 'description':
        wellplate.description = value;
        break;
    }

    this.setState({ wellplate });
  }

  handleTabChange(event) {
    let showWellplate = (event == 0) ? true : false;
    this.setState({activeTab: event, showWellplate});
  }

  wellplateHeader(wellplate) {
    let saveBtnDisplay = wellplate.isEdited ? '' : 'none'

    return(
      <div>
        <i className="icon-wellplate" />
        &nbsp; <span>{wellplate.name}</span> &nbsp;
        <ElementCollectionLabels element={wellplate} placement="right"/>
        <OverlayTrigger placement="bottom"
            overlay={<Tooltip id="closeWellplate">Close Wellplate</Tooltip>}>
          <Button bsStyle="danger" bsSize="xsmall"
            className="button-right" onClick={() => this.props.closeDetails(wellplate)} >
            <i className="fa fa-times"></i>
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom"
            overlay={<Tooltip id="saveWellplate">Save Wellplate</Tooltip>}>
          <Button bsStyle="warning" bsSize="xsmall" className="button-right"
                  onClick={() => this.handleSubmit()}
                  style={{display: saveBtnDisplay}} >
            <i className="fa fa-floppy-o "></i>
          </Button>
        </OverlayTrigger>
        <OverlayTrigger placement="bottom"
            overlay={<Tooltip id="fullSample">FullScreen</Tooltip>}>
        <Button bsStyle="info" bsSize="xsmall" className="button-right"
          onClick={() => this.props.toggleFullScreen()}>
          <i className="fa fa-expand"></i>
        </Button>
        </OverlayTrigger>
      </div>
    )
  }

  wellplateQrCode(wellplate) {
    let qrCode = wellplate.qr_code
    if(qrCode != null)
      return <QRCode value={qrCode} size="80"/>;
    else
      return '';
  }

  wellplateBarCode(wellplate) {
    let barCode = wellplate.bar_code
    if(barCode != null)
      return <Barcode
                value={barCode}
                width={1}
                height={80}
                fontSize={13}
                marginTop={10}
                marginBottom={10}
                margin={0}/>;
    else
      return '';
  }

  render() {
    const {wellplate, activeTab, showWellplate} = this.state;
    const {wells, name, size, description} = wellplate;
    const submitLabel = wellplate.isNew ? "Create" : "Save";
    const properties = {
      name,
      size,
      description
    };

    return (
      <Panel header={this.wellplateHeader(wellplate)}
             bsStyle={wellplate.isPendingToSave ? 'info' : 'primary'}
             className="panel-detail">
        <Tabs activeKey={activeTab} onSelect={event => this.handleTabChange(event)}
              id="wellplateDetailsTab">
          <Tab eventKey={0} title={'Designer'}>
            <Row>
              <Col md={10}>
                <Well>
                  <Wellplate
                    show={showWellplate}
                    size={size}
                    wells={wells}
                    handleWellsChange={(wells) => this.handleWellsChange(wells)}
                    cols={cols}
                    width={60}
                    />
                </Well>
              </Col>
              <Col md={2}>
                {this.wellplateBarCode(wellplate)}
                {this.wellplateQrCode(wellplate)}
              </Col>
            </Row>
          </Tab>
          <Tab eventKey={1} title={'List'}>
            <Well>
              <WellplateList
                wells={wells}
                handleWellsChange={(wells) => this.handleWellsChange(wells)}
                />
            </Well>
          </Tab>
          <Tab eventKey={2} title={'Properties'}>
            <WellplateProperties
              {...properties}
              changeProperties={(change) => this.handleChangeProperties(change)}
              />
          </Tab>
        </Tabs>
        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={() => this.props.closeDetails(wellplate)}
            >
            Close
          </Button>
          <Button
            bsStyle="warning"
            onClick={() => this.handleSubmit()}
            >
            {submitLabel}
          </Button>

          <Button
            bsStyle="default"
            onClick={() => CollectionActions.downloadReportWellplate(wellplate.id)}
            >
            Export samples
          </Button>
        </ButtonToolbar>
      </Panel>
    );
  }
}

WellplateDetails.propTypes = {
  wellplate: PropTypes.object.isRequired,
  closeDetails: React.PropTypes.func,
  toggleFullScreen: React.PropTypes.func,
};
