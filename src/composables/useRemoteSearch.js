import { computed, ref, shallowRef } from 'vue'

/**
 * Items loaded from a server while the user types ("search-url" or "search-request" props).
 * Request: GET search-url?q=term&page=1&...searchParams
 * Response: { results: [...], pagination: { more: true } }, { results: [...], more: true } or an array.
 */
export function useRemoteSearch (props, emit) {
  const enabled = computed(() => !!(props.searchUrl || props.searchRequest))

  const items = shallowRef([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const more = ref(false)
  const error = ref(null)
  // the search string is shorter than "min-search-length"
  const tooShort = ref(false)

  let page = 1
  let term = ''
  // what is loaded now, to not load the same list again when the menu is opened
  let loadedKey = null
  let timer = null
  let controller = null
  // number of the last request, answers of older requests are ignored
  let token = 0

  function getKey (searchTerm) {
    return searchTerm + '\u0001' + props.searchUrl + '\u0001' + JSON.stringify(props.searchParams || {})
  }

  function buildUrl (searchTerm, pageNumber) {
    const params = { q: searchTerm, page: pageNumber, ...(props.searchParams || {}) }
    const query = Object.keys(params)
      .filter(key => params[key] != null)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      .join('&')

    return props.searchUrl + (props.searchUrl.indexOf('?') === -1 ? '?' : '&') + query
  }

  function request (searchTerm, pageNumber, signal) {
    if (props.searchRequest) {
      return Promise.resolve(props.searchRequest(searchTerm, pageNumber, props.searchParams || {}, signal))
    }

    return fetch(buildUrl(searchTerm, pageNumber), {
      signal,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    }).then(response => {
      if (!response.ok) throw new Error('Search request failed with status ' + response.status)

      return response.json()
    })
  }

  function normalize (data) {
    if (Array.isArray(data)) return { results: data, more: false }

    const results = data && Array.isArray(data.results) ? data.results : []
    const hasMore = data ? (data.pagination ? data.pagination.more : data.more) : false

    return { results, more: !!hasMore }
  }

  function cancel () {
    clearTimeout(timer)
    timer = null

    if (controller) controller.abort()
    controller = null
  }

  function load (searchTerm, pageNumber) {
    cancel()

    const current = ++token
    const append = pageNumber > 1

    if (String(searchTerm).length < props.minSearchLength) {
      items.value = []
      more.value = false
      loading.value = false
      loadingMore.value = false
      tooShort.value = true
      loadedKey = null

      return Promise.resolve()
    }

    tooShort.value = false
    error.value = null
    loading.value = !append
    loadingMore.value = append
    controller = typeof AbortController !== 'undefined' ? new AbortController() : null

    return request(searchTerm, pageNumber, controller ? controller.signal : undefined)
      .then(data => {
        if (current !== token) return

        const result = normalize(data)

        items.value = append ? items.value.concat(result.results) : result.results
        more.value = result.more
        page = pageNumber
        term = searchTerm
        loadedKey = getKey(searchTerm)
      })
      .catch(err => {
        if (current !== token || (err && err.name === 'AbortError')) return

        error.value = err
        more.value = false
        if (!append) items.value = []
        loadedKey = null
        emit('search-error', err)
      })
      .then(() => {
        if (current !== token) return

        loading.value = false
        loadingMore.value = false
      })
  }

  // the user typed: waits for "search-delay" before the request
  function search (searchTerm) {
    cancel()
    token++
    loading.value = String(searchTerm).length >= props.minSearchLength

    if (!loading.value) return load(searchTerm, 1)

    timer = setTimeout(() => load(searchTerm, 1), props.searchDelay)
  }

  // the menu was opened: loads the first page if it is not there yet
  function ensureLoaded (searchTerm) {
    if (timer || loadedKey === getKey(searchTerm)) return

    return load(searchTerm, 1)
  }

  function loadMore () {
    if (!more.value || loading.value || loadingMore.value || timer) return

    emit('load-more', page + 1)

    return load(term, page + 1)
  }

  return { enabled, items, loading, loadingMore, more, error, tooShort, search, ensureLoaded, loadMore, cancel }
}
