import React from 'react'
import {Panel, ListGroup, ListGroupItem, ButtonToolbar, Button} from 'react-bootstrap';

import NumeralInputWithUnits from './NumeralInputWithUnits'
import ElementCollectionLabels from './ElementCollectionLabels';

import ElementStore from './stores/ElementStore';
import ElementActions from './actions/ElementActions';
import ReactionDetailsLiteratures from './ReactionDetailsLiteratures';
import MaterialGroupContainer from './MaterialGroupContainer';
import UIStore from './stores/UIStore';
import Aviator from 'aviator';
import SVG from 'react-inlinesvg';

export default class ReactionDetails extends React.Component {
  constructor(props) {
    super(props);
    const {reaction} = props;
    this.state = {
      reaction
    };
  }

  componentDidMount() {
    const {id} = this.state.reaction;
    ElementStore.listen(this.onChange.bind(this));
    ElementActions.fetchReactionSvgByReactionId(id);
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange.bind(this));
  }

  onChange(state) {
    if (! state.currentElement || state.currentElement.type == 'reaction') {
      this.setState({
        reaction: state.currentElement
      });
    }
  }

  handleMaterialsChange(changeEvent) {
    switch (changeEvent.type) {
      case 'referenceChanged':
        this.setState({
          reaction: this.updatedReactionForReferenceChange(changeEvent)
        });
        break;
      case 'amountChanged':
        this.setState({
          reaction: this.updatedReactionForAmountChange(changeEvent)
        });
        break;
      case 'equivalentChanged':
        this.setState({
          reaction: this.updatedReactionForEquivalentChange(changeEvent)
        });
        break;
    }
  }

  updatedReactionForReferenceChange(changeEvent) {
    let {sampleID} = changeEvent;
    let sample = this.findSampleById(sampleID);

    //remember the referenceMaterial
    this.setState({
      referenceMaterial: sample
    });

    return this.updatedReactionWithSample(this.updatedSamplesForReferenceChange.bind(this), sample)
  }

  updatedReactionForAmountChange(changeEvent) {
    let {sampleID, amount} = changeEvent;
    let updatedSample = this.findSampleById(sampleID);

    //todo: sample.setAmountAndNormalizeToMilligram(amount);
    // sample.amount_value = amount.value;
    // sample.amount_unit = amount.unit;

    // normalize to milligram
    updatedSample.setAmountAndNormalizeToMilligram(amount.value, amount.unit);

    return this.updatedReactionWithSample(this.updatedSamplesForAmountChange.bind(this), updatedSample)
  }

  updatedReactionForEquivalentChange(changeEvent) {
    let {sampleID, equivalent} = changeEvent;
    let updatedSample = this.findSampleById(sampleID);

    updatedSample.equivalent = equivalent;

    return this.updatedReactionWithSample(this.updatedSamplesForEquivalentChange.bind(this), updatedSample)
  }

  updatedReactionWithSample(updateFunction, updatedSample) {
    let {reaction} = this.state;
    reaction.starting_materials = updateFunction(reaction.starting_materials, updatedSample);
    reaction.reactants = updateFunction(reaction.reactants, updatedSample);
    reaction.products = updateFunction(reaction.products, updatedSample);
    return reaction;
  }

  componentWillReceiveProps(nextProps) {
    const {id} = nextProps.reaction;
    const {reaction} = this.state;
    if (id != reaction.id) {
      ElementActions.fetchReactionSvgByReactionId(id);
    }
  }

  updatedSamplesForAmountChange(samples, updatedSample) {
    let referenceSample = this.state.referenceMaterial;

    return samples.map((sample) => {
      if (sample.id == updatedSample.id) {

        // sample.amount_value = updatedSample.amount_value;
        // sample.amount_unit = updatedSample.amount_unit;

        sample.setAmountAndNormalizeToMilligram(updatedSample.amount_value, updatedSample.amount_unit);


        if(referenceSample) {
          if(!updatedSample.reference && referenceSample.amount_value) {
            sample.equivalent = sample.amount_mmol / referenceSample.amount_mmol;
          } else {
            sample.equivalent = 1.0;
          }
        }
      }
      else {

        if(updatedSample.reference) {
          if(sample.equivalent) {
            sample.setAmountAndNormalizeToMilligram(sample.equivalent * updatedSample.amount_mmol, 'mmol');
          }
        }
      }
      return sample;
    });
  }

  updatedSamplesForEquivalentChange(samples, updatedSample) {
    let referenceSample = this.state.referenceMaterial;

    return samples.map((sample) => {
      if (sample.id == updatedSample.id) {
        sample.equivalent = updatedSample.equivalent;
        if(referenceSample && referenceSample.amount_value) {
          console.log("updatedSamplesForEquivalentChange newEqui: " + updatedSample.equivalent + " * refAmountValue: " + referenceSample.amount_value)
          //sample.amount_value = updatedSample.equivalent * referenceSample.amount_value;
          sample.setAmountAndNormalizeToMilligram(updatedSample.equivalent * referenceSample.amount_mmol, 'mmol');
        }
        else if(sample.amount_value) {
          console.log("updatedSamplesForEquivalentChange newEqui: " + updatedSample.equivalent + " * sampleValue: " + sample.amount_value)
          //sample.amount_value = updatedSample.equivalent * sample.amount_value;
          sample.setAmountAndNormalizeToMilligram(updatedSample.equivalent * sample.amount_mmol, 'mmol');
        }
      }
      return sample;
    });
  }

  updatedSamplesForReferenceChange(samples, referenceSample) {
    return samples.map((sample) => {
      if (sample.id == referenceSample.id) {
        sample.equivalent = 1.0;
        sample.reference = true;
      }
      else {
        if(sample.amount_value) {
          let referenceAmount = referenceSample.amount_mmol;
          if(referenceSample && referenceAmount) {
            sample.equivalent = sample.amount_mmol / referenceAmount;
          }
        }
        sample.reference = false;
      }
      return sample;
    });
  }

  findSampleById(sampleID) {
    let reaction = this.state.reaction;
    return [...reaction.starting_materials, ...reaction.reactants, ...reaction.products].find((sample) => {
      return sample.id == sampleID;
    })
  }

  // --

  dropSample(sample, materialGroup) {
    const {reaction} = this.state;
    const materials = reaction[materialGroup];
    materials.push(sample);
    this.setState({reaction});
    this.updateReactionSvg();
  }

  deleteMaterial(material, materialGroup) {
    const {reaction} = this.state;
    const materials = reaction[materialGroup];
    const materialIndex = materials.indexOf(material);
    materials.splice(materialIndex, 1);
    this.setState({reaction});
    this.updateReactionSvg();
  }

  dropMaterial(material, previousMaterialGroup, materialGroup) {
    const {reaction} = this.state;
    const materials = reaction[materialGroup];
    this.deleteMaterial(material, previousMaterialGroup);
    materials.push(material);
    this.setState({reaction});
    this.updateReactionSvg();
  }

  _submitFunction() {
    //if(this.state.sample.id == '_new_') {
    //  this.createSample();
    //} else {
    //  this.updateSample();
    //}
  }

  _submitLabel() {
    if (this.state.reaction.id == '_new_') {
      return "Save Reaction";
    } else {
      return "Update Reaction";
    }
  }

  reactionIsValid() {
    //let sample = this.state.sample;
    //return sample && sample.molfile
  }

  closeDetails() {
    let uiState = UIStore.getState();
    Aviator.navigate(`/collection/${uiState.currentCollectionId}`);
  }

  updateReactionSvg() {
    const {reaction} = this.state;
    const materialsInchikeys = {
      starting_materials: reaction.starting_materials.map(material => material.molecule.inchikey),
      reactants: reaction.reactants.map(material => material.molecule.inchikey),
      products: reaction.products.map(material => material.molecule.inchikey)
    };
    ElementActions.fetchReactionSvgByMaterialsInchikeys(materialsInchikeys);
  }

  render() {
    const {reaction} = this.state;
    const svgPath = (reaction.reactionSvg) ? "/images/reactions/" + reaction.reactionSvg : "";
    const svgContainerStyle = {
      position: 'relative',
      height: 0,
      width: '100%',
      padding: 0,
      paddingBottom: '50%'
    };

    return (
      <div>
        <Panel header="Reaction Details" bsStyle='primary'>
          <table width="100%" height="100px">
            <tr>
              <td width="30%">
                <h3>{reaction.name}</h3>
                <ElementCollectionLabels element={reaction} key={reaction.id}/>
              </td>
              <td width="70%">
                <div style={svgContainerStyle}>
                  <SVG key={reaction.reactionSvg} src={svgPath}/>
                </div>
              </td>
            </tr>
          </table>
          <ListGroup fill>
            <ListGroupItem header="Starting Materials">
              <MaterialGroupContainer
                materialGroup="starting_materials"
                materials={reaction.starting_materials}
                dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
                deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
                dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
                onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
                />
            </ListGroupItem>
            <ListGroupItem header="Reactants">
              <MaterialGroupContainer
                materialGroup="reactants"
                materials={reaction.reactants}
                dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
                deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
                dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
                onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
                />
            </ListGroupItem>
            <ListGroupItem header="Products">
              <MaterialGroupContainer
                materialGroup="products"
                materials={reaction.products}
                dropMaterial={(material, previousMaterialGroup, materialGroup) => this.dropMaterial(material, previousMaterialGroup, materialGroup)}
                deleteMaterial={(material, materialGroup) => this.deleteMaterial(material, materialGroup)}
                dropSample={(sample, materialGroup) => this.dropSample(sample, materialGroup)}
                onChange={(changeEvent) => this.handleMaterialsChange(changeEvent)}
                />
            </ListGroupItem>
            <ListGroupItem header='Literatures'>
              <ReactionDetailsLiteratures
                reaction_id={reaction.id}
                literatures={reaction.literatures}
                />
            </ListGroupItem>
          </ListGroup>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={() => this.closeDetails()}>Back</Button>
            <Button bsStyle="warning" onClick={() => this._submitFunction()}
                    disabled={!this.reactionIsValid()}>{this._submitLabel()}</Button>
          </ButtonToolbar>
        </Panel>
      </div>
    );
  }
}
