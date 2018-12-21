<template>
  <div class="singer">
    <list-view
      @select="selectSinger"
      :singers="singers"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  /* var map = new BMap.Map("allmap");
   function myFun(result){
   console.log(result)
   var cityName = result.name;
   // map.setCenter(cityName);
   console.log("当前定位城市:"+cityName);
   }
   var myCity = new BMap.LocalCity();
   myCity.get(myFun); */
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import listView from 'base/listview/listview'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10
  export default {
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      selectSinger(singer) {
        this.$router.push(`/singer/${singer.id}`)
      },
      // 获取歌手列表
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      // 将歌手列表处理成需要的数据结构
      _normalizeSinger(singers) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 只存放热门数据
        singers.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            // 相同的对象结构可以定义一个类
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
          // 按字母进行分类
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          // 相同的对象结构可以定义一个类
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        })
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      }
    },
    components: {
      listView
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom 0
    width: 100%
</style>
