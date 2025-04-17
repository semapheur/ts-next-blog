export default class EventListenerStore {
  store: { [event: string]: [Element, EventListenerOrEventListenerObject][] }

  constructor() {
    this.store = {}
  }

  public storeEventListener(
    event: string,
    el: Element,
    handler: EventListenerOrEventListenerObject,
  ) {
    if (!Object.hasOwn(this.store, event)) {
      this.store[event] = []
    }
    el.addEventListener(event, handler)
    this.store[event].push([el, handler])
  }

  public cleanupEventListeners() {
    for (const event in this.store) {
      for (const [el, handler] of this.store[event]) {
        el.removeEventListener(event, handler)
      }
    }
    this.store = {}
  }
}
