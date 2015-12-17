import React, {Component} from 'react';
import {Table, Input} from 'react-bootstrap';
import SVG from 'react-inlinesvg';

export default class WellplateList extends Component {
  handleReadoutOfWellChange(event, well) {
    const value = event.target.value;
    const {wells, handleWellsChange} = this.props;
    const wellId = wells.indexOf(well);
    wells[wellId].readout = value
    handleWellsChange(wells);
  }

  render() {
    const {wells} = this.props;
    return (
      <div>
        <Table bordered hover condensed>
          <thead>
            <th width="3%">#</th>
            <th width="5%">Position</th>
            <th width="5%">Molecule</th>
            <th width="22%">Name</th>
            <th width="15%">Sum-Formula</th>
            <th width="25%">Readout</th>
            <th width="25%">Imported Readout</th>
          </thead>
          <tbody>
          {wells.map((well, key) => {
            const id = key + 1;
            const {sample, position, readout} = well;
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            const positionY = alphabet[position.y-1];
            const positions = positionY + position.x;
            let svgPath = '';
            let sampleName = '';
            let sum_formular = '';
            let importedReadout = ''
            let svgNode = '';
            const style = {
              resize: 'none',
              height: 66,
            };
            const inputContainerStyle = {
              padding: 0
            };
            if (sample) {
              svgPath = `/images/molecules/${sample.molecule.molecule_svg_file}`;
              svgNode = <SVG className="molecule-small" src={svgPath}/>;
              let {name, external_label, short_label, imported_readout} = sample
              sampleName = `${name || ""} ${external_label || ""} ${short_label || ""}`
              importedReadout = imported_readout
              sum_formular = sample.molecule.sum_formular;
            }
            return <tr key={key}>
              <td>{id}</td>
              <td>{positions}</td>
              <td>{svgNode}</td>
              <td>{sampleName}</td>
              <td>{sum_formular}</td>
              <td style={inputContainerStyle}>
                <Input
                  type="textarea"
                  style={style}
                  value={readout}
                  onChange={event => this.handleReadoutOfWellChange(event, well)}
                  groupClassName="no-margin"
                />
              </td>
              <td style={inputContainerStyle}>
                <Input
                  type="textarea"
                  style={style}
                  value={importedReadout}
                  disabled
                  groupClassName="no-margin"
                />
              </td>
            </tr>
          })}
        </tbody>
        </Table>
      </div>
    );
  }
}
