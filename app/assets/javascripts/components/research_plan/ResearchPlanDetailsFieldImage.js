import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'

import ResearchPlansFetcher from '../fetchers/ResearchPlansFetcher'


export default class ResearchPlanDetailsFieldImage extends Component {

  handleDrop(files) {
    let { field, onChange } = this.props
    let image_file = files[0]
    let replace = field.value.public_name

    // upload new image
    ResearchPlansFetcher.updateImageFile(image_file, replace).then((value) => {
      // update research plan
      onChange(value, field.id)
    });
  }

  renderEdit() {
    let { field } = this.props

    let content
    if (field.value.public_name) {
      let src = '/images/research_plans/' + field.value.public_name
      content = (
        <div className="image-container">
          <img src={src} alt={field.value.file_name} />
        </div>
      )
    } else {
      content = <p>Drop Files, or Click to Select.</p>
    }

    return (
      <Dropzone
        accept="image/*"
        multiple={false}
        onDrop={files => this.handleDrop(files)}
        className="dropzone"
      >
        {content}
      </Dropzone>
    );
  }

  renderStatic() {
    const { field } = this.props
    const src = '/images/research_plans/' + field.value.public_name

    return (
      <div className="image-container">
        <img src={src} alt={field.value.file_name} />
      </div>
    )
  }

  render() {
    if (this.props.edit) {
      return this.renderEdit()
    } else {
      return this.renderStatic()
    }
  }
}

ResearchPlanDetailsFieldImage.propTypes = {
  field: PropTypes.object,
  index: PropTypes.number,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
}
