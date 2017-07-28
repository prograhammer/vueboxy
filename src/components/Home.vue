<template lang="pug">
.vbx-home
  section.hero.is-info.is-medium
    // Hero header: will stick at the top
    .hero-head
      header.nav
        .container
          .nav-left
            a.nav-item
              img(src='images/bulma-type-white.png', alt='Logo')
          span.nav-toggle
            span
            span
            span
          .nav-right.nav-menu
            a.nav-item.is-active
              | Home
            a.nav-item
              | Examples
            a.nav-item(href='https://github.com/prograhammer/vueboxy')
              | Documentation
            span.nav-item
              a.button.is-primary.is-inverted
                span.icon
                  i.fa.fa-github
                span Download
    // Hero content: will be in the middle
    .hero-body
      .container.has-text-centered
        h1.title.vbx-pixel-font(style='margin-top: -50px;')
          | Vueboxy
        h2.subtitle
          | A Drag n' Drop Solution to Arranging Components
    // Hero footer: will stick at the bottom
    .hero-foot
      nav.tabs.is-centered.is-boxed
        .container
          ul
            li.is-active
              a Basic
            li
              a Dashboard
            li
              a Output
            li
              a Example 4
            li
              a More Examples
  section
    .container(style='margin-top: 40px; margin-bottom: 200px;')
      .columns
        .column.is-3
          nav.panel(style='margin-top: -100px;')
            p.panel-heading
              | Components
            .panel-block.is-active(style='justify-content: center; background-color: #FFF;')
              img(src='../assets/images/duck.png')
              comp(v-model="comps.compDuck")
                template(slot="comp" scope)
                  comp-duck
            .panel-block.is-active(style='justify-content: center; background-color: #FFF;')
              img(src='../assets/images/hero.png')
            .panel-block.is-active(style='justify-content: center; background-color: #FFF;')
              img(src='../assets/images/enemy.png')
            .panel-block.is-active(style="height:300px;")
        .column.is-9
          .card(style='margin-top: -100px;')
            .card-content.vbx-canvas-container(style='height: 600px;')
              vueboxy.vueboxy(
                v-model="boxes"
                v-bind:selected="selected"
                @selected="val => selected = val"
                style="max-width: 1000px;"
              )
                template(slot="toolbar" scope="box")
                  div(class="vbx-toolbar")
                    b-icon(icon="settings" @click="showSettings = true")
                    b-icon(icon="delete" @click="boxes.splice(box.index, 1)")
                    b-icon(icon="close" @click="selected = null")
                component(
                  v-for="(box, index) in boxes"
                  v-bind:is="box.comp"
                  v-bind:key="index"
                  v-bind:slot="index"
                )
  div.modal.vbx-modal(v-bind:class="{ 'is-active': showSettings }")
    div.modal-background(@click="showSettings = false")
    div.modal-content
      div.box
        |some settings here
    button.modal-close(@click="showSettings = false")
</template>

<script>
import Vueboxy from './vueboxy/vueboxy'
import CompDuck from './common/comps/CompDuck'
import Hello from './vueboxy/Hello'
import Comp from './vueboxy/comp'

export default {
  name: 'home',

  components: { Vueboxy, CompDuck, Hello, Comp },

  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      showSettings: false,
      selected: null,
      boxes: [
        { comp: 'CompDuck', pos: { h: 120, w: 120, x: 0, y: 0 } },
        { comp: 'CompDuck', pos: { h: 120, w: 120, x: 160, y: 160 } },
        { comp: 'CompDuck', pos: { h: 120, w: 120, x: 300, y: 200 } }
      ],
      comps: {
        compDuck: { comp: 'CompDuck', pos: { h: 120, w: 120 } }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped style="sass">
h1 {
  font-size: 50px;
}

.vbx-toolbar {
  border-radius: 6px;
  background-color: #ECEFF1;
}

.vbx-toolbar i {
  padding: 5px;
}

.vbx-modal {
  z-index: 200;
}

</style>
