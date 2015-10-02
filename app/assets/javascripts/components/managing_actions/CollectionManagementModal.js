import React from 'react';
import {Button, Input, Modal} from 'react-bootstrap';
import Select from 'react-select';

import UIStore from '../stores/UIStore';
import CollectionStore from '../stores/CollectionStore';

import CollectionActions from '../actions/CollectionActions';

import Aviator from 'aviator';

export default class CollectionManagementModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ui_state: UIStore.getState(),
      collection_state: CollectionStore.getState(),
      action: props.action,
      modal_title: props.modal_title,
      show_collections: props.show_collections
    }
  }

  componentDidMount() {
    UIStore.listen(this.onUIChange.bind(this));
    CollectionStore.listen(this.onCollectionChange.bind(this));
  }

  componentWillUnmount() {
    UIStore.unlisten(this.onUIChange.bind(this));
    CollectionStore.unlisten(this.onCollectionChange.bind(this));
  }

  onUIChange(state) {
    this.setState({
      ui_state: state
    })
  }

  onCollectionChange(state) {
    this.setState({
      collection_state: state
    })
  }

  collectionEntries() {
    let collections = this.state.collection_state.unsharedRoots
    return collections.map(
      (collection) => {
        return (<option value={collection.id}>{collection.label}</option>)
      }
    );
  }

  addCollection() {
    let label = this.refs.collectionLabelInput.getValue() || ''; //TODO: Don't allow empty labels.
    CollectionActions.createUnsharedCollection({label: label});
  }

  hideModal() {
    Aviator.navigate(Aviator.getCurrentURI()+'/hide');
  }

  handleSubmit() {
    let select_ref = this.refs.collectionSelect
    let collection_id = select_ref ? select_ref.getValue() : undefined;
    // TODO: This needs to be improved.
    // We are constantly changing the ui_state into this syntax:
    let ui_state = {
      sample: {
        all: this.state.ui_state.sample.checkedAll,
        included_ids: this.state.ui_state.sample.checkedIds,
        excluded_ids: this.state.ui_state.sample.uncheckedIds
      },
      reaction: {
        all: this.state.ui_state.reaction.checkedAll,
        included_ids: this.state.ui_state.reaction.checkedIds,
        excluded_ids: this.state.ui_state.reaction.uncheckedIds
      },
      wellplate: {
        all: this.state.ui_state.wellplate.checkedAll,
        included_ids: this.state.ui_state.wellplate.checkedIds,
        excluded_ids: this.state.ui_state.wellplate.uncheckedIds
      },
      currentCollectionId: this.state.ui_state.currentCollectionId
    }

    this.state.action({ui_state: ui_state, collection_id: collection_id});
  }

  showCollections() {
    if (this.state.show_collections) {
      return (
        <div>
          <Input ref='collectionSelect' type='select' label='Select a Collection'>
            {this.collectionEntries()}
          </Input>
          <form>
            <table width="100%">
              <tr>
                <td width="95%" className="padding-right">
                  <Input type="text" label="Create a new Collection" ref="collectionLabelInput"
                    placeholder={'-- Please insert collection name --'}
                  />
                </td>
                <td width="5%">
                  <Button bsSize="xsmall" bsStyle="success" onClick={this.addCollection.bind(this)}>
                    <i className="fa fa-plus"></i>
                  </Button>
                </td>
              </tr>
            </table>
          </form>
        </div>
      )
    }
    return;
  }

  render() {
    return (
      <div>
        <Modal animation show={true} onHide={this.hideModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.modal_title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { this.showCollections() }
            <Button bsStyle="warning" onClick={this.handleSubmit.bind(this)}>Submit</Button>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}
