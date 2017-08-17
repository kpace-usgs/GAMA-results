import Vue from 'vue'
import Map from '@/components/mapDiv'

describe('mapDiv.vue', () => {
  it('should create a map', () => {
    const Constructor = Vue.extend(Map)
    const vm = new Constructor().$mount()
    // expect(vm.$el.querySelector('.hello h1').textContent)
    //   .to.equal('Welcome to Your Vue.js App')
  })
})