import React from 'react';
import {Button, OverlayTrigger} from 'react-bootstrap';
import CollectionStore from './stores/CollectionStore';
import CollectionActions from './actions/CollectionActions';
import CollectionSubtree from './CollectionSubtree';
import UIActions from './actions/UIActions';
import UIStore from './stores/UIStore';
import ElementStore from './stores/ElementStore';
import Xdiv from './extra/CollectionTreeXdiv';
import update from 'react-addons-update';
import UserInfos from './UserInfos';

export default class CollectionTree extends React.Component {
  constructor(props) {
    super(props);

    let collecState = CollectionStore.getState()
    this.state = {
      unsharedRoots: collecState.unsharedRoots,
      sharedRoots: collecState.sharedRoots,
      remoteRoots: collecState.remoteRoots,
      lockedRoots: collecState.lockedRoots,
      syncInRoots: collecState.syncInRoots,
      ownCollectionVisible: true,
      sharedCollectionVisible: true,
      syncCollectionVisible: true
    }

    this.onChange = this.onChange.bind(this)
  }

  componentDidMount() {
    CollectionStore.listen(this.onChange);
    CollectionActions.fetchLockedCollectionRoots();
    CollectionActions.fetchUnsharedCollectionRoots();
    CollectionActions.fetchSharedCollectionRoots();
    CollectionActions.fetchRemoteCollectionRoots();
    CollectionActions.fetchSyncInCollectionRoots();
  }

  componentWillUnmount() {
    CollectionStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  lockedSubtrees() {
    const roots = this.state.lockedRoots;
    return this.subtrees(roots, null, false);
  }

  unsharedSubtrees() {
    let roots = this.state.unsharedRoots;
    roots = roots.filter(function(item) { return !item.isNew})

    return this.subtrees(roots, null, false);
  }

  sharedSubtrees() {
    let {sharedRoots, sharedToCollectionVisible} = this.state

    if (sharedRoots.length < 1 || sharedRoots[0].children.length < 1)
      return <span />
    sharedToCollectionVisible = !sharedToCollectionVisible
    let labelledRoots = sharedRoots.map(e => {
      return update(e, {label: {$set:
        <span>{this.labelRoot('shared_to', e)}</span>
      }})
    })

    let subTreeLabels = (
      <div className="tree-view">
        <div className="title" style={{backgroundColor:'white'}}
             onClick={() => this.setState({sharedToCollectionVisible: sharedToCollectionVisible})}>
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
    if (remoteRoots.length < 1 || remoteRoots[0].children.length < 1)
      return <span />
    sharedWithCollectionVisible = !sharedWithCollectionVisible
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
             onClick={() => this.setState({sharedWithCollectionVisible: sharedWithCollectionVisible})}>
          <i className="fa fa-list"/> &nbsp;
          Shared with me &nbsp;
          <i className="fa fa-share-alt share-icon"/>
        </div>
      </div>
    )

    return this.subtrees(labelledRoots, subTreeLabels,
                         false, sharedWithCollectionVisible)
  }

  remoteSyncInSubtrees() {
    let {syncInRoots, syncCollectionVisible} = this.state
    if (syncInRoots.length < 1 || syncInRoots[0].children.length < 1)
      return <span />
    syncCollectionVisible = !syncCollectionVisible
    let labelledRoots = syncInRoots.map(e => {
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
             onClick={() => this.setState({syncCollectionVisible: syncCollectionVisible})}>
          <i className="fa fa-list"/> &nbsp;
          Synchronized with me &nbsp;
          <i className="fa fa-share-alt"/>
        </div>
      </div>
    )

    return this.subtrees(labelledRoots, subTreeLabels,
                         false, syncCollectionVisible)
  }


  labelRoot(sharedToOrBy,rootCollection){
    let shared = rootCollection[sharedToOrBy]
    if (shared){
      return(
        <OverlayTrigger placement="bottom" overlay={UserInfos({users:[shared]})}>
          <span>
            &nbsp; {sharedToOrBy == 'shared_to' ? 'with' : 'by'}
            &nbsp; {shared.initials}
          </span>
        </OverlayTrigger>
      )
    } else{
      return(
        <span></span>
      )
    }
  }

  convertToSlug(name) {
    return name.toLowerCase()
  }

  subtrees(roots, label, isRemote, visible = true) {
    if(roots.length > 0) {
      let subtrees = roots.map((root, index) => {
        return <CollectionSubtree root={root} key={index}
                                  isRemote={isRemote} visible={visible}/>
      })

      let subtreesRender = visible ? subtrees : ""
      return (
        <div>
          {label}
          {subtreesRender}
        </div>
      )
    } else {
      return <span></span>;
    }
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
    let {ownCollectionVisible} = this.state
    let extraDiv = [];
    for (let j=0;j < Xdiv.divCount;j++){
      let NoName = Xdiv["div"+j];
      extraDiv.push(<NoName key={"Xdiv"+j} />);
    }

    return (
      <div>
        <div className="tree-view">
          {this.collectionManagementButton()}
          <div className="title" style={{backgroundColor:'white'}}
               onClick={() => this.setState({ownCollectionVisible: !ownCollectionVisible})}>
            <i className="fa fa-list" /> &nbsp; Collections
          </div>
        </div>
        <div className="tree-wrapper">
          {ownCollectionVisible && this.lockedSubtrees()}
          {ownCollectionVisible && this.unsharedSubtrees()}
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
      </div>
    )
  }
}

Array.prototype.unique = function(a){
  return function() { return this.filter(a) }
} (function(a,b,c) { return c.indexOf(a,b+1) < 0 })
