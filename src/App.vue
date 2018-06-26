<template>
  <div id="app">
    <div class="container">
      <!--UPLOAD-->
    
          <form enctype="multipart/form-data" novalidate  v-if="isInitial || isSaving" v-on:submit="validateForm">
            <h1>Starbucks Card Art Uploader</h1>
            <div class="row">
              <div class="col-md-2 col-md-offset2"></div>
              <div class="col-md-6">  
                <div class="dropbox">
                  <input type="file" :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
                accept="image/*" class="input-file">
                  <p v-if="isInitial">
                  Arrastra el arte de la tarjeta aquí<br> o da click para navegar
                  </p>
                  <p v-if="isSaving">
                    Uploading {{ fileCount }} files...
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="profile">
                  <div class="form-group" v-bind:class="{'has-warning': attemptSubmit && missingInicialBin && wrongInicialBinFormat}">
                    <label for="inicialBin" class="form-control-label">Bin Inicial: </label>
                      <input v-validate="'required|numeric'" v-model="cardConfiguration.inicialBin" class="form-control form-control-warning" type="text" name="inicialBin" @blur="onBlur" ref="inicialBin"/>
                    <div class="form-control-feedback" v-if="attemptSubmit && missingInicialBin">Este campo es requerido.</div>
                    <div class="form-control-feedback" v-if="attemptSubmit && wrongInicialBinFormat">Formato de BIN incorrecto.</div>
                  </div>
                  <div class="form-group" v-bind:class="{'has-warning': attemptSubmit && missingFinalBin && wrongInicialBinFormat}">
                     <label for="finalBin" class="form-control-label">Bin Final: </label>
                       <input v-model="cardConfiguration.finalBin" class="form-control form-control-warning" type="text" name="finalBin" @blur="onBlur" ref="finalBin"/>
                     <div class="form-control-feedback" v-if="attemptSubmit && missingFinalBin">Este campo es requerido.</div>
                     <div class="form-control-feedback" v-if="attemptSubmit && wrongFinalBinFormat">Formato de BIN incorrecto.</div>
                  </div>
                  <div class="form-group" v-bind:class="{'has-warning': attemptSubmit && missingPromo}" >
                    <label for="promo">Promo: </label>
                      <input class="form-control form-control-warning" v-model="cardConfiguration.promo" type="text" :name="promo" ref="promo">
                    <div class="form-control-feedback" v-if="attemptSubmit && missingPromo">Este campo es requerido.</div>
                  </div>
               
                  <div class="form-group">
                    <button class="btn btn-primary">Guardar</button>
                    <button class="btn btn-danger">Cancelar</button>
                  </div>

                </div>
              </div>
              <pre>
                {{cardConfiguration}}<br>
                {{missingInicialBin}}<br>
                {{missingFinalBin}}<br>
                {{missingPromo}}
               Wrong Bin: {{wrongInicialBinFormat}}
              
              </pre>
            </div>
      </form>

    </div>


      <!--SUCCESS-->
      <div v-if="isSuccess">
        <h2>Uploaded {{ uploadedFiles.length }} file(s) successfully.</h2>
        <p>
          <a href="javascript:void(0)" @click="reset()">Upload again</a>
        </p>
        <pre>
          {{ cardConfiguration }}
        </pre>
       <!-- <ul class="list-unstyled">
          <li v-for="item in uploadedFiles" :key="item.id">
            <pre>
              {{item}}
            </pre>
            <img :src="item.imgData" class="img-responsive img-thumbnail" :alt="item.imageType">
          </li>
        </ul>-->
      </div>
      <!--FAILED-->
      <div v-if="isFailed">
        <h2>Uploaded failed.</h2>
        <p>
          <a href="javascript:void(0)" @click="reset()">Try again</a>
        </p>
        <pre>{{ uploadError }}</pre>
      </div>
    </div>
  <!--</div>-->
</template>

<script>
  // swap as you need
  //import { upload } from './file-upload.fake.service'; // fake service
  import { upload } from './file-upload.convert.service'; // fake service
  // import { upload } from './file-upload.service';   // real service

  import { wait } from './utils';

  import {Validator} from 'vee-validate';

  const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

  Validator.extend('isBinCard',{
    getMessage: field => 'No es un BIN válido',
    validate: n=>{
      const rgx=/[0-9]{16}/g
      return rgx.test(n)
    }
  });


  let instance = new Validator({trueField: 'isBinCard'});


  export default {
    name: 'app',
    data() {
      return {
        uploadedFiles: [],
        uploadError: null,
        currentStatus: null,
        uploadFieldName: 'cardArt',
        promo:'',
        cardConfiguration:{
          inicialBin:null,
          finalBin: null,
          promo: null,
          images:[]
        },
        attemptSubmit: false

      }
    },
    computed: {
      isInitial() {
        return this.currentStatus === STATUS_INITIAL;
      },
      isSaving() {
        return this.currentStatus === STATUS_SAVING;
      },
      isSuccess() {
        return this.currentStatus === STATUS_SUCCESS;
      },
      isFailed() {
        return this.currentStatus === STATUS_FAILED;
      },
      missingInicialBin(){
        return this.cardConfiguration.inicialBin === null;
      },
      missingFinalBin(){
        return this.cardConfiguration.finalBin === null;
      },
      missingPromo(){
        return this.cardConfiguration.promo === null;
      },
      wrongInicialBinFormat(){
        return (
          this.isBin(this.cardConfiguration.inicialBin) === false ||
          this.cardConfiguration.inicialBin < 1
        )
      },
      wrongFinalBinFormat(){
        return (
          this.isBin(this.cardConfiguration.finalBin) === false ||
          this.cardConfiguration.inicialBin < 1
        )
      }

    },
    methods: {
      reset() {
        // reset form to initial state
        this.currentStatus = STATUS_INITIAL;
        this.uploadedFiles = [];
        this.uploadError = null;
        this.attemptSubmit= false;
        //this.cardConfiguration=null;

      },
      save(formData) {
        // upload data to the server
        this.currentStatus = STATUS_SAVING;
        //const url = `${BASE_URL}/photos/upload`;

        upload(formData)
          .then(wait(1900)) // DEV ONLY: wait for 1.5s 
          .then(x => {
            //console.log(x)
            this.uploadedFiles = [].concat(x);
            //this.uploadedFiles = x;
            this.cardConfiguration.images = this.uploadedFiles;
            this.currentStatus = STATUS_SUCCESS;
            
          })
          .catch(err => {
            //console.log(err)
            this.uploadError = err.response;
            this.currentStatus = STATUS_FAILED;
          });
      },
      filesChange(fieldName, fileList) {
        // handle file changes
        const formData = new FormData();

        if (!fileList.length) return;

        // append the files to FormData
        Array
          .from(Array(fileList.length).keys())
          .map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
          });

        // save it
        if(!this.missingInicialBin && this.missingFinalBin===false && this.missingPromo=== false){
          this.save(formData);
        }
      },
      isBin(n){
        const rgx=/[0-9]{16}/g
        return rgx.test(n)
      },
      validateForm(event){
        this.attemptSubmit = true;
        if(this.missingInicialBin || this.missingFinalBin || this.missingPromo || this.wrongInicialBinFormat || this.wrongFinalBinFormat) event.preventDefault();
      },
      onBlur(event){
        if(event.target.name === 'inicialBin'){
          if(this.missingInicialBin || this.wrongInicialBinFormat){
            event.preventDefault()
            //this.$refs.inicialBin.focus()
            console.log(event)
          }
        }else if(event.target.name === 'finalBin'){
          if(this.missingFinalBin || this.wrongFinalBinFormat){
          event.preventDefault()
          this.$refs.finalBin.focus()
          }
        }
        
          
      }
    },
    mounted() {
      this.reset();
    },
  }

</script>

<style lang="scss">
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
  }
  
  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }
  
  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }
  
  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
</style>