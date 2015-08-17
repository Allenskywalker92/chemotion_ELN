import 'whatwg-fetch';

// TODO: SamplesFetcher also updates Samples and so on...naming?
export default class SamplesFetcher {
  static fetchById(id) {
    let promise = fetch('/api/v1/samples/' + id + '.json', {
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

  static fetchByCollectionId(id) {
    let api = id == 'all' ? '/api/v1/samples.json' : '/api/v1/samples.json?collection_id=' + id
    let promise = fetch(api, {
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

  static update(paramObj) {
    let promise = fetch('/api/v1/samples/' + paramObj.id, {
      credentials: 'same-origin',
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: paramObj.name,
        amount_value: paramObj.amount_value,
        amount_unit: paramObj.amount_unit,
        description: paramObj.description
      })
    })

    return promise;
  }
}
