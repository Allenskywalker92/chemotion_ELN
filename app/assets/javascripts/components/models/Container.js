import Element from './Element';
import Attachment from './Attachment';

export default class Container extends Element {
  static buildEmpty() {
    return new Container({
      name: 'new',
      children: [],
      attachments: [],
      is_deleted: false,
      description: '',
      extended_metadata: {},
      container_type: '',
    })
  }

  static init(){
    var root = this.buildEmpty();
    root.container_type = 'root';

    var analyses = this.buildEmpty();
    analyses.container_type = 'analyses';

    root.children.push(analyses);

    return root;
  }

  name() {
    return this.name;
  }

//  set name(name) {
//    this._name = name;
//  }

  children() {
    return this.children;
  }

  //set children(children) {
  //    this._children = children;
  //}

  attachments() {
    return this.attachments;
  }

  //set attachments(attachments) {
  //    this.attachments = attachments.map(a => new Attachment(a));;
  //}

  serialize() {
    return super.serialize({
      id: this.id,
      name: this.name,
      children: this.children,
      attachments: this.attachments.map(a => a.serialize()),
      is_new: this.isNew || false,
      is_deleted: this.deleted,
      description: this.description,
      extended_metadata: this.extended_metadata,
      container_type: this.container_type,
    })
  }

}
