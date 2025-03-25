
(async () => {
  const space = document.getElementById("custom-task-board");
  if (!space) return;

  space.innerHTML = `
    <h2 style="padding: 10px;">📋 Trello風 タスクボード（kintone連携）</h2>
    <div style="display: flex; gap: 20px; padding: 20px;">
      <div style="flex: 1; background: #f9f9f9; border: 1px solid #ccc; padding: 10px;">
        <h3>発注管理</h3>
        <div id="column-order"></div>
      </div>
      <div style="flex: 1; background: #f9f9f9; border: 1px solid #ccc; padding: 10px;">
        <h3>設備管理</h3>
        <div id="column-equipment"></div>
      </div>
      <div style="flex: 1; background: #f9f9f9; border: 1px solid #ccc; padding: 10px;">
        <h3>清掃管理</h3>
        <div id="column-cleaning"></div>
      </div>
      <div style="width: 100px; text-align: center; padding: 10px;">
        <h3>🗑️</h3>
        <div id="trash" style="border: 2px dashed red; padding: 20px;">完了</div>
      </div>
    </div>
  `;

  // kintone APIからタスク取得（アプリID: 254）
  const resp = await fetch("/k/v1/records.json?app=254", {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "same-origin"
  }).then(res => res.json());

  const tasks = resp.records
    .filter(r => r.ステータス?.value !== "完了")
    .map(r => ({
      id: r.$id.value,
      title: r.タスク名.value,
      category: r.カテゴリ.value
    }));

  // カード生成と表示
  for (const task of tasks) {
    const card = document.createElement("div");
    card.textContent = task.title;
    card.setAttribute("draggable", "true");
    card.style.border = "1px solid #aaa";
    card.style.padding = "8px";
    card.style.margin = "5px";
    card.style.background = "white";
    card.dataset.taskId = task.id;

    card.ondragstart = (e) => {
      e.dataTransfer.setData("text/plain", task.id);
    };

    const targetId =
      task.category === "発注管理" ? "column-order" :
      task.category === "設備管理" ? "column-equipment" :
      task.category === "清掃管理" ? "column-cleaning" : null;

    if (targetId) {
      document.getElementById(targetId).appendChild(card);
    }
  }

  // ドロップ先の設定
  const dropTargets = ["column-order", "column-equipment", "column-cleaning", "trash"];
  for (const id of dropTargets) {
    const target = document.getElementById(id);
    target.ondragover = e => e.preventDefault();
    target.ondrop = async e => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      const card = [...document.querySelectorAll("[draggable]")].find(el => el.dataset.taskId === taskId);
      if (!card) return;

      if (id === "trash") {
        // ステータスを「完了」に変更
        await fetch("/k/v1/record.json", {
          method: "PUT",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify({
            app: 254,
            id: taskId,
            record: {
              ステータス: { value: "完了" }
            }
          })
        });
        card.remove();
      } else {
        target.appendChild(card);
      }
    };
  }
})();
