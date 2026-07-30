<template>
  <div class="login-wrapper">
    <!-- Left Side: Branding / Visual -->
    <div class="login-brand-panel">
      <div class="brand-overlay"></div>
      <div class="brand-content">
        <div class="brand-logo-container">
          <span class="brand-logo-icon">⚽</span>
        </div>
        <h1 class="brand-title">ArbDesig</h1>
        <p class="brand-subtitle">
          Plataforma profesional para la gestión y designación de árbitros deportivos.
        </p>
        
        <div class="brand-footer">
          &copy; {{ new Date().getFullYear() }} ArbDesig. Todos los derechos reservados.
        </div>
      </div>
    </div>

    <!-- Right Side: Form Panel -->
    <div class="login-form-panel">
      <!-- Mobile Background -->
      <div class="mobile-bg" style="background-image: url('/stadium_bg.jpg');"></div>
      
      <div class="form-container">
        <!-- Mobile Header -->
        <div class="mobile-header">
          <span class="mobile-logo-icon">⚽</span>
          <h2 class="mobile-title">ArbDesig</h2>
        </div>

        <div class="form-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div v-if="error" class="error-alert animate-shake">
            <span class="material-symbols-outlined error-icon">error</span>
            <span>{{ error }}</span>
          </div>

          <div v-if="infoMessage" class="info-alert">
            <span class="material-symbols-outlined info-icon">info</span>
            <span>{{ infoMessage }}</span>
          </div>

          <div class="input-group">
            <label for="whatsapp" class="input-label">Número de WhatsApp</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">phone_iphone</span>
              <input
                id="whatsapp"
                type="text"
                v-model="form.whatsapp"
                required
                placeholder="Ej: 549341xxxxxx"
                class="custom-input"
              />
            </div>
          </div>

          <div class="input-group">
            <label for="password" class="input-label">Contraseña</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">lock</span>
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.contrasenia"
                required
                placeholder="••••••••"
                class="custom-input password-input"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <button type="submit" :disabled="isLoading" class="submit-btn">
            <span v-if="isLoading" class="material-symbols-outlined spin-icon">sync</span>
            <span>{{ isLoading ? 'Verificando...' : 'Entrar al Sistema' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { loginUser } from '../store';

const form = reactive({
  whatsapp: '',
  contrasenia: ''
});

const isLoading = ref(false);
const error = ref('');
const infoMessage = ref('');
const showPassword = ref(false);

onMounted(() => {
  const msg = localStorage.getItem("session_timeout_message");
  if (msg) {
    infoMessage.value = msg;
    localStorage.removeItem("session_timeout_message");
  }
});

const handleLogin = async () => {
  error.value = '';
  isLoading.value = true;
  
  try {
    const result = await loginUser(form.whatsapp, form.contrasenia);
    if (!result.success) {
      error.value = result.message;
    }
  } catch (err) {
    error.value = 'Ocurrió un error inesperado';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Reset some basics inside this component just in case */
* {
  box-sizing: border-box;
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #f8fafc; /* slate-50 */
  overflow: hidden;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Left side */
.login-brand-panel {
  display: none;
  position: relative;
  width: 50%;
  background-color: #0f172a; /* slate-900 */
  overflow: hidden;
  background-image: url('/stadium_bg.jpg');
  background-size: cover;
  background-position: center;
}

@media (min-width: 1024px) {
  .login-brand-panel {
    display: flex;
  }
}

.brand-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(6,78,59,0.9) 0%, rgba(15,23,42,0.9) 100%);
  mix-blend-mode: multiply;
}

.brand-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4rem;
  height: 100%;
  color: white;
}

.brand-logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  margin-bottom: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.brand-logo-icon {
  font-size: 3rem;
  line-height: 1;
}

.brand-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
  text-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.brand-subtitle {
  font-size: 1.25rem;
  font-weight: 500;
  color: #ecfdf5; /* emerald-50 */
  max-width: 28rem;
  line-height: 1.625;
  margin: 0;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.brand-footer {
  margin-top: auto;
  padding-bottom: 3rem;
  opacity: 0.7;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Right side */
.login-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1.5rem;
  position: relative;
}

@media (min-width: 640px) {
  .login-form-panel { padding: 3rem; }
}

@media (min-width: 1024px) {
  .login-form-panel { width: 50%; }
}

.mobile-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  filter: blur(4px) brightness(0.5);
}

@media (min-width: 1024px) {
  .mobile-bg { display: none; }
}

.form-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0; /* slate-200 */
}

@media (min-width: 640px) {
  .form-container { padding: 3rem; }
}

@media (min-width: 1024px) {
  .form-container {
    background-color: white;
    backdrop-filter: none;
    box-shadow: none;
    border: none;
  }
}

.mobile-header {
  text-align: center;
  margin-bottom: 2rem;
}

@media (min-width: 1024px) {
  .mobile-header { display: none; }
}

.mobile-logo-icon {
  display: inline-block;
  font-size: 2.25rem;
  margin-bottom: 0.75rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.mobile-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a; /* slate-900 */
  margin: 0;
  letter-spacing: -0.025em;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

@media (min-width: 1024px) {
  .form-header { text-align: left; }
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b; /* slate-800 */
  margin: 0;
  letter-spacing: -0.025em;
}

.form-header p {
  color: #64748b; /* slate-500 */
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Inputs */
.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b; /* slate-500 */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8; /* slate-400 */
  font-size: 1.25rem;
  pointer-events: none;
  z-index: 10;
  transition: color 0.3s;
}

.custom-input {
  width: 100%;
  height: 3.5rem;
  background-color: white;
  border: 2px solid #e2e8f0; /* slate-200 */
  border-radius: 1rem;
  padding: 0 1rem 0 3rem;
  color: #1e293b; /* slate-800 */
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

.custom-input::placeholder {
  color: #94a3b8;
}

.password-input {
  padding-right: 3rem;
  letter-spacing: 0.1em;
}

.custom-input:focus {
  border-color: #10b981; /* emerald-500 */
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.custom-input:focus ~ .input-icon, 
.input-wrapper:focus-within .input-icon {
  color: #10b981;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  color: #94a3b8;
  z-index: 10;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.password-toggle:hover {
  color: #059669; /* emerald-600 */
  background-color: #f1f5f9; /* slate-100 */
}

/* Button */
.submit-btn {
  width: 100%;
  height: 3.5rem;
  margin-top: 1rem;
  background-color: #059669; /* emerald-600 */
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 16px rgba(5, 150, 105, 0.2);
}

.submit-btn:hover:not(:disabled) {
  background-color: #10b981; /* emerald-500 */
  box-shadow: 0 12px 20px rgba(5, 150, 105, 0.3);
}

.submit-btn:active:not(:disabled) {
  background-color: #047857; /* emerald-700 */
  box-shadow: none;
  transform: translateY(2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Error Alert */
.error-alert {
  background-color: #fef2f2; /* red-50 */
  border-left: 4px solid #ef4444; /* red-500 */
  color: #b91c1c; /* red-700 */
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: 0 0.75rem 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.error-icon {
  color: #ef4444;
}

/* Info Alert */
.info-alert {
  background-color: #fffbeb; /* amber-50 */
  border-left: 4px solid #f59e0b; /* amber-500 */
  color: #b45309; /* amber-700 */
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: 0 0.75rem 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.info-icon {
  color: #f59e0b;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
