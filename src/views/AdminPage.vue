<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  login,
  isLoggedIn,
  clearToken,
  fetchLinks,
  createLink,
  updateLink,
  deleteLink,
  fetchConfig,
  updateConfig,
  type Link,
} from '@/composables/useApi'

const authenticated = ref(isLoggedIn())
const password = ref('')
const loginError = ref('')
const saving = ref(false)
const message = ref('')

// Data
const links = ref<Link[]>([])
const config = ref<Record<string, string>>({})

// New link form
const newLink = ref({
  title: '',
  url: '',
  icon: 'globe',
  category: 'information',
  featured: false,
})

// Edit state
const editingId = ref<number | null>(null)
const editForm = ref<Partial<Link>>({})

const iconOptions = [
  'heart',
  'shield',
  'book',
  'megaphone',
  'globe',
  'money',
  'people',
  'fist',
  'flame',
  'star',
  'rocket',
  'lightning',
  'hand',
  'peace',
]

const categoryOptions = ['information', 'organization', 'fundraiser', 'demonstration', 'news']
const bannerTypeOptions = ['info', 'urgent', 'success']

async function handleLogin() {
  loginError.value = ''
  try {
    await login(password.value)
    authenticated.value = true
    await loadData()
  } catch (e: any) {
    loginError.value = e.message || 'Login failed'
  }
}

function handleLogout() {
  clearToken()
  authenticated.value = false
}

async function loadData() {
  try {
    const [linksData, configData] = await Promise.all([fetchLinks(), fetchConfig()])
    links.value = linksData.links
    config.value = configData.config
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      clearToken()
      authenticated.value = false
    }
  }
}

async function handleAddLink() {
  if (!newLink.value.title || !newLink.value.url) return
  saving.value = true
  try {
    await createLink(newLink.value)
    newLink.value = { title: '', url: '', icon: 'globe', category: 'information', featured: false }
    await loadData()
    showMessage('Link added')
  } catch (e: any) {
    showMessage('Error: ' + e.message)
  } finally {
    saving.value = false
  }
}

function startEdit(link: Link) {
  editingId.value = link.id
  editForm.value = { ...link }
}

function cancelEdit() {
  editingId.value = null
  editForm.value = {}
}

async function saveEdit() {
  if (!editingId.value) return
  saving.value = true
  try {
    await updateLink(editingId.value, editForm.value)
    editingId.value = null
    editForm.value = {}
    await loadData()
    showMessage('Link updated')
  } catch (e: any) {
    showMessage('Error: ' + e.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Delete this link?')) return
  saving.value = true
  try {
    await deleteLink(id)
    await loadData()
    showMessage('Link deleted')
  } catch (e: any) {
    showMessage('Error: ' + e.message)
  } finally {
    saving.value = false
  }
}

async function handleMoveUp(link: Link, index: number) {
  if (index === 0) return
  const prev = links.value[index - 1]
  if (!prev) return
  await Promise.all([
    updateLink(link.id, { sort_order: prev.sort_order }),
    updateLink(prev.id, { sort_order: link.sort_order }),
  ])
  await loadData()
}

async function handleMoveDown(link: Link, index: number) {
  if (index >= links.value.length - 1) return
  const next = links.value[index + 1]
  if (!next) return
  await Promise.all([
    updateLink(link.id, { sort_order: next.sort_order }),
    updateLink(next.id, { sort_order: link.sort_order }),
  ])
  await loadData()
}

async function handleSaveConfig() {
  saving.value = true
  try {
    await updateConfig(config.value)
    showMessage('Config saved')
  } catch (e: any) {
    showMessage('Error: ' + e.message)
  } finally {
    saving.value = false
  }
}

function showMessage(msg: string) {
  message.value = msg
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

onMounted(() => {
  if (authenticated.value) {
    loadData()
  }
})
</script>

<template>
  <div class="admin-wrap">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header">
        <h1>ADMIN PANEL</h1>
        <button v-if="authenticated" class="btn btn-small btn-logout" @click="handleLogout">
          Logout
        </button>
      </div>

      <!-- Toast -->
      <div v-if="message" class="admin-toast">{{ message }}</div>

      <!-- Login -->
      <template v-if="!authenticated">
        <section class="panel">
          <div class="panel-header">
            <span>Login</span>
          </div>
          <div class="panel-body">
            <form class="admin-form" @submit.prevent="handleLogin">
              <div class="form-group">
                <label>Password</label>
                <input v-model="password" type="password" placeholder="Enter admin password" />
              </div>
              <p v-if="loginError" class="form-error">{{ loginError }}</p>
              <button type="submit" class="btn btn-primary">Login</button>
            </form>
          </div>
        </section>
      </template>

      <!-- Authenticated Content -->
      <template v-else>
        <!-- Banner Config -->
        <section class="panel">
          <div class="panel-header">
            <span>Banner</span>
          </div>
          <div class="panel-body">
            <div class="admin-form">
              <div class="form-row">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :checked="config.banner_enabled === '1'"
                    @change="
                      config.banner_enabled = ($event.target as HTMLInputElement).checked
                        ? '1'
                        : '0'
                    "
                  />
                  Enabled
                </label>
              </div>
              <div class="form-group">
                <label>Type</label>
                <select v-model="config.banner_type">
                  <option v-for="t in bannerTypeOptions" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Text</label>
                <input v-model="config.banner_text" type="text" />
              </div>
              <div class="form-group">
                <label>Link URL</label>
                <input v-model="config.banner_link" type="text" />
              </div>
              <button class="btn btn-primary" :disabled="saving" @click="handleSaveConfig">
                Save Banner
              </button>
            </div>
          </div>
        </section>

        <!-- Profile -->
        <section class="panel">
          <div class="panel-header">
            <span>Profile Description</span>
          </div>
          <div class="panel-body">
            <div class="admin-form">
              <div class="form-group">
                <label>About Text (separate paragraphs with blank lines)</label>
                <textarea v-model="config.profile_description" rows="10" />
              </div>
              <button class="btn btn-primary" :disabled="saving" @click="handleSaveConfig">
                Save Profile
              </button>
            </div>
          </div>
        </section>

        <!-- Site Config -->
        <section class="panel">
          <div class="panel-header">
            <span>Site Config</span>
          </div>
          <div class="panel-body">
            <div class="admin-form">
              <div class="form-group">
                <label>Contact Email</label>
                <input v-model="config.contact_email" type="email" />
              </div>
              <div class="form-group">
                <label>Last Updated</label>
                <input v-model="config.last_updated" type="text" />
              </div>
              <button class="btn btn-primary" :disabled="saving" @click="handleSaveConfig">
                Save Config
              </button>
            </div>
          </div>
        </section>

        <!-- Links Manager -->
        <section class="panel">
          <div class="panel-header">
            <span>Links ({{ links.length }})</span>
          </div>
          <div class="panel-body">
            <!-- Existing Links -->
            <div class="admin-links-list">
              <div v-for="(link, index) in links" :key="link.id" class="admin-link-item">
                <template v-if="editingId === link.id">
                  <div class="admin-form edit-form">
                    <div class="form-group">
                      <label>Title</label>
                      <input v-model="editForm.title" type="text" />
                    </div>
                    <div class="form-group">
                      <label>URL</label>
                      <input v-model="editForm.url" type="text" />
                    </div>
                    <div class="form-row-2">
                      <div class="form-group">
                        <label>Icon</label>
                        <select v-model="editForm.icon">
                          <option v-for="ic in iconOptions" :key="ic" :value="ic">{{ ic }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Category</label>
                        <select v-model="editForm.category">
                          <option v-for="cat in categoryOptions" :key="cat" :value="cat">
                            {{ cat }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <label class="checkbox-label">
                      <input v-model="editForm.featured" type="checkbox" />
                      Featured
                    </label>
                    <div class="form-actions">
                      <button
                        class="btn btn-primary btn-small"
                        :disabled="saving"
                        @click="saveEdit"
                      >
                        Save
                      </button>
                      <button class="btn btn-small" @click="cancelEdit">Cancel</button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="link-info">
                    <span class="link-title-admin">{{ link.title }}</span>
                    <span class="link-url-admin">{{ link.url }}</span>
                    <span class="link-meta-admin">
                      {{ link.icon }} &middot; {{ link.category }}
                      <span v-if="link.featured"> &middot; featured</span>
                    </span>
                  </div>
                  <div class="link-actions">
                    <button
                      class="btn btn-small"
                      title="Move up"
                      :disabled="index === 0"
                      @click="handleMoveUp(link, index)"
                    >
                      &uarr;
                    </button>
                    <button
                      class="btn btn-small"
                      title="Move down"
                      :disabled="index >= links.length - 1"
                      @click="handleMoveDown(link, index)"
                    >
                      &darr;
                    </button>
                    <button class="btn btn-small" @click="startEdit(link)">Edit</button>
                    <button class="btn btn-small btn-danger" @click="handleDelete(link.id)">
                      Del
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <!-- Add Link Form -->
            <div class="admin-form add-link-form">
              <h3>Add Link</h3>
              <div class="form-group">
                <label>Title</label>
                <input v-model="newLink.title" type="text" placeholder="Link title" />
              </div>
              <div class="form-group">
                <label>URL</label>
                <input v-model="newLink.url" type="text" placeholder="https://..." />
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Icon</label>
                  <select v-model="newLink.icon">
                    <option v-for="ic in iconOptions" :key="ic" :value="ic">{{ ic }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <select v-model="newLink.category">
                    <option v-for="cat in categoryOptions" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>
              </div>
              <label class="checkbox-label">
                <input v-model="newLink.featured" type="checkbox" />
                Featured
              </label>
              <button
                class="btn btn-primary"
                :disabled="saving || !newLink.title || !newLink.url"
                @click="handleAddLink"
              >
                Add Link
              </button>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin-wrap {
  min-height: 100vh;
  background: var(--bg);
  padding: 2.5rem 1rem 3rem;
}

.admin-container {
  max-width: 620px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2a2a2a;
}

.admin-header h1 {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-light);
}

.admin-toast {
  background: var(--accent-green);
  color: white;
  padding: 0.6rem 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--card-radius);
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #d0d0d0;
  border-radius: 5px;
  background: white;
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: 0.8rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-group textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(51, 85, 255, 0.1);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: var(--text-dark);
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.form-error {
  color: var(--accent-red);
  font-size: 0.78rem;
  font-weight: 700;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.55rem 1.15rem;
  border: 1.5px solid #d0d0d0;
  border-radius: 5px;
  background: white;
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.btn:hover {
  background: #f0f0f0;
  border-color: #bbb;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-green);
  color: white;
  border-color: var(--accent-green);
}

.btn-primary:hover {
  background: #007a2e;
  border-color: #007a2e;
}

.btn-danger {
  background: transparent;
  color: var(--accent-red);
  border-color: var(--accent-red);
}

.btn-danger:hover {
  background: var(--accent-red);
  color: white;
}

.btn-logout {
  background: transparent;
  color: #999;
  border-color: #444;
}

.btn-logout:hover {
  color: var(--text-light);
  border-color: #777;
  background: rgba(255, 255, 255, 0.06);
}

.btn-small {
  padding: 0.35rem 0.6rem;
  font-size: 0.65rem;
}

/* Links list */

.admin-links-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
}

.admin-link-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.85rem;
  border: 1.5px solid #e8e8e8;
  border-radius: var(--card-radius);
  background: white;
  transition: border-color 0.15s;
}

.admin-link-item:hover {
  border-color: #ccc;
}

.link-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.link-title-admin {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-dark);
}

.link-url-admin {
  font-size: 0.68rem;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-meta-admin {
  font-size: 0.62rem;
  color: #bbb;
  text-transform: uppercase;
  margin-top: 0.1rem;
}

.link-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
  align-items: center;
}

.edit-form {
  width: 100%;
}

.add-link-form {
  padding-top: 1.25rem;
  border-top: 1px solid #e8e8e8;
}

.add-link-form h3 {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dark);
}
</style>
