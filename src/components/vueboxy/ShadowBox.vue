<template lang="pug">
.vbox-shadow-box(
    v-bind:style="style"
)
</template>

<script>
export default {
  name: 'ShadowBox',
  props: {

    'h': {
      type: Number,
      default: 0
    },

    'w': {
      type: Number,
      default: 0
    },

    'x': {
      type: Number,
      default: 0
    },

    'y': {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      id: Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1),
      display: 'auto'
    }
  },

  computed: {
    style: function () {
      return {
        'display': this.display,
        'top': this.y + 'px',
        'left': this.x + 'px',
        'width': this.w + 'px',
        'height': this.h + 'px'
      }
    }
  },

  methods: {

  }
}
</script>
