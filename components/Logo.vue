<template>
  <div class="time-wrapper" @touchstart="this.touchStart">
    <h1>Timer</h1>
    <button @click="addSegment">Add Segment</button>

    <label>Time</label>
    <input v-model="timeToAdd">
    <label>Type</label>
    <select v-model="typeToAdd">
      <option disabled value="">Please select one</option>
      <option>Workout</option>
      <option>Rest</option>
    </select>
    <label>Name</label>
    <input v-model="workoutName"/>

    <div v-for="(segment, index) in timeSegments" :key="segment.id">
      {{segment.name}} {{ segment.time }} seconds
      <button @click="moveUp(segment)" :disabled="isFirstItem(index)">up</button>
      <button @click="moveDown(segment)" :disabled="isLastItem(index)">down</button>
      <button @click="deleteFromList(segment)">delete</button>
    </div>

    <button @click="this.start">start</button>
    <button @click="this.stopInterval">Stop</button>
    <button @click="this.toggleRepeat">Toggle Repeat</button>
    {{repeat}}
    <button @click="this.togglePause">
      <span v-if="this.pause">Unpause</span>
      <span v-else>Pause</span>
    </button>
    <div class="time-section">
      <div>{{timeLeft}}</div>
      <div>{{currentSegmentName}}</div>
      <div class="up-next">up next {{nextSegmentName}}</div>
    </div>

    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <!-- time-it bottom add -->
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-5363460947226243"
         data-ad-slot="7703035200"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
      (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
</template>
<script>
  import {v4 as uuidv4} from 'uuid';
  import Tone from 'tone';

  export default {
    data() {
      return {
        timeSegments: [
          {id: uuidv4(), time: 10, type: 'set', name: 'Pull Ups'},
          {id: uuidv4(), time: 10, type: 'set', name: 'Rest'},
        ],
        showTimeLeft: false,
        timeLeft: 0,
        countDownType: '',
        interval: null,
        timeToAdd: 0,
        typeToAdd: '',
        repeat: true,
        workoutName: '',
        pause: false,
        currentSegmentName: '',
        nextSegmentName: ''
      };
    },
    methods: {
      async start() {
        if (this.interval != null) {
          return;
        }
        //this.timeSegments.unshift({id: uuidv4(), time: 4, type: 'start'})
        let index = 0;
        this.showTimeLeft = true;
        this.timeLeft = this.timeSegments[index].time;
        this.countDownType = this.timeSegments[index].type;
        this.currentSegmentName = this.timeSegments[index].name;

        if(this.timeSegments[index+1]){
          this.nextSegmentName = this.timeSegments[index+1].name;
        }

        this.interval = setInterval(() => {
          if (!this.pause) {
            if (this.timeLeft > 1) {
              this.timeLeft -= 1;
              if (this.timeLeft <= 3) {
                this.playCountDownTone();
              }
            } else {
              if (index === this.timeSegments.length - 1) {
                if (!this.repeat) {
                  this.stopInterval();
                } else {
                  index = 0;
                  this.timeLeft = this.timeSegments[index].time;
                  this.countDownType = this.timeSegments[index].type;
                  this.currentSegmentName = this.timeSegments[index].name;
                  if(this.timeSegments[index+1]){
                    this.nextSegmentName = this.timeSegments[index+1].name;
                  }

                }

              } else {
                index += 1;
                this.timeLeft = this.timeSegments[index].time;
                this.countDownType = this.timeSegments[index].type;
                this.currentSegmentName = this.timeSegments[index].name;

                if(index === this.timeSegments.length - 1){
                  this.nextSegmentName = this.timeSegments[0].name;
                }else if(this.timeSegments[index+1]){
                  this.nextSegmentName = this.timeSegments[index+1].name;
                }
            //    this.deleteFirstItem()
                this.playStartTone();
              }
            }
          }
        }, 1000);

      },
      playCountDownTone() {
        const synth = new Tone.PolySynth(6, Tone.Synth, {
          oscillator: {
            type: 'sine',
          },
        }).toMaster();
        synth.triggerAttackRelease(['C4'], '16n');
        synth.triggerAttackRelease(['E4'], '16n', '+16n');
        synth.triggerAttackRelease(['G4'], '16n', '+8n');
      },
      playStartTone() {
        const synth = new Tone.PolySynth(6, Tone.Synth, {
          oscillator: {
            type: 'sine',
          },
        }).toMaster();
        synth.triggerAttackRelease(['C6'], '16n');
      },
      stopInterval() {
        clearInterval(this.interval);
        this.interval = null;
      },
      addSegment() {
        this.timeSegments.push({time: this.timeToAdd, type: this.typeToAdd, id: uuidv4(), name: this.workoutName});
      },
      moveUp(segment) {
        const currentIndex = this.timeSegments.indexOf(segment);
        let newIndex;
        if (currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else {
          newIndex = currentIndex;
        }

        this.move(currentIndex, newIndex, this.timeSegments);

      },
      move(from, to, array) {
        array.splice(to, 0, array.splice(from, 1)[0]);
      },
      moveDown(segment) {
        const currentIndex = this.timeSegments.indexOf(segment);
        let newIndex;
        if (currentIndex < this.timeSegments.length - 1) {
          newIndex = currentIndex + 1;
        } else {
          newIndex = currentIndex;
        }

        this.move(currentIndex, newIndex, this.timeSegments);

      },
      deleteFromList(segment) {
        this.timeSegments.splice(this.timeSegments.indexOf(segment), 1);
      },
      deleteFirstItem(){
        this.timeSegments.splice(0,1);
      },
      toggleRepeat() {
        this.repeat = !this.repeat;
      },
      togglePause() {
        this.pause = !this.pause;
      },
      isLastItem(index) {
        return index === this.timeSegments.length - 1;
      },
      isFirstItem(index) {
        return index === 0;
      },
      touchStart() {
        console.log('touch!!!!!');
      },
    },
  };
</script>
<style lang="scss">

  .time-wrapper {
    button {
      color: #006bd6;
    }
  }

  .time-section {
    width: 100%;
    background-color: #006bd6;
    color: white;
    height: 50vh;
    display: flex;
    align-items: center;
    font-size: 10em;
    flex-direction:column;
    justify-content: center;
  }

  .up-next{
    font-size:.5em;
  }
</style>
