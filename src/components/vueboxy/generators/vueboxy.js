export default {
  methods: {
    genWrapper () {
      const data = {
        'class': {
          'vbox-canvas__wrapper': true
        },
        ref: 'wrapper'
      }

      return this.$createElement('div', data, [this.genBoxes(), this.genShadowBox(), this.genToolbar()])
    },

    genBoxes () {
      const boxes = []

      this.boxes.forEach((box, i) => {
        boxes.push(
          this.$createElement('box', {
            key: i,
            props: {
              canvas: this.canvas,
              index: i,
              mode: this.mode,
              responsive: this.responsive,
              pos: box.pos,
              touch: box.touch,
              isSelected: box.isSelected,
              snap: this.snap
            },
            on: {
              pos: (pos) => { box.pos = pos },
              wasSnapped: (wasSnapped) => { this.wasSnapped = wasSnapped },
              touch: (touch) => { box.touch = touch },
              isSelected: (isSelected) => { this.setSelected(i, isSelected) },
              isTouching: (isTouching) => { this.isTouching = isTouching },
              drag: () => this.drag(box),
              drop: () => this.drop(box),
              resize: () => this.drag(box),
              resizeEnd: () => this.drop(box),
              beforeDestroy: () => { this.beforeDestroyBox(box) }
            }
          }, [this.$slots[i], this.genResize()])
        )
      })

      return boxes
    },

    genToolbar () {
      if (!this.$scopedSlots.toolbar || !this.selectedBox) return

      const data = {
        'props': {
          canvas: this.canvas,
          center: this.selectedBox.touch,
          visible: this.selectedBox && !this.isTouching
        },
        'ref': 'toolbar'
      }

      const tools = this.$scopedSlots.toolbar(this.selectedBox.index)

      return this.$createElement('toolbar', data, [tools])
    },

    genResize () {
      if (!this.$slots.resize) return null

      return this.$createElement('div', {
        slot: 'resize'
      }, [this.$slots.resize])
    },

    genShadowBox () {
      if (this.mode !== 'input' || !this.selectedBox) return null

      const props = {
        h: this.selectedBox.pos.h,
        w: this.selectedBox.pos.w,
        x: this.selectedBox.pos.x,
        y: this.selectedBox.pos.y
      }

      return this.$createElement('shadow-box', { props: props }, [])
    }
  },

  render (h) {
    const data = {
      'class': {
        'vbox-canvas': true,
        'js-vbox-canvas': true,
        'vbox-canvas--input-mode': this.mode === 'input',
        'vbox-canvas--output-mode': this.mode === 'output'
      },
      'on': {
        'mousedown': (e) => {
          if (e.target === this.$refs.wrapper) this.clearSelected()
        }
      }
    }

    return h('div', data, [this.genWrapper()])
  }
}
