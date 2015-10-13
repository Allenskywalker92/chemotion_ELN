import alt from '../alt';
import UIActions from './UIActions';

import SamplesFetcher from '../fetchers/SamplesFetcher';
import MoleculesFetcher from '../fetchers/MoleculesFetcher';
import ReactionsFetcher from '../fetchers/ReactionsFetcher';
import WellplatesFetcher from '../fetchers/WellplatesFetcher';
import LiteraturesFetcher from '../fetchers/LiteraturesFetcher';
import CollectionsFetcher from '../fetchers/CollectionsFetcher';
import ReactionSvgFetcher from '../fetchers/ReactionSvgFetcher';
import ScreensFetcher from '../fetchers/ScreensFetcher';
import SearchFetcher from '../fetchers/SearchFetcher';

import Molecule from '../models/Molecule';
import Sample from '../models/Sample';
import Reaction from '../models/Reaction';

import Wellplate from '../models/Wellplate';
import Screen from '../models/Screen';

import _ from 'lodash';

class ElementActions {

  // -- Search --

  fetchBasedOnSearchSelectionAndCollection(selection, collectionId) {
    SearchFetcher.fetchBasedOnSearchSelectionAndCollection(selection, collectionId)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  // -- Collections --


  fetchReactionsByCollectionId(id, queryParams={}) {
    ReactionsFetcher.fetchByCollectionId(id, queryParams)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }


  // -- Samples --

  fetchSampleById(id) {
    SamplesFetcher.fetchById(id)
      .then((result) => {
        this.dispatch(result);
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

  createSample(params) {
    SamplesFetcher.create(params)
      .then((result) => {
        this.dispatch(result)
      });
  }

  updateSample(params) {
    let _params = _.omit( params, _.isNull); //should be better done in SampleProxy#serialize
    SamplesFetcher.update(_params)
      .then((result) => {
        this.dispatch(result)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  generateEmptySample() {
    this.dispatch(Sample.buildEmpty())
  }

  splitAsSubsamples(ui_state) {
    SamplesFetcher.splitAsSubsamples(ui_state)
      .then((result) => {
        this.dispatch(ui_state);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  // -- Molecules --

  fetchMoleculeByMolfile(molfile) {
    MoleculesFetcher.fetchByMolfile(molfile)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  // -- Reactions --

  fetchReactionById(id) {
    ReactionsFetcher.fetchById(id)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  createReaction(params) {
    console.log(params)
    ReactionsFetcher.create(params)
      .then((result) => {
        this.dispatch(result)
      });
  }

  updateReaction(params) {
    ReactionsFetcher.update(params)
      .then((result) => {
        this.dispatch(result)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  generateEmptyReaction() {
    this.dispatch(Reaction.buildEmpty())
  }


  // -- Reactions literatures --


  createReactionLiterature(params) {
    LiteraturesFetcher.create(params)
      .then((result) => {
        this.dispatch(result)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  deleteReactionLiterature(literature) {
    LiteraturesFetcher.delete(literature)
      .then((result) => {
        this.dispatch(result.reaction_id)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchLiteraturesByReactionId(id) {
    LiteraturesFetcher.fetchByReactionId(id)
      .then((result) => {
        console.log("Action Fetch Literatures: ");
        console.log(result);
        this.dispatch(result)
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }


  // -- Reactions SVGs --


  fetchReactionSvgByMaterialsInchikeys(materialsInchikeys, label){
    ReactionSvgFetcher.fetchByMaterialsInchikeys(materialsInchikeys, label)
      .then((result) => {
        this.dispatch(result.reaction_svg);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchReactionSvgByReactionId(reaction_id){
    ReactionSvgFetcher.fetchByReactionId(reaction_id)
      .then((result) => {
        this.dispatch(result.reaction_svg);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }


  // -- Wellplates --


  generateEmptyWellplate() {
    this.dispatch(Wellplate.buildEmpty());
  }

  createWellplate(wellplate) {
    WellplatesFetcher.create(wellplate)
      .then(result => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  updateWellplate(wellplate) {
    WellplatesFetcher.update(wellplate)
      .then(result => {
        this.dispatch(result);
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
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }


  // -- Screens --


  fetchScreensByCollectionId(id, queryParams={}) {
    ScreensFetcher.fetchByCollectionId(id, queryParams)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  fetchScreenById(id) {
    ScreensFetcher.fetchById(id)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  generateEmptyScreen() {
    this.dispatch(Screen.buildEmpty());
  }

  createScreen(screen) {
    ScreensFetcher.create(screen)
      .then(result => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  updateScreen(screen) {
    ScreensFetcher.update(screen)
      .then(result => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  // -- General --

  refreshElements(type) {
    this.dispatch(type)
  }


  deleteElements(ui_state) {
    this.dispatch(ui_state);
  }

  // - ...

  deleteSamplesByUIState(ui_state) {
    SamplesFetcher.deleteSamplesByUIState(ui_state)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  deleteReactionsByUIState(ui_state) {
    ReactionsFetcher.deleteReactionsByUIState(ui_state)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  deleteWellplatesByUIState(ui_state) {
    WellplatesFetcher.deleteWellplatesByUIState(ui_state)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  deleteScreensByUIState(ui_state) {
    ScreensFetcher.deleteScreensByUIState(ui_state)
      .then((result) => {
        this.dispatch(result);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  updateElementsCollection(params) {
    CollectionsFetcher.updateElementsCollection(params)
      .then(() => {
        this.dispatch(params);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  assignElementsCollection(params) {
    CollectionsFetcher.assignElementsCollection(params)
      .then(() => {
        this.dispatch(params);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  removeElementsCollection(params) {
    CollectionsFetcher.removeElementsCollection(params)
      .then(() => {
        this.dispatch(params);
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

}

export default alt.createActions(ElementActions);
