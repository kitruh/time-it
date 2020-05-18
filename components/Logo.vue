<template>
  <div class="time-wrapper">
    <h1>Timer</h1>
    <button @click="addSegment">Add Segment</button>
    <button @click="countDownAudio.play()">playsound</button>
    <label>Time</label>
    <div>
      WORKOUT NAME: <span v-if="editWorkoutName"><input v-model="workoutName"></span>
      <span v-else> {{workoutName}}</span>
      <button @click="toggleEditWorkoutName"> Edit workout name</button>
    </div>
    <input v-model="timeToAdd">
    <label>Type</label>
    <select v-model="typeToAdd">
      <option disabled value="">Please select one</option>
      <option>Workout</option>
      <option>Rest</option>
    </select>
    <label>Name</label>
    <input v-model="intervalName"/>

    <div v-for="(segment, index) in timeSegments" :key="segment.id">

            <span v-if="segment.editOn">
                    <label>Time</label>
                <input v-model="segment.time">
                <label>Type</label>
                <select v-model="segment.type">
                  <option disabled value="">Please select one</option>
                  <option>Workout</option>
                  <option>Rest</option>
                </select>
                <label>Name</label>
                <input v-model="segment.name"/>
            </span>
      <span v-else>{{segment.name}} {{ segment.time }} seconds</span>

      <button @click="moveUp(segment)" :disabled="isFirstItem(index)">up</button>
      <button @click="moveDown(segment)" :disabled="isLastItem(index)">down</button>
      <button @click="deleteFromList(segment)">delete</button>
      <button @click="duplicate(segment)">duplicate</button>
      <button @click="toggleEdit(segment)"><span v-if="segment.editOn">Stop</span> Edit</button>
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
    <div>
      {{secondsToTime.h}}:{{secondsToTime.m}}:{{secondsToTime.s}}
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

    <audio id="countdown-wav">
      <source src="/countdown-belltone.wav" type="audio/wav">
      Your browser does not support the <code>audio</code> element.
    </audio>

    <audio id="start-wav">
      <source src="/start-belltone.wav" type="audio/wav">
      Your browser does not support the <code>audio</code> element.
    </audio>

  </div>
</template>
<script>
  import {v4 as uuidv4} from 'uuid';
  import Tone from 'tone';

  export default {
    mounted(){
      this.startAudio = document.getElementById("start-wav");
      this.countDownAudio = document.getElementById("countdown-wav");
    },
    data() {
      return {
        timeSegments: [
          {id: uuidv4(), time: 10, type: 'set', name: 'Pull Ups', editOn: false},
          {id: uuidv4(), time: 10, type: 'set', name: 'Rest', editOn: false},
        ],
        showTimeLeft: false,
        timeLeft: 0,
        countDownType: '',
        interval: null,
        timeToAdd: 0,
        typeToAdd: '',
        repeat: true,
        intervalName: '',
        pause: false,
        currentSegmentName: '',
        nextSegmentName: '',
        totalTime: 0,
        editWorkoutName: false,
        workoutName: '',
        countDownAudio: {},
        startAudio: {}
      };
    },
    methods: {
      async start() {
        this.totalTime = 0;
        if (this.interval != null) {
          return;
        }
        let index = 0;
        this.showTimeLeft = true;
        this.timeLeft = this.timeSegments[index].time;
        this.countDownType = this.timeSegments[index].type;
        this.currentSegmentName = this.timeSegments[index].name;

        if (this.timeSegments[index + 1]) {
          this.nextSegmentName = this.timeSegments[index + 1].name;
        }

        this.interval = setInterval(() => {
          if (!this.pause) {
            this.totalTime += 1
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
                  if (this.timeSegments[index + 1]) {
                    this.nextSegmentName = this.timeSegments[index + 1].name;
                  }

                }

              } else {
                index += 1;
                this.timeLeft = this.timeSegments[index].time;
                this.countDownType = this.timeSegments[index].type;
                this.currentSegmentName = this.timeSegments[index].name;

                if (index === this.timeSegments.length - 1) {
                  this.nextSegmentName = this.timeSegments[0].name;
                } else if (this.timeSegments[index + 1]) {
                  this.nextSegmentName = this.timeSegments[index + 1].name;
                }
                //    this.deleteFirstItem()
                this.playStartTone();
              }
            }
          }
        }, 1000);

      },
      playCountDownTone() {
        this.countDownAudio.pause()
        this.countDownAudio.currentTime = 0
        this.countDownAudio.play()
      },
      playStartTone() {
        this.startAudio.play()
      },
      stopInterval() {
        clearInterval(this.interval);
        this.interval = null;
      },
      addSegment() {
        this.timeSegments.push({time: this.timeToAdd, type: this.typeToAdd, id: uuidv4(), name: this.intervalName});
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
      deleteFirstItem() {
        this.timeSegments.splice(0, 1);
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
      toggleEdit(segment) {
        segment.editOn = !segment.editOn;
      },
      duplicate(segment){
        this.timeSegments.splice(this.timeSegments.indexOf(segment) + 1, 0, {...segment});
      },
      saveWorkout(){

      },
      toggleEditWorkoutName(){
        this.editWorkoutName = !this.editWorkoutName
      }

    },
    computed: {
      secondsToTime() {
        let hours = Math.floor(this.totalTime / (60 * 60));

        const divisor_for_minutes = this.totalTime % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);

        const divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);

        if(seconds < 10){
          seconds = "0" +seconds
        }
        if(hours < 10){
          hours = "0" +hours
        }
        if(minutes < 10){
          minutes = "0" +minutes
        }
        return {
          'h': hours,
          'm': minutes,
          's': seconds,
        };
      },
    }
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
    flex-direction: column;
    justify-content: center;
  }

  .up-next {
    font-size: .5em;
  }
</style>
