<template>
  <div class="box">
    <div class='top'>
      <div>
        <span class="iconfont icon-Location"></span>
        {{data.resName}}
      </div>
      <div>{{data.dispose? '已处理': '未处理'}}</div>
    </div>
    <div class='details-box'>
      <div class="img-box" :style="{'borderColor': data.color}">
        <img :src="data.faceImage" alt="暂无图片" @error="imgErr" @click="showDetail()">
        <img :src="data.userImage" alt="暂无图片" @error="imgErr" @click="showDetail()">
        <!-- <img :src="'/image/face/?image='+data.faceImage" alt="暂无图片" @error="imgErr" @click="showDetail()">
        <img :src="'/image/face/?image='+data.userImage" alt="暂无图片" @error="imgErr" @click="showDetail()"> -->
        <div class="similarity">{{data.similar + '%'}}</div>
      </div>
      <div class='details-data'>
        <p>
          <span class="iconfont icon-xingming1"></span>{{data.userName}}
        </p>
        <p>
          <span class="iconfont icon-xingming"></span>{{data.groupName}}
        </p>
        <p>
          <span class="iconfont icon-shijian"></span>{{$moment.unix(data.time).format('YYYY-MM-DD HH:mm:ss')}}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default() {
        return {
          age: 55,
          code: '411221198704134012',
          dateTime: 1528905600,
          gender: '2',
          group: '5b0d6b0d17bd6d4f1862c70b',
          groupImgId: 41,
          groupName: '白名单',
          groupTag: 0,
          hour: 19,
          id: '5b224924f910b713688f05bf',
          isdefense: true,
          name: '古天乐',
          passAge: 0,
          passGender: 0,
          faceImage: '5b224924f910b713688f05bd',
          res: '5b18aa7c8b236a0308713dfb',
          resName: '人脸抓拍_视频通道_通道1',
          similar: 50,
          time: 1528973605,
          timestamp: 0,
          userAge: 55,
          userCode: '411221198704134012',
          userGender: '2',
          userId: '5b20f061e8e7a7285cb0374e',
          userImage: '5b20f061e8e7a7285cb03746',
          userName: '古天乐'
        }
      }
    },
    index: {
      type: Number,
      default: 0
    }
  },
  methods: {
    imgErr(e) {
      e.target.src = '/static/noImg1.png'
    },
    showDetail() {
      this.$emit('showDetail')
    }
  }
}
</script>

<style lang="less" scoped>
.img-box {
  border: 1px solid #ddd;
  overflow: hidden;
  height: 114px;
  width: 182px;
  margin-right: 12px;
  position: relative;
  display: flex;
  img {
    height: 112px;
    width: 84px;
    display: flex;
    flex: 1;
    cursor: pointer;
    &:first-child {
      margin-right: 2px;
    }
  }
}
.similarity {
  width: 72px;
  height: 26px;
  position: absolute;
  bottom: -1px;
  font-size: 16px;
  font-weight: 700;
  left: 55px;
  text-align: center;
  line-height: 26px;
  z-index: 10;
  background: url('../../../../static/similarity.png') no-repeat;
  background-size: 100% 100%;
}
.top {
  display: flex;
  justify-content: space-between;
  height: 24px;
  line-height: 24px;
}
.details-box {
  display: flex;
  height: 122px;
  padding-top: 8px;
  .details-data {
    display: flex;
    flex: 1;
    flex-direction: column;
    p {
      margin-bottom: 8px;
      span {
        margin-right: 12px;
      }
    }
  }
}
</style>
