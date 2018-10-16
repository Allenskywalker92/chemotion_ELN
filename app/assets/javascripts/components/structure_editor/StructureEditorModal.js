import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonToolbar,
  Modal,
  Panel,
  FormGroup
} from 'react-bootstrap';
import Select from 'react-select';
import StructureEditor from '../models/StructureEditor';
// import StructureEditorContent from './StructureEditorContent';
import { EditorListParams, EditorList } from './StructureEditorMap';


const EditorSelector = ({ value, updateEditorSelection }) => (
  <FormGroup style={{ width: '50%' }}>
    <Select
      name="editor selection"
      clearable={false}
      // disabled={}
      options={EditorListParams}
      onChange={updateEditorSelection}
      value={value}
    />
  </FormGroup>
);

const WarningBox = ({ handleCancelBtn, hideWarning, show }) => (show ?
  (
    <Panel bsStyle="info">
      <Panel.Heading>
        <Panel.Title>
          Parents/Descendants will not be changed!
        </Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <p>This sample has parents or descendants, and they will not be changed.</p>
        <p>Are you sure?</p>
        <br />
        <Button bsStyle="danger" onClick={handleCancelBtn}
          className="g-marginLeft--10">
          Cancel
        </Button>
        <Button bsStyle="warning" onClick={hideWarning}
          className="g-marginLeft--10">
          Continue Editing
        </Button>
      </Panel.Body>
    </Panel>
  ) : null
);

WarningBox.propTypes = {
  handleCancelBtn: PropTypes.func.isRequired,
  hideWarning: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default class StructureEditorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: props.showModal,
      showWarning: props.hasChildren || props.hasParent,
      molfile: props.molfile,
      editor: props.editors.ketcher
    };

    this.handleEditorSelection = this.handleEditorSelection.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal,
      molfile: nextProps.molfile
    });
  }

  initializeEditor() {
    const { editor, molfile } = this.state;
    editor.molfile = molfile;
  }

  handleEditorSelection(e) {
    this.setState(prevState => ({ ...prevState, editor: this.props.editors[e.value] }));
  }

  handleCancelBtn() {
    this.hideModal();
    if (this.props.onCancel) { this.props.onCancel(); }
  }

  handleSaveBtn() {
    const { editor } = this.state;
    const { molfile, info } = editor;
    editor.fetchSVG().then((svg) => {
      this.setState({
        showModal: false,
        showWarning: this.props.hasChildren || this.props.hasParent
      }, () => { if (this.props.onSave) { this.props.onSave(molfile, svg, info); } });
    });
  }

  hideModal() {
    this.setState({
      showModal: false,
      showWarning: this.props.hasChildren || this.props.hasParent
    });
  }

  hideWarning() {
    this.setState({ showWarning: false });
  }

  render() {
    const handleSaveBtn = !this.props.onSave ? null : this.handleSaveBtn.bind(this);
    const cancelBtnText = this.props.cancelBtnText ? this.props.cancelBtnText : 'Cancel';
    const submitBtnText = this.props.submitBtnText ? this.props.submitBtnText : 'Save';
    const submitAddons = this.props.submitAddons ? this.props.submitAddons : '';
    const { editor, showWarning } = this.state;

    return (
      <div>
        <Modal
          dialogClassName={this.state.showWarning ? '' : 'structure-editor-modal'}
          animation
          show={this.state.showModal}
          onLoad={this.initializeEditor.bind(this)}
          onHide={this.handleCancelBtn.bind(this)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Structure Editor
              <EditorSelector
                value={editor}
                updateEditorSelection={this.handleEditorSelection}
              />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body >
            <WarningBox
              handleCancelBtn={this.handleCancelBtn.bind(this)}
              hideWarning={this.hideWarning.bind(this)}
              show={!!showWarning}
            />
            <div>
              <iframe
                id={editor.id}
                src={editor.src}
                title={`${editor.title}`}
                height="850px"
                width="100%"
                ref={(f) => { this.ifr = f; }}
              />
            </div>
            <div style={{ marginTop: '20px' }}>
              <ButtonToolbar>
                <Button bsStyle="warning" onClick={this.handleCancelBtn.bind(this)}>
                  {cancelBtnText}
                </Button>
                {!handleSaveBtn ? null : (
                  <Button bsStyle="primary" onClick={handleSaveBtn} style={{ marginRight: '20px' }} >
                    {submitBtnText}
                  </Button>
                )}
                {!handleSaveBtn ? null : submitAddons}
              </ButtonToolbar>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

StructureEditorModal.propTypes = {
  editors: PropTypes.objectOf(StructureEditor),
  molfile: PropTypes.string,
  showModal: PropTypes.bool,
  hasChildren: PropTypes.bool,
  hasParent: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
};

StructureEditorModal.defaultProps = {
  editors: EditorList,
  molfile:  "\n  noname\n\n  0  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n",
  showModal: false,
  hasChildren: false,
  hasParent: false,
};
