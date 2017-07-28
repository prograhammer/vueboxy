import box from './box'
import ShadowBox from './ShadowBox.vue'
import toolbar from './toolbar'
import { cloneDeep } from './utils'
import eventBus from './eventBus'
import generators from './generators/vueboxy'

export default {
  components: { box, ShadowBox, toolbar },

  mixins: [generators],

  props: {
    'value': {
      type: Array,
      default: function () {
        return []
      }
    },

    snap: {
      type: Number,
      default: 20
    },

    'mode': {
      type: String,
      default: 'input'
    },

    'responsive': {
      type: Boolean
    },

    'selected': {
      type: Number,
      default: null
    }
  },

  mounted () {
    this.initCanvas()
    this.initListeners()
    this.initBoxes()
  },

  watch: {

    /**
     * The v-model value given to the component.
     * It's synced to boxProps.
     *
     * @param  {Array} val The new value.
     * @param  {Array} old The old value.
     * @return {void}
     */
    value: function (val) {
      this.valueWasEmitted ? this.valueWasEmitted = false : this.initBoxes()
    },

    mode: function (val) {
      this.mode = val
    },

    responsive: function (val) {
      this.responsive = val
    },

    selected: function (val) {
      if (val === this.selectedSync) return
      if (val === null) this.clearSelected()
      else this.setSelected(val)
    }
  },

  computed: {
    selectedBox: function () {
      return this.boxes[this.selectedSync] || null
    }
  },

  beforeDestroy () {
    this.destroyListeners()
  },

  data () {
    return {
      canvas: null,
      valueWasEmitted: false,
      boxes: [],
      sorted: [],
      history: [],
      wasSnapped: false,
      selectedSync: this.selected,
      isTouching: false,
      dragOntoCanvasHandler: () => {},
      dropOntoCanvasHandler: () => {}
    }
  },

  methods: {
    initCanvas () {
      this.canvas = this.$el
    },

    initListeners () {
      this.dragOntoCanvasHandler = (box) => { this.dragOntoCanvas(box) }
      this.dropOntoCanvasHandler = (box) => { this.dropOntoCanvas(box) }
      eventBus.$on('dragOntoCanvas', this.dragOntoCanvasHandler)
      eventBus.$on('dropOntoCanvas', this.dropOntoCanvasHandler)
    },

    destroyListeners () {
      eventBus.$off('dragOntoCanvas', this.dragOntoCanvasHandler)
      eventBus.$off('dropOntoCanvas', this.dropOntoCanvasHandler)
    },

    initBoxes () {
      this.addBoxes()
      this.sortBoxes()
      this.pushHistory()
    },

    isTouchingCanvas (box) {
      return this.isIntersect(box.touch, this.$el.getBoundingClientRect())
    },

    touchBox (touch) {
      if (this.selectedBox) this.selectedBox.touch = touch
    },

    dragOntoCanvas (box) {
      if (!this.selectedBox && this.isTouchingCanvas(box)) {
        this.setSelected(this.addBox(box))
        this.sortBoxes()
        eventBus.$emit('wasDraggedOntoCanvas', true)
      }

      this.touchBox(box.touch)
    },

    dropOntoCanvas (box) {
      this.touchBox(box.touch)
    },

    drag (box) {
      if (!this.wasSnapped) return
      this.resetBoxes()
      this.fixCollisions(box)
    },

    drop (box) {
      this.sortBoxes()
      this.pushHistory()
    },

    addBoxes () {
      this.boxes = []
      for (const boxData of this.value) { this.addBox(boxData) }
    },

    addBox (boxData) {
      const box = {
        index: this.boxes.length,
        comp: boxData.comp,
        pos: boxData.pos,
        touch: boxData.touch,
        isSelected: boxData.isSelected,
        data: boxData.data
      }

      this.$set(this.boxes, box.index, box)

      return box.index
    },

    sortBoxes () {
      this.sorted = this.boxes
        .map(box => box.index)
        .sort((a, b) => this.boxes[a].pos.y - this.boxes[b].pos.y)
    },

    pushHistory () {
      const value = this.boxes.map((box) => ({
        comp: box.comp,
        pos: Object.assign({}, box.pos),
        data: cloneDeep(box.data)
      }))

      this.history = []
      this.history.push(value)
      this.valueWasEmitted = true
      this.$emit('input', value)
    },

    resetBoxes () {
      let selectedBoxSortIndex = 0

      Array.forEach(this.sorted, (boxIndex, sortIndex) => {
        const box = this.boxes[boxIndex]

        // Restore box from history.
        if (!this.isSelectedBox(box)) this.restoreBoxFromHistory(box)

        // Determine the new sort order for the selected Box.
        if ((box.pos.y + box.pos.h) < this.selectedBox.pos.y) selectedBoxSortIndex++
      })

      this.reorderSelectedBox(selectedBoxSortIndex)
    },

    restoreBoxFromHistory (box) {
      this.$set(box, 'pos', Object.assign({}, this.history[this.history.length - 1][box.index].pos))
    },

    reorderSelectedBox (toIndex) {
      const oldIndex = this.getSortIndex(this.selectedBox)
      const lastIndex = this.sorted.length - 1
      toIndex = toIndex > lastIndex ? lastIndex : toIndex

      this.sorted.splice(oldIndex, 1)
      this.sorted.splice(toIndex, 0, this.selectedBox.index)
    },

    isSelectedBox (box) {
      return this.selectedBox ? box.index === this.selectedBox.index : false
    },

    getSortIndex (box) {
      return this.sorted.findIndex(value => {
        return value === box.index
      })
    },

    fixCollisions (box) {
      const startIndex = this.getSortIndex(box)
      const nextIndex = startIndex + 1
      const lastIndex = this.sorted.length - 1
      const boxList = this.sorted.slice(startIndex)
      let collisionsFound = 0

      Array.forEach(boxList, (boxIndex, index) => {
        if (this.fixCollision(box, this.boxes[boxIndex])) collisionsFound++
      })

      // Stop further checking when the next box is the last one.
      if (nextIndex === lastIndex) return

      // Stop further checking if no collisions were found on the dragged box.
      if (this.isSelectedBox(box) && !collisionsFound) return

      const boxIndex = this.sorted[nextIndex]
      this.fixCollisions(this.boxes[boxIndex])
    },

    fixCollision (box, opponentBox) {
      if (box.index === opponentBox.index) return false
      if (this.isSelectedBox(opponentBox)) return false
      if (!this.isIntersect(box.pos, opponentBox.pos)) return false

      const distance = (box.pos.y + box.pos.h) - opponentBox.pos.y
      this.pushDown(opponentBox, distance)

      return true
    },

    pushDown (box, distance) {
      const y = Math.ceil((box.pos.y + distance) / 20) * 20
      this.$set(box.pos, 'y', y)
    },

    isIntersect (box1, box2) {
      if (!box1 || !box2) return false

      box1 = this.convertCoord(box1)
      box2 = this.convertCoord(box2)

      const temp = (box1.left < box2.right &&
              box2.left < box1.right &&
              box1.top < box2.bottom &&
              box2.top < box1.bottom)

      return temp
    },

    convertCoord (coords) {
      const left = typeof coords.x !== 'undefined' ? coords.x : coords.left
      const top = typeof coords.y !== 'undefined' ? coords.y : coords.top
      const width = typeof coords.w !== 'undefined' ? coords.w : coords.width || 0
      const height = typeof coords.h !== 'undefined' ? coords.h : coords.height || 0
      const right = left + width
      const bottom = top + height

      return { left, top, right, bottom }
    },

    setSelected (boxIndex, val = true) { // <-- @TODO: Refactor to use box object.
      if (val) this.selectedSync = boxIndex
      if (!val && boxIndex === this.selectedSync) this.selectedSync = null

      this.boxes[boxIndex].isSelected = val
      this.$emit('selected', this.selectedSync)
    },

    clearSelected () {
      if (!this.selectedBox) return

      this.selectedBox.isSelected = false
      this.selectedSync = null
    },

    beforeDestroyBox (box) {
      if (this.isSelectedBox(box)) this.clearSelected()
    }
  }
}
