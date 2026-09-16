<template>
  <div class="admission-page">
    <Header />
    <main>
      <section class="admission-hero"><span>ADMISIÓN</span><h1>Postula a {{ config?.school?.name || 'tu colegio' }}</h1><p>No necesitas crear una cuenta. Completa los antecedentes y recibirás un número de seguimiento.</p></section>
      <form class="admission-card" @submit.prevent="submit">
        <p v-if="error" class="error" role="alert">{{ error }}</p><p v-if="reference" class="success" role="status">Postulación recibida. Guarda este número: <strong>{{ reference }}</strong></p>
        <p v-if="loading">Cargando establecimientos…</p>
        <p v-else-if="!config && !schools.length" class="error" role="status">Las postulaciones en línea no están disponibles en este momento.</p>
        <fieldset :disabled="busy || !!reference || !config">
          <label v-if="schools.length">Colegio<select v-model="form.school" required @change="loadConfig"><option value="" disabled>Selecciona un colegio</option><option v-for="item in schools" :key="item.slug" :value="item.slug">{{ item.name }}</option></select></label>
          <div class="grid"><label>Nombre del estudiante<input v-model.trim="form.studentFirstName" required maxlength="80" /></label><label>Apellido<input v-model.trim="form.studentLastName" required maxlength="80" /></label><label>RUT del estudiante <small>Opcional</small><input v-model.trim="form.studentRut" maxlength="20" /></label><label>Nivel al que postula<select v-model="form.requestedLevel" required><option value="" disabled>Selecciona un nivel</option><option v-for="level in ADMISSION_LEVELS" :key="level" :value="level">{{ level }}</option></select></label><label>Nombre del apoderado<input v-model.trim="form.guardianName" required maxlength="120" /></label><label>Correo del apoderado<input v-model.trim="form.guardianEmail" required type="email" maxlength="150" /></label><label>Teléfono con código de país<input v-model.trim="form.guardianPhone" placeholder="+56912345678" maxlength="40" /></label></div>
          <label v-for="question in config?.questions || []" :key="question.id">{{ question.label }}<textarea v-model.trim="form.answers[question.id]" :required="question.required" maxlength="3000" /></label>
          <input v-model="form.website" class="honeypot" tabindex="-1" autocomplete="off" />
          <label class="consent"><input v-model="form.consent" type="checkbox" required /> Autorizo al colegio a tratar estos datos exclusivamente para gestionar esta postulación.</label>
          <button :disabled="busy">{{ busy ? 'Enviando…' : 'Enviar postulación' }}</button>
        </fieldset>
      </form>
    </main>
    <Footer />
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/composables/api'
const ADMISSION_LEVELS = ['Prekínder', 'Kínder', '1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico', '1° Medio', '2° Medio', '3° Medio', '4° Medio']
const config=ref(null),schools=ref([]),busy=ref(false),loading=ref(true),error=ref(''),reference=ref('')
const school=new URLSearchParams(location.search).get('school') || ''
const form=reactive({school,studentFirstName:'',studentLastName:'',studentRut:'',requestedLevel:'',guardianName:'',guardianEmail:'',guardianPhone:'',answers:{},consent:false,website:''})
async function loadConfig(){if(!form.school)return;config.value=null;try{const response=await api.get(`/public/admissions/config?school=${encodeURIComponent(form.school)}`);config.value=response.data||response;error.value=''}catch(e){error.value=e.message}}
onMounted(async()=>{try{if(form.school)return await loadConfig();const response=await api.get('/public/admissions/schools');schools.value=response.data||response;if(schools.value.length===1){form.school=schools.value[0].slug;await loadConfig()}}catch(e){error.value=e.message}finally{loading.value=false}})
async function submit(){busy.value=true;error.value='';try{const response=await api.post('/public/admissions',form);const data=response.data||response;reference.value=data.reference}catch(e){error.value=e.message}finally{busy.value=false}}
</script>
<style scoped>
.admission-page{min-height:100vh;background:#f5f9fc;color:#0a2540}.admission-page main{padding:56px 20px 90px}.admission-hero{max-width:760px;margin:auto;text-align:center}.admission-hero span{color:#0067b2;font-weight:800;letter-spacing:.16em}.admission-hero h1{font-size:clamp(38px,6vw,64px);letter-spacing:-.045em;margin:10px}.admission-hero p{color:#526b7e}.admission-card{max-width:850px;margin:34px auto;background:white;border:1px solid #dce6ed;border-radius:20px;padding:28px;box-shadow:0 18px 55px rgba(10,37,64,.1)}fieldset{border:0;padding:0;display:grid;gap:18px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}label{display:grid;gap:7px;font-weight:700;font-size:14px}input,textarea,select{border:1px solid #b8c8d4;border-radius:10px;padding:12px;font:inherit;background:#fff}textarea{min-height:110px}.consent{display:flex;align-items:flex-start;font-weight:500}.consent input{margin-top:2px}button{justify-self:start;border:0;border-radius:10px;background:#0067b2;color:#fff;padding:13px 20px;font-weight:800}.error{color:#b42318}.success{color:#087443;background:#eaf8f1;padding:14px;border-radius:10px}.honeypot{position:absolute;left:-10000px}@media(max-width:650px){.grid{grid-template-columns:1fr}}
</style>
