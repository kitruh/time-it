<template>
  <no-ssr>
    <Vue100vh>
      <div class="page-container">
        <div class="top">
          <div
            :style="workoutTabSelected"
            class="top-tab"
            @click="showWorkoutPage"
            id="bottom-bar-item-home"
          >
            WORKOUT
          </div>
          <div
            :style="editTabSelected"
            class="top-tab"
            @click="showEditPage"
            id="bottom-bar-item-pages"
          >
            EDIT
          </div>
          <!-- <button @click="toggleMute">toggle mute</button> -->
        </div>

        <div v-if="editPageActive">
          <h1>Timer</h1>

          <div>
            WORKOUT NAME:
            <span v-if="editWorkoutName"><input v-model="workoutName"/></span>
            <span v-else> {{ workoutName }}</span>
            <button class=" " @click="initializeNewWorkout">New Workout</button>
            <button class=" " @click="toggleEditWorkoutName">
              Edit workout name
            </button>
            <button
              class=" "
              @click="saveWorkout"
              :disabled="saveWorkoutButtonDisabled"
            >
              Save Workout
            </button>

            <button class=" " @click="clearAllSavedWorkouts">
              Clear All Saved Workouts
            </button>
          </div>
          <div>
            <h5>Saved Workouts:</h5>
            <div v-for="workout in workouts" @click="setWorkout(workout)">
              {{ workout.name }}
            </div>
          </div>

          <button class="" @click="addSegment">Add Segment</button>

          <div class="interval-item-list-edit">
            <div></div>

            <div class="draggable-item-title">
              <div>
                Workout Name
              </div>
              <div>
                Workout length (seconds)
              </div>
            </div>
            <div class="interval-item-list-edit__number-count">
              <div v-for="(segment, index) in timeSegments" :key="segment.id">
                <div>{{ index + 1 }}</div>
              </div>
            </div>
            <Container @drop="onDrop">
              <Draggable
                v-for="(segment, index) in timeSegments"
                :key="segment.id"
              >
                <div class="draggable-item">
                  <div>
                    <input
                      placeholder="Enter name of workout"
                      v-model="segment.name"
                    />
                  </div>
                  <div>
                    <input
                      placeholder="Enter time in seconds"
                      v-model="segment.time"
                    />
                  </div>
                  <i class="fas fa-trash" @click="deleteFromList(segment)"></i>
                </div>
              </Draggable>
            </Container>
          </div>

          <div class="edit-row"></div>
          <button class=" " @click="this.toggleRepeat">Toggle Repeat</button>
        </div>
        <div v-if="workoutPageActive" class="workoutPage time-it-page">
          <div class="time-section">
            <div class="current-segment-text">
              {{ currentSegmentName ? currentSegmentName : "Lets workout" }}
            </div>
            <div class="percentage-middle-circle">
              <div class="current-time">{{ timeLeftInIntervalFormatted }}</div>
              <div class="time-elapsed">
                Time Elapsed: {{ totalTimeFormatted }}
              </div>
            </div>

            <div class="stats">
              <div class="up-next-label">up next... {{ nextSegmentName }}</div>
            </div>
            <div class="play-pause-wrapper">
              <div></div>
              <div class="play-pause-direct-wrapper">
                <img
                  class="play-arrow"
                  src="~/assets/play.svg"
                  @click="this.start"
                />

                <img
                  class="play-arrow"
                  src="~/assets/stop.svg"
                  @click="this.stopInterval"
                />

                <img
                  class="play-arrow"
                  src="~/assets/pause.svg"
                  @click="this.togglePause"
                />
              </div>
              <div></div>
            </div>
          </div>
        </div>

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        ></script>
        <!-- time-it bottom add -->
        <ins
          class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-5363460947226243"
          data-ad-slot="7703035200"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </Vue100vh>
  </no-ssr>
</template>
<script>
import { v4 as uuidv4 } from "uuid";

import Vue100vh from "vue-div-100vh";

import { Container, Draggable } from "vue-smooth-dnd";
import arrayMove from "array-move";
export default {
  mounted() {
    this.countDownAudio = new Audio("countdown-and-start-belltone.wav");
    // this.countDownAudio = document.getElementById("countdown-wav");
    this.currentWorkoutId = uuidv4();
    let savedWorkouts;
    try {
      savedWorkouts = JSON.parse(localStorage.getItem("workouts"));
    } catch {
      localStorage.clear();
    }

    if (savedWorkouts) {
      this.workouts = savedWorkouts;
    }

    if (this.workouts.length > 0) {
      const firstWorkout = this.workouts[0];
      this.currentWorkoutId = firstWorkout.id;
      this.timeSegments = firstWorkout.timeSegments;
    } else {
      this.initializeNewWorkout();
    }

    window.onresize = () => {
      const maxCircleWidth = 600;
      const minCircleWidth = 300;
      const maxCircleThickness = 40;
      const minCircleThickness = 20;
      this.circleWidth =
        window.innerWidth * 0.5 > maxCircleWidth
          ? maxCircleWidth
          : window.innerWidth * 0.5 < minCircleWidth
          ? minCircleWidth
          : window.innerWidth * 0.5;
      this.circleThickness =
        window.innerWidth * 0.03 > maxCircleThickness
          ? maxCircleThickness
          : window.innerWidth * 0.03 < minCircleThickness
          ? minCircleThickness
          : window.innerWidth * 0.03;
    };
  },
  data() {
    return {
      timeSegments: [
        {
          id: uuidv4(),
          time: 10,
          type: "set",
          name: "Pull Ups",
          editOn: false
        },
        { id: uuidv4(), time: 10, type: "set", name: "Rest", editOn: false }
      ],
      showTimeLeft: false,
      timeLeft: 0,
      countDownType: "",
      interval: null,
      timeToAdd: 0,
      typeToAdd: "",
      repeat: true,
      intervalName: "",
      pause: false,
      amount: 50,
      currentSegmentName: "",
      nextSegmentName: "",
      totalTime: 0,
      editWorkoutName: false,
      workoutName: "",
      countDownAudio: {},
      workouts: [],
      currentWorkoutId: "",
      snackbar: {
        showSnackbar: false,
        position: "center",
        duration: 4000,
        isInfinity: false,
        message: ""
      },
      circleWidth: 300,
      circleThickness: 30,
      menuVisible: false,
      theme: "teal",
      currentSegmentTotalTime: 0,
      workoutPageActive: true,
      editPageActive: false,
      muted: false
    };
  },
  methods: {
    onDrop(dropResult) {
      this.timeSegments = arrayMove(
        this.timeSegments,
        dropResult.removedIndex,
        dropResult.addedIndex
      );
    },
    start() {
      this.countDownAudio.currentTime = 1;
      this.countDownAudio.play();
      this.countDownAudio.pause();

      this.totalTime = 0;
      if (this.interval != null) {
        return;
      }
      let index = 0;
      this.showTimeLeft = true;
      this.timeLeft = this.timeSegments[index].time;
      this.countDownType = this.timeSegments[index].type;
      this.currentSegmentName = this.timeSegments[index].name;
      this.currentSegmentTotalTime = Number(this.timeSegments[index].time + "");

      if (this.timeSegments[index + 1]) {
        this.nextSegmentName = this.timeSegments[index + 1].name;
      }

      this.interval = setInterval(() => {
        if (!this.pause) {
          this.totalTime += 1;
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
                this.currentSegmentTotalTime = this.timeSegments[index].time;
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
              this.currentSegmentTotalTime = this.timeSegments[index].time;

              if (index === this.timeSegments.length - 1) {
                this.nextSegmentName = this.timeSegments[0].name;
              } else if (this.timeSegments[index + 1]) {
                this.nextSegmentName = this.timeSegments[index + 1].name;
              }
              //    this.deleteFirstItem()
              console.log("play start tone");
              this.playStartTone();
            }
          }
        }
      }, 1000);
    },
    playCountDownTone() {
      this.countDownAudio.pause();
      this.countDownAudio.currentTime = 0;
      this.countDownAudio.play();
    },
    playStartTone() {
      this.countDownAudio.pause();
      this.countDownAudio.currentTime = 1.5;
      this.countDownAudio.play();
    },
    stopInterval() {
      this.countDownAudio.pause();
      clearInterval(this.interval);
      this.interval = null;
    },
    addSegment() {
      this.timeSegments.push({
        time: this.timeToAdd,
        type: this.typeToAdd,
        id: uuidv4(),
        name: this.intervalName,
        editOn: false
      });
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
    duplicate(segment) {
      this.timeSegments.splice(this.timeSegments.indexOf(segment) + 1, 0, {
        ...segment
      });
    },
    saveWorkout() {
      const existingWorkout = this.workouts.findIndex(workout => {
        return workout.id === this.currentWorkoutId;
      });

      const workoutToSave = {
        timeSegments: this.timeSegments,
        name: this.workoutName,
        id: this.currentWorkoutId
      };

      if (existingWorkout >= 0) {
        this.workouts.splice(existingWorkout, 1, workoutToSave);
      } else {
        this.workouts.push(workoutToSave);
      }

      localStorage.setItem("workouts", JSON.stringify(this.workouts));

      this.snackbar.message = "Workout Successfully Saved";
      this.snackbar.showSnackbar = true;
    },
    toggleEditWorkoutName() {
      this.editWorkoutName = !this.editWorkoutName;
    },
    initSound() {
      this.countDownAudio.volume = 0;
      this.countDownAudio.play();
    },
    setWorkout(workout) {
      this.currentWorkoutId = workout.id;
      this.workoutName = workout.name;
      this.timeSegments = workout.timeSegments;
    },
    initializeNewWorkout() {
      this.currentWorkoutId = uuidv4();
      this.workoutName = `New Workout ${this.workouts.length + 1}`;
      this.timeSegments = [];
    },
    clearAllSavedWorkouts() {
      localStorage.removeItem("workouts");
    },
    showSnackbar() {
      this.snackbar.showSnackbar = true;
    },
    showEditPage() {
      this.editPageActive = true;
      this.workoutPageActive = false;
    },
    showWorkoutPage() {
      this.editPageActive = false;
      this.workoutPageActive = true;
    },
    toggleMute() {
      if (!this.muted) {
        document.querySelectorAll("video, audio").forEach(elem => {
          elem.muted = true;
          elem.pause();
          this.muted = true;
        });
      } else {
        document.querySelectorAll("video, audio").forEach(elem => {
          elem.muted = false;
          this.muted = false;
        });
      }
    },
    secondsToTime(totalSeconds) {
      let hours = Math.floor(totalSeconds / (60 * 60));

      const divisor_for_minutes = totalSeconds % (60 * 60);
      let minutes = Math.floor(divisor_for_minutes / 60);

      const divisor_for_seconds = divisor_for_minutes % 60;
      let seconds = Math.ceil(divisor_for_seconds);

      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      if (hours < 10) {
        hours = "0" + hours;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return {
        h: hours,
        m: minutes,
        s: seconds
      };
    },
    formatTime({ m, s }) {
      return `${m}:${s}`;
    }
  },
  computed: {
    totalTimeFormatted() {
      return this.formatTime(this.secondsToTime(this.totalTime));
    },
    timeLeftInIntervalFormatted() {
      return this.formatTime(this.secondsToTime(this.timeLeft));
    },
    saveWorkoutButtonDisabled() {
      return this.workoutName === "";
    },
    currentPercentage() {
      return 100 - (this.timeLeft / this.currentSegmentTotalTime) * 100;
    },
    editTabSelected() {
      if (this.editPageActive) {
        return "background-color:rgb(48, 48, 48); font-weight:bold; text-decoration:underline;";
      }
    },
    workoutTabSelected() {
      if (this.workoutPageActive) {
        return "background-color:rgb(48, 48, 48); font-weight:bold; text-decoration:underline;";
      }
    }
  },
  components: { Vue100vh, Container, Draggable }
};
</script>

<style lang="scss" scoped>
// @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
@import url("https://fonts.googleapis.com/css2?family=PT+Mono&display=swap");
.phone-viewport {
  width: 322px;
  height: 200px;
  display: inline-flex;
  align-items: flex-end;
  overflow: hidden;
  border: 1px solid rgba(#000, 0.26);
  background: rgba(#000, 0.06);
}

.time-section {
  width: 100vw;
  display: grid;

  @media only screen and (max-width: 700px) {
    grid-template-rows: 8fr 15fr 8fr 56px;
  }
}

.workoutPage {
  display: grid;
}

.up-next-label {
  font-size: 2em;
  color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
}
.up-next-segment-name {
  font-size: 4em;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-bar-wrapper {
  width: 100%;
}

.page-container {
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 20fr 56px;
}

.md-progress-spinner {
  align-self: center;
  justify-self: center;
}

.play-pause-wrapper {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
}
.play-pause-item {
  justify-self: center;
}
.md-progress-spinner {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.percentage-middle-circle {
  display: grid;
  align-items: center;
  height: 100%;
  font-size: 7vw;

  justify-content: center;
  width: 100%;

  .time-elapsed {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3vw;
  }

  .current-time {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30vw;
  }
}

.progress-spinner-wrapper {
  position: relative;
}

.current-segment-text {
  font-size: 5em;
  display: flex;
  justify-content: center;
  align-items: center;

  @media only screen and (max-width: 500px) {
    font-size: 3em;
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

    .time-elapsed {
      font-size: 8vw;
    }
  }
}

@media screen and (min-width: 1200px) {
  .percentage-middle-circle {
    font-size: 6em;

    .time-elapsed {
      font-size: 0.5em;
    }
  }
}

.edit-row {
  grid-gap: 1em 2em;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-auto-rows: 1em;
  font-size: 2em;
  input {
    font-size: 1em;
  }
}

.draggable-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.draggable-item-title {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.interval-item-list-edit {
  display: grid;
  grid-template-columns: 1fr 9fr;
}

.interval-item-list-edit__number-count {
  display: grid;
  grid-template-columns: 1fr;
}

.play-arrow {
  width: 20%;
  justify-self: center;
}
.play-pause-direct-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
.top {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.top-tab {
  background-color: black;
  display: grid;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  &:hover {
    background-color: rgb(48, 48, 48);
  }
}
</style>
