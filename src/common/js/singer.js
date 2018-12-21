/**
 * Created by Administrator on 2018/12/19.
 */
export default class Singer {
  constructor({name, id}) {
    this.name = name
    this.id = id
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${id}.jpg?max_age=2592000`
  }
}
