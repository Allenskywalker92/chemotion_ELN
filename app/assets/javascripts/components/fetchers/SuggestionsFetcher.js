import 'whatwg-fetch';

export default class SuggestionsFetcher {
  static fetchSuggestionsForCurrentUser(elementType, query, collectId,
    isSync = false) {
    return fetch(
      `/api/v1/suggestions/${elementType}/${query}.json?collection_id=${collectId}&isSync=${isSync}`,
      { credentials: 'same-origin' }
    ).then(response => response.json())
      .then(json => json.suggestions)
      .catch((errorMessage) => { console.log(errorMessage); });
  }
}
