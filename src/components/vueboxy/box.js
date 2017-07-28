import touch from './mixins/touch'
import generators from './generators/box'

export default {
  mixins: [touch, generators],

  props: {
    'canvas': {
      type: HTMLDivElement,
      default: function () {
        return null
      }
    },

    mode: {
      type: String,
      default: 'input'
    },

    responsive: {
      type: Boolean,
      default: false
    },

    'index': {
      type: Number,
      default: 0
    },

    'pos': {
      type: Object,
      default: function () {
        return { x: 0, y: 0, w: 0, h: 0 }
      }
    },

    'visible': {
      type: Boolean,
      default: true
    },

    'snap': {
      type: Number,
      default: 20
    }
  },

  mounted () {
    this.isMounted = true
    this.initTouch()
  },

  beforeDestroy () {
    this.$emit('beforeDestroy', this.index)
    this.destroyListeners()
  },

  data () {
    return {
      isMounted: false,
      comp: null,
      posSync: this.pos,
      oldSnapPos: { x: null, y: null, h: null, w: null },
      visibleSync: this.visible
    }
  },

  computed: {
    classes: function () {
      return {
        'vbox-box': true,
        'vbox-box--input-mode': this.mode === 'input',
        'vbox-box--output-mode': this.mode === 'output'
      }
    },

    styles: function () {
      return {
        'top': this.posSync.y + 'px',
        'left': this.responsiveStyles.left || this.posSync.x + 'px',
        'width': this.responsiveStyles.width || this.posSync.w + 'px',
        'height': this.posSync.h + 'px',
        'visibility': this.visibleSync ? 'visible' : 'hidden'
      }
    },

    responsiveStyles: function () {
      if (!this.canvas || !this.responsive) return { left: null, width: null }

      return {
        left: this.posSync.x / this.canvas.getBoundingClientRect().left * 100 + '%',
        width: this.posSync.w / this.canvas.getBoundingClientRect().width * 100 + '%'
      }
    },

    snapPos: function () {
      return {
        x: Math.round(this.posSync.x / this.snap) * this.snap,
        y: Math.round(this.posSync.y / this.snap) * this.snap,
        w: Math.round(this.posSync.w / this.snap) * this.snap,
        h: Math.round(this.posSync.h / this.snap) * this.snap
      }
    },

    wasSnapped: function () {
      const snapPos = this.snapPos
      const old = this.oldSnapPos

      return snapPos.x !== old.x || snapPos.y !== old.y || snapPos.w !== old.w || snapPos.h !== old.h
    }
  },

  watch: {
    pos: function (val) {
      const old = this.posSync
      if (this.isTouching) return // <-- Position changes are not allowed from parent during drag/resize.
      if (val.x !== old.x || val.y !== old.y || val.w !== old.w || val.h !== old.h) this.setPosition(val)
    },

    visible: function (val) {
      this.setVisible(val)
    }
  },

  methods: {
    initTouch () {
      if (this.mode === 'output' || this.disableTouch) return

      this.initTap(this.$refs.overlay)
      this.initDrag(this.$refs.overlay)
      this.initResize(this.$refs.resize)
    },

    setVisible (visible) {
      this.visibleSync = visible
      this.$emit('visible', visible)
    },

    setPosition (pos) {
      this.oldSnapPos = this.snapPos
      this.posSync = pos

      this.$emit('wasSnapped', this.wasSnapped)
      this.$emit('pos', this.isTouching ? this.snapPos : this.posSync)
    },

    // Touch Callbacks (from Touch mixin)

    drag () {
      const { x, y, w, h } = this.posSync
      this.setPosition({ x: x + this.touchSync.offset.left, y: y + this.touchSync.offset.top, w, h })
    },

    drop () {
      this.setPosition(this.snapPos)
    },

    resize () {
      const { x, y, w, h } = this.posSync
      this.setPosition({ x, y, w: w + this.touchSync.offset.right, h: h + this.touchSync.offset.bottom })
    },

    resizeEnd () {
      this.setPosition(this.snapPos)
    }
  }
}
