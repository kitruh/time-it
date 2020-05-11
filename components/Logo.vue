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
    <button @click="this.toggleRepeat">Toggle Repeat</button> {{repeat}}
    <div>{{timeLeft}}</div>
  </div>
</template>
<script>
  import { v4 as uuidv4 } from 'uuid';
  import Tone from 'tone'
  export default {
    data() {
      return {
        timeSegments: [
          {id: uuidv4(), time: 3, type: 'start'},
          {id: uuidv4(), time: 60, type: 'set'},
          {id: uuidv4(), time: 20, type: 'set'},
        ],
        showTimeLeft: false,
        timeLeft: 0,
        countDownType: '',
        interval: null,
        timeToAdd: 0,
        typeToAdd: '',
        repeat: false,
      };
    },
    methods: {
      async start() {
        if(this.interval != null){
          return;
        }
        let index = 0;
        this.showTimeLeft = true;
        this.timeLeft = this.timeSegments[index].time;
        this.countDownType = this.timeSegments[index].type;
        this.playTone()

        this.interval = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft -= 1;
            if(this.timeLeft <=3){
              this.playTone()
            }
          } else {
            if (index === this.timeSegments.length - 1) {
              if(!this.repeat){
                this.stopInterval();
              }else{
                index = 0;
                this.timeLeft = this.timeSegments[index].time;
                this.countDownType = this.timeSegments[index].type;
              }

            } else {
              index += 1;
              this.timeLeft = this.timeSegments[index].time;
              this.countDownType = this.timeSegments[index].type;
              this.playTone()
            }
          }
        }, 1000);

      },
      playTone(){
        const synth = new Tone.PolySynth(6, Tone.Synth, {
          oscillator : {
            type : "sine"
          }
        }).toMaster();
        synth.triggerAttackRelease(["C4"], "16n");
        synth.triggerAttackRelease(["E4"], "16n", '+16n');
        synth.triggerAttackRelease(["G4"], "16n", '+8n');
      },
      stopInterval(){
        clearInterval(this.interval);
        this.interval = null
      },
      addSegment(){
        this.timeSegments.push({time: this.timeToAdd, type: this.typeToAdd, id: uuidv4()})
      },
      moveUp(id){
      console.log("move up", id)
      },
      moveDown(id){
        console.log("move down", id)

      },
      toggleRepeat(){
        this.repeat = !this.repeat
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
