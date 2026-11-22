// Small observer, lets a parent send events to the select (e.g. "set-search").
function Observer () {
  const listeners = {}

  function addListener (event, listener) {
    if (!listeners[event]) listeners[event] = []

    listeners[event].push(listener)
  }

  function removeListener (event, listener) {
    if (!listeners[event]) return

    listeners[event] = listeners[event].filter(l => l !== listener)
  }

  return {
    on: addListener,
    off: removeListener,
    onOnce (event, listener) {
      listener.once = true

      addListener(event, listener)
    },
    emit (event, data) {
      for (const listener of (listeners[event] || []).slice()) {
        listener(data)

        if (listener.once) removeListener(event, listener)
      }
    }
  }
}

export default Observer
