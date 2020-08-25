<template>
  <no-ssr>
  <Vue100vh>
  <div class="page-container">
    <div>
      <button @click="showWorkoutPage" id="bottom-bar-item-home" >WORKOUT</button>
      <button @click="showEditPage" id="bottom-bar-item-pages">EDIT</button>
    </div>

     <div v-if="editPageActive">
    <h1>Timer</h1>

    <div>
      WORKOUT NAME: <span v-if="editWorkoutName"><input v-model="workoutName"></span>
      <span v-else> {{workoutName}}</span>
      <button class=" " @click="initializeNewWorkout">New Workout</button>
      <button class=" " @click="toggleEditWorkoutName"> Edit workout name</button>
      <button class=" " @click="saveWorkout" :disabled="saveWorkoutButtonDisabled">Save Workout</button>

      <button class=" " @click="clearAllSavedWorkouts">Clear All Saved Workouts</button>
    </div>
    <div>
    <h5>Saved Workouts:</h5>
      <div v-for="workout in workouts" @click="setWorkout(workout)">
        {{workout.name}}
      </div>

    </div>

    <button class=" " @click="addSegment">Add Segment</button>
    <button class=" " @click="initSound">playsound</button>
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

      <button class=" " @click="moveUp(segment)" :disabled="isFirstItem(index)">up</button>
      <button class=" " @click="moveDown(segment)" :disabled="isLastItem(index)">down</button>
      <button class=" " @click="deleteFromList(segment)">delete</button>
      <button class=" " @click="duplicate(segment)">duplicate</button>
      <button class=" " @click="toggleEdit(segment)"><span v-if="segment.editOn">Stop</span> Edit</button>
    </div>
       <button class=" " @click="this.toggleRepeat">Toggle Repeat</button>
  </div>
    <div v-if="workoutPageActive" class="workoutPage time-it-page">

      <div class="time-section">
        <div class="current-segment-text">{{currentSegmentName}}</div>
          <div class="percentage-middle-circle">
            <div class="current-time">{{timeLeftInIntervalFormatted}} </div>
            <div class="time-elapsed">Time Elapsed: {{totalTimeFormatted}}</div>
          </div>

        <div class="stats">
         <div class="up-next-label">up next...</div>
          <div class="up-next-segment-name">{{nextSegmentName}}</div>

        </div>
        <div class="play-pause-wrapper" >
          <button class="md-icon-button play-pause-item" @click="this.start"><md-icon>play_arrow</md-icon></button>
          <button class="md-icon-button play-pause-item" @click="this.stopInterval"><md-icon>stop</md-icon></button>
          <button class="md-icon-button play-pause-item" @click="this.togglePause">
            <md-icon v-if="this.pause">play_arrow</md-icon>
            <md-icon v-else>pause</md-icon>
          </button>
        </div>
      </div>
    </div>

    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <!-- time-it bottom add -->
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-5363460947226243"
         data-ad-slot="7703035200"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>
  </Vue100vh>
  </no-ssr>
</template>
<script>
  import {v4 as uuidv4} from 'uuid';
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'

  import Vue100vh from 'vue-div-100vh'

  export default {
    mounted(){
      this.countDownAudio = new Audio('countdown-and-start-belltone.wav')
      // this.countDownAudio = document.getElementById("countdown-wav");
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

      window.onresize = () => {
        const maxCircleWidth = 600
        const minCircleWidth = 300
        const maxCircleThickness = 40
        const minCircleThickness = 20
        this.circleWidth = window.innerWidth * .5 > maxCircleWidth ? maxCircleWidth : window.innerWidth * .5 < minCircleWidth ? minCircleWidth : window.innerWidth * .5
        this.circleThickness = window.innerWidth * .03 > maxCircleThickness ? maxCircleThickness : window.innerWidth * .03 < minCircleThickness ? minCircleThickness : window.innerWidth * .03
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
        amount:50,
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
        circleWidth: 300,
        circleThickness: 30,
        menuVisible: false,
        theme: 'teal',
        currentSegmentTotalTime: 0,
        workoutPageActive: true,
        editPageActive: false
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
        this.currentSegmentTotalTime = Number(this.timeSegments[index].time + "")

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
                  this.currentSegmentTotalTime = this.timeSegments[index].time
                  this.playStartTone();
                  if (this.timeSegments[index + 1]) {
                    this.nextSegmentName = this.timeSegments[index + 1].name;
                  }

                }

              } else {
                index += 1;
                this.timeLeft = this.timeSegments[index].time;
                this.countDownType = this.timeSegments[index].type;
                this.currentSegmentName = this.timeSegments[index].name;
                this.currentSegmentTotalTime = this.timeSegments[index].time

                if (index === this.timeSegments.length - 1) {
                  this.nextSegmentName = this.timeSegments[0].name;
                } else if (this.timeSegments[index + 1]) {
                  this.nextSegmentName = this.timeSegments[index + 1].name;
                }
                //    this.deleteFirstItem()
                console.log('play start tone')
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
        this.countDownAudio.pause()
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
      },
      showEditPage(){
        this.editPageActive = true
        this.workoutPageActive = false
      },
      showWorkoutPage(){
        this.editPageActive = false
        this.workoutPageActive = true
      },
      secondsToTime(totalSeconds) {
        let hours = Math.floor(totalSeconds / (60 * 60));

        const divisor_for_minutes = totalSeconds % (60 * 60);
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
      formatTime({m, s}) {
        return `${m}:${s}`;
      },

    },
    computed: {
      totalTimeFormatted() {
        return this.formatTime(this.secondsToTime(this.totalTime));
      },
      timeLeftInIntervalFormatted(){
        return this.formatTime(this.secondsToTime(this.timeLeft));
      },
      saveWorkoutButtonDisabled(){
        return this.workoutName === ""
      },
      currentPercentage(){
       return 100 - (this.timeLeft/this.currentSegmentTotalTime) * 100
      },
    },
    components: {Vue100vh}
  };


</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

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
    width: 100vw;
    display: grid;
    grid-template-rows: 3fr 15fr 3fr 56px;

    @media only screen and (max-width: 700px) {
      grid-template-rows: 8fr 15fr 8fr 56px;
    }

  }

  .workoutPage{
    display:grid;
  }

  .stats{
    display:grid;
    grid-template-rows: 1fr 3fr;
  }

  .up-next-label{
    font-size:2em;
    color:gray;
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .up-next-segment-name{
    font-size:4em;
    display:flex;
    justify-content: center;
    align-items: center;
  }

  .bottom-bar-wrapper{
    width:100%;
  }

  .page-container{
    display:grid;
    height:100%;
    grid-template-rows: 1fr 20fr 56px;
  }

  .md-progress-spinner{
    align-self: center;
    justify-self: center;
  }

  .play-pause-wrapper{
    width:100%;
    display:grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-content: center;
  }
  .play-pause-item{
    justify-self: center;
  }
  .md-progress-spinner{
    display:flex;
    align-items: center;
    height:100%;
    justify-content: center;
    width:100%;
  }

  .percentage-middle-circle {
    display: grid;
    align-items: center;
    height: 100%;
    font-size: 7vw;

    justify-content: center;
    width: 100%;

    font-family: 'Press Start 2P', cursive;
    grid-template-rows: 5fr 1fr ;

    .time-elapsed{
      display:flex;
      align-items: center;
      justify-content: center;
      font-size:3vw;
    }

    .current-time{
      display:flex;
      align-items: center;
      justify-content: center;
      font-size:18vw;
    }
  }

  .progress-spinner-wrapper{
    position:relative;
  }

  .current-segment-text {
    font-size: 5em;
    display: flex;
    justify-content: center;
    align-items: center;

    @media only screen and (max-width: 500px) {
      font-size:3em;
    }
  }


  @media only screen and (min-width: 400px) {
    /*.percentage-middle-circle {*/
    /*  font-size: 3em;*/
    /*}*/
  }

  @media screen and (max-width: 700px) {
    .percentage-middle-circle {
      font-size: 3em;

      .time-elapsed{
        font-size: 8vw;
      }
    }

  }

  @media screen and (min-width: 1200px) {
    .percentage-middle-circle {
      font-size: 6em;

      .time-elapsed{
        font-size: .5em;
      }
    }
  }
</style>
