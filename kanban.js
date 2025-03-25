
(async () => {
  // 簡易Trello風タスクボードの表示
  const space = document.getElementById("custom-task-board");
  if (!space) return;

  space.innerHTML = `
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

  // 仮のデータ（後でkintone REST APIで置き換え可能）
  const tasks = [
    { id: 1, title: "納品書作成", category: "発注管理" },
    { id: 2, title: "照明チェック", category: "設備管理" },
    { id: 3, title: "式場床清掃", category: "清掃管理" }
  ];

  // 各カテゴリにタスクを表示
  for (const task of tasks) {
    const card = document.createElement("div");
    card.textContent = task.title;
    card.setAttribute("draggable", "true");
    card.style.border = "1px solid #aaa";
    card.style.padding = "8px";
    card.style.marginBottom = "5px";
    card.style.background = "white";
    card.dataset.taskId = task.id;

    // ドラッグ開始
    card.ondragstart = (e) => {
      e.dataTransfer.setData("text/plain", task.id);
    };

    const targetId =
      task.category === "発注管理"
        ? "column-order"
        : task.category === "設備管理"
        ? "column-equipment"
        : "column-cleaning";

    document.getElementById(targetId).appendChild(card);
  }

  // ドロップ先のイベント設定
  const dropTargets = ["column-order", "column-equipment", "column-cleaning", "trash"];
  for (const id of dropTargets) {
    const target = document.getElementById(id);
    target.ondragover = (e) => e.preventDefault();
    target.ondrop = (e) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      const card = [...document.querySelectorAll("[draggable]")]
        .find(el => el.dataset.taskId === taskId);
      if (card) {
        target.appendChild(card);
        if (id === "trash") card.remove(); // ゴミ箱に捨てたら非表示
      }
    };
  }
})();
