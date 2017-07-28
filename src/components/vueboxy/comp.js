import box from './box'
import eventBus from './eventBus'
import touch from './mixins/touch'
import generators from './generators/comp'

export default {
  components: { box },

  mixins: [touch, generators],

  props: {
    'value': {
      type: Object,
      default: function () {
        return {
          comp: null,
          pos: { x: -1000, y: -1000, w: 120, h: 120 },
          data: null
        }
      }
    }
  },

  mounted () {
    document.body.appendChild(this.$refs.box.$el)
    this.initListeners()
    this.initTouch()
  },

  beforeDestroy () {
    this.destroyListeners()
  },

  data () {
    return {
      boxOrigRect: null,
      box: {
        comp: this.value.comp,
        data: this.value.data,
        pos: { x: 0, y: 0, w: this.value.pos.w, h: this.value.pos.h },
        touch: null
      },
      visible: false,
      wasDraggedOntoCanvasHandler: () => {}
    }
  },

  watch: {
    value: function (val) {
      this.box.comp = val.comp || null
      this.box.data = val.data || null
      this.box.pos.w = val.w || 120
      this.box.pos.h = val.h || 120
    }
  },

  methods: {
    initListeners () {
      this.wasDraggedOntoCanvasHandler = () => { this.visible = false }
      eventBus.$on('wasDraggedOntoCanvas', this.wasDraggedOntoCanvasHandler)
    },

    initTouch () {
      this.initTap(this.$refs.overlay)
      this.initDrag(this.$refs.overlay)
    },

    destroyListeners () {
      eventBus.$off('wasDraggedOntoCanvas', this.wasDraggedOntoCanvasHandler)
    },

    dragStart () {
      this.visible = true
    },

    drag () {
      this.box.touch = this.touchSync
      eventBus.$emit('dragOntoCanvas', this.box)
    },

    drop () {
      this.visible = false
      this.box.touch = this.touchSync
      this.box.pos = { x: -1000, y: -1000, w: this.box.pos.w, h: this.box.pos.h }

      eventBus.$emit('dropOntoCanvas', this.box)
    }
  }
}
