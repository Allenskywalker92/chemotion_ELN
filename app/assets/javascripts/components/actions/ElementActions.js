import alt from '../alt';
import SamplesFetcher from '../fetchers/SamplesFetcher';
import ReactionsFetcher from '../fetchers/ReactionsFetcher';
import WellplatesFetcher from '../fetchers/WellplatesFetcher';
import LiteraturesFetcher from '../fetchers/LiteraturesFetcher';

class ElementActions {

  fetchSampleById(id) {
    SamplesFetcher.fetchById(id)
      .then((result) => {
        this.dispatch(result.sample);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchSamplesByCollectionId(id, queryParams={}) {
    SamplesFetcher.fetchByCollectionId(id, queryParams)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  createSample(paramObj) {
    delete paramObj['id'];
    SamplesFetcher.create(paramObj)
      .then((result) => {
        this.dispatch(result.sample.id)
      });
  }

  updateSample(paramObj) {
    SamplesFetcher.update(paramObj)
      .then((result) => {
        this.dispatch(paramObj.id)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchReactionsByCollectionId(id, queryParams={}) {
    ReactionsFetcher.fetchByCollectionId(id, queryParams)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchReactionById(id) {
    ReactionsFetcher.fetchById(id)
      .then((result) => {
        this.dispatch(result.reaction);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchWellplatesByCollectionId(id, queryParams={}) {
    WellplatesFetcher.fetchByCollectionId(id, queryParams)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchWellplateById(id) {
    WellplatesFetcher.fetchById(id)
      .then((result) => {
        this.dispatch(result.wellplate);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

  createReactionLiterature(paramObj) {
    LiteraturesFetcher.create(paramObj)
      .then((result) => {
        // TODO> CHECK VALUE OF PARAMOBJ
        this.dispatch(paramObj)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  refreshElements(type) {
    this.dispatch(type)
  }

  generateEmptySample() {
    let sample = {
      id: '_new_',
      type: 'sample',
      name: 'New Sample',
      amount_value: 0,
      amount_unit: 'g',
      description: '',
      purity: 0,
      solvent: '',
      impurities: '',
      location: '',
      molfile: '',
      molecule: {}
    }
    this.dispatch(sample)
  }
}

export default alt.createActions(ElementActions);
