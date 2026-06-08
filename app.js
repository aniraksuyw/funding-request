const storageKey = "graduateFundingRequests";
const builtInScriptUrl = "https://script.google.com/macros/s/AKfycbwwhyXDvLngx0cosCJk4h9Ay-mE_eVyOR1otb86xyzKnjoVVj03JTTrIGKCyW6uQrkobg/exec";

const form = document.querySelector("#fundingForm");
const recordsBody = document.querySelector("#recordsBody");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const exportButton = document.querySelector("#exportCsv");
const clearButton = document.querySelector("#clearDemo");
const detailDialog = document.querySelector("#detailDialog");
const detailContent = document.querySelector("#detailContent");
const closeDialog = document.querySelector("#closeDialog");

const pendingCount = document.querySelector("#pendingCount");
const approvedCount = document.querySelector("#approvedCount");
const totalAmount = document.querySelector("#totalAmount");

const numberFormatter = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 0,
});

const statusOptions = ["待審核", "通過", "退回", "已撥款"];

function hasRequiredElements() {
  return [
    form,
    recordsBody,
    emptyState,
    searchInput,
    exportButton,
    clearButton,
    detailDialog,
    detailContent,
    closeDialog,
    pendingCount,
    approvedCount,
    totalAmount,
  ].every(Boolean);
}

if (!hasRequiredElements()) {
  throw new Error("Required page elements are missing.");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return `NT$${numberFormatter.format(Number(value || 0))}`;
}

function loadRequests() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function saveRequests(requests) {
  localStorage.setItem(storageKey, JSON.stringify(requests));
}

function getScriptUrl() {
  return builtInScriptUrl;
}

function createRequestId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `F${datePart}-${randomPart}`;
}

function getFormData() {
  const data = new FormData(form);
  return {
    id: createRequestId(),
    applicantName: data.get("applicantName").trim(),
    studentId: data.get("studentId").trim(),
    email: data.get("email").trim(),
    department: data.get("department").trim(),
    category: data.get("category"),
    amount: Number(data.get("amount")),
    expenseDate: data.get("expenseDate"),
    reviewer: data.get("reviewer").trim(),
    purpose: data.get("purpose").trim(),
    attachment: data.get("attachment").trim(),
    status: "待審核",
    syncState: "待同步",
    createdAt: new Date().toISOString(),
  };
}

function updateSummary(requests) {
  pendingCount.textContent = requests.filter((item) => item.status === "待審核").length;
  approvedCount.textContent = requests.filter((item) => item.status === "通過" || item.status === "已撥款").length;
  const total = requests.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  totalAmount.textContent = formatCurrency(total);
}

function matchesSearch(item, query) {
  if (!query) return true;
  const target = [
    item.id,
    item.applicantName,
    item.studentId,
    item.department,
    item.category,
    item.purpose,
    item.reviewer,
    item.status,
    item.syncState,
  ]
    .join(" ")
    .toLowerCase();
  return target.includes(query.toLowerCase());
}

function renderAttachmentLink(url) {
  if (!url) return "未提供";
  const escapedUrl = escapeHtml(url);
  return `<a href="${escapedUrl}" target="_blank" rel="noreferrer">${escapedUrl}</a>`;
}

function renderRequests() {
  const requests = loadRequests();
  const query = searchInput.value.trim();
  const filtered = requests.filter((item) => matchesSearch(item, query));

  recordsBody.innerHTML = "";
  emptyState.classList.toggle("show", filtered.length === 0);
  updateSummary(requests);

  filtered.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.id)}</td>
      <td>
        <strong>${escapeHtml(item.applicantName)}</strong><br />
        <span class="muted">${escapeHtml(item.studentId)}</span>
      </td>
      <td class="purpose-cell">${escapeHtml(item.purpose)}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td></td>
      <td><span class="sync-pill ${item.syncState === "已同步" ? "success" : ""}">${escapeHtml(item.syncState || "未設定")}</span></td>
      <td>
        <div class="row-actions">
          <button class="tiny-button" type="button" data-action="view" data-id="${item.id}">查看</button>
          <button class="tiny-button" type="button" data-action="sync" data-id="${item.id}">同步</button>
          <button class="tiny-button delete" type="button" data-action="delete" data-id="${item.id}">刪除</button>
        </div>
      </td>
    `;

    const statusCell = row.children[4];
    const select = document.createElement("select");
    select.className = "status-select";
    select.dataset.id = item.id;
    statusOptions.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === item.status;
      select.append(option);
    });
    statusCell.append(select);
    recordsBody.append(row);
  });
}

function showDetails(id) {
  const item = loadRequests().find((request) => request.id === id);
  if (!item) return;

  const rows = [
    ["申請編號", item.id],
    ["申請人", item.applicantName],
    ["學號", item.studentId],
    ["Email", item.email],
    ["系所 / 年級", item.department],
    ["經費類別", item.category],
    ["申請金額", formatCurrency(item.amount)],
    ["預計支出日期", item.expenseDate],
    ["審核人", item.reviewer],
    ["審核狀態", item.status],
    ["同步狀態", item.syncState || "未設定"],
    ["申請用途", item.purpose],
    ["附件連結", renderAttachmentLink(item.attachment), true],
  ];

  detailContent.innerHTML = rows
    .map(([label, value, isHtml]) => `<div class="detail-row"><span>${label}</span><span>${isHtml ? value : escapeHtml(value)}</span></div>`)
    .join("");
  detailDialog.showModal();
}

function updateRequest(id, patch) {
  const requests = loadRequests().map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveRequests(requests);
  renderRequests();
}

function updateStatus(id, status) {
  updateRequest(id, { status });
}

function deleteRequest(id) {
  if (!confirm("確定要刪除這筆申請資料嗎？")) return;
  saveRequests(loadRequests().filter((item) => item.id !== id));
  renderRequests();
}

async function postToGoogleSheets(request) {
  const url = getScriptUrl();
  if (!url) {
    throw new Error("尚未設定 Web App URL");
  }

  const response = await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(request),
  });

  return response;
}

async function syncRequest(id) {
  const request = loadRequests().find((item) => item.id === id);
  if (!request) return;

  updateRequest(id, { syncState: "同步中" });
  try {
    await postToGoogleSheets(request);
    updateRequest(id, { syncState: "已同步", syncedAt: new Date().toISOString() });
  } catch (error) {
    updateRequest(id, { syncState: "同步失敗" });
  }
}

function exportCsv() {
  const requests = loadRequests();
  if (requests.length === 0) {
    alert("目前沒有資料可匯出。");
    return;
  }

  const headers = ["申請編號", "申請人", "學號", "Email", "系所年級", "經費類別", "申請金額", "預計支出日期", "審核人", "申請用途", "附件連結", "狀態", "同步狀態", "送出時間"];
  const rows = requests.map((item) => [
    item.id,
    item.applicantName,
    item.studentId,
    item.email,
    item.department,
    item.category,
    item.amount,
    item.expenseDate,
    item.reviewer,
    item.purpose,
    item.attachment,
    item.status,
    item.syncState,
    item.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "研究生經費申請紀錄.csv";
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const request = getFormData();
  const requests = [request, ...loadRequests()];
  saveRequests(requests);
  form.reset();
  renderRequests();

  if (getScriptUrl()) {
    await syncRequest(request.id);
  }
});

recordsBody.addEventListener("change", (event) => {
  if (event.target.matches(".status-select")) {
    updateStatus(event.target.dataset.id, event.target.value);
  }
});

recordsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  if (button.dataset.action === "view") showDetails(button.dataset.id);
  if (button.dataset.action === "sync") syncRequest(button.dataset.id);
  if (button.dataset.action === "delete") deleteRequest(button.dataset.id);
});

searchInput.addEventListener("input", renderRequests);
exportButton.addEventListener("click", exportCsv);
closeDialog.addEventListener("click", () => detailDialog.close());
clearButton.addEventListener("click", () => {
  if (!confirm("這會清空所有申請紀錄，確定嗎？")) return;
  localStorage.removeItem(storageKey);
  renderRequests();
});

renderRequests();
