import React from 'react';
import { SpectraEditor, FN } from 'react-spectra-editor';
import { Modal, Well, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import LoadingActions from './actions/LoadingActions';
import SpectraActions from './actions/SpectraActions';
import SpectraStore from './stores/SpectraStore';
import { SpectraOps } from './utils/quillToolbarSymbol';
import ResearchPlan from './models/ResearchPlan';

class ViewSpectra extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...SpectraStore.getState(),
    };

    this.onChange = this.onChange.bind(this);
    this.writeCommon = this.writeCommon.bind(this);
    this.writePeakOp = this.writePeakOp.bind(this);
    this.writeMpyOp = this.writeMpyOp.bind(this);
    this.writeCloseCommon = this.writeCloseCommon.bind(this);
    this.writeClosePeakOp = this.writeClosePeakOp.bind(this);
    this.writeCloseMpyOp = this.writeCloseMpyOp.bind(this);
    // this.checkWriteOp = this.checkWriteOp.bind(this);
    this.saveOp = this.saveOp.bind(this);
    this.saveCloseOp = this.saveCloseOp.bind(this);
    this.closeOp = this.closeOp.bind(this);
    this.predictOp = this.predictOp.bind(this);
    this.checkedToWrite = this.checkedToWrite.bind(this);
    this.buildOpsByLayout = this.buildOpsByLayout.bind(this);
    this.renderSpectraEditor = this.renderSpectraEditor.bind(this);
    this.renderEmpty = this.renderEmpty.bind(this);
    this.formatPks = this.formatPks.bind(this);
  }

  componentDidMount() {
    SpectraStore.listen(this.onChange);
  }

  componentWillUnmount() {
    SpectraStore.unlisten(this.onChange);
  }

  onChange(newState) {
    const origState = this.state;
    const { writing, predictions } = newState;
    this.setState({ ...origState, ...newState });

    this.checkedToWrite(writing, predictions);
  }

  opsSolvent(shift) {
    const { label } = shift.ref;

    switch (label) {
      case false:
        return [];
      case 'CDCl$3':
        return [
          { insert: 'CDCl' },
          { insert: '3', attributes: { script: 'sub' } },
          { insert: ', ' },
        ];
      case 'C$6D$1$2':
        return [
          { insert: 'C' },
          { insert: '6', attributes: { script: 'sub' } },
          { insert: 'D' },
          { insert: '12', attributes: { script: 'sub' } },
          { insert: ', ' },
        ];
      case 'CD2Cl2':
      case 'CD$2Cl$2':
        return [
          { insert: 'CD' },
          { insert: '2', attributes: { script: 'sub' } },
          { insert: 'Cl' },
          { insert: '2', attributes: { script: 'sub' } },
          { insert: ', ' },
        ];
      case 'D$2O':
        return [
          { insert: 'D' },
          { insert: '2', attributes: { script: 'sub' } },
          { insert: 'O' },
          { insert: ', ' },
        ];
      default:
        return [{ insert: `${label}, ` }];
    }
  }

  formatPks({
    peaks, shift, layout, isAscend, decimal, body,
    isIntensity,
  }) {
    const { jcamp } = this.state;
    const { entity } = FN.buildData(jcamp.file);
    const { features } = entity;
    const { observeFrequency } = Array.isArray(features)
      ? features[0]
      : (features.editPeak || features.autoPeak);
    const freq = Array.isArray(observeFrequency) ? observeFrequency[0] : observeFrequency;
    const freqStr = freq ? `${parseInt(freq, 10)} MHz, ` : '';
    // peaks
    const { maxY, minY } = Array.isArray(features)
      ? features[0]
      : (features.editPeak || features.autoPeak);
    const boundary = { maxY, minY };
    const mBody = body || FN.peaksBody({
      peaks, layout, decimal, shift, isAscend, isIntensity, boundary,
    });
    const layoutOpsObj = SpectraOps[layout];
    const { label, value, name } = shift.ref;
    const solvent = label ? `${name.split('(')[0].trim()} [${value.toFixed(decimal)} ppm], ` : '';
    return [
      ...layoutOpsObj.head(freqStr, solvent),
      { insert: mBody },
      ...layoutOpsObj.tail(),
    ];
  }

  formatMpy({
    shift, isAscend, decimal,
    integration, multiplicity, layout,
  }) {
    // obsv freq
    const { jcamp } = this.state;
    const { entity } = FN.buildData(jcamp.file);
    const { features } = entity;
    const { observeFrequency } = Array.isArray(features)
      ? features[0]
      : (features.editPeak || features.autoPeak);
    const freq = Array.isArray(observeFrequency) ? observeFrequency[0] : observeFrequency;
    const freqStr = freq ? `${parseInt(freq, 10)} MHz, ` : '';
    // multiplicity
    const { refArea, refFactor } = integration;
    const shiftVal = multiplicity.shift;
    const ms = multiplicity.stack;
    const is = integration.stack;

    const macs = ms.map((m) => {
      const { peaks, mpyType, xExtent } = m;
      const { xL, xU } = xExtent;
      const it = is.filter(i => i.xL === xL && i.xU === xU)[0] || { area: 0 };
      const area = (it.area * refFactor) / refArea;
      const center = FN.calcMpyCenter(peaks, shiftVal, mpyType);
      return Object.assign({}, m, { area, center });
    }).sort((a, b) => (isAscend ? a.center - b.center : b.center - a.center));
    let couplings = [].concat(...macs.map((m) => {
      const c = m.center;
      const type = m.mpyType;
      const it = Math.round(m.area);
      const js = [].concat(...m.js.map(j => (
        [
          { insert: 'J', attributes: { italic: true } },
          { insert: ` = ${j.toFixed(decimal)} Hz` },
          { insert: ', ' },
        ]
      )));
      const atomCount = layout === '1H' ? `, ${it}H` : '';
      const xs = m.peaks.map(p => p.x).sort((a, b) => a - b);
      const location = type === 'm' ? `${xs[0].toFixed(decimal)}–${xs[xs.length - 1].toFixed(decimal)}` : `${c.toFixed(decimal)}`;
      return m.js.length === 0
        ? [
          { insert: `${location} (${type}${atomCount})` },
          { insert: ', ' },
        ]
        : [
          { insert: `${location} (${type}, ` },
          ...js.slice(0, js.length - 1),
          { insert: `${atomCount})` },
          { insert: ', ' },
        ];
    }));
    couplings = couplings.slice(0, couplings.length - 1);
    const { label, value, name } = shift.ref;
    const solvent = label ? `${name.split('(')[0].trim()} [${value.toFixed(decimal)} ppm], ` : '';
    return [
      { attributes: { script: 'super' }, insert: layout.slice(0, -1) },
      { insert: `${layout.slice(-1)} NMR (${freqStr}${solvent}ppm) δ = ` },
      ...couplings,
      { insert: '.' },
    ];
  }

  writeCommon({
    peaks, shift, scan, thres, analysis, layout, isAscend, decimal, body,
    keepPred, isIntensity, multiplicity, integration,
  }, isMpy = false) {
    const { sample, handleSampleChanged } = this.props;
    const { spcInfo } = this.state;

    let ops = [];
    if (['1H', '13C', '19F'].indexOf(layout) >= 0 && isMpy) {
      ops = this.formatMpy({
        multiplicity, integration, shift, isAscend, decimal, layout,
      });
    } else {
      ops = this.formatPks({
        peaks,
        shift,
        layout,
        isAscend,
        decimal,
        body,
        isIntensity,
      });
    }

    sample.analysesContainers().forEach((ae) => {
      if (ae.id !== spcInfo.idAe) return;
      ae.children.forEach((ai) => {
        if (ai.id !== spcInfo.idAi) return;
        ai.extended_metadata.content.ops = [ // eslint-disable-line
          ...ai.extended_metadata.content.ops,
          ...ops,
        ];
      });
    });

    const cb = () => (
      this.saveOp({
        peaks, shift, scan, thres, analysis, keepPred, integration, multiplicity,
      })
    );
    handleSampleChanged(sample, cb);
  }

  writePeakOp(params) {
    const isMpy = false;
    this.writeCommon(params, isMpy);
  }

  writeMpyOp(params) {
    const isMpy = true;
    this.writeCommon(params, isMpy);
  }

  checkedToWrite(writing, predictions) {
    if (!writing || predictions.output.result.length === 0) return null;
    const {
      peaks, shift, scan, thres, analysis, layout, isAscend, decimal,
      isIntensity, multiplicity, integration,
    } = writing;

    const data = predictions.output.result[0].shifts;
    const body = FN.formatPeaksByPrediction(peaks, layout, isAscend, decimal, data);
    const isMpy = false;
    this.writeCommon({
      peaks,
      shift,
      scan,
      thres,
      analysis,
      layout,
      isAscend,
      decimal,
      body,
      keepPred: true,
      isIntensity,
      multiplicity,
      integration,
    }, isMpy);

    SpectraActions.WriteStop.defer();
    return null;
  }

  saveOp({
    peaks, shift, scan, thres, analysis, keepPred, integration, multiplicity,
  }) {
    const { handleSubmit } = this.props;
    const { spcInfo } = this.state;
    const fPeaks = FN.rmRef(peaks, shift);
    const peaksStr = FN.toPeakStr(fPeaks);
    const predict = JSON.stringify(analysis);

    LoadingActions.start.defer();
    SpectraActions.SaveToFile.defer(
      spcInfo,
      peaksStr,
      shift,
      scan,
      thres,
      JSON.stringify(integration),
      JSON.stringify(multiplicity),
      predict,
      handleSubmit,
      keepPred,
    );
  }

  closeOp() {
    SpectraActions.ToggleModal.defer();
  }

  writeCloseCommon(params, isMpy = false) {
    this.writeCommon(params, isMpy);
    this.closeOp();
  }

  writeClosePeakOp(params) {
    const isMpy = false;
    this.writeCommon(params, isMpy);
    this.closeOp();
  }

  writeCloseMpyOp(params) {
    const isMpy = true;
    this.writeCommon(params, isMpy);
    this.closeOp();
  }

  saveCloseOp({
    peaks, shift, scan, thres, analysis, integration, multiplicity,
  }) {
    this.saveOp({
      peaks, shift, scan, thres, analysis, integration, multiplicity,
    });
    this.closeOp();
  }

  predictOp({
    peaks, layout, shift,
  }) {
    const { spcInfo } = this.state;

    SpectraActions.InferRunning.defer();
    SpectraActions.InferSpectrum.defer({
      spcInfo, peaks, layout, shift,
    });
  }

  // checkWriteOp({
  //   peaks, shift, scan, thres, analysis, layout, isAscend, decimal,
  //   multiplicity, integration,
  // }) {
  //   const cleanPeaks = FN.rmShiftFromPeaks(peaks, shift);
  //   LoadingActions.start.defer();
  //   SpectraActions.WriteStart.defer({
  //     shift, scan, thres, analysis, layout, isAscend, decimal, peaks: cleanPeaks,
  //     multiplicity, integration,
  //   }); // keep payload to state.writing & handle by onChange/checkedToWrite after predictOp
  //   this.predictOp({ layout, shift, peaks: cleanPeaks });
  // }

  buildOpsByLayout(et) {
    if (this.props.sample && this.props.sample instanceof ResearchPlan) {
      return [
        { name: 'write & save', value: this.writeOp },
        { name: 'write, save & close', value: this.writeCloseOp },
      ];
    }
    const updatable = this.props.sample && this.props.sample.can_update;
    let baseOps = updatable ? [
      { name: 'write peak & save', value: this.writePeakOp },
      { name: 'write peak, save & close', value: this.writeClosePeakOp },
    ] : [];
    const isNmr = updatable && ['1H', '13C', '19F'].indexOf(et.layout) >= 0;
    if (isNmr) {
      baseOps = [
        ...baseOps,
        { name: 'write multiplicity & save', value: this.writeMpyOp },
        { name: 'write multiplicity, save & close', value: this.writeCloseMpyOp },
      ];
    }
    // { name: 'check & write', value: this.checkWriteOp },
    const predictable = updatable && ['1H', '13C'].indexOf(et.layout) >= 0;
    if (predictable) {
      baseOps = [
        ...baseOps,
        { name: 'predict', value: this.predictOp },
      ];
    }
    baseOps = [
      ...baseOps,
      { name: 'save', value: this.saveOp },
      { name: 'save & close', value: this.saveCloseOp },
    ];
    return baseOps;
  }

  renderEmpty() {
    const { fetched } = this.state;
    const content = fetched
      ? (
        <Well onClick={this.closeOp}>
          <i className="fa fa-exclamation-triangle fa-3x" />
          <h3>No Spectra Found!</h3>
          <h3>Please refresh the page!</h3>
          <br />
          <h5>Click here to close the window...</h5>
        </Well>
      )
      : <i className="fa fa-refresh fa-spin fa-3x fa-fw" />;

    return (
      <div className="card-box">
        { content }
      </div>
    );
  }

  renderInvalid() {
    const { fetched } = this.state;
    const content = fetched
      ? (
        <Well onClick={this.closeOp}>
          <i className="fa fa-chain-broken fa-3x" />
          <h3>Invalid spectrum!</h3>
          <h3>Please delete it and upload a valid file!</h3>
          <br />
          <h5>Click here to close the window...</h5>
        </Well>
      )
      : <i className="fa fa-refresh fa-spin fa-3x fa-fw" />;

    return (
      <div className="card-box">
        { content }
      </div>
    );
  }

  renderSpectraEditor() {
    const { jcamp, predictions } = this.state;
    const {
      entity, isExist,
    } = FN.buildData(jcamp.file);

    const operations = this.buildOpsByLayout(entity);

    const forecast = {
      molecule: 'molecule',
      predictions,
    };

    return (
      <Modal.Body>
        {
          !isExist
            ? this.renderInvalid()
            : <SpectraEditor
              entity={entity}
              operations={operations}
              forecast={forecast}
            />
        }
      </Modal.Body>
    );
  }

  render() {
    const { showModal, spcInfo, jcamp } = this.state;
    const modalTitle = spcInfo ? `Spectra Editor - ${spcInfo.title}` : '';
    const dialogClassName = 'spectra-editor-dialog';
    // WORKAROUND: react-stickydiv duplicates elements.
    const specElements = Array.from(document.getElementsByClassName(dialogClassName));
    if (specElements.length > 1) {
      specElements.slice(1).forEach(el => el.parentNode.style.display = 'none'); // eslint-disable-line
    }
    // WORKAROUND: react-stickydiv duplicates elements.

    return (
      <div className="spectra-editor">
        <Modal
          show={showModal}
          dialogClassName={dialogClassName}
          animation
          onHide={this.closeOp}
        >
          <Modal.Header>
            <Modal.Title>
              { modalTitle }
              <Button
                bsStyle="danger"
                bsSize="small"
                className="button-right"
                onClick={this.closeOp}
              >
                <span>
                  <i className="fa fa-times" /> Close without Save
                </span>
              </Button>
            </Modal.Title>
          </Modal.Header>
          {
            showModal && jcamp
              ? this.renderSpectraEditor()
              : this.renderEmpty()
          }
        </Modal>
      </div>
    );
  }
}

ViewSpectra.propTypes = {
  sample: PropTypes.object.isRequired,
  handleSampleChanged: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default ViewSpectra;
