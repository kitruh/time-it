<template>
  <div class="page-container">
    <h1>Timer</h1>

    <div>
      WORKOUT NAME: <span v-if="editWorkoutName"><input v-model="workoutName"></span>
      <span v-else> {{workoutName}}</span>
      <md-button class="md-primary md-raised" @click="initializeNewWorkout">New Workout</md-button>
      <md-button class="md-primary md-raised" @click="toggleEditWorkoutName"> Edit workout name</md-button>
      <md-button class="md-primary md-raised" @click="saveWorkout" :disabled="saveWorkoutButtonDisabled">Save Workout</md-button>

      <md-button class="md-primary md-raised" @click="clearAllSavedWorkouts">Clear All Saved Workouts</md-button>
    </div>
    <div>
    <h5>Saved Workouts:</h5>
      <div v-for="workout in workouts" @click="setWorkout(workout)">
        {{workout.name}}
      </div>

    </div>

    <md-button class="md-primary md-raised" @click="addSegment">Add Segment</md-button>
    <md-button class="md-primary md-raised" @click="initSound">playsound</md-button>
    <label>Time</label>
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

      <md-button class="md-primary md-raised" @click="moveUp(segment)" :disabled="isFirstItem(index)">up</md-button>
      <md-button class="md-primary md-raised" @click="moveDown(segment)" :disabled="isLastItem(index)">down</md-button>
      <md-button class="md-primary md-raised" @click="deleteFromList(segment)">delete</md-button>
      <md-button class="md-primary md-raised" @click="duplicate(segment)">duplicate</md-button>
      <md-button class="md-primary md-raised" @click="toggleEdit(segment)"><span v-if="segment.editOn">Stop</span> Edit</md-button>
    </div>

    <md-button class="md-primary md-raised" @click="this.start">start</md-button>
    <md-button class="md-primary md-raised" @click="this.stopInterval">Stop</md-button>
    <md-button class="md-primary md-raised" @click="this.toggleRepeat">Toggle Repeat</md-button>
    {{repeat}}
    <md-button class="md-primary md-raised" @click="this.togglePause">
      <span v-if="this.pause">Unpause</span>
      <span v-else>Pause</span>
    </md-button>
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
      <source src="/countdown-and-start-belltone.wav" type="audio/wav">
      Your browser does not support the <code>audio</code> element.
    </audio>

    <md-snackbar :md-position="snackbar.position" :md-duration="snackbar.isInfinity ? Infinity : snackbar.duration" :md-active.sync="snackbar.showSnackbar" md-persistent>
      <span>{{snackbar.message}}</span>
      <md-button class="md-primary" @click="snackbar.showSnackbar = false">Close</md-button>
    </md-snackbar>

    <md-bottom-bar md-type="shift">
      <md-bottom-bar-item id="bottom-bar-item-home" md-label="Workout" md-icon="directions_run"></md-bottom-bar-item>
      <md-bottom-bar-item id="bottom-bar-item-pages" md-label="Pages" md-icon="pages"></md-bottom-bar-item>
      <md-bottom-bar-item id="bottom-bar-item-posts" md-label="Posts" md-icon="/assets/icon-whatshot.svg"></md-bottom-bar-item>
      <md-bottom-bar-item id="bottom-bar-item-favorites" md-label="Favorites" md-icon="favorite"></md-bottom-bar-item>
    </md-bottom-bar>
  </div>
</template>
<script>
  import {v4 as uuidv4} from 'uuid';
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  export default {
    mounted(){
      this.countDownAudio = document.getElementById("countdown-wav");
      this.currentWorkoutId = uuidv4();
      let savedWorkouts
      try{
         savedWorkouts = JSON.parse(localStorage.getItem('workouts'));
      }catch{
        localStorage.clear()
      }

      if(savedWorkouts){this.workouts = savedWorkouts}

      if(this.workouts.length > 0){
        const firstWorkout = this.workouts[0]
        this.currentWorkoutId = firstWorkout.id
        this.timeSegments = firstWorkout.timeSegments
      }else{
        this.initializeNewWorkout()
      }
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
        workouts: [],
        currentWorkoutId: '',
        snackbar: {
          showSnackbar: false,
          position: 'center',
          duration: 4000,
          isInfinity: false,
          message: ''
        },
        menuVisible: false,
        theme: 'teal'
           };
    },
    methods: {
      start() {

        this.countDownAudio.currentTime=1
        this.countDownAudio.play()
        this.countDownAudio.pause()

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
        this.countDownAudio.pause()
        this.countDownAudio.currentTime = 1.5
        this.countDownAudio.play()
      },
      stopInterval() {
        clearInterval(this.interval);
        this.interval = null;
      },
      addSegment () {
        this.timeSegments.push(
          {
            time: this.timeToAdd,
            type: this.typeToAdd,
            id: uuidv4(),
            name: this.intervalName,
            editOn: false
          }
        )
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
        const existingWorkout = this.workouts.findIndex( workout => {
          return workout.id === this.currentWorkoutId
        })

       const workoutToSave = {
          timeSegments : this.timeSegments,
          name: this.workoutName,
          id: this.currentWorkoutId
        }

      if(existingWorkout >= 0){
        this.workouts.splice(existingWorkout, 1, workoutToSave)
      }else{
        this.workouts.push(workoutToSave);
      }

        localStorage.setItem('workouts', JSON.stringify(this.workouts));

        this.snackbar.message = "Workout Successfully Saved"
        this.snackbar.showSnackbar = true

      },
      toggleEditWorkoutName(){
        this.editWorkoutName = !this.editWorkoutName
      },
      initSound(){
        this.countDownAudio.volume=0
        this.countDownAudio.play()
      },
      setWorkout(workout){
        this.currentWorkoutId = workout.id
        this.workoutName = workout.name;
        this.timeSegments = workout.timeSegments
      },
      initializeNewWorkout(){
        this.currentWorkoutId= uuidv4();
        this.workoutName = `New Workout ${this.workouts.length + 1}`;
        this.timeSegments = [];
      },
      clearAllSavedWorkouts(){
        localStorage.removeItem('workouts')
      },
      showSnackbar(){
        this.snackbar.showSnackbar=true
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
      saveWorkoutButtonDisabled(){
        return this.workoutName === ""
      }
    }
  };
</script>
<style lang="scss">

</style>

<style lang="scss" scoped>
  .phone-viewport {
    width: 322px;
    height: 200px;
    display: inline-flex;
    align-items: flex-end;
    overflow: hidden;
    border: 1px solid rgba(#000, .26);
    background: rgba(#000, .06);
  }


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
