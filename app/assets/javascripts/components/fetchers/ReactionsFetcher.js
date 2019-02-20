import 'whatwg-fetch';
import { indexOf, split } from 'lodash';
import Reaction from '../models/Reaction';
import UIStore from '../stores/UIStore';
import NotificationActions from '../actions/NotificationActions';
import AttachmentFetcher from './AttachmentFetcher';

// TODO: Extract common base functionality into BaseFetcher
export default class ReactionsFetcher {
  static fetchById(id) {
    let promise = fetch('/api/v1/reactions/' + id + '.json', {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json()
      }).then((json) => {
        if (json.hasOwnProperty("reaction")) {
          return new Reaction(json.reaction)
        } else {
          return json
        }
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchByCollectionId(id, queryParams={}, isSync=false) {
    let page = queryParams.page || 1;
    let per_page = queryParams.per_page || UIStore.getState().number_of_results
    let from_date = '';
    if (queryParams.fromDate) {
      from_date = `&from_date=${queryParams.fromDate.unix()}`
    }
    let to_date = '';
    if (queryParams.toDate) {
      to_date = `&to_date=${queryParams.toDate.unix()}`
    }
    let api = `/api/v1/reactions.json?${isSync ? "sync_" : ""}` +
              `collection_id=${id}&page=${page}&per_page=${per_page}&` +
              `${from_date}${to_date}`;
    let promise = fetch(api, {
        credentials: 'same-origin'
      })
      .then((response) => {
        return response.json().then((json) => {
          return {
            elements: json.reactions.map((r) => new Reaction(r)),
            totalElements: parseInt(response.headers.get('X-Total')),
            page: parseInt(response.headers.get('X-Page')),
            pages: parseInt(response.headers.get('X-Total-Pages')),
            perPage: parseInt(response.headers.get('X-Per-Page'))
          }
        })
      }).catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static update(reaction) {
    let reactionFiles = AttachmentFetcher.getFileListfrom(reaction.container)
    let productsFiles = []
    reaction.products.forEach((prod) => {
      let files = AttachmentFetcher.getFileListfrom(prod.container)
      productsFiles = [...productsFiles, ...files];
    })
    let allFiles = reactionFiles.concat(productsFiles)

    let promise = ()=> fetch('/api/v1/reactions/' + reaction.id, {
      credentials: 'same-origin',
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reaction.serialize())
    }).then((response) => {
      return response.json()
    }).then((json) => {
      const r = json.reaction;
      r.duration_display = (indexOf(r.duration, ' ') > -1 ?
        {
          valueUnit: split(r.duration, ' ')[1],
          userText: split(r.duration, ' ')[0].toString()
        } : {
          valueUnit: 'Day(s)',
          userText: ''
        });
      return new Reaction(json.reaction);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    if (allFiles.length > 0 ){
      return AttachmentFetcher.uploadFiles(allFiles)().then(()=> promise());
    } else {
      return promise()
    }
  }

  static create(reaction) {
    let files = AttachmentFetcher.getFileListfrom(reaction.container)

    let promise = ()=> fetch('/api/v1/reactions/', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reaction.serialize())
    }).then((response) => {
      return response.json()
    }).then((json) => {
      const r = json.reaction;
      r.duration_display = (indexOf(r.duration, ' ') > -1 ?
        {
          valueUnit: split(r.duration, ' ')[1],
          userText: split(r.duration, ' ')[0].toString()
        } : {
          valueUnit: 'Day(s)',
          userText: ''
        });
      return new Reaction(json.reaction);
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });

    if(files.length > 0){
      return AttachmentFetcher.uploadFiles(files)().then(()=> promise());
    }else{
      return promise()
    }
  }

  static importFromChemScanner({ reactions, molecules }) {
    const promise = fetch('/api/v1/reactions/import_chemscanner', {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reactions,
        molecules,
        collection_id: UIStore.getState().currentCollection.id,
      })
    }).then(response => response.json()).catch((errorMessage) => {
      console.log(errorMessage);
    });

    return promise;
  }
}
