import * as Hammer from 'hammerjs'
import Scroll from './scroll'
import Select from './select'

export default {
  mixins: [Scroll, Select],

  props: {
    touch: {
      type: Object,
      default: function () {
        return null
      }
    },

    disableTouch: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      // Information about the latest touch event.
      touchSync: this.touch,

      // Managers for each touch type.
      tapManager: null,
      dragManager: null,
      resizeManager: null,

      // Handlers for each touch events.
      tapHandler: null,
      dragStartHandler: null,
      dragHandler: null,
      dropHandler: null,
      resizeStartHandler: null,
      resizeHandler: null,
      resizeEndHandler: null
    }
  },

  computed: {
    isTouching: function () {
      if (this.touchSync && (this.touchSync.action === 'drag' || this.touchSync.action === 'resize')) return true
      return false
    }
  },

  watch: {
    // Allows for outside control of calling callbacks.
    touch: function (touch) {
      if (!this.isEqual(touch)) this.handleTouch(touch)
    }
  },

  beforeDestroy () {
    this.tapManager.destroy()
    this.dragManager.destroy()
    this.resizeManager.destroy()
  },

  methods: {
    initTap (el) {
      this.tapHandler = (e) => { this.handleTouch(this.getTouch('tap', e)) }
      this.tapManager = new Hammer.Manager(el)
      this.tapManager.add(new Hammer.Tap())

      this.enableTap()
      this.initSelect()
    },

    enableTap () {
      if (!this.tapManager) return

      this.disableTap()

      this.tapManager.get('tap').set({ enable: true })
      this.tapManager.on('tap', this.tapHandler)
    },

    disableTap () {
      if (!this.tapManager) return

      this.tapManager.get('tap').set({ enable: false })
      this.tapManager.off('tap', this.tapHandler)
    },

    initDrag (el) {
      this.dragStartHandler = (e) => { this.handleTouch(this.getTouch('dragStart', e)) }
      this.dragHandler = (e) => { this.handleTouch(this.getTouch('drag', e)) }
      this.dropHandler = (e) => { this.handleTouch(this.getTouch('drop', e)) }

      this.dragManager = new Hammer.Manager(el)
      this.dragManager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, enable: false }))
    },

    enableDrag () {
      if (!this.dragManager) return

      this.disableDrag()

      this.dragManager.get('pan').set({ threshold: 40, 'enable': true })
      this.dragManager.on('panstart', this.dragStartHandler)
      this.dragManager.on('panleft panright panup pandown', this.dragHandler)
      this.dragManager.on('panend', this.dropHandler)
    },

    disableDrag () {
      if (!this.dragManager) return

      this.dragManager.get('pan').set({ 'enable': false })
      this.dragManager.off('panstart', this.dragStartHandler)
      this.dragManager.off('panleft panright panup pandown', this.dragHandler)
      this.dragManager.off('panend', this.dropHandler)
    },

    initResize (el) {
      this.resizeStartHandler = (e) => { this.handleTouch(this.getTouch('resizeStart', e)) }
      this.resizeHandler = (e) => { this.handleTouch(this.getTouch('resize', e)) }
      this.resizeEndHandler = (e) => { this.handleTouch(this.getTouch('resizeEnd', e)) }

      this.resizeManager = new Hammer.Manager(el)
      this.resizeManager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, enable: false }))
    },

    enableResize () {
      if (!this.resizeManager) return

      this.disableResize()

      this.resizeManager.get('pan').set({ 'enable': true })
      this.resizeManager.on('panstart', this.resizeStartHandler)
      this.resizeManager.on('panleft panright panup pandown', this.resizeHandler)
      this.resizeManager.on('panend', this.resizeEndHandler)
    },

    disableResize () {
      if (!this.resizeManager) return

      this.resizeManager.get('pan').set({ 'enable': false })
      this.resizeManager.off('panstart', this.resizeStartHandler)
      this.resizeManager.off('panleft panright panup pandown', this.resizeHandler)
      this.resizeManager.off('panend', this.resizeEndHandler)
    },

    isEqual (touch) {
      return ((touch === this.touchSync) || (touch && this.touchSync && touch.e === this.touchSync.e))
    },

    getTouch (action, hammerEvent) {
      const { x, y } = hammerEvent.center

      return {
        action: action,
        x: x,
        y: y,
        start: this.getTouchStart(hammerEvent),
        offset: this.getTouchOffset(hammerEvent),
        e: hammerEvent
      }
    },

    getTouchStart (hammerEvent) {
      if (this.isTouching) return this.touchSync.start

      const rect = this.$el.getBoundingClientRect()

      return {
        left: hammerEvent.center.x - rect.left - hammerEvent.deltaX,
        top: hammerEvent.center.y - rect.top - hammerEvent.deltaY,
        right: hammerEvent.center.x - rect.right,
        bottom: hammerEvent.center.y - rect.bottom
      }
    },

    getTouchOffset (hammerEvent) {
      const rect = this.$el.getBoundingClientRect()
      const start = this.getTouchStart(hammerEvent)

      return {
        left: hammerEvent.center.x - rect.left - start.left,
        top: hammerEvent.center.y - rect.top - start.top,
        right: hammerEvent.center.x - rect.right,
        bottom: hammerEvent.center.y - rect.bottom
      }
    },

    updateTouchOffset () {
      this.touchSync.offset = this.getTouchOffset(this.touchSync.e)
    },

    handleTouch (touch) {
      this.touchSync = touch
      const action = touch ? touch.action : null

      this.updateTouchOffset()
      this.toggleTapSelection()
      this.clearBrowserSelections()
      this.touchScroll()
      this.callCallbacks()

      this.$emit('touch', this.touchSync)
      this.$emit('isTouching', this.isTouching)
      this.$emit(action)
    },

    callCallbacks () {
      const touch = this.touchSync

      if (touch && touch.action === 'tap') this.tap()
      if (touch && touch.action === 'dragStart') this.dragStart()
      if (touch && touch.action === 'drag') this.drag()
      if (touch && touch.action === 'drop') this.drop()
      if (touch && touch.action === 'resizeStart') this.resizeStart()
      if (touch && touch.action === 'resize') this.resize()
      if (touch && touch.action === 'resizeEnd') this.resizeEnd()
    },

    // Callbacks the parent can use.

    tap () {
      // Override with a method in parent.
    },

    dragStart () {
      // Override with a method in parent.
    },

    drag () {
      // Override with a method in parent.
    },

    drop () {
      // Override with a method in parent.
    },

    resizeStart () {
      // Override with a method in parent.
    },

    resize () {
      // Override with a method in parent.
    },

    resizeEnd () {
      // Override with a method in parent.
    }
  }
}
