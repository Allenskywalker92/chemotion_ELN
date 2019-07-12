import 'whatwg-fetch';
import BaseFetcher from './BaseFetcher';

import CollectionActions from '../actions/CollectionActions';
import NotificationActions from '../actions/NotificationActions';

export default class CollectionsFetcher {
  static takeOwnership(params) {
    let sync = params.isSync ? "syncC" : "c"
    let promise = fetch(`/api/v1/${sync}ollections/take_ownership/${params.id}`, {
      credentials: 'same-origin',
      method: 'POST'
    })

    return promise;
  }

  static fetchLockedRoots() {
    return BaseFetcher.withoutBodyData({
      apiEndpoint: '/api/v1/collections/locked.json',
      requestMethod: 'GET',
      jsonTranformation: (json) => { return json }
    });
  }

  static fetchUnsharedRoots() {
    let promise = fetch('/api/v1/collections/roots.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        return json;
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchSharedRoots() {
    let promise = fetch('/api/v1/collections/shared_roots.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        return json;
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchRemoteRoots() {
    let promise = fetch('/api/v1/collections/remote_roots.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        return json;
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }
  static fetchSyncRemoteRoots() {
    let promise = fetch('/api/v1/syncCollections/sync_remote_roots.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        return json;
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static createSharedCollections(params) {
    return fetch('/api/v1/collections/shared/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
  }

  static createSync(params) {
    return fetch('/api/v1/syncCollections/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection_attributes: params.collection_attributes,
        user_ids: params.user_ids,
        id: params.id,
      })
    });
  }

  static editSync(params) {
    let promise = fetch('/api/v1/syncCollections/' + params.id, {
      credentials: 'same-origin',
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection_attributes: params.collection_attributes,
        user_ids: params.user_ids,
      })
    })

    return promise;
  }

  static deleteSync(params) {
    let promise = fetch('/api/v1/syncCollections/' + params.id, {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_syncd: params.is_syncd
      })
    })
    return promise;
  }

  static bulkUpdateUnsharedCollections(params) {
    let promise = fetch('/api/v1/collections', {
      credentials: 'same-origin',
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collections: params.collections,
        deleted_ids: params.deleted_ids
      })
    })

    return promise;
  }

  static rejectShared(params) {
    const promise = fetch('/api/v1/collections/reject_shared', {
      credentials: 'same-origin',
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: params.id
      })
    })
    return promise;
  }

  static updateSharedCollection(params) {
    let promise = fetch('/api/v1/collections/shared/' + params.id, {
      credentials: 'same-origin',
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection_attributes: params.collection_attributes,
      })
    })

    return promise;
  }

  static createUnsharedCollection(params) {
    let promise = fetch('/api/v1/collections/unshared/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        label: params.label
      })
    }).then((response) => {
      return response.json()
    }).then((json) => {
      return json;
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }

  static updateElementsCollection(params) {
    return fetch('/api/v1/collections/elements/', {
      credentials: 'same-origin',
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ui_state: params.ui_state,
        collection_id: params.collection_id,
        is_sync_to_me: params.is_sync_to_me,
        newCollection: params.newLabel,
      })
    }).then(response => response)
      .catch((errorMessage) => { console.log(errorMessage); });
  }

  static assignElementsCollection(params) {
    return fetch('/api/v1/collections/elements/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ui_state: params.ui_state,
        collection_id: params.collection_id,
        is_sync_to_me: params.is_sync_to_me,
        newCollection: params.newLabel,
      })
    }).then(response => response)
      .catch((errorMessage) => { console.log(errorMessage); });
  }

  static removeElementsCollection(params) {
    return fetch('/api/v1/collections/elements/', {
      credentials: 'same-origin',
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ui_state: params.ui_state,
      })
    }).then(response => response)
      .catch((errorMessage) => { console.log(errorMessage); });
  }

  static showExportError() {
    // TODO move to the right place
    NotificationActions.removeByUid('export_collections')
    NotificationActions.add({
      title: "Error",
      message: "An error occured with your export, please contact the administrators of the site if the problem persists.",
      level: "error",
      dismissible: true,
      uid: "export_collections_error",
      position: "bl",
      autoDismiss: null
    });
  }

  static showImportError() {
    // TODO move to the right place
    NotificationActions.removeByUid('import_collections')
    NotificationActions.add({
      title: "Error",
      message: "An error occured with your import, please contact the administrators of the site if the problem persists.",
      level: "error",
      dismissible: true,
      uid: "import_collections_error",
      position: "bl",
      autoDismiss: null
    });
  }

  static createExportJob(params) {

    let promise = fetch('/api/v1/collections/exports/', {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    }).then((job_id) => {
      return job_id;
    }).catch((errorMessage) => {
       throw new Error(errorMessage);
    });

    return promise;
  }

  static pollExportJob(exportId) {

    let promise = fetch(`/api/v1/collections/exports/${exportId}`, {
      credentials: 'same-origin',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    }).then((json) => {
      if (json.error) {
        CollectionsFetcher.showExportError();
      } else {
        if (json.status == 'completed') {
          // remove the notification
          NotificationActions.removeByUid('export_collections')

          // download the file, headers will prevent the browser from reloading the page
          window.location.href = `/zip/${exportId}.zip`;
        } else if (json.status == 'queued' || json.status == 'working') {
          // continue polling
          setTimeout(() => {
            CollectionsFetcher.pollExportJob(exportId);
          }, 1000);
        } else {
          CollectionsFetcher.showExportError();
        }
      }
    }).catch((errorMessage) => {
      CollectionsFetcher.showExportError();
    });

    return promise;
  }

  static createImportJob(params) {

    var data = new FormData();
    data.append("file", params.file);

    let promise = fetch('/api/v1/collections/imports/', {
      credentials: 'same-origin',
      method: 'POST',
      body: data
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    }).then((job_id) => {
      return job_id;
    }).catch((errorMessage) => {
      throw new Error(errorMessage);
    });

    return promise;
  }

  static pollImportJob(importId) {

    let promise = fetch(`/api/v1/collections/imports/${importId}`, {
      credentials: 'same-origin',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    }).then((json) => {
      if (json.error) {
        CollectionsFetcher.showImportError();
      } else {
        if (json.status == 'completed') {
          // remove the notification
          NotificationActions.removeByUid('import_collections')

          // reload the unshared collections
          CollectionActions.fetchUnsharedCollectionRoots()
        } else if (json.status == 'queued' || json.status == 'working') {
          // continue polling
          setTimeout(() => {
            CollectionsFetcher.pollImportJob(importId);
          }, 1000);
        } else {
          CollectionsFetcher.showImportError();
        }
      }
    }).catch((errorMessage) => {
      CollectionsFetcher.showImportError();
    });

    return promise;
  }
}
