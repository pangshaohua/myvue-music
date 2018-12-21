<template>
  <scroll class="listview"
          :data="singers"
          ref="listview"
          @scroll="scroll"
          :listenScroll="listenScroll"
          :probeType="probeType"
  >
    <ul>
      <li class="list-group"
          v-for="(group,index) in singers"
          :key="index"
          ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item"
              v-for="(item,index) in group.items"
              @click="selectItem(item)"
              :key="index">
            <img class="avatar" v-lazy="item.avatar" :alt="item.name">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut">
      <ul>
        <li class="item"
            @touchstart.stop.prevent="onShortcutTouchStart"
            @touchmove.stop.prevent="onShortcutTouchMove"
            :data-index="index"
            :class="{'current':anchorIndex == index}"
            v-for="(item,index) in shortcutList" :key="index">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div class="loading-container" v-show="!singers.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'

  const ANCHOR_HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default{
    props: {
      singers: {
        type: Array,
        default: () => [] // 按eslint语法，default必须是函数形式返回值，否则报错
      }
    },
    created() {
      this.touch = {}
      this.listenScroll = true
      this.probeType = 3
      this.listHeight = []
    },
    data() {
      return {
        anchorIndex: 0,
        scrollY: -1,
        diff: -1
      }
    },
    computed: {
      shortcutList() {
        return this.singers.map((item) => {
          return item.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.singers[this.anchorIndex] ? this.singers[this.anchorIndex].title : ''
      }
    },
    methods: {
      selectItem(item) {
        this.$emit('select', item)
      },
      onShortcutTouchStart(e) {
        let el = e.target
        let anchorIndex = getData(el, 'index') // 得到的是字符串类型
        let firstTouch = e.touches[0]
        this._scrollTo(anchorIndex)
        this.anchorIndex = anchorIndex
        // 为touchmove记录首次点击的index和pageY以方便计算move中的index
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta // 注意类型转换
        if (anchorIndex < 0) {
          anchorIndex = 0
        }
        if (anchorIndex > this.listHeight.length - 2) {
          anchorIndex = this.listHeight.length - 2
        }
        this._scrollTo(anchorIndex)

        this.anchorIndex = anchorIndex
      },
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }
        // 调用listview组件中定义的scrollToElement方法
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      _calculateHeight() {
        this.listHeight = []
        let list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          height += list[i].clientHeight
          this.listHeight.push(height)
        }
      }
    },
    watch: {
      singers() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        const listHeight = this.listHeight
        if (newY > 0) {
          this.anchorIndex = 0
          return
        }
        for (let i = 0; i < listHeight.length - 1; i++) {
          if (-newY >= listHeight[i] && -newY < listHeight[i + 1]) {
            this.anchorIndex = i
            this.diff = listHeight[i + 1] + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限,-2是因为开始listHeight中push了0，
        // 然后再循环的listGroup每个元素的高度,listGroup的元素个数和右侧字母的元素个数是相同的
        // 因为字母列表循环的是singers的title，列表listGroup循环的是singers的items
        // 所以listHeight中的元素比右侧对应的字母数量要多1
        this.anchorIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal >= 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) { // 防止取到数值为0，为重复渲染，尽管位置并没有变化
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixedTitle.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    box-sizing border-box
    background: $color-background
    .list-group
      width: 100%
      height: 100%
      padding-bottom 20px
      overflow: hidden
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position absolute
      z-index 30
      top: 50%
      right: 0
      transform translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
