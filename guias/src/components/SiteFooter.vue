<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <a class="brand footer-brand" :href="guidesHomeUrl" aria-label="Inicio de guías DashCole">
          <img :src="logoUrl" :srcset="logoSrcset" alt="" class="brand-logo" width="34" height="34" loading="lazy" decoding="async" />
          <span class="brand-name">DashCole</span>
        </a>
        <p>Dashboard escolar para administrar calificaciones, estudiantes, cursos y operaciones del colegio.</p>
      </div>
      <div class="footer-links">
        <div>
          <strong>Operar</strong>
          <RouterLink to="/installation/como-instalar-dashcole">Instalación</RouterLink>
          <RouterLink to="/deployment/desplegar-produccion">Despliegue</RouterLink>
        </div>
        <div>
          <strong>Administrar</strong>
          <RouterLink to="/administration/cuentas-roles-y-permisos">Cuentas y roles</RouterLink>
          <RouterLink to="/operations/respaldos-y-restauracion">Respaldos</RouterLink>
        </div>
      </div>
    </div>
    <div class="footer-base">
      <span>© {{ new Date().getFullYear() }} DashCole</span>
      <span>Guías de instalación y administración.</span>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { logoSrcset, logoUrl } from '../brandAssets'
import { guidesHomeUrl } from '../siteLinks'
</script>
