import alt from '../alt';

// An element object has a type and an id, e.g., {type: 'sample', id: 1}
class UIActions {
  checkAllElements(type) {
    this.dispatch(type);
  }

  checkElement(element) {
    this.dispatch(element);
  }

  uncheckAllElements(type) {
    this.dispatch(type);
  }

  uncheckElement(element) {
    this.dispatch(element);
  }

  selectElement(element) {
    console.log("selectElement:" + element.id + " type: " + element.type)
    this.dispatch(element);
  }

  deselectAllElements(type) {
    this.dispatch(type);
  }
}

export default alt.createActions(UIActions);
