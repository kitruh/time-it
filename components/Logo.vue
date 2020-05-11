<template>
  <div class="time-wrapper">
    <h1>Timer</h1>
    <button @click="addSegment">Add Segment</button>

    <label>Time</label>
    <input v-model="timeToAdd">
    <label>Type</label>
    <input v-model="typeToAdd">

    <div v-for="segment in timeSegments" :key="segment.id">
      time:{{ segment.time }} id:{{ segment.id }} type:{{ segment.type }} <button @click="moveUp(segment.id)">up</button> <button @click="moveDown(segment.id)">down</button>
    </div>

    <button @click="this.start">start</button>
    <button @click="this.stopInterval">Stop</button>
    <div>{{timeLeft}}</div>
  </div>
</template>
<script>
  import { v4 as uuidv4 } from 'uuid';
  export default {
    data() {
      return {
        timeSegments: [
          {id: uuidv4(), time: 3, type: 'start'},
          {id: uuidv4(), time: 2, type: 'set'},
          {id: uuidv4(), time: 1, type: 'set'},
        ],
        showTimeLeft: false,
        timeLeft: 0,
        countDownType: '',
        interval: {},
        timeToAdd: 0,
        typeToAdd: ''
      };
    },
    methods: {
      async start() {
        let index = 0;
        this.showTimeLeft = true;
        this.timeLeft = this.timeSegments[index].time;
        this.countDownType = this.timeSegments[index].type;

        this.interval = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft -= 1;
          } else {
            if (index === this.timeSegments.length - 1) {
              clearInterval(this.interval);
            } else {
              index += 1;
              this.timeLeft = this.timeSegments[index].time;
              this.countDownType = this.timeSegments[index].type;
            }
          }
        }, 1000);

      },
      stopInterval(){
        clearInterval(this.interval);
      },
      addSegment(){
        this.timeSegments.push({time: this.timeToAdd, type: this.typeToAdd, id: uuidv4()})
      },
      moveUp(id){
      console.log("move up", id)
      },
      moveDown(id){
        console.log("move down", id)

      }
    },
  };
</script>
<style lang="scss">

  .time-wrapper {
    button {
      color: green;
    }
  }
</style>
