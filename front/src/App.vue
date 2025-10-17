<template>
  <div class="page">
    <header>
      <h1>TP Pub-Sub — Service X Passif</h1>
      <small class="badge">TP-1</small>
    </header>

    <main>
      <section class="card">
        <h2>Chat</h2>
        <div class="messages" ref="msgBox">
          <div
            v-for="(m, i) in messages"
            :key="i"
            class="msg"
            :class="m.kind"
          >
            <span class="tag">{{ m.tag }}</span>
            <span>{{ m.text }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, ref, nextTick } from "vue";
import { socket } from "./services/socket";
import { sendChatMessage, fetchWhoAmI } from "./services/api";

const ips = ref([]);
const draft = ref("");
const messages = reactive([]);
const msgBox = ref(null);

function push(kind, tag, text) {
  messages.push({ kind, tag, text });
  nextTick(() => {
    if (msgBox.value) {
      msgBox.value.scrollTop = msgBox.value.scrollHeight;
    }
  });
}

async function loadIPs() {
  try {
    const data = await fetchWhoAmI();
    ips.value = data.ip || [];
  } catch (e) {
    console.error(e);
  }
}

async function onSend() {
  const text = draft.value.trim();
  if (!text) return;
  push("self", "you", text);
  draft.value = "";
  try {
    await sendChatMessage(text);
  } catch (e) {
    console.error(e);
    push("system", "error", "Échec d'envoi vers l'API");
  }
}

onMounted(() => {
  socket.on("connect", () => push("system", "ws", `connecté (${socket.id})`));
  socket.on("disconnect", (reason) => push("system", "ws", `déconnecté: ${reason}`));
  socket.on("message", (payload) => push("other", "message", String(payload)));
  socket.on("echo", (payload) => push("system", "echo", String(payload)));
});

onBeforeUnmount(() => {
  socket.off("message");
  socket.off("echo");
  socket.off("connect");
  socket.off("disconnect");
});
</script>

<style scoped>
.page { min-height: 100vh; background:#0f172a; color:#e2e8f0; }
header { padding:16px 24px; background:#111827; border-bottom:1px solid #334155; display:flex; align-items:center; justify-content:space-between; }
.badge { font-size:12px; padding:4px 8px; border-radius:999px; background:#1f2937; color:#93c5fd; }
main { max-width: 900px; margin: 24px auto; padding: 0 16px; display: grid; gap: 16px; }
.card { background:#111827; border:1px solid #374151; border-radius: 12px; padding:16px; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
.messages { height: 360px; overflow:auto; display:flex; flex-direction: column; gap: 10px; background:#0b1220; border:1px solid #1f2937; border-radius: 10px; padding:12px; }
.msg { display:flex; gap:8px; align-items:baseline; }
.msg .tag { font-size:12px; opacity:.7; margin-right:4px; }
.msg.self { color:#93c5fd; }
.msg.other { color:#fbbf24; }
.msg.system { color:#34d399; }
form { display:flex; gap:8px; margin-top:12px; }
input { flex:1; padding:10px 12px; border-radius:10px; border:1px solid #334155; background:#0b1220; color:#e2e8f0; }
button { padding:10px 14px; border-radius:10px; border:1px solid #334155; background:#1f2937; color:#e2e8f0; cursor:pointer; }
button[disabled] { opacity: .5; cursor:not-allowed; }
.ip-list { margin-top:8px; }
.muted { opacity: .7; font-style: italic; }
</style>
