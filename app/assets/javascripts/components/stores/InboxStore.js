import alt from '../alt';
import InboxActions from '../actions/InboxActions';
import _ from 'lodash'

class InboxStore{

  constructor() {
    this.state = {
      inbox: {},
      cache: [],
      numberOfAttachments: 0
    };

    this.bindListeners({
      handleFetchInbox: InboxActions.fetchInbox,
      handleRemoveAttachmentFromList: InboxActions.removeAttachmentFromList,
      handleRemoveUnlinkedAttachmentFromList: InboxActions.removeUnlinkedAttachmentFromList,
      handleRemoveDatasetFromList:InboxActions.removeDatasetFromList,
      handleDeleteAttachment: InboxActions.deleteAttachment,
      handleDeleteContainer: InboxActions.deleteContainer,
      handleClearCache: InboxActions.clearCache,
      handleBackToInbox: InboxActions.backToInbox,
      handleDeleteContainerLink: InboxActions.deleteContainerLink
    })
  }

  handleFetchInbox(result){
    this.state.inbox = result;
    this.sync();
    this.countAttachments();
  }

  handleRemoveAttachmentFromList(attachment){
    let inbox = this.state.inbox

    inbox.children.forEach(device_box => {
      device_box.children.forEach(dataset => {
        var index = dataset.attachments.indexOf(attachment)
        if (index != -1){
            dataset.attachments.splice(index, 1)
            this.state.cache.push(attachment)
        }
      })
    })
    this.setState(inbox)
    this.countAttachments();
  }

  handleRemoveUnlinkedAttachmentFromList(attachment){
    let inbox = this.state.inbox

    var index = inbox.unlinked_attachments.indexOf(attachment)
    if (index != -1){
      inbox.unlinked_attachments.splice(index, 1)
      this.state.cache.push(attachment)
    }

    this.setState(inbox)
    this.countAttachments();
  }

  handleRemoveDatasetFromList(dataset){
    let inbox = this.state.inbox;

    inbox.children.forEach(device_box => {
      var index = device_box.children.indexOf(dataset)
      if(index != -1){
        device_box.children[index].attachments.forEach(attachment => {
          this.state.cache.push(attachment)
        })
        device_box.children[index].attachments = []
      }
    })

    this.setState(inbox)
    this.countAttachments();
  }

  handleDeleteAttachment(result){
    InboxActions.fetchInbox();
  }

  handleDeleteContainerLink(result){
    InboxActions.fetchInbox();
  }

  handleDeleteContainer(result){
    InboxActions.fetchInbox();
  }

  handleBackToInbox(attachment){
    var attachments = this.state.cache.filter(function(item) {
      if (item.id == attachment.id){
        return item
      }
    })
    if (attachments.length == 1) {
      var index = this.state.cache.indexOf(attachments[0])
      this.state.cache.splice(index, 1)
      InboxActions.fetchInbox()
    }else{
      console.log("not found")
      InboxActions.deleteContainerLink(attachment)
    }
  }

  handleClearCache(){
    this.state.cache = [];
  }

  handleClearCache(attachments){

  }

  sync(){
    let inbox = this.state.inbox

    inbox.children.forEach(device_box => {
      device_box.children.forEach(dataset => {
        dataset.attachments = _.differenceBy(dataset.attachments, this.state.cache, 'id')
        //this.state.cache.forEach(deletedAttachment => {
          //dataset.attachments = dataset.attachments.filter(function(item) {
          //  if (item.id !== deletedAttachment.id){
          //    return item
          //  }

        //  })
        //})
      })
    })
    inbox.unlinked_attachments = _.differenceBy(inbox.unlinked_attachments, this.state.cache, 'id')
    //this.state.cache.forEach(deletedAttachment => {
    //  inbox.unlinked_attachments = inbox.unlinked_attachments.filter(function(item) {
    //    if (item.id !== deletedAttachment.id){
    //      return item
    //    }

    //  })
    //})
    this.setState(inbox)
  }

  countAttachments(){
    var count = 0;
    const inbox = this.state.inbox
    inbox.children.forEach(device_box => {
      device_box.children.forEach(dataset => {
        count += dataset.attachments.length
      })
    })
    count += inbox.unlinked_attachments.length
    this.state.numberOfAttachments = count
  }
}

export default alt.createStore(InboxStore, 'InboxStore');
