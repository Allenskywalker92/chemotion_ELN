import React from 'react';
import {Button, OverlayTrigger, Badge} from 'react-bootstrap';
import CollectionStore from './stores/CollectionStore';
import CollectionActions from './actions/CollectionActions';
import CollectionSubtree from './CollectionSubtree';
import UIActions from './actions/UIActions';
import InboxActions from './actions/InboxActions';
import UIStore from './stores/UIStore';
import ElementStore from './stores/ElementStore';
import InboxStore from './stores/InboxStore';
import Xdiv from './extra/CollectionTreeXdiv';
import update from 'react-addons-update';
import UserInfos from './UserInfos';

export default class CollectionTree extends React.Component {
  constructor(props) {
    super(props);

    let collecState = CollectionStore.getState()
    let inboxState = InboxStore.getState()

    this.state = {
      unsharedRoots: collecState.unsharedRoots,
      sharedRoots: collecState.sharedRoots,
      remoteRoots: collecState.remoteRoots,
      lockedRoots: collecState.lockedRoots,
      syncInRoots: collecState.syncInRoots,
      ownCollectionVisible: true,
      sharedWithCollectionVisible: true,
      sharedToCollectionVisible: true,
      syncCollectionVisible: true,
      inbox: inboxState.inbox,
      inboxVisible: false
    }

    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    CollectionStore.listen(this.onChange);
    InboxStore.listen(this.onChange);
    CollectionActions.fetchLockedCollectionRoots();
    CollectionActions.fetchUnsharedCollectionRoots();
    CollectionActions.fetchSharedCollectionRoots();
    CollectionActions.fetchRemoteCollectionRoots();
    CollectionActions.fetchSyncInCollectionRoots();
    InboxActions.fetchInbox();
  }

  componentWillUnmount() {
    CollectionStore.unlisten(this.onChange);
    InboxStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  lockedSubtrees() {
    const roots = this.state.lockedRoots;

    return this.subtrees(roots, null, false);
  }

  removeOrphanRoots(roots) {
    let newRoots =[]
    roots.forEach((root) => {
      if (root.children.length > 0) newRoots.push(root)
    })

    return newRoots;
  }

  unsharedSubtrees() {
    let roots = this.state.unsharedRoots;
    roots = roots.filter(function(item) { return !item.isNew})

    return this.subtrees(roots, null, false);
  }

  sharedSubtrees() {
    let {sharedRoots, sharedToCollectionVisible} = this.state
    sharedRoots = this.removeOrphanRoots(sharedRoots)

    let labelledRoots = sharedRoots.map(e => {
      return update(e, {label: {$set:
        <span>{this.labelRoot('shared_to', e)}</span>
      }})
    })

    let subTreeLabels = (
      <div className="tree-view">
        <div className="title" style={{backgroundColor:'white'}}
             onClick={() => this.setState({sharedToCollectionVisible: !sharedToCollectionVisible})}>
          <i className="fa fa-list" /> &nbsp;
          My shared projects &nbsp;
          <i className="fa fa-share-alt share-icon" />
        </div>
      </div>
    )
    return this.subtrees(labelledRoots, subTreeLabels,
                         false, sharedToCollectionVisible)
  }

  remoteSubtrees() {
    let {remoteRoots, sharedWithCollectionVisible} = this.state
    remoteRoots = this.removeOrphanRoots(remoteRoots)

    let labelledRoots = remoteRoots.map(e => {
      return update(e, {label: {$set:
        <span>
          {this.labelRoot('shared_by',e)}
          {' '}
          {this.labelRoot('shared_to',e)}
        </span>
      }})
    })

    let subTreeLabels = (
      <div className="tree-view">
        <div className="title" style={{backgroundColor:'white'}}
             onClick={() => this.setState({sharedWithCollectionVisible: !sharedWithCollectionVisible})}>
          <i className="fa fa-list"/> &nbsp;
          Shared with me &nbsp;
          <i className="fa fa-share-alt share-icon"/>
        </div>
      </div>
    )

    return this.subtrees(labelledRoots, subTreeLabels,
                         false, sharedWithCollectionVisible)
  }


  inboxSubtrees() {
    const inbox = this.state.inbox;

    let filelist = inbox.map(e => {
      return (
        <li>
          <span style={{fontSize: '18pt', cursor: 'move'}}
            className='text-info fa fa-arrows'></span>
             &nbsp; {e.filename}
        </li>
      )
    })
    return(
      <div className="tree-view">
        <ul>
          {filelist}
        </ul>
      </div>
    )
  }

  remoteSyncInSubtrees() {
    let {syncInRoots, syncCollectionVisible} = this.state
    syncInRoots = this.removeOrphanRoots(syncInRoots)

    let labelledRoots = syncInRoots.map(e => {
      return update(e, {label: {$set:
        <span>
          {this.labelRoot('shared_by', e)}
          {' '}
          {this.labelRoot('shared_to', e)}
        </span>
      }})
    })

    let subTreeLabels = (
      <div className="tree-view">
        <div className="title" style={{backgroundColor:'white'}}
             onClick={() => this.setState({syncCollectionVisible: !syncCollectionVisible})}>
          <i className="fa fa-list"/> &nbsp;
          Synchronized with me &nbsp;
          <i className="fa fa-share-alt"/>
        </div>
      </div>
    )

    return this.subtrees(labelledRoots, subTreeLabels,
                         false, syncCollectionVisible)
  }


  labelRoot(sharedToOrBy, rootCollection) {
    let shared = rootCollection[sharedToOrBy]
    if (!shared) return <span />

    return(
      <OverlayTrigger placement="bottom" overlay={UserInfos({users:[shared]})}>
        <span>
          &nbsp; {sharedToOrBy == 'shared_to' ? 'with' : 'by'}
          &nbsp; {shared.initials}
        </span>
      </OverlayTrigger>
    )
  }

  convertToSlug(name) {
    return name.toLowerCase()
  }

  subtrees(roots, label, isRemote, visible = true) {
    let subtrees = roots.map((root, index) => {
      return <CollectionSubtree root={root} key={index} isRemote={isRemote}/>
    })

    let subtreesVisible = visible ? "" : "none"
    return (
      <div>
        {label}
        <div style={{display: subtreesVisible}}>
          {subtrees}
        </div>
      </div>
    )
  }

  collectionManagementButton() {
    return (
      <div className="take-ownership-btn">
        <Button bsSize="xsmall" bsStyle="danger"
                onClick={() => this.handleCollectionManagementToggle()}>
          <i className="fa fa-cog"></i>
        </Button>
      </div>
    )
  }

  handleCollectionManagementToggle() {
    UIActions.toggleCollectionManagement();
    const {showCollectionManagement, currentCollection,isSync} = UIStore.getState();
    if(showCollectionManagement) {
      Aviator.navigate('/collection/management');
    } else {
      if( currentCollection == null || currentCollection.label == 'All' ) {
        Aviator.navigate(`/collection/all/${this.urlForCurrentElement()}`);
      } else {
        Aviator.navigate(isSync
          ? `/scollection/${currentCollection.id}/${this.urlForCurrentElement()}`
          : `/collection/${currentCollection.id}/${this.urlForCurrentElement()}`);
      }
    }
  }

  urlForCurrentElement() {
    const {currentElement} = ElementStore.getState();
    if(currentElement) {
      if(currentElement.isNew) {
        return `${currentElement.type}/new`;
      }
      else{
        return `${currentElement.type}/${currentElement.id}`;
      }
    }
    else {
      return '';
    }
  }

  render() {
    let {ownCollectionVisible, inboxVisible, inbox} = this.state
    let extraDiv = [];
    for (let j=0;j < Xdiv.count;j++){
      let NoName = Xdiv["content"+j];
      extraDiv.push(<NoName key={"Xdiv"+j} />);
    }

    let ownCollectionDisplay = ownCollectionVisible ? "" : "none"
    let inboxDisplay = inboxVisible ? "" : "none"

    return (
      <div>
        <div className="tree-view">
          {this.collectionManagementButton()}
          <div className="title" style={{backgroundColor:'white'}}
               onClick={() => this.setState({ownCollectionVisible: !ownCollectionVisible})}>
            <i className="fa fa-list" /> &nbsp; Collections
          </div>
        </div>
        <div className="tree-wrapper" style={{display: ownCollectionDisplay}}>
          {this.lockedSubtrees()}
          {this.unsharedSubtrees()}
        </div>
        <div className="tree-wrapper">
          {this.sharedSubtrees()}
        </div>
        <div className="tree-wrapper">
          {this.remoteSubtrees()}
        </div>
        <div className="tree-wrapper">
          {this.remoteSyncInSubtrees()}
        </div>
        {extraDiv.map((e)=>{return e})}
        <div className="tree-view">
          <div className="title" style={{backgroundColor:'white'}}
            onClick={() => this.setState({inboxVisible: !inboxVisible})}>
            <i className="fa fa-list" /> &nbsp; Inbox {
              inbox.length > 0 ? <Badge> {inbox.length} </Badge> : ""
            }
          </div>
        </div>
        <div className="tree-wrapper" style={{display: inboxDisplay}}>
          {this.inboxSubtrees()}
        </div>
      </div>
    )
  }
}

Array.prototype.unique = function(a){
  return function() { return this.filter(a) }
} (function(a,b,c) { return c.indexOf(a,b+1) < 0 })
