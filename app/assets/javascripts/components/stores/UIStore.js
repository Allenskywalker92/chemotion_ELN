import alt from '../alt';
import UIActions from '../actions/UIActions';
import ElementActions from '../actions/ElementActions';
import ElementStore from './ElementStore';

import ArrayUtils from '../utils/ArrayUtils';
const Immutable = require('immutable');

class UIStore {
  constructor() {
    this.state = {
      checkedAllSamples: false,
      checkedSampleIds: Immutable.List(),
      uncheckedSampleIds: Immutable.List(),
      currentCollectionId: null,
      currentSampleId: null,
      pagination: null
    };

    this.bindListeners({
      handleSelectCollection: UIActions.selectCollection,
      handleCheckAllElements: UIActions.checkAllElements,
      handleCheckElement: UIActions.checkElement,
      handleUncheckElement: UIActions.uncheckElement,
      handleUncheckAllElements: UIActions.uncheckAllElements,
      handleDeselectAllElements: UIActions.deselectAllElements,
      handleSelectElement: UIActions.selectElement,
      handleSetPagination: UIActions.setPagination,
      handleRefreshSamples: ElementActions.updateSample
    });
  }

  handleCheckAllElements(type) {
    let {elements} = ElementStore.getState();

    switch(type) {
      case 'sample':
        this.state.checkedAllSamples = true;
        this.state.checkedSampleIds = Immutable.List();
        this.state.uncheckedSampleIds = Immutable.List();
        break;
    }
  }

  handleUncheckAllElements(type) {
    switch(type) {
      case 'sample':
        this.state.checkedAllSamples = false;
        this.state.checkedSampleIds = Immutable.List();
        this.state.uncheckedSampleIds = Immutable.List();
        break;
    }
  }

  handleCheckElement(element) {
    switch(element.type) {
      case 'sample':
        this.state.checkedSampleIds = ArrayUtils.pushUniq(this.state.checkedSampleIds, element.id);
        break;
    }
  }

  handleUncheckElement(element) {
    switch(element.type) {
      case 'sample':
        if(this.state.checkedAllSamples)
        {
          this.state.uncheckedSampleIds = ArrayUtils.pushUniq(this.state.uncheckedSampleIds, element.id);
        }
        else {
          this.state.checkedSampleIds = ArrayUtils.removeFromListByValue(this.state.checkedSampleIds, element.id);
        }
        break;
    }
  }

  handleDeselectAllElements(type) {
    switch(type) {
      case 'sample':
        this.state.currentSampleId = null;
        break;
    }
  }

  handleSelectElement(element) {
    switch(element.type) {
      case 'sample':
        this.state.currentSampleId = element.id;
        // TODO also for reactions and so on
        ElementActions.fetchSampleById(element.id)
        break;
    }
  }

  handleSelectCollection(collection) {
    this.state.currentCollectionId = collection.id;
    // TODO also for reactions and so on
    ElementActions.fetchSamplesByCollectionId(collection.id, this.state.pagination)
  }

  handleSetPagination(pagination) {
    this.state.pagination = pagination;
  }

  handleRefreshSamples() {
    ElementActions.fetchSamplesByCollectionId(this.state.currentCollectionId, this.state.pagination)
  }
}

export default alt.createStore(UIStore, 'UIStore');
