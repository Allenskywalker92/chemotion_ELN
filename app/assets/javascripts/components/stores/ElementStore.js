import alt from '../alt';
import { last, slice, intersectionWith } from 'lodash';
import ElementActions from '../actions/ElementActions';
import CollectionActions from '../actions/CollectionActions';
import UIActions from '../actions/UIActions';
import UserActions from '../actions/UserActions';
import UIStore from './UIStore';
import ClipboardStore from './ClipboardStore';
import Sample from '../models/Sample';
import Reaction from '../models/Reaction';
import Wellplate from '../models/Wellplate';
import Screen from '../models/Screen';

import Device from '../models/Device'
import Container from '../models/Container'
import AnalysesExperiment from '../models/AnalysesExperiment'
import DeviceAnalysis from '../models/DeviceAnalysis'
import DeviceSample from '../models/DeviceSample';
import NotificationActions from '../actions/NotificationActions'
import SamplesFetcher from '../fetchers/SamplesFetcher'
import DeviceFetcher from '../fetchers/DeviceFetcher'

import ModalImportConfirm from '../contextActions/ModalImportConfirm'

import { extraThing } from '../utils/Functions';
import Xlisteners from '../extra/ElementStoreXlisteners';
import Xhandlers from '../extra/ElementStoreXhandlers';
import Xstate from '../extra/ElementStoreXstate';
import { elementShowOrNew } from '../routesUtils';

import DetailActions from '../actions/DetailActions';
import { SameEleTypId, UrlSilentNavigation } from '../utils/ElementUtils';

import Aviator from 'aviator';

class ElementStore {
  constructor() {
    // formerly from DetailStore
    // this.selecteds = [];
    // this.activeKey = 0;
    // this.deletingElement = null;
    // //
    this.state = {
      elements: {
        samples: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        reactions: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        wellplates: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        screens: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        devices: {
          devices: [],
          activeAccordionDevice: 0,
          selectedDeviceId: -1
        },
        research_plans: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        }
      },
      currentElement: null,
      elementWarning: false,
      moleculeSort: false,
      // formerly from DetailStore
      selecteds: [],
      activeKey: 0,
      deletingElement: null,
      ////
      ...extraThing(Xstate)
    };



    for (let i = 0; i < Xlisteners.count; i++){
      Object.keys(Xlisteners["content"+i]).map((k) => {
        this.bindAction(Xlisteners["content" + i][k],
                        Xhandlers["content" + i][k].bind(this))
      });
    }

    this.bindListeners({
      //
      handleFetchAllDevices: ElementActions.fetchAllDevices,
      handleFetchDeviceById: ElementActions.fetchDeviceById,
      handleCreateDevice: ElementActions.createDevice,
      handleSaveDevice: ElementActions.saveDevice,
      handleDeleteDevice: ElementActions.deleteDevice,
      handleToggleDeviceType: ElementActions.toggleDeviceType,
      handleChangeActiveAccordionDevice: ElementActions.changeActiveAccordionDevice,
      handleChangeSelectedDeviceId: ElementActions.changeSelectedDeviceId,
      handleSetSelectedDeviceId: ElementActions.setSelectedDeviceId,
      handleAddSampleToDevice: ElementActions.addSampleToDevice,
      handleAddSampleWithAnalysisToDevice: ElementActions.addSampleWithAnalysisToDevice,
      handleRemoveSampleFromDevice: ElementActions.removeSampleFromDevice,
      handleToggleTypeOfDeviceSample: ElementActions.toggleTypeOfDeviceSample,
      handleChangeDeviceProp: ElementActions.changeDeviceProp,
      handleFetchDeviceAnalysisById: ElementActions.fetchDeviceAnalysisById,
      handleSaveDeviceAnalysis: ElementActions.saveDeviceAnalysis,
      handleOpenDeviceAnalysis: ElementActions.openDeviceAnalysis,
      handleCreateDeviceAnalysis: ElementActions.createDeviceAnalysis,
      handleChangeAnalysisExperimentProp: ElementActions.changeAnalysisExperimentProp,
      handleDeleteAnalysisExperiment: ElementActions.deleteAnalysisExperiment,
      handleDuplicateAnalysisExperiment: ElementActions.duplicateAnalysisExperiment,

      handleFetchBasedOnSearchSelection:
        ElementActions.fetchBasedOnSearchSelectionAndCollection,
      handleFetchSampleById: ElementActions.fetchSampleById,
      handleFetchSamplesByCollectionId:
        ElementActions.fetchSamplesByCollectionId,
      handleUpdateSample: ElementActions.updateSample,
      handleCreateSample: ElementActions.createSample,
      handleCreateSampleForReaction: ElementActions.createSampleForReaction,
      handleEditReactionSample: ElementActions.editReactionSample,
      handleEditWellplateSample: ElementActions.editWellplateSample,
      handleUpdateSampleForReaction: ElementActions.updateSampleForReaction,
      handleUpdateSampleForWellplate: ElementActions.updateSampleForWellplate,
      handleCopySampleFromClipboard: ElementActions.copySampleFromClipboard,
      handleAddSampleToMaterialGroup: ElementActions.addSampleToMaterialGroup,
      handleShowReactionMaterial: ElementActions.showReactionMaterial,
      handleImportSamplesFromFile: ElementActions.importSamplesFromFile,
      handleImportSamplesFromFileConfirm: ElementActions.importSamplesFromFileConfirm,
      handleImportReactionsFromChemRead: ElementActions.importReactionsFromChemRead,

      handleSetCurrentElement: ElementActions.setCurrentElement,
      handleDeselectCurrentElement: ElementActions.deselectCurrentElement,
      handleChangeSorting: ElementActions.changeSorting,

      handleFetchReactionById: ElementActions.fetchReactionById,
      handleTryFetchReactionById: ElementActions.tryFetchReactionById,
      handleCloseWarning: ElementActions.closeWarning,
      handleFetchReactionsByCollectionId:
        ElementActions.fetchReactionsByCollectionId,
      handleUpdateReaction: ElementActions.updateReaction,
      handleCreateReaction: ElementActions.createReaction,
      handleCopyReactionFromId: ElementActions.copyReactionFromId,
      handleFetchReactionSvgByMaterialsSvgPaths:
        ElementActions.fetchReactionSvgByMaterialsSvgPaths,
      handleOpenReactionDetails: ElementActions.openReactionDetails,

      handleBulkCreateWellplatesFromSamples:
        ElementActions.bulkCreateWellplatesFromSamples,
      handleFetchWellplateById: ElementActions.fetchWellplateById,
      handleFetchWellplatesByCollectionId:
        ElementActions.fetchWellplatesByCollectionId,
      handleUpdateWellplate: ElementActions.updateWellplate,
      handleCreateWellplate: ElementActions.createWellplate,
      handleGenerateWellplateFromClipboard:
        ElementActions.generateWellplateFromClipboard,
      handleGenerateScreenFromClipboard:
        ElementActions.generateScreenFromClipboard,

      handleFetchScreenById: ElementActions.fetchScreenById,
      handleFetchScreensByCollectionId:
        ElementActions.fetchScreensByCollectionId,
      handleUpdateScreen: ElementActions.updateScreen,
      handleCreateScreen: ElementActions.createScreen,

      handlefetchResearchPlansByCollectionId: ElementActions.fetchResearchPlansByCollectionId,
      handlefetchResearchPlanById: ElementActions.fetchResearchPlanById,
      handleUpdateResearchPlan: ElementActions.updateResearchPlan,
      handleCreateResearchPlan: ElementActions.createResearchPlan,

      // FIXME ElementStore listens to UIActions?
      handleUnselectCurrentElement: UIActions.deselectAllElements,
      handleSetPagination: UIActions.setPagination,

      handleRefreshElements: ElementActions.refreshElements,
      handleGenerateEmptyElement:
        [
          ElementActions.generateEmptyWellplate,
          ElementActions.generateEmptyScreen,
          ElementActions.generateEmptyResearchPlan,
          ElementActions.generateEmptySample,
          ElementActions.generateEmptyReaction,
          ElementActions.showReportContainer,
          ElementActions.showFormatContainer,
          ElementActions.showComputedPropsGraph,
          ElementActions.showDeviceControl,
        ],
      handleFetchMoleculeByMolfile: ElementActions.fetchMoleculeByMolfile,
      handleDeleteElements: ElementActions.deleteElements,

      handleUpdateElementsCollection: ElementActions.updateElementsCollection,
      handleAssignElementsCollection: ElementActions.assignElementsCollection,
      handleRemoveElementsCollection: ElementActions.removeElementsCollection,
      handleSplitAsSubsamples: ElementActions.splitAsSubsamples,
      // formerly from DetailStore
      handleSelect: DetailActions.select,
      handleClose: DetailActions.close,
      handleDeletingElements: ElementActions.deleteElementsByUIState,
      handleConfirmDelete: DetailActions.confirmDelete,
      handleChangeCurrentElement: DetailActions.changeCurrentElement,
      handleGetMoleculeCas: DetailActions.getMoleculeCas,
      handleUpdateMoleculeNames: DetailActions.updateMoleculeNames,
      handleUpdateMoleculeCas: DetailActions.updateMoleculeCas,
      handleUpdateElement: [
        ElementActions.updateReaction,
        ElementActions.updateSample,
        ElementActions.updateWellplate,
        ElementActions.updateScreen,
        ElementActions.updateResearchPlan
      ],
    })
  }

  handleFetchAllDevices(devices) {
    this.state.elements['devices'].devices = devices
  }

  handleFetchDeviceById(device) {
    this.state.currentElement = device
  }

  findDeviceIndexById(deviceId) {
    const {devices} = this.state.elements['devices']
    return devices.findIndex((e) => e.id === deviceId)
  }

  handleSaveDevice(device) {
    const {devices} = this.state.elements['devices']
    const deviceKey = devices.findIndex((e) => e._checksum === device._checksum)
    if (deviceKey === -1) {
      this.state.elements['devices'].devices.push(device)
    } else {
      this.state.elements['devices'].devices[deviceKey] = device
    }
  }

  handleToggleDeviceType({device, type}) {
    if (device.types.includes(type)) {
      device.types = device.types.filter((e) => e !== type)
    } else {
      device.types.push(type)
    }
    const deviceKey = this.findDeviceIndexById(device.id)
    this.state.elements['devices'].devices[deviceKey] = device
  }

  handleCreateDevice() {
    const {devices} = this.state.elements['devices']
    const newDevice = Device.buildEmpty()
    const newKey = devices.length
    this.state.elements['devices'].activeAccordionDevice = newKey
    this.state.elements['devices'].devices.push(newDevice)
  }

  handleDeleteDevice(device) {
    const {devices, activeAccordionDevice} = this.state.elements['devices']
    this.state.elements['devices'].devices = devices.filter((e) => e.id !== device.id)
  }

  handleAddSampleToDevice({sample, device, options = {save: false}}) {
    const deviceSample = DeviceSample.buildEmpty(device.id, sample)
    device.samples.push(deviceSample)
    if(options.save) {
      ElementActions.saveDevice(device)
      ElementActions.fetchDeviceById.defer(device.id)
    }
  }

  handleAddSampleWithAnalysisToDevice({sample, analysis, device}) {
    switch (analysis.kind) {
      case '1H NMR':
        // add sample to device
        const deviceSample = DeviceSample.buildEmpty(device.id, {id: sample.id, short_label: sample.short_label})
        deviceSample.types = ["NMR"]
        device.samples.push(deviceSample)
        DeviceFetcher.update(device)
        .then(device => {
          const savedDeviceSample = last(device.samples)
          // add sampleAnalysis to experiments
          let deviceAnalysis = device.devicesAnalyses.find(a => a.analysisType === "NMR")
          if(!deviceAnalysis) {
            deviceAnalysis = DeviceAnalysis.buildEmpty(device.id, "NMR")
          }
          const newExperiment = AnalysesExperiment.buildEmpty(sample.id, sample.short_label, analysis.id, savedDeviceSample.id)
          deviceAnalysis.experiments.push(newExperiment)
          ElementActions.saveDeviceAnalysis.defer(deviceAnalysis)
        })
        break
    }
  }

  handleToggleTypeOfDeviceSample({device, sample, type}) {
    const sampleKey = device.samples.findIndex(s => s.id === sample.id)
    if (sample.types.includes(type)) {
      sample.types = sample.types.filter(t => t !== type)
    } else {
      sample.types.push(type)
    }
    device.samples[sampleKey] = sample
  }

  handleOpenDeviceAnalysis({device, type}){
    switch(type) {
      case "NMR":
        const {currentCollection, isSync} = UIStore.getState();
        const deviceAnalysis = device.devicesAnalyses.find((a) => a.analysisType === "NMR")

        // update Device in case of sample was added by dnd and device was not saved
        device.updateChecksum()
        ElementActions.saveDevice(device)

        if (deviceAnalysis) {
          Aviator.navigate(isSync
            ? `/scollection/${currentCollection.id}/devicesAnalysis/${deviceAnalysis.id}`
            : `/collection/${currentCollection.id}/devicesAnalysis/${deviceAnalysis.id}`
          )
        } else {
          Aviator.navigate(isSync
            ? `/scollection/${currentCollection.id}/devicesAnalysis/new/${device.id}/${type}`
            : `/collection/${currentCollection.id}/devicesAnalysis/new/${device.id}/${type}`
          )
        }
        break
    }
  }

  handleRemoveSampleFromDevice({sample, device}) {
    device.samples = device.samples.filter((e) => e.id !== sample.id)
    const deviceKey = this.findDeviceIndexById(device.id)
    this.state.elements['devices'].devices[deviceKey] = device
  }

  handleChangeDeviceProp({device, prop, value}) {
    device[prop] = value
    const deviceKey = this.findDeviceIndexById(device.id)
    this.state.elements['devices'].devices[deviceKey] = device
  }

  handleChangeActiveAccordionDevice(key) {
    this.state.elements['devices'].activeAccordionDevice = key
  }

  handleChangeSelectedDeviceId(deviceId) {
    this.state.elements['devices'].selectedDeviceId = deviceId
  }

  handleSetSelectedDeviceId(deviceId) {
    this.state.elements['devices'].selectedDeviceId = deviceId
  }

//TODO move these in Element Action ??
  createSampleAnalysis(sampleId, type) {
    return new Promise((resolve, reject) => {
      SamplesFetcher.fetchById(sampleId)
      .then(sample => {
        let analysis = Container.buildAnalysis()
        switch (type) {
          case 'NMR':
            analysis =  Container.buildAnalysis("1H NMR")
            break
        }
        sample.addAnalysis(analysis)
        SamplesFetcher.update(sample)
        resolve(analysis)
      })
    })
  }

  createAnalysisExperiment (deviceSample, deviceAnalysis) {
    return new Promise((resolve, reject) => {
      this.createSampleAnalysis(deviceSample.sampleId, deviceAnalysis.analysisType)
      .then(sampleAnalysis => {
        const experiment = AnalysesExperiment.buildEmpty(
          deviceSample.sampleId,
          deviceSample.shortLabel,
          sampleAnalysis.id,
          deviceSample.id
        )
        resolve(experiment)
      })
    })
  }

  handleCreateDeviceAnalysis({device, analysisType}) {
    const analysis = DeviceAnalysis.buildEmpty(device.id, analysisType)
    const samplesOfAnalysisType = device.samples.filter(s => s.types.includes(analysisType))
    const promises = samplesOfAnalysisType.map(s => this.createAnalysisExperiment(s, analysis))
    Promise.all(promises)
    .then(experiments => {
      experiments.map(experiment => analysis.experiments.push(experiment))
      ElementActions.saveDeviceAnalysis(analysis)
    })
  }

  handleFetchDeviceAnalysisById({analysis, device}) {
    const {experiments} = analysis
    const samplesOfAnalysisType = device.samples.filter(s => s.types.includes(analysis.analysisType))
    const samplesWithoutOld = slice(samplesOfAnalysisType, experiments.length)
    const promises = samplesWithoutOld.map(s => this.createAnalysisExperiment(s, analysis))
    Promise.all(promises)
    .then(experiments => {
      experiments.map(experiment => analysis.experiments.push(experiment))
      ElementActions.saveDeviceAnalysis(analysis)
    })
  }

  handleSaveDeviceAnalysis(analysis) {
    const {currentCollection, isSync} = UIStore.getState();
    this.state.currentElement = analysis

    Aviator.navigate( isSync
      ? `/scollection/${currentCollection.id}/devicesAnalysis/${analysis.id}`
      : `/collection/${currentCollection.id}/devicesAnalysis/${analysis.id}`
    )
  }

  handleChangeAnalysisExperimentProp({analysis, experiment, prop, value}) {
    const experimentKey = analysis.experiments.findIndex((e) => e.id === experiment.id)
    analysis.experiments[experimentKey][prop] = value
    this.state.currentElement = analysis
  }

  handleDeleteAnalysisExperiment({device, analysis, experiment}) {
    const sample = device.samples.find(s => s.id === experiment.deviceSampleId)
    const sampleKey = device.samples.findIndex(s => s.id === experiment.deviceSampleId)
    device.samples[sampleKey].types = sample.types.filter(t => t !== analysis.analysisType)
    ElementActions.saveDevice(device)
    ElementActions.fetchDeviceAnalysisById.defer(analysis.id)
  }

  handleDuplicateAnalysisExperiment({device, analysis, experiment}) {
    const sample = device.samples.find(s => s.id === experiment.deviceSampleId)
    const newSample = DeviceSample.buildEmpty(analysis.deviceId, {id: sample.sampleId, short_label: sample.shortLabel})
    newSample.types = [analysis.analysisType]
    device.samples.push(newSample)
    ElementActions.saveDevice(device)
    ElementActions.fetchDeviceAnalysisById.defer(analysis.id)
  }

  // SEARCH

  handleFetchBasedOnSearchSelection(result) {
    Object.keys(result).forEach((key) => {
      this.state.elements[key] = result[key];
    });
  }

  handlefetchBasedOnStructureAndCollection(result) {
    Object.keys(result).forEach((key) => {
      this.state.elements[key] = result[key];
    });
  }

  // -- Elements --
  handleDeleteElements(options) {
    this.waitFor(UIStore.dispatchToken);
    const ui_state = UIStore.getState();
    const { sample, reaction, wellplate, screen, research_plan, currentCollection } = ui_state;
    const selecteds = this.state.selecteds.map(s => ({ id: s.id, type: s.type }));
    ElementActions.deleteElementsByUIState({
      options,
      sample,
      reaction,
      wellplate,
      screen,
      research_plan,
      currentCollection,
      selecteds
    });
    ElementActions.fetchSamplesByCollectionId(ui_state.currentCollection.id, {},
      ui_state.isSync, this.state.moleculeSort);
    ElementActions.fetchReactionsByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchWellplatesByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchScreensByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchResearchPlansByCollectionId(ui_state.currentCollection.id);
  }

  handleUpdateElementsCollection(params) {
    CollectionActions.fetchUnsharedCollectionRoots();
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id, {},
      params.ui_state.isSync, this.state.moleculeSort);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
    ElementActions.fetchResearchPlansByCollectionId(collection_id);
  }

  handleAssignElementsCollection(params) {
    CollectionActions.fetchUnsharedCollectionRoots();
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id, {},
      params.ui_state.isSync, this.state.moleculeSort);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
    ElementActions.fetchResearchPlansByCollectionId(collection_id);
  }

  handleRemoveElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id

    UIActions.clearSearchSelection.defer()
    this.waitFor(UIStore.dispatchToken)

    ElementActions.fetchSamplesByCollectionId(collection_id, {},
      params.ui_state.isSync, this.state.moleculeSort);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
    ElementActions.fetchResearchPlansByCollectionId(collection_id);
  }

  // -- Samples --

  handleFetchSampleById(result) {
    if (!this.state.currentElement || this.state.currentElement._checksum != result._checksum) {
      this.state.currentElement = result;
    }
  }

  handleFetchSamplesByCollectionId(result) {
    this.state.elements.samples = result;
  }

  handleUpdateSample(sample) {
  //  this.state.currentElement = sample;
    this.handleRefreshElements('sample');
  }

  handleCreateSample(sample) {
    UserActions.fetchCurrentUser();

    this.handleRefreshElements('sample');
    this.navigateToNewElement(sample);
  }

  handleCreateSampleForReaction({newSample, reaction, materialGroup}) {
    UserActions.fetchCurrentUser();

    reaction.addMaterial(newSample, materialGroup);

    this.handleRefreshElements('sample');

    this.state.currentElement = reaction;
  }

  handleEditReactionSample(result){
    const sample = result.sample;
    sample.belongTo = result.reaction;
    this.state.currentElement = sample;
  }

  handleEditWellplateSample(result){
    const sample = result.sample;
    sample.belongTo = result.wellplate;
    this.state.currentElement = sample;
  }

  handleUpdateSampleForReaction(reaction) {
    // UserActions.fetchCurrentUser();
    this.state.currentElement = reaction;
    this.handleRefreshElements('sample');
  }

  handleUpdateSampleForWellplate(wellplate) {
    // UserActions.fetchCurrentUser()
    this.state.currentElement = null;
    this.handleRefreshElements('sample')

    const wellplateID = wellplate.id;
    ElementActions.fetchWellplateById(wellplateID)
  }

  handleSplitAsSubsamples(ui_state) {
    ElementActions.fetchSamplesByCollectionId(ui_state.currentCollection.id, {},
      ui_state.isSync, this.state.moleculeSort);
  }

  // Molecules
  handleFetchMoleculeByMolfile(result) {
    // Attention: This is intended to update SampleDetails
    this.state.currentElement.molecule = result;
    this.handleRefreshElements('sample');
  }

  // Samples with residues
  handleFetchResidueByMolfile(result) {
    // Attention: This is intended to update SampleDetails
    //this.state.currentElement.molecule = result;
    this.state.currentElement.sample = result;
    this.handleRefreshElements('sample');
  }

  handleCopySampleFromClipboard(collection_id) {
    const clipboardSamples = ClipboardStore.getState().samples;

    this.state.currentElement =
      Sample.copyFromSampleAndCollectionId(clipboardSamples[0],
                                           collection_id, true)
  }

  /**
   * @param {Object} params = { reaction, materialGroup }
   */
  handleAddSampleToMaterialGroup(params) {
    const { materialGroup } = params
    let { reaction } = params

    let sample = Sample.buildEmpty(reaction.collection_id)
    sample.molfile = sample.molfile || ''
    sample.molecule = sample.molecule == undefined ? sample : sample.molecule
    sample.sample_svg_file = sample.sample_svg_file
    sample.belongTo = reaction;
    sample.matGroup = materialGroup;
    reaction.changed = true
    this.state.currentElement = sample;
  }

  handleShowReactionMaterial(params) {
    const { reaction, sample } = params;
    sample.belongTo = reaction;
    this.state.currentElement = sample;
  }

  handleImportSamplesFromFile(data) {
    if (data.sdf){
      UIActions.updateModalProps.defer({
        show: true,
        component: ModalImportConfirm,
        title: "Sample Import Confirmation",
        action: null,
        listSharedCollections: false,
        customModal: "custom-modal",
        data: data.data,
        //raw_data: data.raw_data,
        custom_data_keys: data.custom_data_keys,
        mapped_keys: data.mapped_keys,
        collection_id: data.collection_id,
      })
    } else {
      this.handleRefreshElements('sample');
    }

    this.handleRefreshElements('sample');
  }

  handleImportSamplesFromFileConfirm(data) {
    if (data.sdf){
      this.handleRefreshElements('sample');
    }
  }

  handleImportReactionsFromChemRead(data) {
    this.handleRefreshElements('sample');
    this.handleRefreshElements('reaction');
  }

  // -- Wellplates --

  handleBulkCreateWellplatesFromSamples() {
    this.handleRefreshElements('wellplate');
    this.handleRefreshElements('sample');
  }

  handleFetchWellplateById(result) {
    this.state.currentElement = result;
  //  this.navigateToNewElement(result)
  }

  handleFetchWellplatesByCollectionId(result) {
    this.state.elements.wellplates = result;
  }

  handleUpdateWellplate(wellplate) {
    // this.state.currentElement = wellplate;
    this.handleRefreshElements('wellplate');
    this.handleRefreshElements('sample');
  }

  handleCreateWellplate(wellplate) {
    this.handleRefreshElements('wellplate');
    this.navigateToNewElement(wellplate);
  }

  handleGenerateWellplateFromClipboard(collection_id) {
    let clipboardSamples = ClipboardStore.getState().samples;

    this.state.currentElement =
      Wellplate.buildFromSamplesAndCollectionId(clipboardSamples, collection_id);
  }
  // -- Screens --

  handleFetchScreenById(result) {
    if (!this.state.currentElement || this.state.currentElement._checksum != result._checksum) {
      this.state.currentElement = result;
    }
  }

  handleFetchScreensByCollectionId(result) {
    this.state.elements.screens = result;
  }

  handleUpdateScreen(screen) {
    // this.state.currentElement = screen;
    this.handleRefreshElements('screen');
  }

  handleCreateScreen(screen) {
    this.handleRefreshElements('screen');
    this.navigateToNewElement(screen);
  }

  handleGenerateScreenFromClipboard(collection_id) {
    let clipboardWellplates = ClipboardStore.getState().wellplates;

    this.state.currentElement =
      Screen.buildFromWellplatesAndCollectionId(clipboardWellplates,
                                                collection_id);
  }

  // -- ResearchPlans --
  handlefetchResearchPlansByCollectionId(result) {
    this.state.elements.research_plans = result;
  }

  handlefetchResearchPlanById(result) {
    this.state.currentElement = result;
  }

  handleUpdateResearchPlan(research_plan) {
    // this.state.currentElement = research_plan;
    this.handleRefreshElements('research_plan');
  }

  handleCreateResearchPlan(research_plan) {
    this.handleRefreshElements('research_plan');
    this.navigateToNewElement(research_plan);
  }

  // -- Reactions --

  handleFetchReactionById(result) {
    if (!this.state.currentElement || this.state.currentElement._checksum != result._checksum) {
      this.state.currentElement = result;
      this.state.elements.reactions.elements = this.refreshReactionsListForSpecificReaction(result);
    //  this.navigateToNewElement(result);
    }
  }

  refreshReactionsListForSpecificReaction(newReaction) {
    return this.state.elements.reactions.elements.map( reaction => {
      return reaction.id === newReaction.id
        ? newReaction
        : reaction
    });
  }

  handleTryFetchReactionById(result) {
    if (result.hasOwnProperty("error")) {
      this.state.elementWarning = true
    } else {
      this.state.currentElement = result
      this.navigateToNewElement(result)
    }
  }

  handleCloseWarning() {
    this.state.elementWarning = false
  }

  handleFetchReactionsByCollectionId(result) {
    this.state.elements.reactions = result;
  }

  handleUpdateReaction(reaction) {
    // UserActions.fetchCurrentUser();

    // this.state.currentElement = reaction;
    this.handleRefreshElements('reaction');
    this.handleRefreshElements('sample');
  }

  handleCreateReaction(reaction) {
    UserActions.fetchCurrentUser();
    this.handleRefreshElements('reaction');
    this.navigateToNewElement(reaction);
  }

  handleCopyReactionFromId(reaction) {
    this.waitFor(UIStore.dispatchToken);
    const uiState = UIStore.getState();
    this.state.currentElement =
      Reaction.copyFromReactionAndCollectionId(reaction,
                                               uiState.currentCollection.id);
  }

  handleOpenReactionDetails(reaction) {
    this.state.currentElement = reaction;
    this.handleRefreshElements('sample')
  }

  // -- Reactions Literatures --

  handleCreateReactionLiterature(result) {
    this.state.currentElement.literatures.push(result);
  }

  handleDeleteReactionLiterature(reactionId) {
    ElementActions.fetchLiteraturesByReactionId(reactionId);
    this.handleRefreshElements('reaction');
  }

  handleFetchLiteraturesByReactionId(result) {
    this.state.currentElement.literatures = result.literatures;
  }

  // -- Reactions SVGs --

  handleFetchReactionSvgByMaterialsSvgPaths(result) {
    this.state.currentElement.reaction_svg_file = result;
  }

  // -- Generic --

  navigateToNewElement(element = {}) {
    this.waitFor(UIStore.dispatchToken);
    const { type, id } = element;
    const { uri, namedParams } = Aviator.getCurrentRequest();
    const uriArray = uri.split(/\//);
    if (!type) {
      Aviator.navigate(`/${uriArray[1]}/${uriArray[2]}`, { silent: true });
      return null;
    }
    namedParams[`${type}ID`] = id;
    Aviator.navigate(`/${uriArray[1]}/${uriArray[2]}/${type}/${id}`, { silent: true });
    elementShowOrNew({ type, params: namedParams });
    return null;
  }

  handleGenerateEmptyElement(element) {
    let {currentElement} = this.state;

    const newElementOfSameTypeIsPresent =
      currentElement && currentElement.isNew && currentElement.type ==
      element.type;
    if(!newElementOfSameTypeIsPresent) {
      this.state.currentElement = element;
    }
  }

  handleUnselectCurrentElement() {
    this.state.currentElement = null;
  }

  handleSetPagination(pagination) {
    this.waitFor(UIStore.dispatchToken);
    this.handleRefreshElements(pagination.type, pagination.sortBy);
  }

  handleRefreshElements(type) {
    this.waitFor(UIStore.dispatchToken);
    const uiState = UIStore.getState();

    if (!uiState.currentCollection || !uiState.currentCollection.id) return;

    const page = uiState[type].page;
    const moleculeSort = this.state.moleculeSort;

    this.state.elements[`${type}s`].page = page;
    const currentSearchSelection = uiState.currentSearchSelection;

    // TODO if page changed -> fetch
    // if there is a currentSearchSelection
    //    we have to execute the respective action
    if (currentSearchSelection != null) {
      currentSearchSelection.page_size = uiState.number_of_results;
      ElementActions.fetchBasedOnSearchSelectionAndCollection.defer({
        selection: currentSearchSelection,
        collectionId: uiState.currentCollection.id,
        page,
        isSync: uiState.isSync,
        moleculeSort
      });
    } else {
      const per_page = uiState.number_of_results;
      const { fromDate, toDate, productOnly } = uiState;
      const params = { page, per_page, fromDate, toDate, productOnly };
      const fnName = type.split('_').map(x => x[0].toUpperCase() + x.slice(1)).join("") + 's';
      const fn = `fetch${fnName}ByCollectionId`;
      ElementActions[fn](
        uiState.currentCollection.id,
        params,
        uiState.isSync,
        moleculeSort
      );
    }
  }

  // CurrentElement
  handleSetCurrentElement(result) {
    this.state.currentElement = result;
  }

  handleDeselectCurrentElement() {
    this.state.currentElement = null;
  }

  handleChangeSorting(sort) {
    this.state.moleculeSort = sort;
    this.waitFor(UIStore.dispatchToken);
    this.handleRefreshElements("sample");
  }

  // //////////////////////
  // formerly DetailStore
  // TODO: clean this section
  handleSelect(index) {
    this.resetCurrentElement(index, this.state.selecteds);
  }

  handleClose({ deleteEl, force }) {
    // Currently ignore report "isPendingToSave"
    if (force || deleteEl.type === 'report' || this.isDeletable(deleteEl)) {
      this.deleteCurrentElement(deleteEl);
    } else {
      this.setState({ deletingElement: deleteEl });
    }
  }

  handleConfirmDelete(confirm) {
    const deleteEl = this.state.deletingElement
    if(confirm) {
      this.deleteCurrentElement(deleteEl)
    }
    this.setState({ deletingElement: null })
  }

  handleChangeCurrentElement({ oriEl, nextEl }) {
    const selecteds = this.state.selecteds;
    const index = this.elementIndex(selecteds, nextEl);
    let activeKey = index;
    let newSelecteds = null;
    const sync = this.synchronizeElements(oriEl, nextEl);
    oriEl = sync.ori;
    nextEl = sync.next;
    if (index === -1) {
      activeKey = selecteds.length
      newSelecteds = this.addElement(nextEl)
    } else {
      newSelecteds = this.updateElement(nextEl, index)
    }

    this.state.selecteds = newSelecteds;
    this.state.activeKey = activeKey;
    return true
  }

  handleGetMoleculeCas(updatedSample) {
    const selecteds = this.state.selecteds
    const index = this.elementIndex(selecteds, updatedSample)
    const newSelecteds = this.updateElement(updatedSample, index)
    this.setState({ selecteds: newSelecteds })
  }

  UpdateMolecule(updatedSample) {
    if (updatedSample) {
      const selecteds = this.state.selecteds;
      const index = this.elementIndex(selecteds, updatedSample);
      const newSelecteds = this.updateElement(updatedSample, index);
      this.setState({ selecteds: newSelecteds });
    }
  }

  handleUpdateMoleculeNames(updatedSample) {
    this.UpdateMolecule(updatedSample);
  }

  handleUpdateMoleculeCas(updatedSample) {
    this.UpdateMolecule(updatedSample);
  }

  handleUpdateElement(updatedElement) {
    this.state.selecteds = this.state.selecteds.map((e) => {
      if (SameEleTypId(e, updatedElement)) { return updatedElement; }
      return e;
    });
  }

  synchronizeElements(close, open) {
    const associatedSampleFromReaction = (
      close instanceof Reaction && open instanceof Sample &&
      close.samples.map(s => s.id).includes(open.id)
    );

    const associatedReactionFromSample = (
      close instanceof Sample && open instanceof Reaction &&
      open.samples.map(s => s.id).includes(close.id)
    );

    if (associatedSampleFromReaction) {
      const s = close.samples.filter(x => x.id == open.id)[0];

      open.amount_value = s.amount_value;
      open.amount_unit = s.amount_unit;
      open.container = s.container;
    } else if (associatedReactionFromSample) {
      open.updateMaterial(close);
      if (close.isPendingToSave) { open.changed = close.isPendingToSave; }
    }

    return { ori: close, next: open };
  }

  addElement(addEl) {
    const selecteds = this.state.selecteds
    return [...selecteds, addEl]
  }

  updateElement(updateEl, index) {
    const selecteds = this.state.selecteds;
    return [
      ...selecteds.slice(0, index),
      updateEl,
      ...selecteds.slice(index + 1)
    ];
  }

  deleteElement(deleteEl) {
    return this.state.selecteds.filter(el => !SameEleTypId(el, deleteEl));
  }

  elementIndex(selecteds, newSelected) {
    let index = -1;
    if (newSelected) {
      selecteds.forEach((s, i) => {
        if (SameEleTypId(s, newSelected)) { index = i; }
      });
    }
    return index;
  }

  resetCurrentElement(newKey, newSelecteds) {
    const newCurrentElement = newKey < 0 ? newSelecteds[0] : newSelecteds[newKey]
    if(newSelecteds.length === 0) {
      this.state.currentElement = null;
    } else {
      this.state.currentElement = newCurrentElement;
    }

    UrlSilentNavigation(newCurrentElement)
  }

  deleteCurrentElement(deleteEl) {
    const newSelecteds = this.deleteElement(deleteEl)
    const left = this.state.activeKey - 1
    this.setState(
      prevState => ({ ...prevState, selecteds: newSelecteds }),
      this.resetCurrentElement(left, newSelecteds)
    )
  }

  isDeletable(deleteEl) {
    return deleteEl && deleteEl.isPendingToSave ? false : true
  }

  handleDeletingElements(response) {
    const elements = response && response.selecteds;
    const { currentElement } = this.state;
    const currentNotDeleted = intersectionWith([currentElement], elements, SameEleTypId)[0];
    const newSelecteds = intersectionWith(this.state.selecteds, elements, SameEleTypId);

    if (currentNotDeleted) {
      this.setState({ selecteds: newSelecteds });
    } else {
      this.setState({ selecteds: newSelecteds }, this.resetCurrentElement(-1, newSelecteds));
    }
  }
  // End of DetailStore
  /////////////////////
}

export default alt.createStore(ElementStore, 'ElementStore');
