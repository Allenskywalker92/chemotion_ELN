import alt from '../alt';
import UIActions from '../actions/UIActions';
import ElementActions from '../actions/ElementActions';
import ElementStore from './ElementStore';

import ArrayUtils from '../utils/ArrayUtils';
const Immutable = require('immutable');

class UIStore {
  constructor() {
    this.state = {
      sample: {
        checkedAll: false,
        checkedIds: Immutable.List(),
        uncheckedIds: Immutable.List(),
        currentId: null,
        page: 1
      },
      reaction: {
        checkedAll: false,
        checkedIds: Immutable.List(),
        uncheckedIds: Immutable.List(),
        currentId: null,
        page: 1
      },
      wellplate: {
        checkedAll: false,
        checkedIds: Immutable.List(),
        uncheckedIds: Immutable.List(),
        currentId: null,
        page: 1
      },
      screen: {
        checkedAll: false,
        checkedIds: Immutable.List(),
        uncheckedIds: Immutable.List(),
        currentId: null,
        page: 1
      },
      currentCollectionId: null,
      currentTab: 1,
      currentSearchSelection: null
    };

    this.bindListeners({
      handleSelectTab: UIActions.selectTab,
      handleSelectCollection: UIActions.selectCollection,
      handleCheckAllElements: UIActions.checkAllElements,
      handleCheckElement: UIActions.checkElement,
      handleUncheckElement: UIActions.uncheckElement,
      handleUncheckAllElements: UIActions.uncheckAllElements,
      handleDeselectAllElementsOfType: UIActions.deselectAllElementsOfType,
      handleSelectElement: UIActions.selectElement,
      handleSetPagination: UIActions.setPagination,
      handleDeselectAllElements: UIActions.deselectAllElements,
      handleSetSearchSelection: UIActions.setSearchSelection,
      handleSelectCollectionWithoutUpdating: UIActions.selectCollectionWithoutUpdating,
      handleClearSearchSelection: UIActions.clearSearchSelection
    });
  }

  handleSelectTab(tab) {
    console.log('handleSelectTab: ' + tab)
    this.state.currentTab = tab;
  }

  handleCheckAllElements(type) {
    let {elements} = ElementStore.getState();

    this.state[type].checkedAll = true;
    this.state[type].checkedIds = Immutable.List();
    this.state[type].uncheckedIds = Immutable.List();
  }

  handleUncheckAllElements(type) {
    this.state[type].checkedAll = false;
    this.state[type].checkedIds = Immutable.List();
    this.state[type].uncheckedIds = Immutable.List();
  }

  handleCheckElement(element) {
    let type = element.type;

    if(this.state[type].checkedAll) {
      this.state[type].uncheckedIds = ArrayUtils.removeFromListByValue(this.state[type].uncheckedIds, element.id);
    }
    else {
      this.state[type].checkedIds = ArrayUtils.pushUniq(this.state[type].checkedIds, element.id);
    }

  }

  handleUncheckElement(element) {
    let type = element.type;

    if(this.state[type].checkedAll)
    {
      this.state[type].uncheckedIds = ArrayUtils.pushUniq(this.state[type].uncheckedIds, element.id);
    }
    else {
      this.state[type].checkedIds = ArrayUtils.removeFromListByValue(this.state[type].checkedIds, element.id);
    }
  }

  handleDeselectAllElementsOfType(type) {
    this.state[type].currentId = null;
  }

  handleDeselectAllElements() {
    this.state.sample.currentId = null;
    this.state.reaction.currentId = null;
    this.state.wellplate.currentId = null;
  }

  handleSelectElement(element) {
    this.state[element.type].currentId = element.id;
  }

  handleSelectCollection(collection) {
    let hasChanged = (this.state.currentCollectionId != collection.id) || (this.state.currentSearchSelection != null);
    this.state.currentCollectionId = collection.id;

    if(hasChanged) {
      ElementActions.fetchSamplesByCollectionId(collection.id, this.state.pagination);
      ElementActions.fetchReactionsByCollectionId(collection.id, this.state.pagination);
      ElementActions.fetchWellplatesByCollectionId(collection.id, this.state.pagination);
      ElementActions.fetchScreensByCollectionId(collection.id, this.state.pagination);
    }
  }

  handleSetPagination(pagination) {
    let {type, page} = pagination;
    this.state[type].page = page;
  }

  handleSetSearchSelection(selection) {
    this.state.currentSearchSelection = selection;
  }

  handleSelectCollectionWithoutUpdating(collection) {
    this.state.currentCollectionId = collection.id;
  }

  handleClearSearchSelection() {
    this.state.currentSearchSelection = null;
  }
}

export default alt.createStore(UIStore, 'UIStore');
