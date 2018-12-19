<template>
  <div class="singer">
    歌手页面
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
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = res.data.list
          }
        })
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom 0
    width:100%
</style>
