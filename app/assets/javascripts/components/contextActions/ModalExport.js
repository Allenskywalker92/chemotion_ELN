import React from 'react';
import {Button, ButtonToolbar, Input} from 'react-bootstrap';
import CheckBoxs from '../common/CheckBoxs';
import UIStore from './../stores/UIStore';
import Utils from '../utils/Functions';

export default class ModalExport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [ {value: "Image", text: "image", checked: true},
                  {value: "name", text: "name", checked: true},
                  {value: "description", text: "description", checked: true},
                  {value: "cano_smiles", text: "cano_smiles", checked: true},
                  {value: "sum_formular", text: "sum_formula", checked: true},
                  {value: "inchistring", text: "inchistring", checked: true},
                  {value: "target_amount_value,target_amount_unit", text: "target amount", checked: false},
                  {value: "created_at", text: "created_at", checked: false},
                  {value: "updated_at", text: "updated_at", checked: false},
                  {value: "molfile", text: "molfile", checked: false},
                  {value: "purity", text: "purity", checked: false},
                  {value: "solvent", text: "solvent", checked: false},
                  {value: "impurities", text: "impurities", checked: false},
                  {value: "location", text: "location", checked: false},
                  {value: "is_top_secret", text: "is_top_secret", checked: false},
                  {value: "ancestry", text: "ancestry", checked: false},
                  {value: "external_label", text: "external_label", checked: false},
                  {value: "short_label", text: "short_label", checked: false},
                  {value: "real_amount_value,real_amount_unit", text: "real_amount", checked: false},
                  {value: "imported_readout", text: "imported_readout", checked: false},
                  {value: "identifier", text: "identifier", checked: false},
                  {value: "density", text: "density", checked: false},
                  {value: "melting_point", text: "melting_point", checked: false},
                  {value: "boiling_point", text: "boiling_point", checked: false} ],
      checkedAllColumns: true,
    };
  }

  toggleColumns(text, checked){
    const { columns } = this.state;
    this.setState({
      columns: columns.map( col => {
        if(col.text === text) {
          return Object.assign({}, col, {checked: !checked})
        }
        return col
      })
    })
  }

  toggleColumnsAll() {
    const { columns } = this.state;
    const newCheckValue = !this.state.checkedAllColumns
    this.setState({
      columns: columns.map( col => {
        return Object.assign({}, col, {checked: newCheckValue})
      }),
      checkedAllColumns: newCheckValue
    })
  }

  buttonBar() {
    const { onHide } = this.props;
    return (
      <ButtonToolbar>
        <div className="pull-right">
          <Button bsStyle="primary" onClick={() => onHide()}>Cancel</Button>
          <Button bsStyle="warning" onClick={() => this.handleClick()} >Export</Button>
        </div>
      </ButtonToolbar>
    )
  }

  handleClick() {
    const uiState = UIStore.getState();
    const { onHide } = this.props;
    onHide();
    const removedColumns = this.removedColumns();
    exportSelections(uiState, removedColumns);
  }

  removedColumns() {
    const { columns } = this.state;
    return this.chainedItems(columns);
  }

  chainedItems(items) {
    return items.map(item => {
      return !item.checked
        ? item.value
        : null
    }).filter(r => r!=null).join(',');
  }

  render() {
    return (
      <div>
        <div className='export-container'>
          <CheckBoxs  items={this.state.columns}
                      toggleCheckbox={this.toggleColumns.bind(this)}
                      toggleCheckAll={this.toggleColumnsAll.bind(this)}
                      checkedAll={this.state.checkedAllColumns} />
        </div>
        {this.buttonBar()}
      </div>
    )
  }
}

const exportSelections = (uiState, removedColumns) => {
  const { currentTab, currentCollection, sample, reaction, wellplate } = uiState;
  let url_params;
  switch(currentTab) {
    case 1:
      url_params = "type=sample" + selectedStringfy(sample, currentCollection, removedColumns);
      break;
    case 2:
      url_params = "type=reaction" + selectedStringfy(reaction, currentCollection, removedColumns);
      break;
    case 3:
      url_params = "type=wellplate" + selectedStringfy(wellplate, currentCollection, removedColumns);
      break;
  }
  Utils.downloadFile({ contents: "api/v1/reports/export_samples_from_selections?" + url_params });
}

const selectedStringfy = (input, currentCollection, removedColumns) => {
  const { checkedIds, uncheckedIds, checkedAll } = input;
  return "&checkedIds=" + checkedIds.toArray() +
          "&uncheckedIds=" + uncheckedIds.toArray() +
          "&checkedAll=" + checkedAll +
          "&currentCollection=" + currentCollection.id +
          "&removedColumns=" + removedColumns
}
